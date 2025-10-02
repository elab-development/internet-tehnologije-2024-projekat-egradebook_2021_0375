import { useEffect, useMemo, useState } from 'react';
import { gradesApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { GradesHeader, CreateGradeModal } from '../components/grades';

function GradeRow({ g }) {
  return (
    <tr className='hover:bg-green-50/40 transition'>
      <td className='px-4 py-3'>{g.student?.fullName}</td>
      <td className='px-4 py-3'>
        {g.subject?.name}{' '}
        <span className='text-xs text-gray-500'>({g.subject?.code})</span>
      </td>
      <td className='px-4 py-3'>{g.teacher?.fullName}</td>
      <td className='px-4 py-3 font-semibold text-green-700'>{g.value}</td>
      <td className='px-4 py-3 capitalize'>{g.type}</td>
      <td className='px-4 py-3'>
        {g.date ? new Date(g.date).toLocaleDateString() : '-'}
      </td>
      <td className='px-4 py-3 text-gray-600'>{g.comment || '-'}</td>
    </tr>
  );
}

export default function Grades() {
  const { user } = useAuth();
  const role = user?.role;

  const isAdmin = role === 'admin';
  const isProfessor = role === 'professor';
  const isStudent = role === 'student';
  const isParent = role === 'parent';

  const [filters, setFilters] = useState({
    subject: '',
    type: '',
    from: '',
    to: '',
    student: '',
    teacher: '',
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
        subject: filters.subject || undefined,
        type: filters.type || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
      };

      if (isAdmin) {
        if (filters.student) params.student = filters.student;
        if (filters.teacher) params.teacher = filters.teacher;
      } else if (isProfessor) {
        params.teacher = 'me';
        if (filters.student) params.student = filters.student;
      } else if (isStudent) {
        params.student = 'me';
      } else if (isParent) {
      }

      const res = await gradesApi.list(params);
      setItems(res.items || []);
    } catch (e) {
      setErr(e.message || 'Failed to load grades.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.subject,
    filters.type,
    filters.from,
    filters.to,
    filters.student,
    filters.teacher,
  ]);

  const average = useMemo(() => {
    if (!items.length) return null;
    const sum = items.reduce((a, b) => a + (Number(b.value) || 0), 0);
    return (sum / items.length).toFixed(2);
  }, [items]);

  return (
    <div className='mx-auto max-w-6xl'>
      <GradesHeader
        role={role}
        filters={filters}
        setFilters={setFilters}
        onNew={isProfessor ? () => setShowCreate(true) : undefined}
      />

      {err && (
        <div className='mb-4 rounded-2xl bg-red-50 px-4 py-3 text-red-700 shadow'>
          {err}
        </div>
      )}

      {loading ? (
        <div className='rounded-2xl bg-white p-8 text-center text-gray-600 shadow'>
          Loading grades…
        </div>
      ) : items.length === 0 ? (
        <div className='rounded-2xl bg-white p-8 text-center text-gray-600 shadow'>
          No grades found.
        </div>
      ) : (
        <div className='overflow-hidden rounded-2xl bg-white shadow'>
          <div className='flex items-center justify-between border-b border-gray-100 px-4 py-3'>
            <p className='text-sm text-gray-600'>
              Showing <b>{items.length}</b> grade{items.length !== 1 ? 's' : ''}
              {average ? (
                <>
                  {' '}
                  · Average: <b className='text-green-700'>{average}</b>
                </>
              ) : null}
            </p>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full text-left text-sm'>
              <thead className='bg-green-50 text-gray-700'>
                <tr>
                  <th className='px-4 py-3 font-semibold'>Student</th>
                  <th className='px-4 py-3 font-semibold'>Subject</th>
                  <th className='px-4 py-3 font-semibold'>Teacher</th>
                  <th className='px-4 py-3 font-semibold'>Value</th>
                  <th className='px-4 py-3 font-semibold'>Type</th>
                  <th className='px-4 py-3 font-semibold'>Date</th>
                  <th className='px-4 py-3 font-semibold'>Comment</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {items.map((g) => (
                  <GradeRow key={g._id} g={g} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isProfessor && (
        <CreateGradeModal
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
