import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import todoRoutes from "./routes/todoRoutes";
import projectRoutes from "./routes/projectRoutes";
import sectionRoutes from "./routes/sectionRoutes";

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  credentials: true
}));
app.options('*', cors());
app.use(helmet({
  crossOriginResourcePolicy: false, // не переопределять CORS
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(express.json()); // обязательно до роутов

app.get("/health", (_req, res) => res.status(200).json({ ok: true }));
app.use("/api/todos", todoRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/sections", sectionRoutes);

app.use((err: any, _req: any, _res: any, _next: any) => {
  // Centralized error logging
  console.error("UNHANDLED_ERROR:", err?.message ?? err);
  if (err?.stack) console.error(err.stack);

  // In development expose the error message for easier debugging
  const isDev = process.env.NODE_ENV !== 'production';
  const payload = isDev ? { message: err?.message ?? 'Internal Server Error', stack: err?.stack } : { message: 'Internal Server Error' };

  // Use the express Response object from the closure (avoid using _res param name)
  try {
    // @ts-ignore
    _res.status(500).json(payload);
  } catch (e) {
    // If response is already finished, just log the extra error
    console.error('Failed to send error response', e);
  }
});

app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0', () => {
  console.log(`API running at http://0.0.0.0:${process.env.PORT ?? 3000}`);
});