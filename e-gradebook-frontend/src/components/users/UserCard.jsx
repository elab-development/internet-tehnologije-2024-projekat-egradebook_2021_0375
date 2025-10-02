import { Link2, Users, UserSquare } from 'lucide-react';

export default function UserCard({ user, onAssignParents, onAssignChildren }) {
  const isStudent = user.role === 'student';
  const isParent = user.role === 'parent';

  return (
    <div className='rounded-2xl bg-white p-5 shadow-md'>
      <div className='mb-2 flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <h3 className='truncate text-lg font-semibold text-gray-900'>
            {user.fullName}
          </h3>
          <p className='truncate text-sm text-gray-600'>{user.email}</p>
          <div className='mt-1 text-xs'>
            <span className='inline-flex items-center rounded-xl bg-green-50 px-2 py-1 text-green-700 shadow-inner'>
              {user.role}
            </span>
            {user.classLabel && (
              <span className='ml-2 inline-flex items-center rounded-xl bg-gray-50 px-2 py-1 text-gray-700 shadow-inner'>
                class: {user.classLabel}
              </span>
            )}
          </div>
        </div>
        <span className='inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white shadow'>
          <UserSquare size={18} />
        </span>
      </div>

      {isStudent && (
        <div className='mt-3'>
          <p className='mb-1 text-xs font-medium text-gray-500'>Parents</p>
          {user.parents?.length ? (
            <ul className='text-sm text-gray-700 space-y-1'>
              {user.parents.map((p) => {
                const key = typeof p === 'string' ? p : p.id;
                const label =
                  typeof p === 'string'
                    ? p
                    : p.fullName
                    ? `${p.fullName} (${p.email})`
                    : p.id;
                return <li key={key}>{label}</li>;
              })}
            </ul>
          ) : (
            <p className='text-sm text-gray-500'>No parents linked.</p>
          )}
        </div>
      )}

      {isParent && (
        <div className='mt-3'>
          <p className='mb-1 text-xs font-medium text-gray-500'>Children</p>
          {user.children?.length ? (
            <ul className='text-sm text-gray-700 space-y-1'>
              {user.children.map((c) => {
                const key = typeof c === 'string' ? c : c.id;
                const label =
                  typeof c === 'string'
                    ? c
                    : c.fullName
                    ? `${c.fullName} (${c.email})`
                    : c.id;
                return <li key={key}>{label}</li>;
              })}
            </ul>
          ) : (
            <p className='text-sm text-gray-500'>No children linked.</p>
          )}
        </div>
      )}

      <div className='mt-4 flex items-center gap-2'>
        {isStudent && (
          <button
            onClick={() => onAssignParents?.(user)}
            className='inline-flex items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-green-700'
          >
            <Link2 size={16} /> Set parents
          </button>
        )}
        {isParent && (
          <button
            onClick={() => onAssignChildren?.(user)}
            className='inline-flex items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-green-700'
          >
            <Users size={16} /> Set children
          </button>
        )}
      </div>
    </div>
  );
}
