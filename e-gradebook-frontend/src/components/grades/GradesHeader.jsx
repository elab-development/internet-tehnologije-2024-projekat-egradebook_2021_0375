import { FileText, Plus } from 'lucide-react';
import UserPicker from '../users/UserPicker';
import SubjectPicker from './SubjectPicker';

const TYPES = [
  { value: '', label: 'All types' },
  { value: 'written', label: 'Written' },
  { value: 'oral', label: 'Oral' },
  { value: 'test', label: 'Test' },
  { value: 'final', label: 'Final' },
  { value: 'other', label: 'Other' },
];

export default function GradesHeader({ role, filters, setFilters, onNew }) {
  const isAdmin = role === 'admin';
  const isProfessor = role === 'professor';

  return (
    <div className='mb-6 flex flex-col gap-4'>
      <div className='flex items-center gap-3'>
        <span className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow'>
          <FileText size={18} />
        </span>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            {isProfessor ? 'My Grades' : 'Grades'}
          </h1>
          <p className='text-sm text-gray-600'>
            {isProfessor ? 'Grades you issued.' : 'Browse grades.'}
          </p>
        </div>
        <div className='ml-auto flex items-center gap-2'>
          {isProfessor && (
            <button
              onClick={onNew}
              className='inline-flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-green-700'
            >
              <Plus size={18} /> New grade
            </button>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
        <div className='lg:col-span-1'>
          <label className='mb-1 block text-sm font-medium text-gray-700'>
            Subject
          </label>
          <SubjectPicker
            value={filters.subject}
            onChange={(v) => setFilters((f) => ({ ...f, subject: v || '' }))}
            teacherScope={isProfessor ? 'me' : undefined}
          />
        </div>
        <div className='lg:col-span-1'>
          <label className='mb-1 block text-sm font-medium text-gray-700'>
            Type & Dates
          </label>
          <div className='rounded-2xl bg-white p-4 shadow-inner space-y-3'>
            <select
              className='w-full rounded-xl bg-gray-50 px-3 py-2 shadow-inner outline-none focus:ring-2 focus:ring-green-600'
              value={filters.type}
              onChange={(e) =>
                setFilters((f) => ({ ...f, type: e.target.value }))
              }
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
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
                Teacher
              </label>
              <UserPicker
                role='professor'
                value={
                  filters._teacherArr ||
                  (filters.teacher ? [filters.teacher] : [])
                }
                onChange={(arr) =>
                  setFilters((f) => ({
                    ...f,
                    teacher: arr[0] || '',
                    _teacherArr: arr,
                  }))
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
