'use strict';

import config from './config/config';
import app from './config/express';
import grpcServer from './grpc/server';

app.listen(config.port, () => {
  grpcServer.start();
  console.log(`Business service is listening on: ${config.port}`);
});
