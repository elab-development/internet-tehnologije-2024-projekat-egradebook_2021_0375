import mongoose from 'mongoose';
import { Subject } from '../models/Subject.js';
import { User } from '../models/User.js';

function pickCreatePayload(body) {
  return {
    name: body?.name,
    code: body?.code,
    description: body?.description ?? '',
  };
}

function pickUpdatePayload(body) {
  const payload = {};
  if (typeof body?.name === 'string') payload.name = body.name;
  if (typeof body?.code === 'string') payload.code = body.code;
  if (typeof body?.description === 'string')
    payload.description = body.description;
  if (Array.isArray(body?.teachers)) payload.teachers = body.teachers;
  return payload;
}

export async function listSubjects(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page ?? '1', 10), 1);
    const limit = Math.max(
      Math.min(parseInt(req.query.limit ?? '10', 10), 100),
      1
    );
    const q = (req.query.q ?? '').trim();
    const teacherParam = (req.query.teacher ?? '').trim();

    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { code: { $regex: q, $options: 'i' } },
          ],
        }
      : {};
      if (teacherParam) {
      const teacherId = teacherParam === 'me' ? req.user.id : teacherParam;
      if (!mongoose.Types.ObjectId.isValid(teacherId)) {
        return res.status(400).json({ message: 'Invalid teacher parameter.' });
      }
      filter.teachers = teacherId;
    }

    const [items, total] = await Promise.all([
      Subject.find(filter)
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({ path: 'teachers', select: 'fullName email role' })
        .lean(),
      Subject.countDocuments(filter),
    ]);

    return res.json({
      message: 'Subjects fetched',
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('SUBJECT_LIST_ERROR', err);
    return res.status(500).json({ message: 'Failed to fetch subjects' });
  }
}

export async function getSubject(req, res) {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id)
      .populate({ path: 'teachers', select: 'fullName email role' })
      .lean();

    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    return res.json({ message: 'Subject fetched', subject });
  } catch (err) {
    console.error('SUBJECT_GET_ERROR', err);
    return res.status(500).json({ message: 'Failed to fetch subject' });
  }
}

export async function createSubject(req, res) {
  try {
    const payload = pickCreatePayload(req.body);

    if (!payload.name || !payload.code) {
      return res.status(400).json({ message: 'name and code are required.' });
    }

    const subject = await Subject.create(payload);
    return res.status(201).json({ message: 'Subject created', subject });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Subject code already exists.' });
    }
    console.error('SUBJECT_CREATE_ERROR', err);
    return res.status(500).json({ message: 'Failed to create subject' });
  }
}

export async function updateSubject(req, res) {
  try {
    const { id } = req.params;
    const payload = pickUpdatePayload(req.body);

    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    if (payload.name !== undefined) subject.name = payload.name;
    if (payload.code !== undefined) subject.code = payload.code;
    if (payload.description !== undefined)
      subject.description = payload.description;

    if (payload.teachers !== undefined) {
      if (!Array.isArray(payload.teachers)) {
        return res
          .status(400)
          .json({ message: 'teachers must be an array of user IDs.' });
      }
      const teacherIds = payload.teachers
        .filter(Boolean)
        .map(String)
        .filter((v) => mongoose.Types.ObjectId.isValid(v));

      const teachers = await User.find(
        { _id: { $in: teacherIds }, role: 'professor' },
        '_id'
      ).lean();
      if (teachers.length !== teacherIds.length) {
        return res.status(400).json({
          message: 'One or more teacher IDs are invalid or not professors.',
        });
      }

      const oldTeacherIds = subject.teachers.map((t) => t.toString());
      const newTeacherIds = teachers.map((t) => t._id.toString());

      subject.teachers = newTeacherIds;

      const toRemove = oldTeacherIds.filter((x) => !newTeacherIds.includes(x));
      const toAdd = newTeacherIds.filter((x) => !oldTeacherIds.includes(x));

      if (toRemove.length) {
        await User.updateMany(
          { _id: { $in: toRemove } },
          { $pull: { subjectsTaught: subject._id } }
        );
      }
      if (toAdd.length) {
        await User.updateMany(
          { _id: { $in: toAdd } },
          { $addToSet: { subjectsTaught: subject._id } }
        );
      }
    }

    await subject.save();

    const populated = await Subject.findById(subject._id)
      .populate({ path: 'teachers', select: 'fullName email role' })
      .lean();

    return res.json({ message: 'Subject updated', subject: populated });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Subject code already exists.' });
    }
    console.error('SUBJECT_UPDATE_ERROR', err);
    return res.status(500).json({ message: 'Failed to update subject' });
  }
}

export async function deleteSubject(req, res) {
  try {
    const { id } = req.params;
    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    if (subject.teachers?.length) {
      await User.updateMany(
        { _id: { $in: subject.teachers } },
        { $pull: { subjectsTaught: subject._id } }
      );
    }

    return res.json({ message: 'Subject deleted' });
  } catch (err) {
    console.error('SUBJECT_DELETE_ERROR', err);
    return res.status(500).json({ message: 'Failed to delete subject' });
  }
}