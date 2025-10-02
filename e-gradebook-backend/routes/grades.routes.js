import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { listGrades, createGrade } from '../controllers/grades.controller.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', listGrades);
router.post('/', requireRole('professor'), createGrade);

export default router;