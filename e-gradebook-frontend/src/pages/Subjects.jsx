import { useEffect, useMemo, useState } from 'react';
import { subjectsApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  CreateSubjectModal,
  EditSubjectModal,
  DeleteSubjectModal,
  SubjectCard,
  SubjectsHeader,
  Toast,
} from '../components/subjects';

export default function Subjects() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isProfessor = user?.role === 'professor';

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [items, setItems] = useState([]);
  const [page] = useState(1);
  const [limit] = useState(50);
  const [q, setQ] = useState('');

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.code.toLowerCase().includes(term) ||
        (s.description || '').toLowerCase().includes(term)
    );
  }, [items, q]);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await subjectsApi.list({
        page,
        limit,
        teacher: isProfessor ? 'me' : undefined,
      });
      setItems(res.items || []);
    } catch (e) {
      setErr(e.message || 'Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToastWith = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  return (
    <div className='mx-auto max-w-6xl'>
      <SubjectsHeader
        q={q}
        setQ={setQ}
        isAdmin={isAdmin}
        onNew={() => setCreating(true)}
      />

      {err && (
        <div className='mb-4 rounded-2xl bg-red-50 px-4 py-3 text-red-700 shadow'>
          {err}
        </div>
      )}

      {loading ? (
        <div className='rounded-2xl bg-white p-8 text-center text-gray-600 shadow'>
          Loading subjects…
        </div>
      ) : filtered.length === 0 ? (
        <div className='rounded-2xl bg-white p-8 text-center text-gray-600 shadow'>
          No subjects found.
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {filtered.map((s) => (
            <SubjectCard
              key={s._id}
              subject={s}
              isAdmin={isAdmin}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <Toast show={showToast}>{toastMsg}</Toast>

      {creating && (
        <CreateSubjectModal
          open={creating}
          onClose={() => setCreating(false)}
          onCreated={async () => {
            setCreating(false);
            await load();
            showToastWith('Subject created');
          }}
        />
      )}

      {editing && (
        <EditSubjectModal
          open={!!editing}
          subject={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await load();
            showToastWith('Changes saved');
          }}
        />
      )}

      {deleting && (
        <DeleteSubjectModal
          open={!!deleting}
          subject={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={async () => {
            setDeleting(null);
            await load();
            showToastWith('Subject deleted');
          }}
        />
      )}
    </div>
  );
}
