import Promise from 'bluebird';
import grpc from 'grpc';
import _ from 'lodash';
import httpStatus from 'http-status';
import passport from 'passport';
import fs from 'fs';
import fsx from 'fs-extra';
import Cron from 'node-cron';

import grants from '../config/rbac.config';
import BaseController from './base.controller';
import APIError from '../helper/api-error';
import Business from '../models/business.model';
import Category from '../models/category.model';
import Tag from '../models/tag.model';
import config from '../config/config';
import { notificationProto } from '../config/grpc.client';

class BusinessController extends BaseController {
  constructor() {
    super();

    const weekTask = Cron.schedule('0 0 0 * * Monday', () => {
      Business.updateMany({ weekViewsCount: 0 }).then(result => {
        console.log(result);
      }).catch(err => {
        throw err;
      });
    });

    const monthTask = Cron.schedule('0 0 0 1 * *', () => {
      Business.updateMany({ monthViewsCount: 0 }).then(result => {
        console.log(result);
      }).catch(err => {
        throw err;
      });
    });

    this._notificationGrpcClient = new notificationProto.NotificationService(
      config.notificationGrpcServer.host + ':' + config.notificationGrpcServer.port,
      grpc.credentials.createInsecure()
    );

    this._notificationGrpcClient.waitForReady(Infinity, (err) => {
      if (err) console.error(err);

      console.log("Notification gRPC Server connected succesfully!");
    });
  }

  /**
   * Get business list
   * @role - *
   * @property {String} req.query.category - Business category
   * @property {Number} req.query.skip - Number of business to skip
   * @property {Number} req.query.limit - Number of bussiness page limit
   * @property {Number} req.query.event -  Business event
   * @property {String} req.query.list - Array of business ids
   * @property {Number} req.query.area - Business areas code
   * @property {String} req.query.orderBy - Business list order
   * @property {String} req.query.search - Search business
   */
  getBusiness(req, res, next) {
    const { skip, limit, event, list, area, orderBy, search, category } = req.query;

    const filter = {
      "state": "published",
      "area": area,
      "event": event,
      "list": list,
      "category": [],

    };
    var promise;

    if (category) {
      promise = new Promise((resolve, reject) => {
        Category.findOne({ "enName": category })
          .then(category => {
            if (!_.isEmpty(category)) {
              filter.category.push(category._id);

              return Category.getChildren(category.code);
            }

            return ;
        })
        .then(categories => {
          if (!_.isEmpty(categories)) {
            categories.map(category => filter.category.push(category._id));
          }

          resolve(categories);
        });
      })
    } else {
      promise = '';
    }

    Promise.resolve(promise)
      .then(categories => {
        return Business.getTotalCount({ filter, search });
      })
      .then(count => {
        req.count = count;
        return Business.getList({ skip, limit, filter, search, orderBy });
      })
      .then(list => {
        return res.json({
          totalCount: req.count,
          list: list,
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
   * @property {Number} req.query.by - Retrieve business by manger, admin
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
          if (_.isUndefined(req.query.by)) {
            business.viewsCount = business.viewsCount + 1;
            business.weekViewsCount = business.weekViewsCount + 1;
            business.monthViewsCount = business.monthViewsCount + 1;
            return business.save();
          } else {
            return business;
          }
        } else {
          throw new APIError("Not found", httpStatus.NOT_FOUND);
        }
      }).then(business => {
        return res.json(business);
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Admin get business list
   * @property {Number} req.query.skip - Number of business to skip
   * @property {Number} req.query.limit - Number of bussiness page limit
   * @property {Number} req.query.event -  Business event
   * @property {Numnber} req.query.state - Business state
   * @property {Boolean} req.query.reports - Busienss reports
   * @property {String} req.query.search - Search business
   */
  adminGetBusinessList(req, res, next) {
    const { skip, limit, search, state, event, reports } = req.query;

    const filter = {
      "event": event,
      "state": state,
      "reports": reports,
    };

    BusinessController.authenticate(req, res, next)
      .then(role => {
        if (_.isEmpty(role)) throw new APIError("Forbidden", httpStatus.FORBIDDEN);

        return Business.getTotalCount({ filter, search });
      })
      .then(count => {
        req.count = count;
        return Business.getList({
          skip,
          limit,
          filter,
          search,
          orderBy: "new"
        });
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
   * Add new business
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

        const {
          state,
          cnName,
          krName,
          enName,
          chains,
          category,
          tags,
          tel,
          address,
          geo,
          description,
          priceRange,
          supportedLanguage,
          status,
          openningHoursSpec,
          rest,
          payment,
          delivery,
          event,
          menu,
          priority,
         } = req.body;

        // const data = req.body;
        const business = new Business({
          state,
          cnName,
          krName,
          enName,
          category,
          tags,
          chains,
          tel,
          address,
          geo,
          description,
          priceRange,
          supportedLanguage,
          status,
          openningHoursSpec,
          rest,
          payment,
          delivery,
          event,
          menu,
          priority,
        });

        return business.save();
      })
      .then(business => {
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
        data.updatedAt = Date.now();

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
   * Report business
   * @property {ObejctId} req.params.id - Business id
   * @property {String} req.body.content - Report content
   * @property {String} req.body.contact - Reporter contact
   */
  reportBusiness(req, res, next) {
    Business.getById(req.params.id)
      .then(business => {
        if (_.isEmpty(business)) throw new APIError("Not found", httpStatus.NOT_FOUND);

        business.reports.push({
          contact: req.body.contact || '',
          content: req.body.content,
        });

        business.save();
      })
      .then(business => {
        return res.status(204).send();
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
 			passport.authenticate('access-token', (err, payload, info) => {
 				if (err) return reject(err);
 				if (info) return reject(new APIError(info.message, httpStatus.UNAUTHORIZED));

        if (payload.isVerified && (payload.role === 'manager' || payload.role === 'admin' || payload.role === 'god')) {
      		return resolve(payload.role);
      	} else {
          return reject(new APIError("Forbidden", httpStatus.FORBIDDEN));
        }
 			})(req, res, next);
 		});
 	}
}

export default BusinessController;
