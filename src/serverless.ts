// Load env
import * as dotenv from 'dotenv';
dotenv.config();

// Other imports
import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import app from './app.js';

const fastify = Fastify({ logger: true });

fastify.register(app, { prefix: '/' });

export default async (req: FastifyRequest, res: FastifyReply) => {
  try {
    await fastify.ready();
    fastify.server.emit('request', req, res);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};
