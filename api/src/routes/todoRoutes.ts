
import { Router } from "express";
import { listTodos, getTodo, createTodo, updateTodo, deleteTodo, cleanupDeletedTodos } from "../controllers/todoController";
import { restoreTodo } from "../controllers/todoController";

const r = Router();
r.get("/", listTodos);
r.get("/:id", getTodo);
r.post("/", createTodo);
r.put("/:id", updateTodo);
r.delete("/:id", deleteTodo);
r.post("/:id/restore", restoreTodo);
r.post("/cleanup", cleanupDeletedTodos);

export default r;