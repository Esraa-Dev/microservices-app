const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    alias: {
      '@ecommerce/error-handler': join(
        __dirname,
        '../../packages/error-handler/index.ts'
      ),
      '@ecommerce/prisma': join(
        __dirname,
        '../../packages/libs/prisma/index.ts'
      ),
      '@ecommerce/redis': join(
        __dirname,
        '../../packages/libs/redis/index.ts'
      ),
      '@ecommerce/middleware': join(
        __dirname,
        '../../packages/middleware/index.ts'
      ),
      '@ecommerce/components': join(__dirname, '../../packages/components'),
    },
  },

  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false,
      sourceMap: true,
    }),
  ],
};