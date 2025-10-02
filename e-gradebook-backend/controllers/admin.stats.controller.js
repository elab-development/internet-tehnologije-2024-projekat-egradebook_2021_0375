import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Subject } from '../models/Subject.js';
import { Grade } from '../models/Grade.js';
import { Note } from '../models/Note.js';

const isId = (v) => mongoose.Types.ObjectId.isValid(String(v));

function parseDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}
function dateRangeFromQuery(
  req,
  { useDomainDate = true, fallbackDays = 30 } = {}
) {
  // Grades have both "date" (domain) and timestamps. For analytics we default to domain date.
  const fromQ = parseDate(req.query.from);
  const toQ = parseDate(req.query.to);
  if (fromQ || toQ) {
    return {
      field: useDomainDate ? 'date' : 'createdAt',
      match: {
        ...(fromQ ? { $gte: fromQ } : {}),
        ...(toQ ? { $lte: toQ } : {}),
      },
    };
  }
  // Default: last N days ending today
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - Number(req.query.days || fallbackDays));
  return {
    field: useDomainDate ? 'date' : 'createdAt',
    match: { $gte: from, $lte: to },
  };
}

export async function overview(req, res) {
  try {
    // users by role
    const usersByRoleAgg = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $project: { _id: 0, role: '$_id', count: 1 } },
    ]);

    const [subjectsCount, gradesCount, notesCount] = await Promise.all([
      Subject.countDocuments(),
      Grade.countDocuments(),
      Note.countDocuments(),
    ]);

    // last 7 days activity
    const now = new Date();
    const from = new Date();
    from.setDate(now.getDate() - 6); // include today → 7 points
    const gradesDaily = await Grade.aggregate([
      { $match: { date: { $gte: new Date(from.toDateString()), $lte: now } } },
      {
        $group: {
          _id: { $dateTrunc: { date: '$date', unit: 'day' } },
          count: { $sum: 1 },
        },
      },
      { $project: { date: '$_id', count: 1, _id: 0 } },
      { $sort: { date: 1 } },
    ]);
    const notesDaily = await Note.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(from.toDateString()), $lte: now },
        },
      },
      {
        $group: {
          _id: { $dateTrunc: { date: '$createdAt', unit: 'day' } },
          count: { $sum: 1 },
        },
      },
      { $project: { date: '$_id', count: 1, _id: 0 } },
      { $sort: { date: 1 } },
    ]);

    // normalize to 7 entries
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const g =
        gradesDaily.find((x) => x.date.toISOString().slice(0, 10) === key)
          ?.count || 0;
      const n =
        notesDaily.find((x) => x.date.toISOString().slice(0, 10) === key)
          ?.count || 0;
      days.push({ date: key, grades: g, notes: n });
    }

    return res.json({
      usersByRole: usersByRoleAgg,
      totals: {
        subjects: subjectsCount,
        grades: gradesCount,
        notes: notesCount,
      },
      last7Days: { days },
    });
  } catch (err) {
    console.error('ADMIN_STATS_OVERVIEW_ERROR', err);
    return res.status(500).json({ message: 'Failed to build overview stats' });
  }
}

export async function gradesAvgBySubject(req, res) {
  try {
    const { field, match } = dateRangeFromQuery(req, {
      useDomainDate: true,
      fallbackDays: 90,
    });

    const rows = await Grade.aggregate([
      { $match: { [field]: match } },
      {
        $group: {
          _id: '$subject',
          avg: { $avg: '$value' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subject',
        },
      },
      { $unwind: '$subject' },
      {
        $project: {
          subjectId: '$_id',
          _id: 0,
          code: '$subject.code',
          name: '$subject.name',
          avg: { $round: ['$avg', 2] },
          count: 1,
        },
      },
      { $sort: { avg: -1 } },
    ]);

    return res.json({ items: rows });
  } catch (err) {
    console.error('ADMIN_STATS_AVG_SUBJECT_ERROR', err);
    return res.status(500).json({ message: 'Failed to compute averages' });
  }
}

export async function gradesDistribution(req, res) {
  try {
    const subject = req.query.subject?.trim();
    const { field, match } = dateRangeFromQuery(req, {
      useDomainDate: true,
      fallbackDays: 90,
    });

    const matchStage = { [field]: match };
    if (subject) {
      if (!isId(subject))
        return res.status(400).json({ message: 'Invalid subject id.' });
      matchStage.subject = new mongoose.Types.ObjectId(subject);
    }

    const agg = await Grade.aggregate([
      { $match: matchStage },
      { $group: { _id: '$value', count: { $sum: 1 } } },
      { $project: { _id: 0, value: '$_id', count: 1 } },
    ]);

    // Ensure 1..5
    const map = new Map(agg.map((r) => [Number(r.value), r.count]));
    const buckets = [1, 2, 3, 4, 5].map((v) => ({
      value: v,
      count: map.get(v) || 0,
    }));
    const total = buckets.reduce((a, b) => a + b.count, 0);

    return res.json({ buckets, total });
  } catch (err) {
    console.error('ADMIN_STATS_GRADE_DIST_ERROR', err);
    return res.status(500).json({ message: 'Failed to compute distribution' });
  }
}

export async function activityByDay(req, res) {
  try {
    const daysN = Math.max(
      1,
      Math.min(120, parseInt(req.query.days ?? '30', 10))
    );
    const now = new Date();
    const from = new Date();
    from.setDate(now.getDate() - (daysN - 1));

    const [g, n] = await Promise.all([
      Grade.aggregate([
        {
          $match: { date: { $gte: new Date(from.toDateString()), $lte: now } },
        },
        {
          $group: {
            _id: { $dateTrunc: { date: '$date', unit: 'day' } },
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, date: '$_id', count: 1 } },
      ]),
      Note.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(from.toDateString()), $lte: now },
          },
        },
        {
          $group: {
            _id: { $dateTrunc: { date: '$createdAt', unit: 'day' } },
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, date: '$_id', count: 1 } },
      ]),
    ]);

    const days = [];
    for (let i = 0; i < daysN; i++) {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: key,
        grades:
          g.find((x) => x.date.toISOString().slice(0, 10) === key)?.count || 0,
        notes:
          n.find((x) => x.date.toISOString().slice(0, 10) === key)?.count || 0,
      });
    }
    return res.json({ days });
  } catch (err) {
    console.error('ADMIN_STATS_ACTIVITY_ERROR', err);
    return res.status(500).json({ message: 'Failed to build activity series' });
  }
}

export async function notesByVisibility(req, res) {
  try {
    const { match } = dateRangeFromQuery(req, {
      useDomainDate: false,
      fallbackDays: 90,
    });
    const rows = await Note.aggregate([
      { $match: { createdAt: match } },
      { $group: { _id: '$visibility', count: { $sum: 1 } } },
      { $project: { _id: 0, visibility: '$_id', count: 1 } },
    ]);
    return res.json({ items: rows });
  } catch (err) {
    console.error('ADMIN_STATS_NOTES_VIS_ERROR', err);
    return res
      .status(500)
      .json({ message: 'Failed to compute notes visibility' });
  }
}

export async function topTeachersByGrades(req, res) {
  try {
    const limit = Math.max(
      1,
      Math.min(20, parseInt(req.query.limit ?? '5', 10))
    );
    const { field, match } = dateRangeFromQuery(req, {
      useDomainDate: true,
      fallbackDays: 90,
    });

    const rows = await Grade.aggregate([
      { $match: { [field]: match } },
      { $group: { _id: '$teacher', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'teacher',
        },
      },
      { $unwind: '$teacher' },
      {
        $project: {
          _id: 0,
          teacherId: '$teacher._id',
          fullName: '$teacher.fullName',
          email: '$teacher.email',
          count: 1,
        },
      },
    ]);

    return res.json({ items: rows });
  } catch (err) {
    console.error('ADMIN_STATS_TOP_TEACHERS_ERROR', err);
    return res.status(500).json({ message: 'Failed to compute top teachers' });
  }
}

export async function studentCountByClass(req, res) {
  try {
    const rows = await User.aggregate([
      { $match: { role: 'student', classLabel: { $ne: null } } },
      { $group: { _id: '$classLabel', count: { $sum: 1 } } },
      { $project: { _id: 0, classLabel: '$_id', count: 1 } },
      { $sort: { classLabel: 1 } },
    ]);
    return res.json({ items: rows });
  } catch (err) {
    console.error('ADMIN_STATS_STUDENT_BY_CLASS_ERROR', err);
    return res.status(500).json({ message: 'Failed to compute class sizes' });
  }
}
