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
  },
  "enName": {
    "type": String,
    "required": true,
    "unique": true,
    lowercase: true,
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
  business: [{
    type: Schema.Types.ObjectId,
    ref: 'Business'
  }],
});

/**
 * Index
 */
CategorySchema.index({
  "code": 1,
  "enName": 'text',
  "cnName": 'text',
  "krName": 'text',
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
   * @param {String} search - Search term
	 * @returns {Promise<Category[]>}
	 */
	getCategoriesList(search) {
    let searchCondition = {};

    const escapedString = _.escapeRegExp(search);
    const num = _.toNumber(search);

    if (num) {
      searchCondition = {
        $or: [
          {
            "code": num
          },
          {
            "parent": num
          },
        ]
      }
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
			.sort({ "code": 1 })
			.exec();
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
