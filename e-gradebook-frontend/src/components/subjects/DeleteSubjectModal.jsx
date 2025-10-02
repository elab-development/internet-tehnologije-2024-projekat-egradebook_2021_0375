import { useEffect, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { subjectsApi } from '../../lib/api';

export default function DeleteSubjectModal({
  open,
  subject,
  onClose,
  onDeleted,
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (open) {
      setBusy(false);
      setErr(null);
    }
  }, [open]);

  if (!open) return null;

  const onConfirm = async () => {
    setBusy(true);
    setErr(null);
    try {
      await subjectsApi.remove(subject._id);
      onDeleted?.();
    } catch (e) {
      setErr(e.message || 'Failed to delete subject.');
      setBusy(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
      <div className='w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Delete subject
          </h3>
          <button
            onClick={onClose}
            className='rounded-xl bg-gray-100 p-2 text-gray-600 shadow hover:bg-gray-200'
            aria-label='Close'
          >
            <X size={16} />
          </button>
        </div>

        <p className='text-sm text-gray-700'>
          Are you sure you want to delete <b>{subject?.name}</b> (
          <span className='text-green-700 font-medium'>{subject?.code}</span>)?
          This action cannot be undone.
        </p>

        {err && (
          <div className='mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 shadow'>
            {err}
          </div>
        )}

        <div className='mt-6 flex items-center justify-end gap-3'>
          <button
            onClick={onClose}
            className='rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-200'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className='inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 disabled:opacity-60'
          >
            <Trash2 size={16} /> {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
