import Promise from 'bluebird';
import mongoose, { Schema } from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helper/api-error';

const BusinessSchema = new Schema({
  "state": {
    type: String,
    required: true,
    default: "draft",
    enum: ['draft', 'published', 'deleted']
  },
  "cnName": {
    type: String,
    required: true,
    unique: true
  },
  "krName": {
    type: String,
    required: true,
    unique: true,
  },
  "enName": {
    type: String,
    required: true,
  },
  "subDepartments": [{
    type: Schema.Types.ObjectId,
    ref: 'Business'
  }],
  "category": {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Category',
  },
  "tags": [{
    type: Schema.Types.ObjectId,
    ref: 'Tag',
  }],
  "tel": {
    type: String,
    required: true,
  },
  "address": {
		province: {
			name: {
				type: String,
			},
			code: {
				type: Number,
			}
		},
		city: {
			name: {
				type: String,
			},
			code: {
				type: Number,
			}
		},
		area: {
			name: {
				type: String,
			},
			code: {
				type: Number,
			}
		},
		street: {
			type: String,
		},
	},
  "geo": {
    lat: {
      type: String,
    },
    long: {
      type: String,
    }
  },
  "description": {
    type: String
  },
  "priceRange": {
    type: String
  },
  "status": {
    type: String,
    required: true,
    enum: ['normal', 'dissolute'],
    default: 'normal',
  },
  "viewsCount": {
    type: Number,
    required: true,
    default: 0,
  },
  "favoredCount": {
    type: Number,
    required: true,
    default: 0,
  },
  "openningHoursSpec": {
    mon: {
      type: String
    },
    tue: {
      type: String
    },
    wed: {
      type: String
    },
    thu: {
      type: String
    },
    fri: {
      type: String
    },
    sat: {
      type: String
    },
    sun: {
      type: String
    }
  },
  "supportedLanguage": [{
    type: String
  }],
  "rest": {
    type: String
  },
  "payment": [{
    type: String
  }],
  "delivery": {
    type: String
  },
  "event": {
    type: String
  },
  "menu": [{
    name: {
      type: String
    },
    price: {
      type: Number
    },
    hot: {
      type: Boolean
    },
    new: {
      type: Boolean
    }
  }],
  "thumbnailUri": {
    default: {
      type: String
    },
    hd: {
      type: String
    },
  },
  "imagesUri": [{
    type: String
  }],
  "reviewsCount": {
    type: Number,
    default: 0
  },
  "reviewsList": {
    type: String
  },
  "ratingAverage": {
    type: Number,
    default: 0,
  },
  "storiesCount": {
    type: Number,
    default: 0,
  },
  "storiesList": [{
    type: String
  }]
});

/**
 * Index
 */
BusinessSchema.index({
  cnName: 'text',
  krName: 'text',
  enName: 'text',
  description: 'text'
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
	 * @returns {Promise<Business[]>}
	 */
	getBusinessList({skip = 0, limit = 50} = {}) {
		return this.find({}, 'krName cnName enName state status viewsCount thumbnailUri event')
			.sort({ createdAt: -1 })
			.skip(+skip)
			.limit(+limit)
      .populate({
        path: 'category',
        select: ['code', 'krName', 'cnName', 'enName', 'parent']
      })
      .populate({
        path: 'tags',
        select: ['code', 'krName', 'cnName', 'enName']
      })
			.exec();
	},

  /**
   * Get business by id
   * @param {ObjectId} id - Business id
   */
  getById(id) {
    return this.findById(id)
      .populate({
        path: 'category',
        select: ['code', 'krName', 'cnName', 'enName', 'parent'],
      })
      .populate({
        path: 'tags',
        select: ['code', 'krName', 'cnName', 'enName'],
      })
      .populate({
        path: 'subDepartments',
        select: ['krName', 'cnName', 'enName'],
      })
      .exec();
  },

  /**
   * Filtered business list count
   */
  getTotalCount() {
    return this.count().exec();
  },
};

export default mongoose.model('Business', BusinessSchema);
