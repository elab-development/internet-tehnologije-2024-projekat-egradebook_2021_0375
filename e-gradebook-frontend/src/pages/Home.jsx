import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, FileText, StickyNote } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import UpcomingHolidaysCard from '../components/holidays/UpcomingHolidaysCard';

const ROLE_LABELS = {
  admin: 'Admin',
  professor: 'Professor',
  student: 'Student',
  parent: 'Parent',
};

const LINKS_BY_ROLE = {
  admin: [
    {
      to: '/subjects',
      label: 'Subjects',
      desc: 'Create, edit, and manage subjects.',
      icon: BookOpen,
    },
    {
      to: '/grades',
      label: 'Grades',
      desc: 'Overview of grade entries.',
      icon: FileText,
    },
    {
      to: '/notes',
      label: 'Notes',
      desc: 'Track student notes and updates.',
      icon: StickyNote,
    },
    {
      to: '/users',
      label: 'Users',
      desc: 'Manage parent ⇄ child relations.',
      icon: GraduationCap,
    },
  ],
  professor: [
    {
      to: '/subjects',
      label: 'Subjects',
      desc: 'Your teaching subjects.',
      icon: BookOpen,
    },
    {
      to: '/grades',
      label: 'Grades',
      desc: 'Add and review grades.',
      icon: FileText,
    },
    {
      to: '/notes',
      label: 'Notes',
      desc: 'Log notes for students.',
      icon: StickyNote,
    },
  ],
  student: [
    {
      to: '/grades',
      label: 'My Grades',
      desc: 'See your latest grades.',
      icon: FileText,
    },
    {
      to: '/notes',
      label: 'My Notes',
      desc: 'Review notes addressed to you.',
      icon: StickyNote,
    },
  ],
  parent: [
    {
      to: '/grades',
      label: "Child's Grades",
      desc: 'See your child’s grades.',
      icon: FileText,
    },
    {
      to: '/notes',
      label: "Child's Notes",
      desc: 'Review notes for your child.',
      icon: StickyNote,
    },
  ],
};

function QuickLinkCard({ to, label, desc, Icon }) {
  return (
    <Link
      to={to}
      className='group block rounded-2xl bg-white p-5 shadow-md transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-600'
    >
      <div className='flex items-center gap-3 mb-2'>
        <span className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow'>
          <Icon size={18} aria-hidden='true' />
        </span>
        <h3 className='text-lg font-semibold text-gray-900'>{label}</h3>
      </div>
      <p className='text-sm text-gray-600'>{desc}</p>
    </Link>
  );
}

export default function Home() {
  const { user } = useAuth();
  const role = user?.role ?? 'student';
  const links = LINKS_BY_ROLE[role] ?? [];

  return (
    <div className='mx-auto max-w-5xl'>
      <section className='mb-6 rounded-2xl bg-white p-6 shadow-lg'>
        <div className='flex items-start gap-4'>
          <span className='inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 text-white shadow'>
            <GraduationCap size={22} aria-hidden='true' />
          </span>
          <div className='flex-1'>
            <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
              Welcome back, {user?.fullName || 'User'}!
            </h1>
            <p className='mt-1 text-gray-600'>
              You are signed in as{' '}
              <span className='inline-flex items-center rounded-xl bg-green-50 px-2 py-1 text-green-700 shadow-inner text-xs font-medium'>
                {ROLE_LABELS[role] || role}
              </span>
              .
            </p>
          </div>
        </div>
      </section>

      <section className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <UpcomingHolidaysCard />

        {links.map(({ to, label, desc, icon: Icon }) => (
          <QuickLinkCard
            key={to}
            to={to}
            label={label}
            desc={desc}
            Icon={Icon}
          />
        ))}
      </section>
    </div>
  );
}
