import Promise from 'bluebird';
import httpStatus from 'http-status';
import passport from 'passport';
import _ from 'lodash';

import BaseController from './base.controller';
import APIError from '../helper/api-error';
import Tag from '../models/tag.model';

class TagController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get Business Tags list
   * @property {String} search - Search term
   */
  getTagsList(req, res, next) {
    const { search } = req.query;

    Tag.getTagsList(search)
      .then(list => {
        return res.json(list);
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Add Tags tag
   * @property {number} req.body.code - Tag code
   * @property {string} req.body.cnName - Tag chinese name
   * @property {string} req.body.krName - Tag korean name
   * @property {string} req.body.enName - Tag English name
   */
  addBusinessTag(req, res, next) {
    TagController.authenticate(req, res, next)
      .then(role => {
        if (_.isEmpty(role)) throw new APIError("Permission denied", httpStatus.UNAUTHORIZED);

        const data = req.body;

        return Tag.findOne({$or: [
          {
            "code": data.code,
          },
          {
            "cnName": data.cnname,
          },
          {
            "krName": data.krName,
          },
          {
            "enName": data.enName,
          }
        ]});
      })
      .then(tag => {
        if(_.isEmpty(tag)) {
          const data = req.body;

          tag = new Tag({
            code: data.code,
            enName: data.enName,
            cnName: data.cnName,
            krName: data.krName,
          });

          return tag.save();
        } else {
          throw new APIError("The tag already exists", httpStatus.CONFLICT);
        }
      })
      .then(tag => {
        return Tag.getTagsList();
      })
      .then(list => {
        return res.json(list);
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Update business tag
   * @role manager, admin
   * @property {ObjectId} req.body._id - Tag id
   * @property {number} req.body.code - Tag code
   * @property {string} req.body.cnName - Tag chinese name
   * @property {string} req.body.krName - Tag korean name
   * @property {string} req.body.enName - Tag English name
   */
  updateBusinessTag(req, res, next) {
    TagController.authenticate(req, res, next)
      .then(role => {
        if (_.isEmpty(role)) throw new APIError("Permission denied", httpStatus.UNAUTHORIZED);

        return Tag.getById(req.body._id);
      })
      .then(tag => {
        if (tag) {
          tag.code = req.body.code;
          tag.cnName = req.body.cnName;
          tag.krName = req.body.krName;
          tag.enName = req.body.enName;

          return tag.save();
        } else {
          throw new APIError("Not found", httpStatus.NOT_FOUND);
        }
      })
      .then(tag => {
        return Tag.getTagsList();
      })
      .then(list => {
        return res.json(list);
      })
      .catch(err => {
        if (err.name === 'MongoError' && err.code === 11000) {
          return next(new APIError('The tag already exists', httpStatus.CONFLICT));
        }

        return next(err);
      });
  }

  /**
   * Delete business tag
   * @role manager, admin
   * @property {ObjectId} req.body._id - Tag id
   */
  deleteBusinessTag(req, res, next) {
    TagController.authenticate(req, res, next)
      .then(role => {
        if (_.isEmpty(role)) throw new APIError("Permission denied", httpStatus.UNAUTHORIZED);

        return Tag.getById(req.body._id);
      })
      .then(tag => {
        if (tag) {
          return Tag.findByIdAndRemove(req.body._id);
        } else {
          throw new APIError("Not found", httpStatus.NOT_FOUND);
        }
      })
      .then(tag => {
        return Tag.getTagsList();
      })
      .then(list => {
        return res.json(list);
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

export default TagController;
