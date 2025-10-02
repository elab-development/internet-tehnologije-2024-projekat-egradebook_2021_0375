import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { adminStatsApi } from '../../lib/api';
import { BarChart3, Users, BookOpen, FileText, StickyNote } from 'lucide-react';

function Card({ title, subtitle, children, right }) {
  return (
    <section className='rounded-2xl bg-white p-4 shadow'>
      <div className='mb-3 flex items-center justify-between'>
        <div>
          <h3 className='text-base font-semibold text-gray-900'>{title}</h3>
          {subtitle && <p className='text-xs text-gray-500'>{subtitle}</p>}
        </div>
        {right}
      </div>
      <div className='h-[280px] w-full'>{children}</div>
    </section>
  );
}

const COLORS = [
  '#16a34a',
  '#22c55e',
  '#86efac',
  '#065f46',
  '#34d399',
  '#047857',
];
const ROLE_ORDER = ['admin', 'professor', 'student', 'parent'];

export default function ChartsOverview() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [overview, setOverview] = useState(null);
  const [avgBySubject, setAvgBySubject] = useState([]);
  const [distribution, setDistribution] = useState({ buckets: [], total: 0 });
  const [activity, setActivity] = useState({ days: [] });
  const [notesVis, setNotesVis] = useState([]);
  const [topTeachers, setTopTeachers] = useState([]);
  const [classSizes, setClassSizes] = useState([]);

  const [days, setDays] = useState(14);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [ov, avg, dist, act, vis, top, classes] = await Promise.all([
          adminStatsApi.overview(),
          adminStatsApi.gradesAvgBySubject({}),
          adminStatsApi.gradesDistribution({}),
          adminStatsApi.activityByDay({ days }),
          adminStatsApi.notesByVisibility({}),
          adminStatsApi.topTeachersByGrades({ limit: 5 }),
          adminStatsApi.studentCountByClass(),
        ]);
        setOverview(ov);
        setAvgBySubject(avg.items || []);
        setDistribution(dist || { buckets: [], total: 0 });
        setActivity(act || { days: [] });
        setNotesVis(vis.items || []);
        setTopTeachers(top.items || []);
        setClassSizes(classes.items || []);
      } catch (e) {
        setErr(e.message || 'Failed to load charts');
      } finally {
        setLoading(false);
      }
    })();
  }, [days]);

  const usersByRole = useMemo(() => {
    const counts = Object.fromEntries(ROLE_ORDER.map((r) => [r, 0]));
    (overview?.usersByRole || []).forEach((r) => {
      counts[r.role] = r.count;
    });
    return ROLE_ORDER.map((r) => ({ role: r, count: counts[r] }));
  }, [overview]);

  const totals = overview?.totals;

  if (err) {
    return (
      <div className='rounded-2xl bg-red-50 p-4 text-sm text-red-700 shadow'>
        {err}
      </div>
    );
  }

  if (loading) {
    return (
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className='h-28 animate-pulse rounded-2xl bg-white shadow'
          />
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* OVERVIEW TILES */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Tile
          icon={Users}
          label='Users'
          value={usersByRole.reduce((a, b) => a + b.count, 0)}
          chips={usersByRole.map((u) => ({ label: u.role, value: u.count }))}
        />
        <Tile icon={BookOpen} label='Subjects' value={totals?.subjects ?? 0} />
        <Tile icon={FileText} label='Grades' value={totals?.grades ?? 0} />
        <Tile icon={StickyNote} label='Notes' value={totals?.notes ?? 0} />
      </div>

      {/* ACTIVITY line (grades vs notes) */}
      <Card
        title='Activity by day'
        subtitle='Grades (by date) vs Notes (creation)'
        right={
          <div className='flex items-center gap-2'>
            <span className='text-xs text-gray-500'>Last</span>
            <select
              className='rounded-xl bg-gray-50 px-2 py-1 text-sm shadow-inner outline-none focus:ring-2 focus:ring-green-600'
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value, 10))}
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
            </select>
          </div>
        }
      >
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart data={activity.days}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line
              type='monotone'
              dataKey='grades'
              stroke='#16a34a'
              strokeWidth={2}
              dot={false}
            />
            <Line
              type='monotone'
              dataKey='notes'
              stroke='#86efac'
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* AVG BY SUBJECT bar */}
      <Card title='Average grade by subject' subtitle='Last ~90 days'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={avgBySubject.slice(0, 12)}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='code' tick={{ fontSize: 12 }} />
            <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v, n, o) => [v, `${o.payload.name}`]} />
            <Bar dataKey='avg' fill='#16a34a'>
              {avgBySubject.slice(0, 12).map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* GRADE DISTRIBUTION bar */}
      <Card
        title='Grade distribution (1–5)'
        subtitle='All subjects, last ~90 days'
      >
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={distribution.buckets}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='value' tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey='count' fill='#22c55e'>
              {distribution.buckets.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* NOTES by visibility donut */}
      <Card title='Notes by visibility' subtitle='Last ~90 days'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={notesVis}
              dataKey='count'
              nameKey='visibility'
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {notesVis.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* TOP TEACHERS horizontal bar */}
      <Card title='Top teachers by number of grades' subtitle='Last ~90 days'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={topTeachers} layout='vertical' margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis type='number' allowDecimals={false} />
            <YAxis
              type='category'
              dataKey='fullName'
              width={120}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Bar dataKey='count' fill='#065f46'>
              {topTeachers.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* STUDENTS per class */}
      <Card title='Students per class' subtitle='Current roster'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={classSizes}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='classLabel' tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey='count' fill='#34d399'>
              {classSizes.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function Tile({ icon: Icon = BarChart3, label, value, chips }) {
  return (
    <div className='rounded-2xl bg-white p-4 shadow'>
      <div className='mb-2 flex items-center gap-2'>
        <span className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow'>
          <Icon size={18} />
        </span>
        <div>
          <div className='text-sm font-medium text-gray-600'>{label}</div>
          <div className='text-2xl font-bold text-gray-900'>{value}</div>
        </div>
      </div>
      {Array.isArray(chips) && chips.length > 0 && (
        <div className='mt-2 flex flex-wrap gap-2'>
          {chips.map((c) => (
            <span
              key={c.label}
              className='inline-flex items-center rounded-xl bg-green-50 px-2 py-1 text-xs font-medium text-green-700 shadow-inner'
            >
              {c.label}: {c.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
