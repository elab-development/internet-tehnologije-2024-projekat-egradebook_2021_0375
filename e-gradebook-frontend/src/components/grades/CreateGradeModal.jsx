import { useEffect, useState } from 'react';
import { gradesApi, usersApi, subjectsApi } from '../../lib/api';
import { X, Save, Search } from 'lucide-react';

export default function CreateGradeModal({ open, onClose, onCreated }) {
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [studentOptions, setStudentOptions] = useState([]);
  const [student, setStudent] = useState('');
  const [value, setValue] = useState(5);
  const [type, setType] = useState('other');
  const [date, setDate] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await subjectsApi.list({
          page: 1,
          limit: 200,
          teacher: 'me',
        });
        setSubjects(res.items || []);
      } catch (e) {}
    })();
  }, [open]);

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
      } catch (e) {}
    }, 300);
    return () => clearTimeout(t);
  }, [open, studentQuery]);

  useEffect(() => {
    if (open) {
      setSubject('');
      setStudent('');
      setValue(5);
      setType('other');
      setDate('');
      setComment('');
      setErr(null);
      setSaving(false);
      setStudentQuery('');
    }
  }, [open]);

  if (!open) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await gradesApi.create({
        student,
        subject,
        value: Number(value),
        type,
        date: date || undefined,
        comment,
      });
      onCreated?.();
    } catch (e) {
      setErr(e.message || 'Failed to create grade.');
      setSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
      <div className='w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-900'>Add grade</h3>
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
              Subject
            </label>
            <select
              className='w-full rounded-xl bg-gray-50 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-600'
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            >
              <option value='' disabled>
                Select subject…
              </option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

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

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700'>
                Value (1–5)
              </label>
              <input
                type='number'
                min={1}
                max={5}
                className='w-full rounded-xl bg-gray-50 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-600'
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700'>
                Type
              </label>
              <select
                className='w-full rounded-xl bg-gray-50 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-600'
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value='written'>Written</option>
                <option value='oral'>Oral</option>
                <option value='test'>Test</option>
                <option value='final'>Final</option>
                <option value='other'>Other</option>
              </select>
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700'>
                Date
              </label>
              <input
                type='date'
                className='w-full rounded-xl bg-gray-50 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-600'
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Comment
            </label>
            <textarea
              rows={3}
              className='w-full rounded-xl bg-gray-50 px-4 py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-600'
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder='Optional'
            />
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
              <Save size={16} /> {saving ? 'Saving…' : 'Create grade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
