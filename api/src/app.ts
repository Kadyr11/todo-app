import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import todoRoutes from './routes/todoRoutes';
import projectRoutes from './routes/projectRoutes';
import sectionRoutes from './routes/sectionRoutes';

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  credentials: true,
}));
app.options('*', cors());

app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// JSON parser
app.use(express.json());

// health
app.get('/health', (_req, res) => res.json({ ok: true }));

// mount API routers
app.use('/api/todos', todoRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sections', sectionRoutes);

// final error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('UNHANDLED_ERROR:', err?.message ?? err);
  if (err?.stack) console.error(err.stack);
  const code = Number(err?.status || err?.statusCode) || 500;
  res.status(code).json({ error: 'SERVER_ERROR', message: err?.message || 'Unexpected error' });
});

export default app;
