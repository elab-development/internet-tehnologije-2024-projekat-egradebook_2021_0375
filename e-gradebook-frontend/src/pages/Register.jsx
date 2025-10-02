import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
  { value: 'professor', label: 'Professor' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [classLabel, setClassLabel] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      await register({
        fullName,
        email,
        password,
        role,
        classLabel: classLabel || null,
      });
      navigate('/', { replace: true });
    } catch (e) {
      setErr(e.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const showClassLabel = role === 'student';

  return (
    <div className='min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 py-10'>
      <div className='w-full max-w-md'>
        <div className='bg-white shadow-2xl rounded-2xl p-8'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='h-10 w-10 rounded-2xl bg-green-600 shadow-lg flex items-center justify-center text-white font-bold'>
              eG
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Create account
              </h1>
              <p className='text-sm text-gray-500'>Join e-Gradebook</p>
            </div>
          </div>

          {err && (
            <div
              className='mb-4 rounded-xl bg-red-50 text-red-700 px-4 py-3 shadow'
              role='alert'
              aria-live='polite'
            >
              {err}
            </div>
          )}

          <form onSubmit={onSubmit} className='space-y-5'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Full name
              </label>
              <input
                className='w-full rounded-xl bg-gray-50 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-600'
                placeholder='Petar Petrović'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Role
              </label>
              <select
                className='w-full rounded-xl bg-gray-50 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-600'
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <p className='text-xs text-gray-500'>
                Admin accounts cannot be created here.
              </p>
            </div>

            {showClassLabel && (
              <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Class label <span className='text-gray-400'>(optional)</span>
                </label>
                <input
                  className='w-full rounded-xl bg-gray-50 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-600'
                  placeholder='e.g., II-1, VII-3'
                  value={classLabel}
                  onChange={(e) => setClassLabel(e.target.value)}
                />
              </div>
            )}

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Email
              </label>
              <input
                type='email'
                className='w-full rounded-xl bg-gray-50 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-600'
                placeholder='mail@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete='email'
                required
              />
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Password
              </label>
              <div className='relative'>
                <input
                  type={showPwd ? 'text' : 'password'}
                  className='w-full rounded-xl bg-gray-50 px-4 py-3 pr-12 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-600'
                  placeholder='••••••••'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete='new-password'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPwd((s) => !s)}
                  className='absolute inset-y-0 right-0 px-3 text-sm text-gray-500 hover:text-gray-700'
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className='text-xs text-gray-500'>
                Use at least 6 characters.
              </p>
            </div>

            <button
              type='submit'
              disabled={submitting}
              className='w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:bg-green-700 disabled:opacity-60'
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className='mt-6 text-center text-sm text-gray-600'>
            Already have an account?{' '}
            <Link
              to='/login'
              className='font-medium text-green-700 hover:underline'
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className='mt-6 text-center text-xs text-gray-500'>
          Secure signup • Cookies enabled • Green &amp; clean UI
        </p>
      </div>
    </div>
  );
}
