import mongoose from 'mongoose';
import { User } from '../models/User.js';

function mapRef(p) {
  if (!p) return null;
  if (typeof p === 'object' && (p.fullName || p.email || p.role)) {
    return {
      id: String(p._id ?? p.id),
      fullName: p.fullName,
      email: p.email,
      role: p.role,
    };
  }
  return String(p);
}

function toPublicUser(u) {
  return {
    id: u._id?.toString?.() ?? u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    classLabel: u.classLabel,
    parents: (u.parents || []).map(mapRef).filter(Boolean),
    children: (u.children || []).map(mapRef).filter(Boolean),
  };
}

const isId = (v) => mongoose.Types.ObjectId.isValid(String(v));
const uniqStr = (arr) => Array.from(new Set(arr.map(String)));
const diff = (a, b) => {
  const A = new Set(a.map(String));
  const B = new Set(b.map(String));
  return {
    toAdd: [...B].filter((x) => !A.has(x)),
    toRemove: [...A].filter((x) => !B.has(x)),
  };
};

export async function listUsers(req, res) {
  try {
    const requesterRole = req.user.role;

    const page = Math.max(parseInt(req.query.page ?? '1', 10), 1);
    const limit = Math.max(
      Math.min(parseInt(req.query.limit ?? '25', 10), 100),
      1
    );
    const q = (req.query.q ?? '').trim();
    const roleParam = req.query.role?.trim();

    const filter = {};

    if (requesterRole === 'admin') {
      if (roleParam) filter.role = roleParam;
    } else if (requesterRole === 'professor') {
      filter.role = 'student';
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (q) {
      filter.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      User.find(filter)
        .select('fullName email role classLabel parents children')
        .sort({ fullName: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return res.json({
      message: 'Users fetched',
      items: items.map(toPublicUser),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('USERS_LIST_ERROR', err);
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
}

export async function getUser(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .populate({ path: 'parents', select: 'fullName email role' })
      .populate({ path: 'children', select: 'fullName email role classLabel' })
      .lean();

    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ message: 'User fetched', user: toPublicUser(user) });
  } catch (err) {
    console.error('USERS_GET_ERROR', err);
    return res.status(500).json({ message: 'Failed to fetch user' });
  }
}

export async function setParents(req, res) {
  try {
    const { id } = req.params;
    let { parents } = req.body || {};
    if (!Array.isArray(parents)) parents = [];

    const student = await User.findById(id);
    if (!student) return res.status(404).json({ message: 'User not found' });
    if (student.role !== 'student') {
      return res
        .status(400)
        .json({ message: 'Target user must be a student.' });
    }

    const parentIds = uniqStr(parents).filter(
      (p) => isId(p) && String(p) !== String(id)
    );

    const validParents = await User.find(
      { _id: { $in: parentIds }, role: 'parent' },
      '_id'
    ).lean();
    if (validParents.length !== parentIds.length) {
      return res.status(400).json({
        message: 'One or more parent IDs are invalid or not parents.',
      });
    }

    const oldParentIds = (student.parents || []).map((p) => String(p));
    const { toAdd, toRemove } = diff(oldParentIds, parentIds);

    student.parents = parentIds;
    await student.save();

    if (toRemove.length) {
      await User.updateMany(
        { _id: { $in: toRemove } },
        { $pull: { children: student._id } }
      );
    }
    if (toAdd.length) {
      await User.updateMany(
        { _id: { $in: toAdd } },
        { $addToSet: { children: student._id } }
      );
    }

    const populated = await User.findById(student._id)
      .populate({ path: 'parents', select: 'fullName email role' })
      .populate({ path: 'children', select: 'fullName email role classLabel' })
      .lean();

    return res.json({
      message: 'Parents updated',
      user: toPublicUser(populated),
    });
  } catch (err) {
    console.error('USERS_SET_PARENTS_ERROR', err);
    return res.status(500).json({ message: 'Failed to update parents' });
  }
}

export async function setChildren(req, res) {
  try {
    const { id } = req.params;
    let { children } = req.body || {};
    if (!Array.isArray(children)) children = [];

    const parent = await User.findById(id);
    if (!parent) return res.status(404).json({ message: 'User not found' });
    if (parent.role !== 'parent') {
      return res.status(400).json({ message: 'Target user must be a parent.' });
    }

    const childIds = uniqStr(children).filter(
      (c) => isId(c) && String(c) !== String(id)
    );

    const validChildren = await User.find(
      { _id: { $in: childIds }, role: 'student' },
      '_id'
    ).lean();
    if (validChildren.length !== childIds.length) {
      return res.status(400).json({
        message: 'One or more child IDs are invalid or not students.',
      });
    }

    const oldChildIds = (parent.children || []).map((c) => String(c));
    const { toAdd, toRemove } = diff(oldChildIds, childIds);

    parent.children = childIds;
    await parent.save();

    if (toRemove.length) {
      await User.updateMany(
        { _id: { $in: toRemove } },
        { $pull: { parents: parent._id } }
      );
    }
    if (toAdd.length) {
      await User.updateMany(
        { _id: { $in: toAdd } },
        { $addToSet: { parents: parent._id } }
      );
    }

    const populated = await User.findById(parent._id)
      .populate({ path: 'parents', select: 'fullName email role' })
      .populate({ path: 'children', select: 'fullName email role classLabel' })
      .lean();

    return res.json({
      message: 'Children updated',
      user: toPublicUser(populated),
    });
  } catch (err) {
    console.error('USERS_SET_CHILDREN_ERROR', err);
    return res.status(500).json({ message: 'Failed to update children' });
  }
}
