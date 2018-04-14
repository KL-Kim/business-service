import Promise from 'bluebird';
import httpStatus from 'http-status';
import passport from 'passport';
import _ from 'lodash';

import BaseController from './base.controller';
import APIError from '../helper/api-error';
import Category from '../models/category.model';

class CategoryController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get business categories list
   * @role - *
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
   * @property {Number} req.body.code - Cateogory code
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
        return Category.getCategoriesList();
      })
      .then(list => {
        return res.json(list);
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Update business category
   * @role - manager, admin, god
   * @property {ObjectId} req.body._id - Cateogory id
   * @property {Number} req.body.code - Cateogory code
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
        if (category) {
          category.code = req.body.code;
          category.cnName = req.body.cnName;
          category.krName = req.body.krName;
          category.enName = req.body.enName;
          category.parent = req.body.parent;

          return category.save();
        } else {
          throw new APIError("Not found", httpStatus.NOT_FOUND);
        }
      })
      .then(category => {
        return Category.getCategoriesList();
      })
      .then(list => {
        return res.json(list);
      })
      .catch(err => {
        return next(err);
      });
  }

  /**
   * Delete business category
   * @role - manager, admin, god
   * @property {ObjectId} req.body._id - Cateogory id
   */
  deleteBusinessCategory(req, res, next) {
    CategoryController.authenticate(req, res, next)
      .then(role => {
        if (_.isEmpty(role)) throw new APIError("Permission denied", httpStatus.UNAUTHORIZED);

        return Category.findByIdAndRemove(req.body._id);
      })
      .then(category => {
        if (category) {
          return Category.getCategoriesList();
        } else {
          throw new APIError("Not found", httpStatus.NOT_FOUND);
        }
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

export default CategoryController;
