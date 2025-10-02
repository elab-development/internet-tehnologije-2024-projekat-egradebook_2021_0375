import ChartsOverview from '../components/charts/ChartsOverview';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to='/' replace />;

  return (
    <div className='mx-auto max-w-7xl'>
      <h1 className='mb-4 text-2xl font-bold text-gray-900'>Admin dashboard</h1>
      <ChartsOverview />
    </div>
  );
}
