import 'dotenv/config';
import { app } from './app';
import { env } from './env';
import { logger } from './lib/logger';

app.listen(env.PORT, () => {
  logger.info(`rebook server listening on http://localhost:${env.PORT}`);
  logger.info(`Swagger docs: http://localhost:${env.PORT}/docs`);
});
