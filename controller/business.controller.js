import Promise from 'bluebird';
import httpStatus from 'http-status';
import passport from 'passport';
import fs from 'fs';
import fsx from 'fs-extra';
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
   * @role - *
   * @property {Number} req.query.skip - Number of business to skip
   * @property {Number} req.query.limit - Number of bussiness page limit
   * @property {String} req.query.search - Business search term
   * @property {Number} req.query.state - Business state
   * @property {Number} req.query.event -  Business event
   * @property {reports} req.query.reports - Busienss reports
   */
  getBusinessList(req, res, next) {
    const { skip, limit, search, state, event, reports } = req.query;
    const filter = {
      state: state,
      event: event,
      reports: reports,
    };

    Business.getTotalCount({ skip, limit, filter, search }).then(count => {
      req.count = count;
      return Business.getList({skip, limit, filter, search})
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
   * @role - *
   * @property {ObjectId} req.query.id - Business id
   * @property {String} req.query.enName - Business English name
   */
  getSingleBusiness(req, res, next) {
    if (_.isEmpty(req.query.id) && _.isEmpty(req.query.enName)) {
      throw new APIError("Not found", httpStatus.NOT_FOUND);
    }

    let params;

    if (req.query.id) {
      params = {
        _id: req.query.id,
      };
    } else if (req.query.enName) {
      params = {
        enName: req.query.enName,
      };
    }

    Business.getSingleBusiness(params)
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
   * @role - manager, admin, god
   * @property {String} req.body.cnName - Business chinese name
   * @property {String} req.body.krName - Business korean name
   * @property {String} req.body.enName - Business english name
   * @property {ObjectId} req.body.category - Business category id
   * @property {Array} req.body.tags - Business tag id array
   * @property {String} req.body.tel - Business telephone number
   * @property {Object} req.body.address - Business address
   * @property {Object} req.body.geo - Business geo
   * @property {String} req.body.description - Business description
   * @property {Array} req.body.supportedLanguage - Business supported language array
   * more ...
   */
  addBusiness(req, res, next) {
    BusinessController.authenticate(req, res, next)
      .then(role => {
        if (_.isEmpty(role)) throw new APIError("Forbidden", httpStatus.FORBIDDEN);

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
   * @role - manager, admin, god
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
   * @property {Array} req.body.supportedLanguage - Business supported language array
   * more ...
   */
  updateBusiness(req, res, next) {
    BusinessController.authenticate(req, res, next)
      .then(role => {
        if (_.isEmpty(role)) throw new APIError("Forbidden", httpStatus.FORBIDDEN);

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
   * @role god
   * @property {ObjectId} req.body._id - Business id
   */
  deleteBusiness(req, res, next) {
    BusinessController.authenticate(req, res, next)
      .then(role => {
        if (_.isEmpty(role)) throw new APIError("Forbidden", httpStatus.FORBIDDEN);

        if (process.env.NODE_ENV !== 'development') {
          if (role !== 'god') throw new APIError("Forbidden", httpStatus.FORBIDDEN);
        }

        return Business.findByIdAndRemove(req.body._id);
      })
      .then(business => {
        if (business) {
          fsx.remove('public/images/' + req.body._id, err => {
            if (err) throw err;

            return res.status(204).json();
          });

        } else {
          throw new APIError("Not found", httpStatus.NOT_FOUND);
        }
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Add business images
   * @role - manager, admin, god
   * @param {ObjectId} req.params.id - Business id
   * @property {Object} req.files - Business images files
   */
  addBusinessImages(req, res, next) {
    BusinessController.authenticate(req, res, next)
      .then(role => {
        if (_.isEmpty(role)) throw new APIError("Forbidden", httpStatus.FORBIDDEN);

        if (_.isEmpty(req.files)) {
          throw new APIError("Bad request", httpStatus.BAD_REQUEST);
        }

        return Business.findById(req.params.id);
      })
      .then(business => {
        if (business) {
          if (!_.isEmpty(req.files.thumbnail)) {
            business.thumbnailUri = {
              hd: 'images/' + req.params.id + '/' + req.files.thumbnail[0].filename,
              defaut: 'images/' + req.params.id + '/' + req.files.thumbnail[0].filename,
            };
          }

          if (!_.isEmpty(req.files.images)) {
            req.files.images.map(image => {
              const index = business.imagesUri.indexOf('images/' + req.params.id + '/' + image.filename);

              if (index < 0) {
                business.imagesUri.push('images/' + req.params.id + '/' + image.filename);
              }
            })
          }

          return business.save();
        } else {
          throw new APIError("Not found", httpStatus.NOT_FOUND);
        }
      })
      .then(business => {
        return res.json({
          thumbnailUri: business.thumbnailUri,
          imagesUri: business.imagesUri,
        });
      }).catch(err => {
        return next(err);
      });
  }

  /**
   * Delete business image
   * @role - manager, admin, god
   * @param {ObjectId} req.params.id - Business id
   * @property {String} req.body.image - Business image filename
   */
  deleteBusinessImage(req, res, next) {
    BusinessController.authenticate(req, res, next)
      .then(role => {
        if (_.isEmpty(role)) throw new APIError("Forbidden", httpStatus.FORBIDDEN);

        return Business.findById(req.params.id);
      })
      .then(business => {
        if (business) {
          const images = business.imagesUri.slice();
          let index = images.indexOf(req.body.image);

          if (index > -1) {
            images.splice(index, 1);
            business.imagesUri = images.slice();

            return business.save();
          } else {
            throw new APIError("Not found", httpStatus.NOT_FOUND);
          }
        } else {
          throw new APIError("Not found", httpStatus.NOT_FOUND);
        }
      })
      .then(business => {
        const filename = req.body.image.split('/').pop();

        return fs.unlink('public/images/' + req.params.id + '/' + filename, err => {
          if (err) throw err;

          return res.json({
            thumbnailUri: business.thumbnailUri,
            imagesUri: business.imagesUri,
          });
        });
      })
      .catch(err => {
        return next(err);
      })
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
