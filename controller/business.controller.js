import Promise from 'bluebird';
import httpStatus from 'http-status';
import passport from 'passport';
import _ from 'lodash';

import BaseController from './base.controller';
import APIError from '../helper/api-error';
import Business from '../models/business.model';
import Category from '../models/category.model';
import Tag from '../models/tag.model';

class BusinessController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get business list
   */
  getBusinessList(req, res, next) {
    const { skip, limit } = req.query;

    Business.getTotalCount().then(count => {
      req.count = count;
      return Business.getBusinessList({skip, limit})
    })
    .then(list => {
      return res.json({
        totalCount: req.count,
        list: list
      });
    })
    .catch(err => {
      return next(err);
    });
  }

  /**
   * Add business
   * @property {String} req.body.cnName - Business chinese name
   * @property {String} req.body.krName - Business korean name
   * @property {String} req.body.enName - Business english name
   * @property {ObjectId} req.body.category - Business category id
   * @property {Array} req.body.tags - Business tag id array
   * @property {String} req.body.tel - Business telephone number
   * @property {Object} req.body.address - Business address
   * @property {Object} req.body.geo - Business geo
   * @property {String} req.body.description - Business description
   * @property {Array} req.body.language - Business supported language array
   */
  addBusiness(req, res, next) {
    BusinessController.authenticate(req, res, next)
      .then(role => {
        if (_.isEmpty(role)) throw new APIError("Permission denied", httpStatus.UNAUTHORIZED);

        // const data = req.body;
        const business = new Business({
          ...req.body
        });

        return business.save();

      })
      .then(business => {
        req.business = business;
        return Category.getById(business.category)
          .then(category => {
            category.business.push(business);
            return category.save();
          });
      })
      .then(category => {
        return res.json(req.business);
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Authenticate
   */
  static authenticate(req, res, next) {
 		return new Promise((resolve, reject) => {
 			passport.authenticate('access-token', (err, role, info) => {
 				if (err) return reject(err);
 				if (info) return reject(new APIError(info.message, httpStatus.UNAUTHORIZED));

        if (role === 'manager' || role === 'admin' || role === 'god') {
      		return resolve(role);
      	} else {
          return reject(new APIError("Unauthorized", httpStatus.UNAUTHORIZED));
        }
 			})(req, res, next);
 		});
 	}
}

export default BusinessController;
