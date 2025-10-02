export default function Toast({ show, children }) {
  if (!show) return null;
  return (
    <div className='fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white shadow'>
      {children}
    </div>
  );
}
