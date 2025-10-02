import { StickyNote, Plus, Search } from 'lucide-react';
import UserPicker from '../users/UserPicker';
import AuthorPicker from './AuthorPicker';

const VIS = [
  { value: '', label: 'All visibility' },
  { value: 'all', label: 'All (everyone)' },
  { value: 'student', label: 'Student only' },
  { value: 'parent', label: 'Parent' },
  { value: 'staff', label: 'Staff' },
];

export default function NotesHeader({ role, filters, setFilters, onNew }) {
  const isAdmin = role === 'admin';
  const isProfessor = role === 'professor';

  return (
    <div className='mb-6 flex flex-col gap-4'>
      <div className='flex items-center gap-3'>
        <span className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow'>
          <StickyNote size={18} />
        </span>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Notes</h1>
          <p className='text-sm text-gray-600'>
            {isAdmin || isProfessor
              ? 'Browse and create notes.'
              : 'Browse notes.'}
          </p>
        </div>
        {(isAdmin || isProfessor) && (
          <button
            onClick={onNew}
            className='ml-auto inline-flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-green-700'
          >
            <Plus size={18} /> New note
          </button>
        )}
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
        <div className='lg:col-span-1'>
          <label className='mb-1 block text-sm font-medium text-gray-700'>
            Search
          </label>
          <div className='flex items-center gap-2 rounded-2xl bg-white p-3 shadow-inner'>
            <Search size={16} className='text-gray-500' />
            <input
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              placeholder='Title or text…'
              className='w-full bg-transparent text-sm outline-none'
            />
          </div>
        </div>

        <div className='lg:col-span-1'>
          <label className='mb-1 block text-sm font-medium text-gray-700'>
            Visibility & Dates
          </label>
          <div className='rounded-2xl bg-white p-4 shadow-inner space-y-3'>
            <select
              className='w-full rounded-xl bg-gray-50 px-3 py-2 shadow-inner outline-none focus:ring-2 focus:ring-green-600'
              value={filters.visibility}
              onChange={(e) =>
                setFilters((f) => ({ ...f, visibility: e.target.value }))
              }
            >
              {VIS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
            <input
              type='date'
              className='w-full rounded-xl bg-gray-50 px-3 py-2 shadow-inner outline-none focus:ring-2 focus:ring-green-600'
              value={filters.from}
              onChange={(e) =>
                setFilters((f) => ({ ...f, from: e.target.value }))
              }
              placeholder='From'
            />
            <input
              type='date'
              className='w-full rounded-xl bg-gray-50 px-3 py-2 shadow-inner outline-none focus:ring-2 focus:ring-green-600'
              value={filters.to}
              onChange={(e) =>
                setFilters((f) => ({ ...f, to: e.target.value }))
              }
              placeholder='To'
            />
          </div>
        </div>

        {isAdmin && (
          <>
            <div className='lg:col-span-1'>
              <label className='mb-1 block text-sm font-medium text-gray-700'>
                Student
              </label>
              <UserPicker
                role='student'
                value={
                  filters._studentArr ||
                  (filters.student ? [filters.student] : [])
                }
                onChange={(arr) =>
                  setFilters((f) => ({
                    ...f,
                    student: arr[0] || '',
                    _studentArr: arr,
                  }))
                }
              />
            </div>
            <div className='lg:col-span-1'>
              <label className='mb-1 block text-sm font-medium text-gray-700'>
                Author
              </label>
              <AuthorPicker
                value={filters.author ? [filters.author] : []}
                onChange={(arr) =>
                  setFilters((f) => ({ ...f, author: arr[0] || '' }))
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
