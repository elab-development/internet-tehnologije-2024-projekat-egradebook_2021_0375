import { useEffect, useMemo, useState } from 'react';
import { X, Save } from 'lucide-react';
import { subjectsApi } from '../../lib/api';
import TeacherPicker from './TeacherPicker.jsx';

export default function EditSubjectModal({ open, onClose, subject, onSaved }) {
  const [name, setName] = useState(subject?.name ?? '');
  const [code, setCode] = useState(subject?.code ?? '');
  const [description, setDescription] = useState(subject?.description ?? '');
  const [teacherIds, setTeacherIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const initialTeacherIds = useMemo(() => {
    const arr = Array.isArray(subject?.teachers) ? subject.teachers : [];
    return arr
      .map((t) => (typeof t === 'string' ? t : t?._id))
      .filter(Boolean)
      .map(String);
  }, [subject]);

  useEffect(() => {
    if (open) {
      setName(subject?.name ?? '');
      setCode(subject?.code ?? '');
      setDescription(subject?.description ?? '');
      setTeacherIds(initialTeacherIds);
      setErr(null);
      setSaving(false);
    }
  }, [open, subject, initialTeacherIds]);

  if (!open) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await subjectsApi.update(subject._id, {
        name,
        code,
        description,
        teachers: teacherIds,
      });
      onSaved?.();
    } catch (e) {
      setErr(e.message || 'Failed to update subject.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
      <div className='w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-900'>Edit subject</h3>
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
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700'>
                Name
              </label>
              <input
                className='w-full rounded-xl bg-gray-50 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-600'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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

            <div className='sm:col-span-2'>
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
          </div>

          <div>
            <div className='mb-2 flex items-center justify-between'>
              <label className='block text-sm font-medium text-gray-700'>
                Teachers (professors)
              </label>
              <span className='text-xs text-gray-500'>
                Selected: <b>{teacherIds.length}</b>
              </span>
            </div>
            <TeacherPicker value={teacherIds} onChange={setTeacherIds} />
            <p className='mt-2 text-xs text-gray-500'>
              Only users with the <b>professor</b> role can be assigned.
            </p>
          </div>

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
              <Save size={16} />
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
