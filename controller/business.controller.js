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
    const { skip, limit, search, state, event } = req.query;
    const filter = {
      state: state,
      event: event
    };

    Business.getTotalCount({skip, limit, filter, search}).then(count => {
      req.count = count;
      return Business.getBusinessList({skip, limit, filter, search})
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
   * Get single business by idea
   * @property {ObjectId} req.params.id - Business id
   */
  getSingleBusiness(req, res, next) {
    Business.getById(req.params.id)
      .then(business => {
        if (business) {
          return res.json(business);
        } else {
          throw new APIError("Not found", httpStatus.NOT_FOUND);
        }
      }).catch(err => {
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
        if (!_.isEmpty(business.chains)) {
          business.chains.map(chain => {
            console.log(chain);
          });
        }

        return res.status(204).json();
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Update business
   * @property {ObjectId} req.body._id - Business id
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
  updateBusiness(req, res, next) {
    BusinessController.authenticate(req, res, next)
      .then(role => {
        if (_.isEmpty(role)) throw new APIError("Permission denied", httpStatus.UNAUTHORIZED);

        const id = req.body._id
        const data = req.body;
        delete data._id;

        return Business.findByIdAndUpdate(id, {...data}).exec();
      })
      .then(business => {
        if (business) {
          return res.status(204).json();
        } else {
          throw new APIError("Not found", httpStatus.NOT_FOUND);
        }
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Delete business
   * @property {ObjectId} req.body._id - Business id
   */
  deleteBusiness(req, res, next) {
    BusinessController.authenticate(req, res, next)
      .then(role => {
        if (_.isEmpty(role)) throw new APIError("Permission denied", httpStatus.UNAUTHORIZED);

        return Business.findByIdAndRemove(req.body._id);
      })
      .then(business => {
        if (business) {
          return res.status(204).json();
        } else {
          throw new APIError("Not found", httpStatus.NOT_FOUND);
        }
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
          return reject(new APIError("Forbidden", httpStatus.FORBIDDEN));
        }
 			})(req, res, next);
 		});
 	}
}

export default BusinessController;
