const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Ecommerce Auth Service API',
    description: 'Authentication API documentation',
    version: '1.0.0',
  },
  host: 'localhost:6001',
  basePath: '/api',
  schemes: ['http'],
};

const outputFile = './apps/auth-service/src/swagger-output.json';

const endpointsFiles = [
  './apps/auth-service/src/routes/auth.router.ts',
];

swaggerAutogen(outputFile, endpointsFiles, doc);