import { Config, startApp } from './app';

const config: Config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 8080,
  serveFront: process.env.NODE_ENV === 'production',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  redisUseTls: false,
};

startApp(config);
