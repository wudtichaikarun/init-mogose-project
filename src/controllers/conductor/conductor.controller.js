import { HttpMethod, route } from 'koa-decorator';
import { conductorClient } from '../../config/conductor';

@route('/conductor')
class Home {
  @route('/', HttpMethod.POST)
  async listHome(ctx) {
    const { body } = ctx.request;
    await conductorClient.startWorkflow('start_task_demo', {
      orderId: body.orderId
    });
    ctx.body = { data: body };
  }
}

export default Home;
