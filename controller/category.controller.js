/**
 * Business category controller
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
import Category from '../models/category.model';

class CategoryController extends BaseController {

  /**
   * Get business categories list
   * @role - *
   * @since 0.0.1
   * @property {String} search - Search term
   */
  getCategoriesList(req, res, next) {
    const { search } = req.query;

    Category.getCategoriesList(search)
      .then(list => {
        return res.json(list);
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Add business category
   * @role - manager, admin, god
   * @since 0.0.1
   * @property {Number} req.body.code - Category code
   * @property {String} req.body.cnName - Category chinese name
   * @property {String} req.body.krName - Category korean name
   * @property {String} req.body.enName - Category English name
   * @property {Number} req.body.parent - Category parent code
   */
  addBusinessCategory(req, res, next) {
    CategoryController.authenticate(req, res, next)
      .then(role => {
        if (_.isEmpty(role)) throw new APIError("Permission denied", httpStatus.UNAUTHORIZED);

        const data = req.body;

        const category = new Category({
          code: data.code,
          enName: data.enName,
          cnName: data.cnName,
          krName: data.krName,
          parent: data.parent,
        });

        return category.save();
      })
      .then(category => {
        return res.status(201).send();
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Update business category
   * @role - manager, admin, god
   * @since 0.0.1
   * @property {ObjectId} req.body._id - Category id
   * @property {Number} req.body.code - Category code
   * @property {String} req.body.cnName - Category chinese name
   * @property {String} req.body.krName - Category korean name
   * @property {String} req.body.enName - Category English name
   * @property {Number} req.body.parent - Category parent code
   */
  updateBusinessCategory(req, res, next) {
    CategoryController.authenticate(req, res, next)
      .then(role => {
        if (_.isEmpty(role)) throw new APIError("Permission denied", httpStatus.UNAUTHORIZED);

        return Category.getById(req.body._id);
      })
      .then(category => {
        if (_.isEmpty(category)) throw new APIError("Not found", httpStatus.NOT_FOUND);

        category.code = req.body.code;
        category.cnName = req.body.cnName;
        category.krName = req.body.krName;
        category.enName = req.body.enName;
        category.parent = req.body.parent;

        return category.save();
      })
      .then(category => {
        return res.status(204).send();
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Delete business category
   * @role - manager, admin, god
   * @since 0.0.1
   * @property {ObjectId} req.body._id - Category id
   */
  deleteBusinessCategory(req, res, next) {
    CategoryController.authenticate(req, res, next)
      .then(role => {
        if (_.isEmpty(role)) throw new APIError("Permission denied", httpStatus.UNAUTHORIZED);

        return Category.findByIdAndRemove(req.body._id);
      })
      .then(category => {
        if (category) {
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

export default CategoryController;
