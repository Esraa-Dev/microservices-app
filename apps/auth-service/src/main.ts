import express from 'express';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import { errorMiddleware } from '@ecommerce/error-handler';
import authRouter from './routes/auth.router';

const app = express();

const swaggerDocument = require('./swagger-output.json');

app.use(express.json());
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/docs-json', (req, res) => {
  res.json(swaggerDocument);
});

app.use('/api', authRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Hello, API!' });
});

app.use(errorMiddleware);

const port = process.env.PORT || 6001;

const server = app.listen(port, () => {
  console.log(`Auth service is running at http://localhost:${port}`);
  console.log(`Swagger Docs: http://localhost:${port}/api-docs`);
});

server.on('error', console.error);