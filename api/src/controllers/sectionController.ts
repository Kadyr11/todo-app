import { Request, Response } from "express";
import { prisma } from "../database";
import { z } from "zod";

const SectionCreate = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  projectId: z.number().int().positive(),
  position: z.number().int().min(0).optional(),
});

const SectionUpdate = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  position: z.number().int().min(0).optional(),
});

export async function listSections(req: Request, res: Response) {
  const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
  if (projectId && isNaN(projectId)) {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  const sections = await prisma.section.findMany({
    where: projectId ? { projectId } : {},
    include: {
      project: true,
      _count: {
        select: { todos: true }
      }
    },
    orderBy: [
      { projectId: 'asc' },
      { position: 'asc' }
    ]
  });
  res.json(sections);
}

export async function getSection(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid section ID' });
  }

  const section = await prisma.section.findUnique({
    where: { id },
    include: {
      project: true,
      todos: {
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: { todos: true }
      }
    }
  });

  if (!section) {
    return res.status(404).json({ message: "Section not found" });
  }

  res.json(section);
}

export async function createSection(req: Request, res: Response) {
  const parsed = SectionCreate.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(parsed.error.flatten());
  }

  const { name, description, projectId, position } = parsed.data;

  // Check if project exists
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return res.status(400).json({ error: 'Project not found' });
  }

  const section = await prisma.section.create({
    data: { name, description, projectId, position: position || 0 },
    include: {
      project: true,
      _count: {
        select: { todos: true }
      }
    }
  });

  res.status(201).json(section);
}

export async function updateSection(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid section ID' });
  }

  const parsed = SectionUpdate.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(parsed.error.flatten());
  }

  const updateData = parsed.data;

  try {
    const section = await prisma.section.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
        _count: {
          select: { todos: true }
        }
      }
    });
    res.json(section);
  } catch {
    res.status(404).json({ message: "Section not found" });
  }
}

export async function deleteSection(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid section ID' });
  }

  try {
    await prisma.section.delete({ where: { id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ message: "Section not found" });
  }
}