import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0"; // чтобы телефон видел API

app.listen(PORT, HOST, () => {
  console.log(`API running on http://${HOST}:${PORT}`);
});
