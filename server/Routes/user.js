import express from 'express';
import {
	chengePassword,
	createUser,
	getAllUser,
	getUser,
	updateUser,
} from '../Controllers/userCn.js';
import isAdmin from './../Middlewares/isAdmin.js';
import isLogin from './../Middlewares/isLogin.js';

const router = express.Router();

router.route('/').get(isAdmin, getAllUser).post(isAdmin, createUser);

router.route('/:id').get(isLogin, getUser).patch(isAdmin, updateUser);

router.route('/chenge-password').post(isLogin, chengePassword);

export default router;
