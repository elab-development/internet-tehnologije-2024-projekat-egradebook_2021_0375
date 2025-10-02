export default function LoadingOverlay({
  show = true,
  label = 'Loading…',
  blur = true,
}) {
  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 ${
        blur ? 'backdrop-blur-sm' : ''
      }`}
      aria-live='polite'
      aria-busy='true'
    >
      <div className='flex flex-col items-center gap-3'>
        <div
          className='h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white'
          role='status'
          aria-label={label}
        />
        <span className='text-sm text-white/90'>{label}</span>
      </div>
    </div>
  );
}
