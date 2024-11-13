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

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
const swaggerOptions = { //TODO swagger doesn't show up the routes
	swaggerDefinition: {
	  openapi: '3.0.0',
	  info: {
		 title: 'Project API',
		 description: 'API documentation for the project',
		 version: '1.0.0',
	  },
	  servers: [
		 {
			url: 'http://localhost:5001',
			description: 'Local development server',
		 },
	  ],
	  components: {
		 securitySchemes: {
			AdminAuth: {
			  type: 'http',
			  scheme: 'bearer',
			  bearerFormat: 'JWT',
			},
			UserAuth: {
			  type: 'http',
			  scheme: 'bearer',
			  bearerFormat: 'JWT',
			},
		 },
	  },
	},
	apis: [], // if you have additional routes, add them here, or leave empty for inline paths
	paths: {
	  '/admin': {
		 get: {
			summary: 'Get all admins',
			security: [{ AdminAuth: [] }],
			responses: {
			  '200': {
				 description: 'List of all admins',
			  },
			},
		 },
		 post: {
			summary: 'Create a new admin',
			security: [{ AdminAuth: [] }],
			requestBody: {
			  content: {
				 'application/json': {
					schema: {
					  type: 'object',
					  properties: {
						 name: { type: 'string' },
						 email: { type: 'string' },
						 password: { type: 'string' },
					  },
					},
				 },
			  },
			},
			responses: {
			  '201': {
				 description: 'Admin created successfully',
			  },
			},
		 },
	  },
	  '/admin/{id}': {
		 get: {
			summary: 'Get details of a specific admin',
			security: [{ UserAuth: [] }],
			parameters: [
			  {
				 name: 'id',
				 in: 'path',
				 required: true,
				 schema: { type: 'string' },
			  },
			],
			responses: {
			  '200': {
				 description: 'Admin details',
			  },
			},
		 },
		 patch: {
			summary: 'Update admin information',
			security: [{ AdminAuth: [] }],
			parameters: [
			  {
				 name: 'id',
				 in: 'path',
				 required: true,
				 schema: { type: 'string' },
			  },
			],
			requestBody: {
			  content: {
				 'application/json': {
					schema: {
					  type: 'object',
					  properties: {
						 name: { type: 'string' },
						 email: { type: 'string' },
					  },
					},
				 },
			  },
			},
			responses: {
			  '200': {
				 description: 'Admin updated successfully',
			  },
			},
		 },
	  },
	  '/admin/change-password': {
		 post: {
			summary: 'Change admin password',
			security: [{ UserAuth: [] }],
			requestBody: {
			  content: {
				 'application/json': {
					schema: {
					  type: 'object',
					  properties: {
						 oldPassword: { type: 'string' },
						 newPassword: { type: 'string' },
					  },
					},
				 },
			  },
			},
			responses: {
			  '200': {
				 description: 'Password changed successfully',
			  },
			},
		 },
	  },
	  '/auth/auth': {
		 post: {
			summary: 'Authenticate a user',
			requestBody: {
			  content: {
				 'application/json': {
					schema: {
					  type: 'object',
					  properties: {
						 email: { type: 'string' },
						 password: { type: 'string' },
					  },
					},
				 },
			  },
			},
			responses: {
			  '200': {
				 description: 'Authentication successful',
			  },
			},
		 },
	  },
	  '/auth/forget-password': {
		 post: {
			summary: 'Request a password reset',
			requestBody: {
			  content: {
				 'application/json': {
					schema: {
					  type: 'object',
					  properties: {
						 email: { type: 'string' },
					  },
					},
				 },
			  },
			},
			responses: {
			  '200': {
				 description: 'Password reset requested',
			  },
			},
		 },
	  },
	  '/auth/forget-password-check': {
		 post: {
			summary: 'Check password reset code',
			requestBody: {
			  content: {
				 'application/json': {
					schema: {
					  type: 'object',
					  properties: {
						 email: { type: 'string' },
						 code: { type: 'string' },
					  },
					},
				 },
			  },
			},
			responses: {
			  '200': {
				 description: 'Reset code validated',
			  },
			},
		 },
	  },
	  '/auth/change-password': {
		 post: {
			summary: 'Change user password',
			security: [{ UserAuth: [] }],
			requestBody: {
			  content: {
				 'application/json': {
					schema: {
					  type: 'object',
					  properties: {
						 oldPassword: { type: 'string' },
						 newPassword: { type: 'string' },
					  },
					},
				 },
			  },
			},
			responses: {
			  '200': {
				 description: 'Password changed successfully',
			  },
			},
		 },
	  },
	  '/courses': {
		 get: {
			summary: 'Get all courses',
			responses: {
			  '200': {
				 description: 'List of all courses',
			  },
			},
		 },
		 post: {
			summary: 'Create a new course',
			security: [{ AdminAuth: [] }],
			requestBody: {
			  content: {
				 'application/json': {
					schema: {
					  type: 'object',
					  properties: {
						 title: { type: 'string' },
						 description: { type: 'string' },
						 duration: { type: 'string' },
					  },
					},
				 },
			  },
			},
			responses: {
			  '201': {
				 description: 'Course created successfully',
			  },
			},
		 },
	  },
	  '/courses/{id}': {
		 get: {
			summary: 'Get course details',
			parameters: [
			  {
				 name: 'id',
				 in: 'path',
				 required: true,
				 schema: { type: 'string' },
			  },
			],
			responses: {
			  '200': {
				 description: 'Course details',
			  },
			},
		 },
		 patch: {
			summary: 'Update a course',
			security: [{ AdminAuth: [] }],
			parameters: [
			  {
				 name: 'id',
				 in: 'path',
				 required: true,
				 schema: { type: 'string' },
			  },
			],
			requestBody: {
			  content: {
				 'application/json': {
					schema: {
					  type: 'object',
					  properties: {
						 title: { type: 'string' },
						 description: { type: 'string' },
					  },
					},
				 },
			  },
			},
			responses: {
			  '200': {
				 description: 'Course updated successfully',
			  },
			},
		 },
		 delete: {
			summary: 'Delete a course',
			security: [{ AdminAuth: [] }],
			parameters: [
			  {
				 name: 'id',
				 in: 'path',
				 required: true,
				 schema: { type: 'string' },
			  },
			],
			responses: {
			  '200': {
				 description: 'Course deleted successfully',
			  },
			},
		 },
	  },
	},
 };
 
const swaggerDocs=swaggerJSDoc(swaggerOptions)

///* required app uses *\\\
const app = express();
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDocs))
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

///* catching every error automatically *\\\
app.use(catchError);

export default app;
