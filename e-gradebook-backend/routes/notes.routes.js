import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { listNotes, createNote } from '../controllers/notes.controller.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', listNotes);
router.post('/', requireRole('professor', 'admin'), createNote);

export default router;