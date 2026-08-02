import express from 'express';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from '@ecommerce/error-handler';

const app = express();

app.use(express.json());
app.use(cookieParser());



app.get('/', (req, res) => {
  res.json({ message: 'Hello, API!' });
});

app.use(errorMiddleware);

const port = process.env.PORT || 6001;

const server = app.listen(port, () => {
  console.log(`Auth service is running at http://localhost:${port}`);
});

server.on('error', console.error);