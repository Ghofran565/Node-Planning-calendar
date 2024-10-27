import express from 'express';
import {
	chengePasswordAdmin,
	createAdmin,
	getAdmin,
	getAllAdmin,
	updateAdmin,
} from '../Controllers/adminCn.js';
import isAdmin from './../Middlewares/isAdmin.js';
import isLogin from './../Middlewares/isLogin.js';

const router = express.Router();

router.route('/').get(isAdmin, getAllAdmin).post(isAdmin, createAdmin);

router.route('/:id').get(isLogin, getAdmin).patch(isAdmin, updateAdmin);

router.route('/chenge-password').post(isLogin, chengePasswordAdmin);

export default router;
