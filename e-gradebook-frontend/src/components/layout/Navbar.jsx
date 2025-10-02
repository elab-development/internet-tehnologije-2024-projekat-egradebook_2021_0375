import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  X,
  Home as HomeIcon,
  LogIn,
  UserPlus,
  LogOut,
  GraduationCap,
  LayoutDashboard,
} from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const NavItem = ({ to, end, icon: Icon, children }) => (
    <NavLink
      to={to}
      end={end}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
          isActive
            ? 'text-green-700 font-semibold'
            : 'text-gray-700 hover:text-green-700'
        }`
      }
    >
      <Icon size={18} aria-hidden='true' />
      <span>{children}</span>
    </NavLink>
  );

  return (
    <header className='sticky top-0 z-40 bg-white shadow-md'>
      <nav className='container mx-auto flex items-center justify-between px-4 py-3'>
        <Link to='/' className='flex items-center gap-2'>
          <span className='inline-flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-white shadow'>
            <GraduationCap size={18} aria-hidden='true' />
          </span>
          <span className='text-lg font-semibold text-gray-900'>
            e-Gradebook
          </span>
        </Link>

        <div className='hidden md:flex items-center gap-2'>
          <NavItem to='/' end icon={HomeIcon}>
            Home
          </NavItem>
          {user?.role === 'admin' && (
            <NavItem to='/admin' icon={LayoutDashboard}>
              Dashboard
            </NavItem>
          )}

          {!user && (
            <>
              <NavItem to='/login' icon={LogIn}>
                Login
              </NavItem>
              <NavItem to='/register' icon={UserPlus}>
                Register
              </NavItem>
            </>
          )}

          {user && (
            <div className='flex items-center gap-3'>
              <span className='text-sm text-gray-700'>
                {user.fullName}{' '}
                <span className='text-gray-400'>({user.role})</span>
              </span>
              <button
                onClick={onLogout}
                className='inline-flex items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-green-700'
              >
                <LogOut size={16} aria-hidden='true' />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

        <button
          className='ml-4 inline-flex items-center rounded-xl bg-green-50 p-2 text-green-700 shadow hover:bg-green-100 md:hidden'
          onClick={() => setOpen((s) => !s)}
          aria-expanded={open}
          aria-controls='primary-menu'
          aria-label='Toggle menu'
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        id='primary-menu'
        className={`md:hidden transition-all duration-200 ${
          open ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className='mx-4 mb-4 rounded-2xl bg-white p-3 shadow-2xl'>
          <div className='flex flex-col gap-1'>
            <NavItem to='/' end icon={HomeIcon}>
              Home
            </NavItem>

            {!user && (
              <>
                <NavItem to='/login' icon={LogIn}>
                  Login
                </NavItem>
                <NavItem to='/register' icon={UserPlus}>
                  Register
                </NavItem>
              </>
            )}

            {user && (
              <>
                <div className='flex items-center justify-between rounded-xl bg-green-50 px-3 py-2 text-sm text-gray-700 shadow-inner'>
                  <span className='truncate'>
                    {user.fullName}{' '}
                    <span className='text-gray-400'>({user.role})</span>
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className='mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-green-700'
                >
                  <LogOut size={16} aria-hidden='true' />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
