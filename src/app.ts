import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifyServerOptions,
} from 'fastify';
import { router } from './routes.js';

/**
 * PtBr - Função que registra diferentes rotas e plugins no servidor.
 * En - Function that registers different routes and plugins on the server.
 */
async function app(
  instance: FastifyInstance,
  _: FastifyServerOptions,
  done: () => void
) {
  /**
   * PtBr - Rota de exemplo só para mostrar que o servidor está funcionando.
   * En - Example route just to show that the server is working.
   */
  instance.get('/', async (_: FastifyRequest, reply: FastifyReply) => {
    reply.status(200).send({ oi: 'mãe' });
  });

  /**
   * PtBr - Registra as rotas reais.
   * En - Registers the real routes.
   */
  instance.register(router, { prefix: '/api/v1' });

  /**
   * PtBr - Finaliza a execução do plugin.
   * En - Ends the plugin execution.
   */
  done();
}

export default app;
