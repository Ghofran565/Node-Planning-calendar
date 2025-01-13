import express from 'express';
import {
	confirmRecord,
	createRecord,
	getAllReports,
	getIdReports,
	registerComment,
} from '../Controllers/reportsCn.js';
import isLogin from '../Middlewares/isLogin.js';

const router = express.Router();

router.route('/').get(isLogin, getAllReports).post(isLogin, createRecord);
router.route('/:id').get(isLogin, getIdReports);
router.route('/confirm/:id/:sId').patch(isLogin, confirmRecord);
router.route('/comment/:id/:sId').patch(isLogin, registerComment);

export default router;
