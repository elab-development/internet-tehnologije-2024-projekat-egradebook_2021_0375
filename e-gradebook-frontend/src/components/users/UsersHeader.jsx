import { Users, Search } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'professor', label: 'Professor' },
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
];

export default function UsersHeader({ q, setQ, role, setRole }) {
  return (
    <div className='mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
      <div className='flex items-center gap-3'>
        <span className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow'>
          <Users size={18} />
        </span>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Users</h1>
          <p className='text-sm text-gray-600'>
            Browse and manage parent ⇄ child relations (admin).
          </p>
        </div>
      </div>

      <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center'>
        <div className='relative w-full sm:w-72'>
          <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
            <Search size={16} className='text-gray-500' />
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Search name or email…'
            className='w-full rounded-2xl bg-white pl-9 pr-3 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-green-600'
          />
        </div>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className='rounded-2xl bg-white px-4 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-green-600'
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
