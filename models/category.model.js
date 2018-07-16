/**
 * Business Category Model
 *
 * @version 0.0.1
 *
 * @author KL-Kim (https://github.com/KL-Kim)
 * @license MIT
 */

import Promise from 'bluebird';
import mongoose, { Schema } from 'mongoose';
import httpStatus from 'http-status';
import _ from 'lodash';

import APIError from '../helper/api-error';

const CategorySchema = new Schema({
  "code": {
    "type": Number,
    "required": true,
    "unique": true,
    "index": true,
  },
  "enName": {
    "type": String,
    "required": true,
    "unique": true,
    "text": true,
    "lowercase": true,
  },
  "cnName": {
    "type": String,
    "required": true,
    "unique": true,
  },
  "krName": {
    "type": String,
    "required": true,
    "unique": true,
  },
  "parent": {
    "type": Number,
  },
  "priority": {
    "type": Number,
    "default": 0,
    "min": 0,
    "max": 9,
    "index": true,
  },
  "thumbnailUrl": {
    "type": String,
  },
});

/**
 * Compund Indexes
 */
CategorySchema.index({
  "priority": -1,
  "code": 1
});

/**
 * Virtuals
 */
CategorySchema.virtual('id')
 	.get(function() { return this._id });

/**
 * Methods
 */
CategorySchema.methods = {
  /**
	 * Remove unnecessary info
	 */
  toJSON() {
		let obj = this.toObject();
		delete obj.__v;
		delete obj.createdAt;
		return obj;
	},
};

/**
 * Statics
 */
CategorySchema.statics = {
  /**
	 * List category in descending order of 'code'.
   * @property {Number} skip - Number of categories to skip
   * @property {Number} limit - Number of categories limit
   * @property {String} search - Search term
   * @property {String} orderBy - List order
	 * @returns {Promise<Category[]>}
	 */
	getCategoriesList({ skip, limit, search, orderBy } = {}) {
    let searchCondition = {}, sort;

    switch (orderBy) {
      case "priority":
        sort = {
          "priority": -1,
          "code": 1
        };
        break;

      default:
        sort = {
          "code": 1
        };
    }

    const escapedString = _.escapeRegExp(search);

    if (escapedString) {
      searchCondition = {
        $or: [
          {
            "krName": {
              $regex: escapedString,
							$options: 'i'
            }
          },
          {
            "cnName": {
              $regex: escapedString,
							$options: 'i'
            }
          },
          {
            "enName": {
              $regex: escapedString,
							$options: 'i'
            }
          },
        ]
      }
    }

		return this.find(searchCondition)
      .skip(+skip)
      .limit(+limit)
			.sort(sort)
			.exec();
	},

  /**
   * Get category children
   * @param {Number} code - Category code
   */
  getChildren(code) {
    return this.find({ "parent": code }).exec();
  },

  /**
   * Get category by id
   * @param {ObjectId} id - Category id
   * @return {Promise<Category>}
   */
  getById(id) {
    return this.findById(id).exec();
  },

  /**
   * Get category by code
   * @param {Number} code - Category code
   * @return {Promise<Category>}
   */
  getByCode(code) {
    return this.findOne({"code": code}).exec();
  },

};

export default mongoose.model('Category', CategorySchema);
