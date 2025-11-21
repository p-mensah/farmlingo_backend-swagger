import { Request, Response, NextFunction } from 'express';
import { and, eq } from 'drizzle-orm';

import { db } from '../db/dbconfig';
import { lessons, NewLesson } from '../db/schema';

interface HttpError extends Error { status?: number }
const createHttpError = (status: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.status = status;
  return err;
};

function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = typeof value === 'string' ? Number(value) : (value as number);
  return Number.isFinite(n) ? n : undefined;
}

export const getLessons = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
    const limit = Math.max(parseInt(String(req.query.limit ?? '10'), 10) || 10, 1);
    const offset = (page - 1) * limit;
    const courseId = (req.query.courseId as string | undefined) || undefined;

    let rows;
    if (courseId) {
      rows = await db.select().from(lessons).where(eq(lessons.course_id, courseId)).limit(limit).offset(offset);
    } else {
      rows = await db.select().from(lessons).limit(limit).offset(offset);
    }

    res.status(200).json({ data: rows, pagination: { page, limit } });
  } catch (err) {
    next(err as Error);
  }
};

export const createLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.body as Partial<NewLesson & { metadata?: unknown }>;

    let metadata: unknown = body.metadata;
    if (typeof metadata === 'string') {
      try { metadata = metadata ? JSON.parse(metadata) : undefined; } catch { return next(createHttpError(400, 'Invalid metadata JSON')); }
    }

    const [created] = await db
      .insert(lessons)
      .values({
        course_id: body.course_id!,
        title: body.title!,
        description: body.description,
        category: body.category,
        duration_minutes: toNumber(body.duration_minutes),
        order_number: toNumber(body.order_number),
        is_mandatory: body.is_mandatory as boolean | undefined,
        metadata: metadata as NewLesson['metadata'],
        status: body.status,
        creator_id: body.creator_id,
      } as NewLesson)
      .returning();

    res.status(201).json(created);
  } catch (err) {
    next(err as Error);
  }
};

export const getLessonById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lessonId } = req.params as { lessonId: string };
    const rows = await db.select().from(lessons).where(eq(lessons.lesson_id, lessonId)).limit(1);
    const lesson = rows[0];
    if (!lesson) return next(createHttpError(404, 'Lesson not found'));
    res.status(200).json(lesson);
  } catch (err) {
    next(err as Error);
  }
};

export const updateLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lessonId } = req.params as { lessonId: string };
    const body = req.body as Partial<NewLesson & { metadata?: unknown }>;

    let metadata: unknown = body.metadata;
    if (typeof metadata === 'string') {
      try { metadata = metadata ? JSON.parse(metadata) : undefined; } catch { return next(createHttpError(400, 'Invalid metadata JSON')); }
    }

    const [updated] = await db
      .update(lessons)
      .set({
        title: body.title,
        description: body.description,
        category: body.category,
        duration_minutes: toNumber(body.duration_minutes),
        order_number: toNumber(body.order_number),
        is_mandatory: body.is_mandatory as boolean | undefined,
        metadata: metadata as NewLesson['metadata'],
        status: body.status,
      })
      .where(eq(lessons.lesson_id, lessonId))
      .returning();

    if (!updated) return next(createHttpError(404, 'Lesson not found'));
    res.status(200).json(updated);
  } catch (err) {
    next(err as Error);
  }
};

export const deleteLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lessonId } = req.params as { lessonId: string };
    const result = await db.delete(lessons).where(eq(lessons.lesson_id, lessonId)).returning();
    if (result.length === 0) return next(createHttpError(404, 'Lesson not found'));
    res.status(204).send();
  } catch (err) {
    next(err as Error);
  }
};
