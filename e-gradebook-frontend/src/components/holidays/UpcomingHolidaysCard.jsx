import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { getPublicHolidays } from '../../lib/publicApi';

function fmt(d) {
  return new Date(d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function UpcomingHolidaysCard({ lookaheadDays = 60 }) {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const now = new Date();
        const year = now.getFullYear();
        const thisYear = await getPublicHolidays(year);
        const nextYearNeeded = now.getMonth() >= 10; // Nov/Dec
        const nextYear = nextYearNeeded
          ? await getPublicHolidays(year + 1)
          : [];
        const all = [...thisYear, ...nextYear];

        const upcoming = all
          .filter((h) => new Date(h.date) >= new Date(now.toDateString()))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setItems(upcoming);
      } catch (e) {
        setErr(e.message || 'Failed to load holidays');
      } finally {
        setLoading(false);
      }
    })();
  }, [lookaheadDays]);

  const nextFew = useMemo(() => items.slice(0, 3), [items]);

  return (
    <div className='group block rounded-2xl bg-white p-5 shadow-md transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-600'>
      <div className='mb-3 flex items-center gap-3'>
        <span className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow'>
          <CalendarDays size={18} />
        </span>
        <h3 className='text-lg font-semibold text-gray-900'>
          Upcoming holidays
        </h3>
      </div>

      {loading && <p className='text-sm text-gray-600'>Loading…</p>}
      {err && (
        <p className='rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 shadow'>
          {err}
        </p>
      )}

      {!loading && !err && (
        <>
          {nextFew.length === 0 ? (
            <p className='text-sm text-gray-600'>No upcoming holidays soon.</p>
          ) : (
            <ul className='space-y-2'>
              {nextFew.map((h) => (
                <li
                  key={h.date}
                  className='flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 shadow-inner'
                >
                  <span className='text-sm text-gray-900'>
                    {h.localName || h.name}
                  </span>
                  <span className='text-xs font-medium text-green-700'>
                    {fmt(h.date)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className='mt-4'>
            <Link
              to='/holidays'
              className='inline-flex items-center rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-green-700'
            >
              See all holidays
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
