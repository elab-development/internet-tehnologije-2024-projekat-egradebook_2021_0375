import { useEffect, useState } from 'react';
import { notesApi, usersApi } from '../../lib/api';
import { X, Save, Search } from 'lucide-react';

const VIS = ['all', 'student', 'parent', 'staff'];

export default function CreateNoteModal({ open, onClose, onCreated }) {
  const [studentQuery, setStudentQuery] = useState('');
  const [studentOptions, setStudentOptions] = useState([]);
  const [student, setStudent] = useState('');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState('all');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      try {
        const res = await usersApi.list({
          role: 'student',
          q: studentQuery,
          page: 1,
          limit: 50,
        });
        setStudentOptions(res.items || []);
      } catch (e) {
        setStudentOptions([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [open, studentQuery]);

  useEffect(() => {
    if (open) {
      setStudent('');
      setTitle('');
      setText('');
      setVisibility('all');
      setSaving(false);
      setErr(null);
      setStudentQuery('');
    }
  }, [open]);

  if (!open) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await notesApi.create({ student, title, text, visibility });
      onCreated?.();
    } catch (e) {
      setErr(e.message || 'Failed to create note.');
      setSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
      <div className='w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-900'>Add note</h3>
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
          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Student
            </label>
            <div className='mb-2 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 shadow-inner'>
              <Search size={16} className='text-gray-500' />
              <input
                value={studentQuery}
                onChange={(e) => setStudentQuery(e.target.value)}
                placeholder='Search students by name or email…'
                className='w-full bg-transparent text-sm outline-none'
              />
            </div>
            <select
              className='w-full rounded-xl bg-gray-50 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-600'
              value={student}
              onChange={(e) => setStudent(e.target.value)}
              required
            >
              <option value='' disabled>
                Select student…
              </option>
              {studentOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Title
            </label>
            <input
              className='w-full rounded-xl bg-gray-50 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-600'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g., Missing homework'
              required
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Text
            </label>
            <textarea
              rows={3}
              className='w-full rounded-xl bg-gray-50 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-600'
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='Optional details…'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Visibility
            </label>
            <select
              className='w-full rounded-xl bg-gray-50 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-600'
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              {VIS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
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
              <Save size={16} /> {saving ? 'Saving…' : 'Create note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
