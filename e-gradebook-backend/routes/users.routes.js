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

router.use(requireAuth);

router.get('/', listUsers);
router.get('/:id', requireRole('admin'), getUser);
router.patch('/:id/parents', requireRole('admin'), setParents);
router.patch('/:id/children', requireRole('admin'), setChildren);
export default router;