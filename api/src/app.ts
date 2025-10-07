import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import todoRoutes from './routes/todoRoutes';
import projectRoutes from './routes/projectRoutes';
import sectionRoutes from './routes/sectionRoutes';

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://127.0.0.1:5173', 
    'http://127.0.0.1:5174',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.options('*', cors());

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Body parser middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

// API routes
app.use('/api/todos', todoRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sections', sectionRoutes);

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('UNHANDLED_ERROR:', err?.message ?? err);
  if (err?.stack) console.error(err.stack);
  
  const isDev = process.env.NODE_ENV !== 'production';
  const code = Number(err?.status || err?.statusCode) || 500;
  
  const payload = isDev 
    ? { error: 'SERVER_ERROR', message: err?.message || 'Internal Server Error', stack: err?.stack }
    : { error: 'SERVER_ERROR', message: 'Internal Server Error' };
  
  try {
    res.status(code).json(payload);
  } catch (e) {
    console.error('Failed to send error response:', e);
  }
});

export default app;
