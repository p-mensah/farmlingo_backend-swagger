import { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';

import { db } from '../db/dbconfig';
import { courses, NewCourse } from '../db/schema';

interface HttpError extends Error {
  status?: number;
}

const createHttpError = (status: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.status = status;
  return err;
};

export const getCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
    const limit = Math.max(parseInt(String(req.query.limit ?? '10'), 10) || 10, 1);
    const offset = (page - 1) * limit;

    const rows = await db.select().from(courses).limit(limit).offset(offset);

    res.status(200).json({ data: rows, pagination: { page, limit } });
  } catch (err) {
    next(err as Error);
  }
};

export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.body as Partial<NewCourse>;

    const [created] = await db
      .insert(courses)
      .values({
        title: body.title!,
        description: body.description,
        category: body.category,
        language: body.language,
        thumbnail_url: body.thumbnail_url,
        status: body.status,
        creator_id: body.creator_id,
      } as NewCourse)
      .returning();

    res.status(201).json(created);
  } catch (err) {
    next(err as Error);
  }
};

export const getCourseById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params as { courseId: string };
    const rows = await db.select().from(courses).where(eq(courses.course_id, courseId)).limit(1);
    const course = rows[0];
    if (!course) return next(createHttpError(404, 'Course not found'));
    res.status(200).json(course);
  } catch (err) {
    next(err as Error);
  }
};

export const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params as { courseId: string };
    const body = req.body as Partial<NewCourse>;

    const [updated] = await db
      .update(courses)
      .set({
        title: body.title,
        description: body.description,
        category: body.category,
        language: body.language,
        thumbnail_url: body.thumbnail_url,
        status: body.status,
      })
      .where(eq(courses.course_id, courseId))
      .returning();

    if (!updated) return next(createHttpError(404, 'Course not found'));
    res.status(200).json(updated);
  } catch (err) {
    next(err as Error);
  }
};

export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params as { courseId: string };
    const result = await db.delete(courses).where(eq(courses.course_id, courseId)).returning();
    if (result.length === 0) return next(createHttpError(404, 'Course not found'));
    res.status(204).send();
  } catch (err) {
    next(err as Error);
  }
};
