import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

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
      await login(email, password);
      navigate('/', { replace: true });
    } catch (e) {
      setErr(e.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 py-10'>
      <div className='w-full max-w-md'>
        <div className='bg-white shadow-2xl rounded-2xl p-8'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='h-10 w-10 rounded-2xl bg-green-600 shadow-lg flex items-center justify-center text-white font-bold'>
              eG
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Sign in</h1>
              <p className='text-sm text-gray-500'>
                Welcome back to e-Gradebook
              </p>
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
                  autoComplete='current-password'
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
            </div>

            <button
              type='submit'
              disabled={submitting}
              className='w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:bg-green-700 disabled:opacity-60'
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className='mt-6 text-center text-sm text-gray-600'>
            Don’t have an account?{' '}
            <Link
              to='/register'
              className='font-medium text-green-700 hover:underline'
            >
              Create one
            </Link>
          </p>
        </div>

        <p className='mt-6 text-center text-xs text-gray-500'>
          Secure access • Cookies enabled • Green &amp; clean UI
        </p>
      </div>
    </div>
  );
}
