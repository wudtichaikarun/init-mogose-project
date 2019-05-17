import { HttpMethod, route } from 'koa-decorator';
@route('/home')
class Home {
  @route('/', HttpMethod.GET)
  async listHome(ctx) {
    ctx.body = { data: 'Home' };
  }
  @route('/:id', HttpMethod.GET)
  async ViewHome(ctx) {
    const { id } = ctx.params;
    ctx.body = { data: `Home${id}` };
  }
}

export default Home;
