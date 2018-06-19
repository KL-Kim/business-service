/**
 * Business tag controller
 *
 * @export {Class}
 * @version 0.0.1
 *
 * @author KL-Kim (https://github.com/KL-Kim)
 * @license MIT
 */

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
   * @role - *
   * @since 0.0.1
   * @property {Number} req.query.skip - Number of tags to skip
   * @property {Number} req.query.limit - Number of tags limit
   * @property {String} req.query.search - Search term
   * @property {String} req.query.orderBy - List order
   */
  getTagsList(req, res, next) {
    const { skip, limit, search, orderBy } = req.query;

    Tag.getTagsList({ skip, limit, search, orderBy })
      .then(list => {
        return res.json(list);
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Add Tags tag
   * @role - manager, admin, god
   * @since 0.0.1
   * @property {number} req.body.code - Tag code
   * @property {string} req.body.cnName - Tag chinese name
   * @property {string} req.body.krName - Tag korean name
   * @property {string} req.body.enName - Tag English name
   */
  addBusinessTag(req, res, next) {
    TagController.authenticate(req, res, next)
      .then(role => {
        if (_.isEmpty(role)) throw new APIError("Permission denied", httpStatus.UNAUTHORIZED);

        const tag = new Tag({
          ...req.body
        });

        return tag.save();
      })
      .then(tag => {
        return res.status(204).send();
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Update business tag
   * @role - manager, admin, god
   * @since 0.0.1
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
        if (_.isEmpty(tag)) throw new APIError("Not found", httpStatus.NOT_FOUND);

        delete req.body._id;
        return tag.update({...req.body});
      })
      .then(tag => {
        return res.status(204).send();
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Delete business tag
   * @role - manager, admin, god
   * @since 0.0.1
   * @property {ObjectId} req.body._id - Tag id
   */
  deleteBusinessTag(req, res, next) {
    TagController.authenticate(req, res, next)
      .then(role => {
        if (_.isEmpty(role)) throw new APIError("Permission denied", httpStatus.UNAUTHORIZED);

        return Tag.findByIdAndRemove(req.body._id);
      })
      .then(tag => {
        if (tag) {
          return res.status(204).send();
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
   * @since 0.0.1
	 * @returns {Promise<Object, APIError>}
   */
  static authenticate(req, res, next) {
 		return new Promise((resolve, reject) => {
 			passport.authenticate('access-token', (err, payload, info) => {
 				if (err) return reject(err);
 				if (info) return reject(new APIError(info.message, httpStatus.UNAUTHORIZED));

        if (payload.role === 'manager' || payload.role === 'admin' || payload.role === 'god') {
      		return resolve(payload.role);
      	} else {
          return reject(new APIError("Unauthorized", httpStatus.UNAUTHORIZED));
        }
 			})(req, res, next);
 		});
 	}
}

export default TagController;
