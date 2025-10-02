import { useEffect, useMemo, useState } from 'react';
import { usersApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  UsersHeader,
  UserCard,
  AssignParentsModal,
  AssignChildrenModal,
  Toast,
} from '../components/users';

export default function AdminUsers() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [items, setItems] = useState([]);

  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [page] = useState(1);
  const [limit] = useState(25);

  const [assignParentsUser, setAssignParentsUser] = useState(null);
  const [assignChildrenUser, setAssignChildrenUser] = useState(null);

  const [toast, setToast] = useState('');

  const filtered = useMemo(() => {
    return items;
  }, [items]);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await usersApi.list({
        role: role || undefined,
        q,
        page,
        limit,
      });
      setItems(res.items || []);
    } catch (e) {
      setErr(e.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 1500);
  };

  if (!isAdmin) {
    return (
      <div className='mx-auto max-w-4xl rounded-2xl bg-white p-8 text-center text-gray-700 shadow'>
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-6xl'>
      <UsersHeader q={q} setQ={setQ} role={role} setRole={setRole} />

      {err && (
        <div className='mb-4 rounded-2xl bg-red-50 px-4 py-3 text-red-700 shadow'>
          {err}
        </div>
      )}

      {loading ? (
        <div className='rounded-2xl bg-white p-8 text-center text-gray-600 shadow'>
          Loading users…
        </div>
      ) : filtered.length === 0 ? (
        <div className='rounded-2xl bg-white p-8 text-center text-gray-600 shadow'>
          No users found.
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {filtered.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              onAssignParents={(usr) => setAssignParentsUser(usr)}
              onAssignChildren={(usr) => setAssignChildrenUser(usr)}
            />
          ))}
        </div>
      )}

      <Toast show={!!toast}>{toast}</Toast>

      {assignParentsUser && (
        <AssignParentsModal
          open={!!assignParentsUser}
          student={assignParentsUser}
          onClose={() => setAssignParentsUser(null)}
          onSaved={async () => {
            setAssignParentsUser(null);
            await load();
            showToast('Parents updated');
          }}
        />
      )}

      {assignChildrenUser && (
        <AssignChildrenModal
          open={!!assignChildrenUser}
          parent={assignChildrenUser}
          onClose={() => setAssignChildrenUser(null)}
          onSaved={async () => {
            setAssignChildrenUser(null);
            await load();
            showToast('Children updated');
          }}
        />
      )}
    </div>
  );
}
