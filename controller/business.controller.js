import Promise from 'bluebird';
import httpStatus from 'http-status';

import BaseController from './base.controller';
import APIError from '../helper/api-error';

class BusinessController extends BaseController {
  constructor() {
    super();
  }

  getBusinessList(req, res, next) {
    const { limit = 50, skip = 0 } = req.query;

    return res.json("Get business list!");
  }
}

export default BusinessController;
