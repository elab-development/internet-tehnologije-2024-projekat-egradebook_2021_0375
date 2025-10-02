import { Pencil, Trash2 } from 'lucide-react';

export default function SubjectCard({ subject, isAdmin, onEdit, onDelete }) {
  return (
    <div className='rounded-2xl bg-white p-5 shadow-md'>
      <div className='mb-2 flex items-start justify-between gap-3'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>
            {subject.name}
          </h3>
          <p className='text-sm font-medium text-green-700'>{subject.code}</p>
        </div>

        {isAdmin && (
          <div className='flex items-center gap-2'>
            <button
              onClick={() => onEdit?.(subject)}
              className='rounded-xl bg-green-50 p-2 text-green-700 shadow hover:bg-green-100'
              aria-label='Edit subject'
              title='Edit subject'
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onDelete?.(subject)}
              className='rounded-xl bg-red-50 p-2 text-red-600 shadow hover:bg-red-100'
              aria-label='Delete subject'
              title='Delete subject'
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <p className='text-sm text-gray-600'>
        {subject.description || 'No description.'}
      </p>

      {Array.isArray(subject.teachers) && subject.teachers.length > 0 && (
        <p className='mt-3 text-xs text-gray-500'>
          Teachers: {subject.teachers.map((t) => t.fullName).join(', ')}
        </p>
      )}
    </div>
  );
}
