import { useEffect, useMemo, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { HOLIDAYS_COUNTRY, getPublicHolidays } from '../lib/publicApi';

function fmt(d) {
  return new Date(d).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Holidays() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const now = new Date();
        const y = now.getFullYear();
        const thisYear = await getPublicHolidays(y);
        const nextYear = await getPublicHolidays(y + 1); // to always have upcoming even late in the year
        const all = [...thisYear, ...nextYear]
          .filter((h) => new Date(h.date) >= new Date(now.toDateString()))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setItems(all);
      } catch (e) {
        setErr(e.message || 'Failed to load holidays');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const groups = useMemo(() => {
    const map = new Map();
    items.forEach((h) => {
      const key = new Date(h.date).getFullYear();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(h);
    });
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [items]);

  return (
    <div className='mx-auto max-w-5xl'>
      <div className='mb-6 flex items-center gap-3'>
        <span className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow'>
          <CalendarDays size={18} />
        </span>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Upcoming holidays
          </h1>
          <p className='text-sm text-gray-600'>
            Country: <b>{HOLIDAYS_COUNTRY}</b>
          </p>
        </div>
      </div>

      {err && (
        <div className='rounded-2xl bg-red-50 px-4 py-3 text-red-700 shadow'>
          {err}
        </div>
      )}

      {loading ? (
        <div className='rounded-2xl bg-white p-8 text-center text-gray-600 shadow'>
          Loading…
        </div>
      ) : items.length === 0 ? (
        <div className='rounded-2xl bg-white p-8 text-center text-gray-600 shadow'>
          No upcoming holidays.
        </div>
      ) : (
        <div className='space-y-6'>
          {groups.map(([year, list]) => (
            <section key={year} className='rounded-2xl bg-white p-4 shadow'>
              <h2 className='mb-3 text-lg font-semibold text-gray-900'>
                {year}
              </h2>
              <ul className='divide-y divide-gray-100'>
                {list.map((h) => (
                  <li
                    key={h.date}
                    className='flex items-start justify-between gap-4 px-2 py-3'
                  >
                    <div className='min-w-0'>
                      <div className='truncate text-sm font-medium text-gray-900'>
                        {h.localName || h.name}
                      </div>
                      {h.localName && h.localName !== h.name && (
                        <div className='truncate text-xs text-gray-500'>
                          {h.name}
                        </div>
                      )}
                    </div>
                    <div className='shrink-0 text-sm font-semibold text-green-700'>
                      {fmt(h.date)}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
