import { useEffect, useMemo, useState } from 'react';
import { usersApi } from '../../lib/api';
import { Search } from 'lucide-react';

export default function AuthorPicker({ value = [], onChange }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [options, setOptions] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        const [profs, admins] = await Promise.all([
          usersApi.list({ role: 'professor', q, page: 1, limit: 100 }),
          usersApi.list({ role: 'admin', q, page: 1, limit: 100 }),
        ]);
        const dedup = new Map();
        [...(profs.items || []), ...(admins.items || [])].forEach((u) =>
          dedup.set(u.id, u)
        );
        setOptions([...dedup.values()]);
      } catch (e) {
        setErr(e.message || 'Failed to load authors.');
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [q]);

  const selected = useMemo(() => new Set(value.map(String)), [value]);

  return (
    <div className='rounded-2xl bg-white p-4 shadow-inner'>
      <div className='mb-2 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 shadow-inner'>
        <Search size={16} className='text-gray-500' />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Search authors…'
          className='w-full bg-transparent text-sm outline-none'
        />
      </div>

      {loading && <p className='text-sm text-gray-600 px-1'>Loading…</p>}
      {err && (
        <p className='text-sm text-red-700 bg-red-50 rounded-xl shadow px-3 py-2'>
          {err}
        </p>
      )}

      {!loading && !err && (
        <ul className='max-h-64 overflow-auto space-y-2 pr-1'>
          <li>
            <button
              type='button'
              onClick={() => onChange?.([])}
              className={`w-full rounded-xl px-3 py-2 text-left shadow ${
                value.length === 0
                  ? 'bg-green-50 ring-1 ring-green-600'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              Any author
            </button>
          </li>
          {options.map((u) => {
            const id = String(u.id ?? u._id);
            const isSel = selected.has(id);
            return (
              <li key={id}>
                <button
                  type='button'
                  onClick={() => onChange?.([id])}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 shadow ${
                    isSel
                      ? 'bg-green-50 ring-1 ring-green-600'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className='min-w-0'>
                    <span className='block truncate text-sm font-medium text-gray-900'>
                      {u.fullName}
                    </span>
                    <span className='block truncate text-xs text-gray-500'>
                      {u.email} · {u.role}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
