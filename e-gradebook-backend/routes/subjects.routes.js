import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import {
  listSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subjects.controller.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', listSubjects);
router.get('/:id', getSubject);

router.post('/', requireRole('admin'), createSubject);
router.patch('/:id', requireRole('admin'), updateSubject);
router.delete('/:id', requireRole('admin'), deleteSubject);

export default router;