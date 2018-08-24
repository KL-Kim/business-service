/**
 * Business controller
 *
 * @export {Class}
 * @version 0.0.1
 *
 * @author KL-Kim (https://github.com/KL-Kim)
 * @license MIT
 */

import Promise from 'bluebird';
import grpc from 'grpc';
import _ from 'lodash';
import httpStatus from 'http-status';
import passport from 'passport';
import fs from 'fs';
import Cron from 'node-cron';
import OSS from 'ali-oss';

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

    // Reset week views count every monday 00:00
    const weekTask = Cron.schedule('0 0 0 * * Monday', () => {
      Business.updateMany({ weekViewsCount: 0 })
        .then(result => {
          console.log(result);
          console.log("Reset week views count successfully")
        }).catch(err => {
          throw err;
        });
    });

    // Reset month views count every month 1th 00:00
    const monthTask = Cron.schedule('0 0 0 1 * *', () => {
      Business.updateMany({ monthViewsCount: 0 })
        .then(result => {
          console.log(result);
          console.log("Reset month views count successfully")
        }).catch(err => {
          throw err;
        });
    });

    // Connect to Notification GRPC Serivce
    this._notificationGrpcClient = new notificationProto.NotificationService(
      config.notificationGrpcServer.host + ':' + config.notificationGrpcServer.port,
      grpc.credentials.createInsecure()
    );

    this._notificationGrpcClient.waitForReady(Infinity, (err) => {
      if (err) console.error(err);

      console.log("Notification gRPC Server connected successfully!");
    });
  }

  /**
   * Get business list
   * @role - *
   * @since 0.0.1
   * @property {Number} req.query.skip - Number of business to skip
   * @property {Number} req.query.limit - Number of bussiness limit
   * @property {Number} req.query.event -  Business event
   * @property {String} req.query.ids - Array of business ids
   * @property {Number} req.query.area - Business areas code
   * @property {String} req.query.orderBy - Business list order
   * @property {String} req.query.search - Search business
   * @property {String} req.query.category - Business category English name
   * @property {String} req.query.tag - Business tag English name
   */
  getBusinessList(req, res, next) {
    const { skip, limit, event, ids, area, orderBy, search, category, tag } = req.query;

    const filter = {
      status: "PUBLISHED",
      area,
      event,
      ids,
      "category": null,
      "tag": null,
    };

    const selectItems = 'krName cnName enName businessState viewsCount monthViewsCount weekViewsCount ratingAverage mainImage event priority category address';

    var categoryPromise, tagPromise;

    if (category) {
      categoryPromise = new Promise((resolve, reject) => {
        Category.findOne({ "enName": category })
          .then(category => {
            if (_.isEmpty(category)) {
              return reject(new APIError("Not found", httpStatus.NOT_FOUND));
            }

            filter.category = category._id.toString();
            return resolve(category);;
        })
      })
    }
    
    if (tag) {
      tagPromise = new Promise((resolve, reject) => {
        Tag.findOne({ "enName": tag })
          .then(tag => {
            if (_.isEmpty(tag)) return reject(new APIError("Not found", httpStatus.NOT_FOUND));

            filter.tag = tag._id.toString();
            return resolve(tag);
          })
      });
    }

    Promise.all([categoryPromise, tagPromise])
      .then(() => {
        return Business.getTotalCount({ filter, search });
      })
      .then(count => {
        req.count = count;
        return Business.getList({ skip, limit, filter, search, orderBy, selectItems });
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
   * Get single business by slug
   * @role - *
   * @since 0.0.1
   * @property {ObjectId} req.params.slug - Business enName
   */
  getSingleBusiness(req, res, next) {
    Business.getByName(req.params.slug)
      .then(business => {
        if (_.isEmpty(business)) throw new APIError("Not found", httpStatus.NOT_FOUND);

        business.viewsCount = business.viewsCount + 1;
        business.weekViewsCount = business.weekViewsCount + 1;
        business.monthViewsCount = business.monthViewsCount + 1;

        return business.save();
      })
      .then(business => {
        return res.json(business);
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Report business
   * @role - *
   * @since 0.0.1
   * @property {ObejctId} req.params.id - Business id
   * @property {String} req.body.content - Report content
   * @property {String} req.body.contact - Reporter contact
   */
  reportBusiness(req, res, next) {
    Business.getById(req.params.id)
      .then(business => {
        if (_.isEmpty(business)) throw new APIError("Not found", httpStatus.NOT_FOUND);

        const { type, contact, content } = req.body;

        business.reports.push({
          type,
          contact,
          content,
        });

        return business.save();
      })
      .then(business => {
        return res.status(204).send();
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Admin get business list
   * @role - manager, admin, god
   * @since 0.0.1
   * @property {Number} req.query.skip - Number of business to skip
   * @property {Number} req.query.limit - Number of bussiness page limit
   * @property {Number} req.query.event -  Business event
   * @property {Numnber} req.query.status - Business status
   * @property {Boolean} req.query.reports - Busienss reports
   * @property {String} req.query.search - Search business
   */
  getBusinessListByAdmin(req, res, next) {
    const { skip, limit, search, status, event, reports, orderBy } = req.query;

    const filter = {
      event,
      status,
      reports,
    };

    BusinessController.authenticate(req, res, next)
      .then(payload => {
        if (_.isEmpty(payload)) throw new APIError("Forbidden", httpStatus.FORBIDDEN);

        return Business.getTotalCount({ filter, search });
      })
      .then(count => {
        req.count = count;
        return Business.getList({
          skip,
          limit,
          filter,
          search,
          orderBy,
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
   * @since 0.0.1
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
      .then(payload => {
        if (_.isEmpty(payload)) throw new APIError("Forbidden", httpStatus.FORBIDDEN);

        const business = new Business({
          ...req.body
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
   * @since 0.0.1
   * @property {ObjectId} req.query.id - Business id
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
      .then(payload => {
        if (_.isEmpty(payload)) throw new APIError("Forbidden", httpStatus.FORBIDDEN);

        const data = req.body;
        data.updatedAt = Date.now();

        return Business.findById(req.params.id);
      })
      .then(business => {
        if (_.isEmpty(business)) throw new APIError("Not found", httpStatus.NOT_FOUND);

        return business.update({
          ...req.body,
          updatedAt: Date.now(),
        });

      })
      .then(() => {
        return res.status(204).send();
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Delete business
   * @role god
   * @since 0.0.1
   * @property {ObjectId} req.params.id - Business id
   */
  deleteBusiness(req, res, next) {
    BusinessController.authenticate(req, res, next)
      .then(payload => {
        if (_.isEmpty(payload) || payload.role !== 'god') throw new APIError("Forbidden", httpStatus.FORBIDDEN);
        
        return Business.findById(req.params.id);
      })
      .then(business => {
        if (_.isEmpty(business)) throw new APIError("Not found", httpStatus.NOT_FOUND);

        req.business = business;

        // Delete related images
        const images = [];

        if (!_.isEmpty(business.mainImage.name)) {
          images.push(business.mainImage.name);
        }

        if (!_.isEmpty(business.gallery)) {
          business.gallery.map(item => {
            images.push(item.name);
          });
        }

        const OSS_Client = new OSS({
          accessKeyId: config.OSSAccessKey.accessKeyId,
          accessKeySecret: config.OSSAccessKey.accessKeySecret,
          region: config.OSSRegion,
          bucket: config.OSSBucket,
          secure: true,
        });

        if (!_.isEmpty(images)) {
          return OSS_Client.deleteMulti(images);
        } else {
          return {
            res: {
              statusCode: 200
            }
          };
        }
      })
      .then(response => {
        if (response.res.statusCode === 200 || response.res.statusCode === 204) {
          return req.business.remove();
        } else {
          throw new APIError("Aliyun OSS Server Error: " + response.res.message, httpStatus.INTERNAL_SERVER_ERROR);
        }
      })
      .then(() => {
        return res.status(204).send();
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Add business images
   * @role - manager, admin, god
   * @since 0.0.1
   * @param {ObjectId} req.params.id - Business id
   * @property {Object} req.files - Business images files
   */
  addBusinessImages(req, res, next) {
    BusinessController.authenticate(req, res, next)
      .then(payload => {
        if (_.isEmpty(payload)) throw new APIError("Forbidden", httpStatus.FORBIDDEN);

        if (_.isEmpty(req.files)) {
          throw new APIError("Bad request", httpStatus.BAD_REQUEST);
        }

        return Business.findById(req.params.id);
      })
      .then(business => {
        if (_.isEmpty(business)) throw new APIError("Not found", httpStatus.NOT_FOUND);

        req.business = business

        const client = new OSS({
          accessKeyId: config.OSSAccessKey.accessKeyId,
          accessKeySecret: config.OSSAccessKey.accessKeySecret,
          region: config.OSSRegion,
          bucket: config.OSSBucket,
          secure: true,
        });

        const imagesPromises = [];
        let promise, rs, pathname;

        if (!_.isEmpty(req.files.main)) {
          const file = req.files.main[0];

          rs = fs.createReadStream(file.path);
          
          rs.on("error", error => {
            throw error;
          });

          pathname = 'business/images/' + business._id.toString() + '/main.' + file.filename.split('.').pop();
          
          promise = new Promise((resolve, reject) => {
            return client.putStream(pathname, rs)
                    .then(response => {
                      req.business.mainImage = {
                        name: response.name,
                        url: response.url,
                      };
  
                      return fs.unlink(file.path);
                    })
                    .then(() => {
                      return resolve("Success");
                    })
                    .catch(err => {
                      return reject(err);
                    })
          });

          imagesPromises.push(promise);
        }

        if (!_.isEmpty(req.files.gallery)) {
          req.files.gallery.map(image => {
            const readableStream = fs.createReadStream(image.path);

            readableStream.on("error", error => {
              throw error;
            });

            pathname = 'business/images/' + business._id.toString() + '/' + image.originalname;

            promise = new Promise((resolve, reject) => {
              return client.putStream(pathname, readableStream)
                      .then(response => {
                        req.business.gallery.push({
                          name: response.name,
                          url: response.url,
                        });
    
                        return fs.unlink(image.path);
                      })
                      .then(() => {
                        return resolve("Success");
                      })
                      .catch(err => {
                        return reject(err);
                      });
            });
  
            imagesPromises.push(promise);
          });
        }

        return Promise.all([...imagesPromises]);
      })
      .then(() => {
        return req.business.save();
      })
      .then(() => {
        return res.status(204).send();
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Delete business image
   * @role - manager, admin, god
   * @since 0.0.1
   * @param {ObjectId} req.params.id - Business id
   * @property {Boolean} req.body.main - Business main image
   * @property {String} req.body.imageId - Business gallery image id
   */
  deleteBusinessImage(req, res, next) {
    BusinessController.authenticate(req, res, next)
      .then(payload => {
        if (_.isEmpty(payload)) throw new APIError("Forbidden", httpStatus.FORBIDDEN);

        return Business.findById(req.params.id);
      })
      .then(business => {
        if (_.isEmpty(business)) throw new APIError("Not found", httpStatus.NOT_FOUND);

        req.business = business;
        
        const client = new OSS({
          accessKeyId: config.OSSAccessKey.accessKeyId,
          accessKeySecret: config.OSSAccessKey.accessKeySecret,
          region: config.OSSRegion,
          bucket: config.OSSBucket,
          secure: true,
        });

        if (req.body.mainImage) {
          return client.delete(req.business.mainImage.name);
        } 
        else if (!_.isEmpty(req.body.imageId)) {
          let targetName;
          req.newGallery = [];

          business.gallery.map(item => {
            if (item._id.toString() === req.body.imageId) {
              targetName = item.name;
            } else {
              req.newGallery.push(item);
            }
          });
  
          if (_.isEmpty(targetName)) throw new APIError("Image Not found", httpStatus.NOT_FOUND);

          return client.delete(targetName);
        } 
        else {
          throw new APIError("Bad request", httpStatus.BAD_REQUEST);
        }
      })
      .then(response => {
        if (response.res.statusCode === 204) {
          if (req.body.mainImage) {
            req.business.mainImage = {};
          } else if (!_.isEmpty(req.body.imageId)) {
            req.business.gallery = [...req.newGallery];
          }

          return req.business.save();
        } else {
          throw new APIError("Aliyun OSS Server Error: " + response.res.message, httpStatus.INTERNAL_SERVER_ERROR);
        }
      })
      .then(() => {
        return res.status(204).send();
      })
      .catch(err => {
        return next(err);
      })
  }

  /**
   * Authenticate
   * @since 0.0.1
   * @returns {Promise<Object, APIError>}
   */
  static authenticate(req, res, next) {
 		return new Promise((resolve, reject) => {
 			passport.authenticate('access-token', (err, payload, info) => {
 				if (err) return reject(err);
 				if (info) return reject(new APIError(info.message, httpStatus.UNAUTHORIZED));

        if (payload.role === 'manager' || payload.role === 'admin' || payload.role === 'god') {
      		return resolve(payload);
      	} else {
          return reject(new APIError("Forbidden", httpStatus.FORBIDDEN));
        }
 			})(req, res, next);
 		});
 	}
}

export default BusinessController;
