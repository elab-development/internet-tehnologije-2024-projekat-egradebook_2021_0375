import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className='mt-auto bg-white shadow-inner'>
      <div className='container mx-auto px-4 py-6 text-center text-sm text-gray-600'>
        <span className='inline-flex items-center justify-center gap-2'>
          © {new Date().getFullYear()} e-Gradebook
          <Heart size={14} className='text-green-600' aria-hidden='true' />
        </span>
      </div>
    </footer>
  );
}
