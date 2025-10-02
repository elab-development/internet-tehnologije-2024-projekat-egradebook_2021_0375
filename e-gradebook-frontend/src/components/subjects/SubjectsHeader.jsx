import { BookOpen, Plus } from 'lucide-react';

export default function SubjectsHeader({ q, setQ, isAdmin, onNew }) {
  return (
    <div className='mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
      <div className='flex items-center gap-3'>
        <span className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow'>
          <BookOpen size={18} />
        </span>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            {isAdmin ? 'Subjects' : 'My Subjects'}
          </h1>
          <p className='text-sm text-gray-600'>
            {isAdmin
              ? `Browse all subjects${
                  isAdmin ? ' · Admin can create, edit, delete' : ''
                }.`
              : `Subjects you teach.`}
          </p>
        </div>
      </div>

      <div className='flex w-full items-center gap-3 sm:w-auto'>
        <input
          placeholder='Search by name or code…'
          className='w-full rounded-2xl bg-white px-4 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-green-600 sm:w-72'
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {isAdmin && (
          <button
            onClick={onNew}
            className='inline-flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-green-700'
          >
            <Plus size={18} />
            New
          </button>
        )}
      </div>
    </div>
  );
}
