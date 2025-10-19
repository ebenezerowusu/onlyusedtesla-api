import 'reflect-metadata';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { NestFactory, Reflector } from '@nestjs/core'; // ⬅️ add Reflector import
import { AppModule } from './app.module';
import { ProblemFilter } from './common/problem.filter';
import { RequestIdInterceptor } from './common/request-id.interceptor';
import { CountryGuard } from './common/country.guard';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import fstatic from '@fastify/static';

const { getAbsoluteFSPath } = require('swagger-ui-dist');

async function bootstrap() {
  const adapter = new FastifyAdapter({ logger: false });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, { cors: false });

  await app.register(helmet, { crossOriginEmbedderPolicy: false, contentSecurityPolicy: false });
  await app.register(cors, { origin: [/localhost/, /\.onlyusedtesla\.com$/], credentials: true });
  await app.register(cookie);

  app.useGlobalFilters(new ProblemFilter());
  app.useGlobalInterceptors(new RequestIdInterceptor());

  // ⬇️ pass Reflector into the guard
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new CountryGuard(reflector));

  // … (rest unchanged)
  const openapiPath = path.join(process.cwd(), 'src', 'swagger', 'openapi.yaml');
  if (fs.existsSync(openapiPath)) {
    const swaggerRoot = getAbsoluteFSPath();
    await app.register(fstatic, { root: swaggerRoot, prefix: '/docs/' });

    // HTML shell
    app.getHttpAdapter().getInstance().get('/docs', async (_req: any, reply: any) => {
      const html = `<!doctype html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <title>OnlyUsedTesla API Docs</title>
          <link rel="stylesheet" href="/docs/swagger-ui.css" />
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script src="/docs/swagger-ui-bundle.js"></script>
          <script src="/docs/swagger-ui-standalone-preset.js"></script>
          <script>
            window.onload = () => {
              window.ui = SwaggerUIBundle({
                url: '/docs/openapi.yaml',
                dom_id: '#swagger-ui',
                presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
                layout: "BaseLayout"
              });
            };
          </script>
        </body>
        </html>`;
      reply.type('text/html').send(html);
    });

    // Serve your YAML
    app.getHttpAdapter().getInstance().get('/docs/openapi.yaml', async (_req: any, reply: any) => {
      const yaml = fs.readFileSync(openapiPath, 'utf8');
      reply.type('application/yaml').send(yaml);
    });
  }

  const hasDocs = fs.existsSync(path.join(process.cwd(), 'src', 'swagger', 'openapi.yaml'));
  const fastify = app.getHttpAdapter().getInstance();
  fastify.get('/', (_req: any, reply: any) => {
    if (hasDocs) return reply.redirect(302, '/docs');
    reply.send({ name: 'OnlyUsedTesla API', status: 'ok', docs: null, health: '/health' });
  });

  const port = Number(process.env.PORT ?? 3003);
  await app.listen(port, '0.0.0.0');
  console.log(`Listening on http://localhost:${port} — Swagger at /docs`);
}
bootstrap();