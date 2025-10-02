import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import {
  listUsers,
  getUser,
  setParents,
  setChildren,
} from '../controllers/users.controller.js';
const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/', listUsers);
router.get('/:id', getUser);
router.patch('/:id/parents', setParents);
router.patch('/:id/children', setChildren);
export default router;