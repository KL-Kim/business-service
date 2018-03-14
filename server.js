'use strict';

import config from './config/config';
import app from './config/express';

app.listen(config.port, () => {
  console.log(`Business service is listening on: ${config.port}`);
});
