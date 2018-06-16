/**
 * Province Model
 *
 * @version 0.0.1
 *
 * @author KL-Kim (https://github.com/KL-Kim)
 * @license MIT
 */

import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';

import APIError from '../helper/api-error';

const ProvinceSchema = new mongoose.Schema({
  "code": {
    "type": String,
    "required": true,
  },
  "cnName": {
    "type": String,
    "required": true,
  },
  "pinyin": {
    "type": String,
    "required": true,
  },
});

/**
 * Virtuals
 */
ProvinceSchema.virtual('id')
 	.get(function() { return this._id });

/**
 * Methods
 */
ProvinceSchema.methods = {
  /**
	 * Remove unnecessary info
	 */
  toJSON() {
		let obj = this.toObject();
    delete obj._id;
		delete obj.__v;
		delete obj.createdAt;
		return obj;
	},
};

/**
 * Statics
 */
ProvinceSchema.statics = {

  /**
	 * List Provinces in descending order of 'createdAt' timestamp.
	 * @param {number} skip - Number of Provinces to be skipped.
	 * @param {number} limit - Limit number of Provinces to be returned.
	 * @returns {Promise<User[]>}
	 */
	getProvincesList() {
		return this.find()
			.sort({ "code": 1 })
			.exec();
	}
};

export default mongoose.model('Province', ProvinceSchema);
