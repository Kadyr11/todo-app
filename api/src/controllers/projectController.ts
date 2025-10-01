import { Request, Response } from "express";
import { prisma } from "../database";
import { z } from "zod";

const ProjectCreate = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

const ProjectUpdate = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  archived: z.boolean().optional(),
});

export async function listProjects(req: Request, res: Response) {
  const includeArchived = req.query.includeArchived === 'true';
  const projects = await prisma.project.findMany({
    where: includeArchived ? {} : { archived: false },
    include: {
      sections: {
        include: {
          _count: {
            select: { todos: true }
          }
        },
        orderBy: { position: 'asc' }
      },
      _count: {
        select: { sections: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  // TEMP LOG: show which projects are returned (id + archived flag)
  try {
    console.log('[listProjects] includeArchived=', includeArchived, 'returned:', projects.map(p => ({ id: p.id, archived: p.archived })));
  } catch (e) {
    // ignore
  }
  res.json(projects);
}

export async function getProject(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      sections: {
        include: {
          todos: true,
          _count: {
            select: { todos: true }
          }
        },
        orderBy: { position: 'asc' }
      }
    }
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  res.json(project);
}

export async function createProject(req: Request, res: Response) {
  const parsed = ProjectCreate.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(parsed.error.flatten());
  }

  const { name, description, color } = parsed.data;
  // TEMP LOG: log incoming body for debugging
  console.log('[createProject] incoming body:', req.body);

  const project = await prisma.project.create({
    // Force archived to false on creation to avoid accidental archival from client-side
    data: { name, description, color, archived: false },
    include: {
      sections: true,
      _count: {
        select: { sections: true }
      }
    }
  });

  // TEMP LOG: log created project
  console.log('[createProject] created project:', project);

  res.status(201).json(project);
}

export async function updateProject(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  const parsed = ProjectUpdate.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(parsed.error.flatten());
  }

  const updateData = parsed.data;

  try {
    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        sections: {
          include: {
            _count: {
              select: { todos: true }
            }
          },
          orderBy: { position: 'asc' }
        },
        _count: {
          select: { sections: true }
        }
      }
    });
    res.json(project);
  } catch {
    res.status(404).json({ message: "Project not found" });
  }
}

export async function deleteProject(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  try {
    await prisma.project.delete({ where: { id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ message: "Project not found" });
  }
}

export async function archiveProject(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  try {
    // Extra diagnostics: log request origin so we can trace unexpected archive calls
    const ua = req.headers['user-agent'] || '<no-ua>';
    const referer = req.headers['referer'] || req.headers['referrer'] || '<no-referer>';
    const ip = (req.ip || req.headers['x-forwarded-for'] || '<no-ip>');
    console.log('[archiveProject] called', {
      id,
      time: new Date().toISOString(),
      ip,
      userAgent: ua,
      referer,
      body: req.body,
    });
    const project = await prisma.project.update({
      where: { id },
      data: { archived: true },
      include: {
        sections: true,
        _count: {
          select: { sections: true }
        }
      }
    });
    console.log('[archiveProject] updated:', { id: project.id, archived: project.archived });
    res.json(project);
  } catch (err) {
    console.error('[archiveProject] error for id=', id, err);
    res.status(404).json({ message: "Project not found" });
  }
}

export async function unarchiveProject(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  try {
    console.log('[unarchiveProject] called for id=', id, 'body=', req.body);
    const project = await prisma.project.update({
      where: { id },
      data: { archived: false },
      include: {
        sections: true,
        _count: {
          select: { sections: true }
        }
      }
    });
    console.log('[unarchiveProject] updated:', { id: project.id, archived: project.archived });
    res.json(project);
  } catch (err) {
    console.error('[unarchiveProject] error for id=', id, err);
    res.status(404).json({ message: "Project not found" });
  }
}

export async function cleanupArchivedProjects(req: Request, res: Response) {
  try {
    const result = await prisma.project.deleteMany({ where: { archived: true } });
    // result.count contains number of deleted records
    res.json({ deleted: result.count });
  } catch (err) {
    console.error('cleanupArchivedProjects error', err);
    res.status(500).json({ message: 'Failed to cleanup archived projects' });
  }
}