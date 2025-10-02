import { User } from '../models/User.js';

export async function listUsers(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page ?? '1', 10), 1);
    const limit = Math.max(
      Math.min(parseInt(req.query.limit ?? '25', 10), 100),
      1
    );
    const q = (req.query.q ?? '').trim();
    const role = req.query.role;

    const filter = {};
    if (role) filter.role = role;
    if (q) {
      filter.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      User.find(filter)
        .select('fullName email role')
        .sort({ fullName: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return res.json({
      message: 'Users fetched',
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('USERS_LIST_ERROR', err);
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
}