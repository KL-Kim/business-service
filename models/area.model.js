import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';

import APIError from '../helper/api-error';

const AreaSchema = new mongoose.Schema({
  "code": {
    "type": String,
    "required": true,
  },
  "cityCode": {
    "type": String,
    "required": true,
  },
  "provinceCode": {
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
AreaSchema.virtual('id')
 	.get(function() { return this._id });

/**
 * Methods
 */
AreaSchema.methods = {
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
AreaSchema.statics = {

  /**
	 * List areas in descending order of 'createdAt' timestamp.
	 * @param {number} skip - Number of areas to be skipped.
	 * @param {number} limit - Limit number of areas to be returned.
	 * @returns {Promise<User[]>}
	 */
	getAreasList({skip = 0, limit = 50} = {}) {
		return this.find()
			.sort({ createdAt: -1 })
			.skip(+skip)
			.limit(+limit)
			.exec();
	}
};

export default mongoose.model('Area', AreaSchema);
