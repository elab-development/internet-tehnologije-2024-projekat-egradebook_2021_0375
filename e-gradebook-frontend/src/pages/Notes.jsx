import { useEffect, useMemo, useState } from 'react';
import { notesApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { NotesHeader, CreateNoteModal, NoteCard } from '../components/notes';

export default function Notes() {
  const { user } = useAuth();
  const role = user?.role;

  const isAdmin = role === 'admin';
  const isProfessor = role === 'professor';
  const isStudent = role === 'student';
  const isParent = role === 'parent';

  const [filters, setFilters] = useState({
    q: '',
    visibility: '',
    from: '',
    to: '',
    student: '',
    author: '',
  });

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [items, setItems] = useState([]);
  const [page] = useState(1);
  const [limit] = useState(50);

  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const params = {
        page,
        limit,
        q: filters.q || undefined,
        visibility: filters.visibility || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
      };

      if (isAdmin) {
        if (filters.student) params.student = filters.student;
        if (filters.author) params.author = filters.author;
      } else if (isProfessor) {
        params.author = 'me';
        if (filters.student) params.student = filters.student;
      } else if (isStudent) {
      } else if (isParent) {
      }

      const res = await notesApi.list(params);
      setItems(res.items || []);
    } catch (e) {
      setErr(e.message || 'Failed to load notes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => load(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.q,
    filters.visibility,
    filters.from,
    filters.to,
    filters.student,
    filters.author,
  ]);

  const count = useMemo(() => items.length, [items]);

  return (
    <div className='mx-auto max-w-6xl'>
      <NotesHeader
        role={role}
        filters={filters}
        setFilters={setFilters}
        onNew={isAdmin || isProfessor ? () => setShowCreate(true) : undefined}
      />

      {err && (
        <div className='mb-4 rounded-2xl bg-red-50 px-4 py-3 text-red-700 shadow'>
          {err}
        </div>
      )}

      {loading ? (
        <div className='rounded-2xl bg-white p-8 text-center text-gray-600 shadow'>
          Loading notes…
        </div>
      ) : count === 0 ? (
        <div className='rounded-2xl bg-white p-8 text-center text-gray-600 shadow'>
          No notes found.
        </div>
      ) : (
        <div className='space-y-3'>
          {items.map((n) => (
            <NoteCard key={n._id} n={n} />
          ))}
        </div>
      )}

      {(isAdmin || isProfessor) && (
        <CreateNoteModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={async () => {
            setShowCreate(false);
            await load();
          }}
        />
      )}
    </div>
  );
}
