///* required imports *\\\
import express from 'express';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
import catchError from './Utils/catchError.js';
import HandleError from './Utils/handleError.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

///* custom imports *\\\
import adminRouter from './Routes/admin.js';
import authRouter from './Routes/auth.js';
import coursesRouter from './Routes/courses.js';
import reportsRouter from './Routes/reports.js';
import uploadRouter from './Routes/upload.js';
import userRouter from './Routes/user.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
const port = process.env.PORT;

const swaggerOptions = { //TODO swagger problems
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Project API',
      description: 'API documentation for the project',
      version: '1.0.0',
    },
    // servers: [
    //   {
    //     url: `http://localhost:${port}`,
    //     description: 'Local development server',
    //   },
    // ],
    components: {
      
    },
  },
  apis: ['./app.js'],
};


const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/user', userRouter);

app.use(catchError);
app.use(HandleError);

export default app;