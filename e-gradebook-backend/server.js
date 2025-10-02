import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import subjectRoutes from './routes/subjects.routes.js';
import usersRoutes from './routes/users.routes.js';
import gradesRoutes from './routes/grades.routes.js';
import notesRoutes from './routes/notes.routes.js';
import adminStatsRoutes from './routes/admin.stats.routes.js';

dotenv.config();

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'e-gradebook',
    time: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/grades', gradesRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/admin/stats', adminStatsRoutes);

connectDB(MONGODB_URI)
  .then(() =>
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    )
  )
  .catch((err) => {
    console.error('Mongo connection error:', err);
    process.exit(1);
  });
