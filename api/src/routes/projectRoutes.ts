import { Router } from "express";
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  archiveProject,
  unarchiveProject,
  cleanupArchivedProjects
} from "../controllers/projectController";

const r = Router();
r.get("/", listProjects);
r.get("/:id", getProject);
r.post("/", createProject);
r.put("/:id", updateProject);
r.delete("/:id", deleteProject);
r.post("/:id/archive", archiveProject);
r.post("/:id/unarchive", unarchiveProject);
r.post('/cleanup/archived', cleanupArchivedProjects);

export default r;