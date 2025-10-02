import { useEffect, useState } from 'react';
import { X, Save } from 'lucide-react';
import { subjectsApi } from '../../lib/api';

export default function CreateSubjectModal({ open, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (open) {
      setName('');
      setCode('');
      setDescription('');
      setErr(null);
      setSaving(false);
    }
  }, [open]);

  if (!open) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await subjectsApi.create({ name, code, description });
      onCreated?.();
    } catch (e) {
      setErr(e.message || 'Failed to create subject.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
      <div className='w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-900'>New subject</h3>
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

        <form onSubmit={onSubmit} className='space-y-4'>
          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Name
            </label>
            <input
              className='w-full rounded-xl bg-gray-50 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-600'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Code
            </label>
            <input
              className='w-full rounded-xl bg-gray-50 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-600'
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Description
            </label>
            <textarea
              rows={3}
              className='w-full rounded-xl bg-gray-50 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-600'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className='flex items-center justify-end gap-3 pt-2'>
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
              <Save size={16} /> {saving ? 'Creating…' : 'Create subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
