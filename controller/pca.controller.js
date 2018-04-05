import Promise from 'bluebird';
import httpStatus from 'http-status';
import _ from 'lodash';

import BaseController from './base.controller';
import APIError from '../helper/api-error';
import Province from '../models/province.model';
import City from '../models/city.model';
import Area from '../models/area.model';

class PcaController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get provinces list
   */
  getProvincesList(req, res, next) {
    Province.getProvincesList().then(list => {
      return res.json(list);
    }).catch(err => {
      return next(err);
    });
  }

  /**
   * Get cities list
   * @property {Number} code - Province code
   */
  getCitiesByCode(req, res, next) {
    City.getCitiesList(req.params.code)
      .then((cities) => {
        if (_.isEmpty(cities)) {
          const error = new APIError("Not Found", httpStatus.NOT_FOUND);
          return next(error);
        } else {
          res.json(cities)
        }
      }).catch(err => (next(err)));

  }

  /**
   * Get areas list
   * @property {Number} code - City code
   */
  getAreasByCode(req, res, next) {
    Area.getAreasList(req.params.code)
      .then((areas) => {
        if (_.isEmpty(areas)) {
          const error = new APIError("Not Found", httpStatus.NOT_FOUND);
          return next(error);
        } else {
          res.json(areas)
        }
      }).catch(err => (next(err)));
  }
}

export default PcaController;
