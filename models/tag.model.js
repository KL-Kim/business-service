/**
 * Business Tag Model
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

const TagSchema = new Schema({
  "code": {
    "type": Number,
    "required": true,
    "unique": true,
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
  "priority": {
    "type": Number,
    "default": 0,
    "min": 0,
    "max": 9,
    "index": true,
  },
});

/**
 * Compund Indexes
 */
TagSchema.index({
  "priority": -1,
  "code": 1
});

/**
 * Virtuals
 */
TagSchema.virtual('id')
 	.get(function() { return this._id });

/**
 * Methods
 */
TagSchema.methods = {
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
TagSchema.statics = {

  /**
	 *  List tags in descending order of 'code'.
   * @property {Number} skip - Number of categories to skip
   * @property {Number} limit - Number of categories limit
   * @property {String} search - Search term
   * @property {String} orderBy - List order
	 * @returns {Promise<Tag[]>}
	 */
	getTagsList({ skip, limit, search, orderBy } = {}) {
    let searchCondition = {}, sort;

    switch (orderBy) {
      case "priority":
        sort = {
          "priority": -1,
          "code": 1
        };
        break;

      default:
        sort =  {
          "code": 1
        };
    }

    const escapedString = _.escapeRegExp(search);
    const num = _.toNumber(search);

    if (num) {
      searchCondition = {
        "code": num
      };
    } else {
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
   * Get tag by id
   * @param {Object} id - tag id
   * @return {Promise<Tag>}
   */
  getById(id) {
    return this.findById(id).exec();
  },

  /**
   * Get tag by code
   * @param {Number} code - tag code
   * @return {Promise<Tag>}
   */
  getByCode(code) {
    return this.findOne({"code": code}).exec();
  },
};

export default mongoose.model('Tag', TagSchema);
