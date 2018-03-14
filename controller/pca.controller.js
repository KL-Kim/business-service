import Promise from 'bluebird';
import httpStatus from 'http-status';

import BaseController from './base.controller';
import APIError from '../helper/api-error';

class PcaController extends BaseController {
  constructor() {
    super();
  }

  getProvinces(req, res, next) {
    return res.json("Get provinces");
  }
}

export default PcaController;
