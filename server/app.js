///* required imports *\\\
import express from 'express';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
import catchError from './Utils/catchError.js';
import HandleError from './Utils/handleError.js';

///* custom imports *\\\
import adminRouter from './Routes/admin.js';
import authRouter from './Routes/auth.js';
import coursesRouter from './Routes/courses.js';
import reportsRouter from './Routes/reports.js';
import uploadRouter from './Routes/upload.js';
import userRouter from './Routes/user.js';

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

///* required app uses *\\\
const app = express();
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(morgan('dev'));
app.use(cors()); //TODO: fill with front local path

///* custom app uses *\\\
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/user', userRouter);

app.use('*', (req, res, next) => {
	return next(new HandleError('Invalid route', 404));
});

///* catching every error automaticly *\\\
app.use(catchError);

export default app;
