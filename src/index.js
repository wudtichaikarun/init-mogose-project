import Koa from 'koa';
import path from 'path';
import bodyParser from 'koa-bodyparser';
import { load } from 'koa-decorator';
import {
  loggingMiddleware,
  configLogger
} from 'graylog-koa-client';
import mongooseClient from './libraries/database/mongoose';
import config from './config';
import Conductor from './config/conductor';

const app = new Koa();

const url = `mongodb://${config.database.host}/${
  config.database.name
}`;

configLogger({
  host: process.env.LOGGING_HOST,
  port: process.env.LOGGING_PORT,
  service: process.env.LOGGING_SERVICE,
  env: process.env.NODE_ENV
});

app.use(bodyParser({ enableTypes: ['json', 'form'] }));
app.use(loggingMiddleware);
mongooseClient(url)
  .then(() => {
    console.log('connected success');
  })
  .catch(error => {
    console.log(`connect fail: ${error}`);
    process.exit(1);
  });

const apiRouter = load(
  path.resolve(__dirname, 'controllers'),
  '.controller.js'
);
app.use(apiRouter.routes());

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.use(ctx => {
  ctx.body = 'Hello Koa';
});

Conductor(__dirname);

app.listen(config.port);
