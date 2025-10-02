import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { listUsers } from '../controllers/users.controller.js';

const router = express.Router();

router.get('/', requireAuth, requireRole('admin'), listUsers);

export default router;