import { Router } from 'express';
import healthRouter from './health.route';
import usersRouter from './users.route';
import coursesRouter from './courses.route';
import lessonsRouter from './lessons.route';
import forumsRouter from './forums.route';
import enrollmentsRouter from './enrollments.route';
import chatRouter from './chat.route';

const router = Router();

router.use('/health', healthRouter);
router.use('/users', usersRouter);
router.use('/courses', coursesRouter);
router.use('/lessons', lessonsRouter);
router.use('/forums', forumsRouter);
router.use('/enrollments', enrollmentsRouter);
router.use('/chatrooms', chatRouter);

export default router;
