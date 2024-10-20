import express from 'express';
import { createCourse, deleteCourse, getAllCourses, getCourse, updateCourse } from '../Controllers/coursesCn.js';
import isAdmin from '../Middlewares/isAdmin.js';

const router = express.Router();

router.route('/').get().get(getAllCourses).post(isAdmin, createCourse);

router
	.route('/:id')
	.get(getCourse)
	.patch(isAdmin, updateCourse)
	.delete(isAdmin, deleteCourse);

export default router;
