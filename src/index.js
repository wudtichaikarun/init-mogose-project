import Koa from 'koa';
import path from 'path';
import { load } from 'koa-decorator';
import mongooseClient from './libraries/database/mongoose';
import config from './config';

const app = new Koa();

const url = `mongodb://${config.database.host}/${
  config.database.name
}`;

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

app.listen(config.port);
