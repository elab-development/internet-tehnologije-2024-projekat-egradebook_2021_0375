import mongoose from 'mongoose';
import { Note } from '../models/Note.js';
import { User } from '../models/User.js';

const isId = (v) => mongoose.Types.ObjectId.isValid(String(v));
const ALLOWED_VIS = ['staff', 'parent', 'student', 'all'];

const basePopulate = [
  { path: 'student', select: 'fullName email role classLabel' },
  { path: 'author', select: 'fullName email role' },
];

export async function listNotes(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page ?? '1', 10), 1);
    const limit = Math.max(
      Math.min(parseInt(req.query.limit ?? '50', 10), 200),
      1
    );

    const q = (req.query.q ?? '').trim();
    const studentParam = (req.query.student ?? '').trim();
    const authorParam = (req.query.author ?? '').trim();
    const visibility = (req.query.visibility ?? '').trim();
    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;

    const filter = {};
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { text: { $regex: q, $options: 'i' } },
      ];
    }

    if (studentParam && studentParam !== 'me') {
      if (!isId(studentParam))
        return res.status(400).json({ message: 'Invalid student id.' });
      filter.student = studentParam;
    }
    if (authorParam && authorParam !== 'me') {
      if (!isId(authorParam))
        return res.status(400).json({ message: 'Invalid author id.' });
      filter.author = authorParam;
    }

    if (visibility) {
      if (!ALLOWED_VIS.includes(visibility))
        return res.status(400).json({ message: 'Invalid visibility.' });
      filter.visibility = visibility;
    }

    if (from || to) {
      filter.createdAt = {};
      if (from && !Number.isNaN(from.getTime())) filter.createdAt.$gte = from;
      if (to && !Number.isNaN(to.getTime())) filter.createdAt.$lte = to;
    }

    const role = req.user.role;
    const myId = req.user.id;

    if (role === 'admin') {
    } else if (role === 'professor') {
      filter.author = myId;
    } else if (role === 'student') {
      filter.student = myId;
      filter.visibility = { $in: ['student', 'all'] };
    } else if (role === 'parent') {
      const me = await User.findById(myId).select('children').lean();
      const childIds = (me?.children || []).map((c) => String(c));
      if (childIds.length === 0) {
        return res.json({
          message: 'Notes fetched',
          items: [],
          pagination: { page, limit, total: 0, pages: 0 },
        });
      }
      if (filter.student) {
        const requested = Array.isArray(filter.student.$in)
          ? filter.student.$in
          : [filter.student];
        const allAllowed = requested.every((id) =>
          childIds.includes(String(id))
        );
        if (!allAllowed)
          return res
            .status(403)
            .json({ message: 'Not allowed to view requested student notes.' });
      } else {
        filter.student = { $in: childIds };
      }
      filter.visibility = { $in: ['parent', 'all'] };
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (studentParam === 'me') filter.student = myId;
    if (authorParam === 'me') filter.author = myId;

    const [items, total] = await Promise.all([
      Note.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate(basePopulate)
        .lean(),
      Note.countDocuments(filter),
    ]);

    return res.json({
      message: 'Notes fetched',
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('NOTES_LIST_ERROR', err);
    return res.status(500).json({ message: 'Failed to fetch notes' });
  }
}

export async function createNote(req, res) {
  try {
    if (!['professor', 'admin'].includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Only professors or admins can create notes.' });
    }

    const author = req.user.id;
    const { student, title, text = '', visibility = 'all' } = req.body || {};

    if (!student || !title) {
      return res
        .status(400)
        .json({ message: 'student and title are required.' });
    }
    if (!isId(student)) {
      return res.status(400).json({ message: 'Invalid student id.' });
    }
    if (!ALLOWED_VIS.includes(visibility)) {
      return res.status(400).json({ message: 'Invalid visibility.' });
    }

    const studentDoc = await User.findById(student).select('role').lean();
    if (!studentDoc)
      return res.status(404).json({ message: 'Student not found.' });
    if (studentDoc.role !== 'student') {
      return res.status(400).json({ message: 'Target user is not a student.' });
    }

    const note = await Note.create({
      student,
      author,
      title,
      text,
      visibility,
    });
    const populated = await Note.findById(note._id)
      .populate(basePopulate)
      .lean();

    return res.status(201).json({ message: 'Note created', note: populated });
  } catch (err) {
    console.error('NOTES_CREATE_ERROR', err);
    return res.status(500).json({ message: 'Failed to create note' });
  }
}