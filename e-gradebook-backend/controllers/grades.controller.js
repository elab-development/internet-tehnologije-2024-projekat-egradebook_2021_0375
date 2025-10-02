import mongoose from 'mongoose';
import { Grade } from '../models/Grade.js';
import { User } from '../models/User.js';
import { Subject } from '../models/Subject.js';

const isId = (v) => mongoose.Types.ObjectId.isValid(String(v));
const ALLOWED_TYPES = ['written', 'oral', 'test', 'final', 'other'];

const basePopulate = [
  { path: 'student', select: 'fullName email role classLabel' },
  { path: 'teacher', select: 'fullName email role' },
  { path: 'subject', select: 'name code' },
];

export async function listGrades(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page ?? '1', 10), 1);
    const limit = Math.max(
      Math.min(parseInt(req.query.limit ?? '50', 10), 200),
      1
    );

    const subjectParam = (req.query.subject ?? '').trim();
    const teacherParam = (req.query.teacher ?? '').trim();
    const studentParam = (req.query.student ?? '').trim();
    const typeParam = (req.query.type ?? '').trim();
    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;

    const filter = {};

    if (typeParam) {
      if (!ALLOWED_TYPES.includes(typeParam)) {
        return res.status(400).json({ message: 'Invalid grade type.' });
      }
      filter.type = typeParam;
    }

    if (subjectParam) {
      if (!isId(subjectParam))
        return res.status(400).json({ message: 'Invalid subject id.' });
      filter.subject = subjectParam;
    }

    if (teacherParam && teacherParam !== 'me') {
      if (!isId(teacherParam))
        return res.status(400).json({ message: 'Invalid teacher id.' });
      filter.teacher = teacherParam;
    }
    if (studentParam && studentParam !== 'me') {
      if (!isId(studentParam))
        return res.status(400).json({ message: 'Invalid student id.' });
      filter.student = studentParam;
    }

    if (from || to) {
      filter.date = {};
      if (from && !Number.isNaN(from.getTime())) filter.date.$gte = from;
      if (to && !Number.isNaN(to.getTime())) filter.date.$lte = to;
    }

    const role = req.user.role;
    const myId = req.user.id;

    if (role === 'admin') {
    } else if (role === 'professor') {
      filter.teacher = myId;
    } else if (role === 'student') {
      filter.student = myId;
    } else if (role === 'parent') {
      const me = await User.findById(myId).select('children').lean();
      const childIds = (me?.children || []).map((c) => String(c));
      if (childIds.length === 0) {
        return res.json({
          message: 'Grades fetched',
          items: [],
          pagination: { page, limit, total: 0, pages: 0 },
        });
      }
      if (filter.student) {
        if (!childIds.includes(String(filter.student))) {
          return res
            .status(403)
            .json({ message: 'Not allowed to view requested student grades.' });
        }
      } else {
        filter.student = { $in: childIds };
      }
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (teacherParam === 'me') filter.teacher = myId;
    if (studentParam === 'me') filter.student = myId;

    const [items, total] = await Promise.all([
      Grade.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate(basePopulate)
        .lean(),
      Grade.countDocuments(filter),
    ]);

    return res.json({
      message: 'Grades fetched',
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('GRADES_LIST_ERROR', err);
    return res.status(500).json({ message: 'Failed to fetch grades' });
  }
}

export async function createGrade(req, res) {
  try {
    if (req.user.role !== 'professor') {
      return res
        .status(403)
        .json({ message: 'Only professors can create grades.' });
    }
    const teacherId = req.user.id;

    const {
      student,
      subject,
      value,
      type = 'other',
      date,
      comment = '',
    } = req.body || {};

    if (!student || !subject || typeof value !== 'number') {
      return res
        .status(400)
        .json({ message: 'student, subject and numeric value are required.' });
    }
    if (!isId(student) || !isId(subject)) {
      return res
        .status(400)
        .json({ message: 'Invalid student or subject id.' });
    }
    if (value < 1 || value > 5) {
      return res
        .status(400)
        .json({ message: 'value must be between 1 and 5.' });
    }
    if (type && !ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ message: 'Invalid grade type.' });
    }

    const [studentDoc, subjectDoc] = await Promise.all([
      User.findById(student).select('role').lean(),
      Subject.findById(subject).select('teachers').lean(),
    ]);
    if (!studentDoc)
      return res.status(404).json({ message: 'Student not found.' });
    if (studentDoc.role !== 'student') {
      return res.status(400).json({ message: 'Target user is not a student.' });
    }
    if (!subjectDoc)
      return res.status(404).json({ message: 'Subject not found.' });

    const teachesThisSubject = (subjectDoc.teachers || [])
      .map((t) => String(t))
      .includes(String(teacherId));
    if (!teachesThisSubject) {
      return res.status(403).json({
        message: 'You are not assigned as a teacher for this subject.',
      });
    }

    const grade = await Grade.create({
      student,
      subject,
      teacher: teacherId,
      value,
      type,
      date: date ? new Date(date) : undefined,
      comment,
    });

    const populated = await Grade.findById(grade._id)
      .populate(basePopulate)
      .lean();
    return res.status(201).json({ message: 'Grade created', grade: populated });
  } catch (err) {
    console.error('GRADES_CREATE_ERROR', err);
    return res.status(500).json({ message: 'Failed to create grade' });
  }
}