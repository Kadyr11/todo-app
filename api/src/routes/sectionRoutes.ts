import { Router } from "express";
import {
  listSections,
  getSection,
  createSection,
  updateSection,
  deleteSection
} from "../controllers/sectionController";

const r = Router();
r.get("/", listSections);
r.get("/:id", getSection);
r.post("/", createSection);
r.put("/:id", updateSection);
r.delete("/:id", deleteSection);

export default r;