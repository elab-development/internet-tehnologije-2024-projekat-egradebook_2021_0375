import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingOverlay from './components/LoadingOverlay';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Subjects from './pages/Subjects';
import Grades from './pages/Grades';
import Notes from './pages/Notes';
import Holidays from './pages/Holidays';
import AdminUsers from './pages/AdminUsers';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingOverlay label='Checking session…' />;
  return user ? <Outlet /> : <Navigate to='/login' replace />;
}

function RedirectIfAuthenticated() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingOverlay label='Checking session…' />;
  return user ? <Navigate to='/' replace /> : <Outlet />;
}

function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingOverlay label='Checking session…' />;
  return user?.role === 'admin' ? <Outlet /> : <Navigate to='/' replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className='min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col'>
          <Navbar />
          <main className='container mx-auto w-full flex-1 px-4 py-6'>
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route path='/' element={<Home />} />
                <Route path='/subjects' element={<Subjects />} />
                <Route path='/grades' element={<Grades />} />
                <Route path='/notes' element={<Notes />} />
                <Route path='/holidays' element={<Holidays />} />
                <Route element={<AdminRoute />}>
                  <Route path='/users' element={<AdminUsers />} />
                  <Route path='/admin' element={<AdminDashboard />} />
                </Route>
              </Route>
              <Route element={<RedirectIfAuthenticated />}>
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
              </Route>
              <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
