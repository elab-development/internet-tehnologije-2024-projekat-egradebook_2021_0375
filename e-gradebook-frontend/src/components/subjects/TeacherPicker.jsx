import { useEffect, useMemo, useState } from 'react';
import { Search, Check } from 'lucide-react';

import { usersApi } from '../../lib/api';

export default function TeacherPicker({ value = [], onChange }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [options, setOptions] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await usersApi.list({
          role: 'professor',
          page: 1,
          limit: 200,
        });
        setOptions(res.items || []);
      } catch (e) {
        setErr(e.message || 'Failed to load professors.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectedSet = useMemo(() => new Set(value.map(String)), [value]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return options;
    return options.filter(
      (u) =>
        u.fullName.toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term)
    );
  }, [options, q]);

  const toggle = (id) => {
    const set = new Set(value.map(String));
    const key = String(id);
    if (set.has(key)) set.delete(key);
    else set.add(key);
    onChange?.(Array.from(set));
  };

  return (
    <div className='rounded-2xl bg-white p-4 shadow-inner'>
      <div className='mb-3 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 shadow-inner'>
        <Search size={16} className='text-gray-500' aria-hidden='true' />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Search professors by name or email…'
          className='w-full bg-transparent text-sm outline-none'
        />
      </div>

      {loading && (
        <p className='px-1 py-2 text-sm text-gray-600'>Loading professors…</p>
      )}
      {err && (
        <p className='px-1 py-2 text-sm text-red-700 bg-red-50 rounded-xl shadow'>
          {err}
        </p>
      )}

      {!loading && !err && (
        <ul className='max-h-64 overflow-auto space-y-2 pr-1'>
          {filtered.length === 0 ? (
            <li className='text-sm text-gray-600 px-1 py-2'>No matches.</li>
          ) : (
            filtered.map((u) => {
              const selected = selectedSet.has(String(u._id));
              return (
                <li key={u._id}>
                  <button
                    type='button'
                    onClick={() => toggle(u._id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 shadow
                      ${
                        selected
                          ? 'bg-green-50 ring-1 ring-green-600'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                  >
                    <span className='flex min-w-0 items-center gap-3'>
                      <span className='inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white text-xs font-semibold shadow'>
                        {u.fullName?.slice(0, 2).toUpperCase()}
                      </span>
                      <span className='min-w-0'>
                        <span className='block truncate text-sm font-medium text-gray-900'>
                          {u.fullName}
                        </span>
                        <span className='block truncate text-xs text-gray-500'>
                          {u.email}
                        </span>
                      </span>
                    </span>
                    {selected && (
                      <span className='inline-flex items-center justify-center rounded-lg bg-green-600 p-1 text-white shadow'>
                        <Check size={14} aria-hidden='true' />
                      </span>
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}

      <div className='mt-3 text-xs text-gray-500'>
        Selected: <b>{value.length}</b>
      </div>
    </div>
  );
}
