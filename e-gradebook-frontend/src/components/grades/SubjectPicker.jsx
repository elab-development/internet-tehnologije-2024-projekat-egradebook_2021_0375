import { useEffect, useMemo, useState } from 'react';
import { subjectsApi } from '../../lib/api';
import { Search, BookOpen } from 'lucide-react';

export default function SubjectPicker({ value, onChange, teacherScope }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [options, setOptions] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await subjectsApi.list({
          page: 1,
          limit: 200,
          teacher: teacherScope === 'me' ? 'me' : undefined,
        });
        setOptions(res.items || []);
      } catch (e) {
        setErr(e.message || 'Failed to load subjects.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teacherScope]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return options;
    return options.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.code.toLowerCase().includes(term)
    );
  }, [options, q]);

  return (
    <div className='rounded-2xl bg-white p-4 shadow-inner'>
      <div className='mb-2 flex items-center gap-2'>
        <span className='inline-flex h-8 w-8 items-center justify-center rounded-xl bg-green-600 text-white shadow'>
          <BookOpen size={16} />
        </span>
        <div className='relative w-full'>
          <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
            <Search size={14} className='text-gray-500' />
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Search subjects…'
            className='w-full rounded-xl bg-gray-50 pl-8 pr-3 py-2 text-sm shadow-inner outline-none focus:ring-2 focus:ring-green-600'
          />
        </div>
      </div>

      {loading && (
        <p className='text-sm text-gray-600 px-1'>Loading subjects…</p>
      )}
      {err && (
        <p className='text-sm text-red-700 bg-red-50 rounded-xl shadow px-3 py-2'>
          {err}
        </p>
      )}

      {!loading && !err && (
        <div className='grid max-h-64 grid-cols-1 gap-2 overflow-auto pr-1'>
          <button
            type='button'
            onClick={() => onChange?.('')}
            className={`rounded-xl px-3 py-2 mt-1 ml-1 text-left shadow ${
              !value
                ? 'bg-green-50 ring-1 ring-green-600'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            All subjects
          </button>
          {filtered.map((s) => (
            <button
              key={s._id}
              type='button'
              onClick={() => onChange?.(s._id)}
              className={`rounded-xl px-3 py-2 ml-1 text-left shadow ${
                String(value) === String(s._id)
                  ? 'bg-green-50 ring-1 ring-green-600'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className='text-sm font-medium text-gray-900'>{s.name}</div>
              <div className='text-xs text-gray-500'>{s.code}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
