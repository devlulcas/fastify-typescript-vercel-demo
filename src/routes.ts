import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyServerOptions,
} from 'fastify';
import z from 'zod';

/**
 * PtBr- Função que registra diferentes rotas como um plugin.
 * En - Function that registers different routes as a plugin.
 * @param server - Instância do servidor do Fastify / Fastify server instance
 */
export const router: FastifyPluginAsync = async (server) => {
  /**
   * PtBr - Registra um plugin que contém rotas de saudação.
   * En - Registers a plugin that contains greeting routes.
   */
  server.register(
    async (instance: FastifyInstance, _: FastifyServerOptions, done) => {
      /**
       * PtBr - Rota de exemplo que usa o Zod para validar um parâmetro de consulta.
       * En - Example route that uses Zod to validate a query parameter.
       * @param req - Requisição do cliente / Client request
       * @param reply - Resposta do servidor / Server response
       * @returns - Uma mensagem de saudação / A greeting message
       */
      instance.get('/', async (req, reply) => {
        const searchParamsSchema = z.object({
          name: z.string(),
        });

        const validatedSearchParams = searchParamsSchema.safeParse(req.query);

        if (!validatedSearchParams.success) {
          return reply.status(400).send(validatedSearchParams.error.errors);
        }

        const { name } = validatedSearchParams.data;

        reply.status(200).send(`Hello ${name}`);
      });

      done();
    },
    { prefix: '/hello' }
  );
};
