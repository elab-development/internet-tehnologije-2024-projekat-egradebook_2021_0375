import { useEffect, useMemo, useState } from 'react';
import { X, Save } from 'lucide-react';
import { usersApi } from '../../lib/api';
import UserPicker from './UserPicker';

export default function AssignParentsModal({
  open,
  student,
  onClose,
  onSaved,
}) {
  const [parentIds, setParentIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const initialIds = useMemo(() => {
    const arr = Array.isArray(student?.parents) ? student.parents : [];
    return arr
      .map((p) => (typeof p === 'string' ? p : p.id))
      .filter(Boolean)
      .map(String);
  }, [student]);

  useEffect(() => {
    if (open) {
      setParentIds(initialIds);
      setSaving(false);
      setErr(null);
    }
  }, [open, initialIds]);

  if (!open) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await usersApi.setParents(student.id ?? student._id, parentIds);
      onSaved?.();
    } catch (e) {
      setErr(e.message || 'Failed to update parents.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
      <div className='w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Set parents for{' '}
            <span className='text-green-700'>{student?.fullName}</span>
          </h3>
          <button
            onClick={onClose}
            className='rounded-xl bg-gray-100 p-2 text-gray-600 shadow hover:bg-gray-200'
            aria-label='Close'
          >
            <X size={16} />
          </button>
        </div>

        {err && (
          <div className='mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 shadow'>
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className='space-y-6'>
          <UserPicker role='parent' value={parentIds} onChange={setParentIds} />
          <div className='flex items-center justify-end gap-3 pt-1'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-200'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={saving}
              className='inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-green-700 disabled:opacity-60'
            >
              <Save size={16} /> {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
