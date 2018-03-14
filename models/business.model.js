import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';

import APIError from '../helper/api-error';

const BusinessSchema = new mongoose.Schema({
  "state": {
    "type": String,
    "required": true,
    "default": "draft",
    "enum": ['draft', 'published', 'deleted']
  },
  "subDepartments": [{
    "id": {
      "type": String
    },
    "name": {
      "type": String
    }
  }],
  "cnName": {
    "type": String,
    "required": true,
  },
  "krName": {
    "type": String,
    "required": true,
  },
  "category": {
    "type": String,
    "required": true,
  },
});

/**
 * Virtuals
 */
BusinessSchema.virtual('id')
 	.get(function() { return this._id });

/**
 * Methods
 */
BusinessSchema.methods = {
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
BusinessSchema.statics = {

  /**
	 * List business in descending order of 'createdAt' timestamp.
	 * @param {number} skip - Number of business to be skipped.
	 * @param {number} limit - Limit number of business to be returned.
	 * @returns {Promise<User[]>}
	 */
	getBusinessList({skip = 0, limit = 50} = {}) {
		return this.find()
			.sort({ createdAt: -1 })
			.skip(+skip)
			.limit(+limit)
			.exec();
	}
};

export default mongoose.model('Business', BusinessSchema);
