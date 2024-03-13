# Fastify Serverless na Vercel com TypeScript usando ESM (ES6 Modules)

> Fastify + TypeScript + Vercel + ESM + TSUP + Serverless Functions + Skill issues

Este projeto é uma demonstração de como criar uma API com Fastify e TypeScript e fazer o deploy na Vercel.

A api é bem simples, ela apenas retorna um objeto com uma mensagem na rota raiz e na rota `/api/v1/hello` ela retorna um objeto com uma mensagem e o nome que foi passado como parâmetro na query string.

| Rota          | Método | Descrição                          | Retorno               | Parâmetros     |
| ------------- | ------ | ---------------------------------- | --------------------- | -------------- |
| /             | GET    | Retorna um objeto com uma mensagem | {"oi": "mãe"}         |                |
| /api/v1/hello | GET    | Retorna um objeto com uma mensagem | {"hello": "seu_nome"} | ?name=seu_nome |

Eu uso a Vercel para fazer o deploy da API com o Vercel Serverless Functions, que é uma forma de fazer o deploy de funções serverless na Vercel.

Tem três pontos cruciais para fazer o deploy de uma API com Fastify + TypeScript na Vercel:

- Processo de build
- Conteúdo do arquivo vercel.json
- Request Handler

## Build

Para fazer o build do projeto, eu uso o comando `pnpm build` que é um comando que executa o `tsup` para compilar o TypeScript e fazer o bundle do projeto.

```json
{
  "scripts": {
    "build": "tsup"
  }
}
```

## tsup.config.ts, tsconfig.json e package.json

Para configurar o `tsup` eu criei um arquivo `tsup.config.ts` e um `tsconfig.json` para configurar o TypeScript.

> tsup.config.ts

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: ['src/serverless.ts'],
  format: ['esm'],
  clean: true,
  sourcemap: true,
  minify: false,
  target: 'node18',
  tsconfig: 'tsconfig.json',
});
```

- `entryPoints`: é o arquivo principal da aplicação, é por onde o `tsup` vai começar a compilar o projeto.
- `format`: é o formato do bundle que o `tsup` vai gerar, eu uso `esm` para gerar um bundle com módulos ES6.
- `clean`: é para limpar a pasta `dist` antes de fazer o build.
- `sourcemap`: é para gerar o sourcemap do projeto (útil para debug).
- `minify`: é para minificar o código do bundle (útil para produção).
- `target`: é a versão do Node.js que o bundle vai ser compatível.
- `tsconfig`: é o arquivo de configuração do TypeScript.

> tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ESNext" /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */,
    "module": "NodeNext" /* Specify what module code is generated. */,
    "esModuleInterop": true /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables 'allowSyntheticDefaultImports' for type compatibility. */,
    "forceConsistentCasingInFileNames": true /* Ensure that casing is correct in imports. */,
    "strict": true /* Enable all strict type-checking options. */,
    "skipLibCheck": true /* Skip type checking all .d.ts files. */
  }
}
```

Sendo bem sincero eu só instalei o Typescript no projeto com `pnpm add -D typescript` e executei o comando `pnpm tsc --init` para gerar o `tsconfig.json` e mudei algumas coisas para usar ESNext e NodeNext e usar ESM como módulo.

> package.json

```json
{
  "name": "fastify-typescript-vercel",
  "version": "1.0.0",
  "main": "dist/serverless.js",
  "type": "module",
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "dev:vercel": "tsup --watch & vercel dev --listen 5005"
  },
  "keywords": ["fastify", "typescript", "tsup", "vercel"],
  "author": "devlulcas",
  "license": "ISC",
  "devDependencies": {
    "tsup": "^8.0.2",
    "typescript": "^5.4.2"
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "fastify": "^4.26.2",
    "zod": "^3.22.4"
  }
}
```

Eu mudei o `type` para `module` para usar módulos ES6 e mudei o `main` para `dist/serverless.js` que é o arquivo que o `tsup` vai gerar.

Nos `scripts` eu adicionei o `dev:vercel` que é para executar o `tsup` e o `vercel dev` ao mesmo tempo. Eu uso o `&` para executar os dois comandos em paralelo. O `vercel dev` é para simular o ambiente da Vercel localmente. Eu uso a flag `--listen 5005` para mudar a porta que o `vercel dev` vai escutar, porque por padrão ele escuta na porta `3000` e eu sempre tenho outros projetos rodando nessa porta.

## vercel.json

O `vercel.json` é o arquivo de configuração do Vercel, nele eu defino as configurações do projeto na Vercel.

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/serverless.js",
      "use": "@vercel/node"
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "dist/serverless.js"
    }
  ]
}
```

- `version`: é a versão do arquivo de configuração.
- `builds`: é um array de objetos que define como o projeto vai ser buildado na Vercel. Eu defini o `src` como `dist/serverless.js` que é o arquivo que o `tsup` vai gerar e o `use` como `@vercel/node` que é o runtime do Node.js na Vercel.
- `rewrites`: é um array de objetos que define como as rotas vão ser tratadas na Vercel. No meu caso `source` é `/(.*)` que é para qualquer rota e `destination` é `dist/serverless.js` que é o arquivo que o `tsup` vai gerar e é onde a Vercel vai redirecionar as requisições.

Resumo da opera: Todo request que acertar a gente vai ser tratado pelo `dist/serverless.js` que é onde está nosso request handler.

## Request Handler e o arquivo src/serverless.ts (futuro dist/serverless.js)

O arquivo `src/serverless.ts` é o arquivo no qual está o nosso request handler.

[Para aprender mais sobre essa parada dê uma lida na documentação da vercel sobre Serverless Function usando o Node.js como runtime](https://vercel.com/docs/functions/runtimes/node-js)

```ts
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
```

> Ah mas porque você usa `.js` nos imports? Porque eu estou gerando arquivos que usam ESM e nesses casos você tem que usar o caminho completo do arquivo com a extensão `.js`.

O `app` é um plugin do Fastify que eu criei para definir as rotas da API. Ele se encontra no arquivo `src/app.ts`.

O resto do funcionamento do Fastify é normal, eu crio uma instância do Fastify, registro o plugin `app` com o prefixo `/` e exporto uma função que é o request handler.

Esse request handler é o que a Vercel vai chamar quando uma requisição acertar a gente. Nós só pegamos o `req` e o `res` e passamos para o `fastify.server.emit('request', req, res)` que vai fazer com o que o Fastify trate a requisição e tome o controle daí em diante.

## Conclusão

O trem não é tão complicado, mas tem uns detalhes que você tem que prestar atenção. O `tsup` é um bundler que eu acho bem tranquilo de usar, ele é bem rápido (ESBuild ⚡katchau⚡ por trás) e fácil de configurar.

O Fastify é um framework para Node.js bem performático também, ele é bem parecido com o Express, mas é mais rápido e tem mais recursos.

Poder fazer deploy de funções serverless na Vercel é interessante principalmente por ser de graça até certo ponto. Lembre-se que usando serverless você vai ter algumas limitações com o tempo que seu código pode ficar rodando, além de limitações de memória e etc.
