import { Request, Response } from "express";
import { prisma } from "../database";
import { z } from "zod";

const TodoCreate = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["PENDING", "DONE"]).optional().default("PENDING"),
  dueDate: z.string().datetime().optional(),
  completed: z.boolean().optional(),
  priority: z.enum(["LOW","MEDIUM","HIGH","URGENT"]).optional(),
  sectionId: z.number().int().positive().optional(),
});

export async function listTodos(req: Request, res: Response) {
  try {
    const status = (req.query.status as "PENDING" | "DONE" | undefined) || undefined;
    const search = (req.query.search as string | undefined) || undefined;
    const includeDeleted = req.query.includeDeleted === 'true';

    const items = await prisma.todo.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(items);
  } catch (err) {
    console.error("listTodos failed:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getTodo(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    const includeDeleted = req.query.includeDeleted === 'true';

    const item = await prisma.todo.findFirst({
      where: { id, ...(includeDeleted ? {} : { deletedAt: null }) },
      include: {
        section: true
      }
    });
    if (!item) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(item);
  } catch (err) {
    console.error("getTodo failed:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function createTodo(req: Request, res: Response) {
  try {
    const parsed = TodoCreate.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }

    const { title, description, status, dueDate, completed, priority, sectionId } = parsed.data;
    const item = await prisma.todo.create({
      data: { 
        title, 
        description, 
        status,
        completed,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        sectionId
      },
      include: {
        section: true
      }
    });

    res.status(201).json(item);
  } catch (err) {
    console.error("createTodo failed:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateTodo(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    const parsed = TodoCreate.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }

    const { title, description, status, dueDate, completed, priority, sectionId } = parsed.data;
    const updateData: any = {};
    
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (typeof completed === "boolean") updateData.completed = completed;
    if (priority) updateData.priority = priority;
    if (sectionId !== undefined) updateData.sectionId = sectionId;
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    try {
      const item = await prisma.todo.update({ where: { id }, data: updateData });
      res.json(item);
    } catch (err: any) {
      if (err?.code === 'P2025') {
        // record to update not found
        return res.status(404).json({ message: "Not found" });
      }
      console.error("updateTodo failed:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } catch (err) {
    console.error("updateTodo failed:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteTodo(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    try {
      // Soft-delete: set deletedAt instead of physical delete
      const deleted = await (prisma as any).todo.update({ where: { id }, data: { deletedAt: new Date() } });
      res.status(200).json(deleted);
    } catch (err: any) {
      if (err?.code === 'P2025') {
        return res.status(404).json({ message: "Not found" });
      }
      console.error("deleteTodo failed:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } catch (err) {
    console.error("deleteTodo failed:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function restoreTodo(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    try {
  const restored = await (prisma as any).todo.update({ where: { id }, data: { deletedAt: null } });
  res.json(restored);
    } catch (err: any) {
      if (err?.code === 'P2025') {
        return res.status(404).json({ message: "Not found" });
      }
      console.error("restoreTodo failed:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } catch (err) {
    console.error("restoreTodo failed:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function cleanupDeletedTodos(req: Request, res: Response) {
  try {
    const result = await (prisma as any).todo.deleteMany({ where: { deletedAt: { not: null } } });
    res.json({ deleted: result.count });
  } catch (err) {
    console.error('cleanupDeletedTodos failed:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}