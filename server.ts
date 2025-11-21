import http from 'http';
import app from './src/app';
import { port, appName } from './src/config/config';

import detect from 'detect-port';

const server = http.createServer(app);

detect(port).then((freePort) => {
  if (freePort !== port) {
    console.log(`⚠️ Port ${port} is in use. Switching to ${freePort}`);
  }

  server.listen(freePort, () => {
    
    // eslint-disable-next-line no-console(with this you will see the full URL in the console.)
    // console.log(`${appName} listening on port ${port} — env=${process.env.NODE_ENV || 'development'}`);

    // eslint-disable-next-line no-console(this help you see the full URL in the console.)
    console.log(`${appName} listening at http://localhost:${freePort} — env=${process.env.NODE_ENV || 'development'}`);
    // With this you will see the Swagger UI url
    console.log(`Swagger UI: http://localhost:${freePort}/api-docs/#/`);
  });
});

process.on('SIGINT', () => {
  // eslint-disable-next-line no-console
  console.log('SIGINT received: shutting down');
  server.close(() => process.exit(0));
});
