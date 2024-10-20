import express from 'express';
import {

} from '../Controllers/reportsCn.js';
import isLogin from '../Middlewares/isLogin.js';
import isAdmin from './../Middlewares/isAdmin.js';

const router = express.Router();

// router.route('/auth').post(auth);
// router.route('/forget-password').post(forgetPassword);
// router.route('/forget-password-check').post(checkForgetPassword);
// router.route('/change-password').patch(isLogin, changePassword);

export default router;
