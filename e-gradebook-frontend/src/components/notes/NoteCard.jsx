import { Eye, Shield, UsersRound, GraduationCap } from 'lucide-react';

function VisBadge({ v }) {
  const map = {
    all: { label: 'All', icon: Eye },
    student: { label: 'Student', icon: GraduationCap },
    parent: { label: 'Parent', icon: UsersRound },
    staff: { label: 'Staff', icon: Shield },
  };
  const { label, icon: Icon } = map[v] || map.all;
  return (
    <span className='inline-flex items-center gap-1 rounded-xl bg-green-50 px-2 py-1 text-xs font-medium text-green-700 shadow-inner'>
      <Icon size={12} /> {label}
    </span>
  );
}

export default function NoteCard({ n }) {
  return (
    <div className='rounded-2xl bg-white p-5 shadow-md'>
      <div className='mb-2 flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <h3 className='truncate text-lg font-semibold text-gray-900'>
            {n.title}
          </h3>
          <p className='text-xs text-gray-500'>
            For <b>{n.student?.fullName}</b> · by <b>{n.author?.fullName}</b> ·{' '}
            {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
          </p>
        </div>
        <VisBadge v={n.visibility} />
      </div>
      <p className='text-sm text-gray-700 whitespace-pre-line'>
        {n.text || '—'}
      </p>
    </div>
  );
}
