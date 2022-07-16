import { Config, startApp } from './app';

const config: Config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 8080,
  serveFront: process.env.NODE_ENV === 'production',
};

startApp(config);
