import express from 'express';
import upload from '../Utils/UploadFile.js';
import isLogin from './../Middlewares/isLogin.js';
import checkUpload from './../Middlewares/checkUpload.js';
import { deleteFile, uploadFile } from '../Controllers/uploadCn.js';

const router = express.Router();

router
	.route('/')
	.post(isLogin, checkUpload, upload.single('file'), uploadFile)
	.delete(isLogin, deleteFile);

export default router;
