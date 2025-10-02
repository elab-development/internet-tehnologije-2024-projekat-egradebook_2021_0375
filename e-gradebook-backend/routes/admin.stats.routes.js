import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import {
  overview,
  gradesAvgBySubject,
  gradesDistribution,
  activityByDay,
  notesByVisibility,
  topTeachersByGrades,
  studentCountByClass,
} from '../controllers/admin.stats.controller.js';

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/overview', overview);
router.get('/grades/avg-by-subject', gradesAvgBySubject);
router.get('/grades/distribution', gradesDistribution);
router.get('/activity/by-day', activityByDay);
router.get('/notes/by-visibility', notesByVisibility);
router.get('/teachers/top', topTeachersByGrades);
router.get('/classes/student-count', studentCountByClass);

export default router;
