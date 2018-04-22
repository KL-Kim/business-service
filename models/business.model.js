import Promise from 'bluebird';
import mongoose, { Schema } from 'mongoose';
import httpStatus from 'http-status';
import _ from 'lodash';

import APIError from '../helper/api-error';

const BusinessSchema = new Schema({
  "state": {
    type: String,
    required: true,
    default: "draft",
    enum: ['draft', 'published', 'trash']
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
    unique: true,
    lowercase: true,
  },
  "chains": [{
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
  "reviewsList": [{
    type: Schema.Types.ObjectId,
    ref: 'Review',
  }],
  "ratingSum": {
    type: Number,
    default: 0,
  },
  "storiesCount": {
    type: Number,
    default: 0,
  },
  "storiesList": [{
    type: String
  }],
  "reports": [{
    "checked": {
      type: Boolean
    },
    content: {
      type: String
    }
  }],
  "updatedAt": {
    type: Date,
    default: Date.now,
  },
  "createdAt": {
		type: Date,
		default: Date.now
	},
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
 * Pre-save hooks
 */
BusinessSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  return next();
});

BusinessSchema.pre('update', function(next) {
  this.updatedAt = Date.now();

  return next();
});

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
        path: 'chains',
        select: ['krName', 'cnName', 'enName'],
      })
      .exec();
  },

  /**
   * Get single business by params
   * @param {Object} params - id, enName
   */
  getSingleBusiness(params) {
    return this.findOne(params)
    .populate({
      path: 'category',
      select: ['code', 'krName', 'cnName', 'enName', 'parent'],
    })
    .populate({
      path: 'tags',
      select: ['code', 'krName', 'cnName', 'enName'],
    })
    .populate({
      path: 'chains',
      select: ['krName', 'cnName', 'enName'],
    })
    .exec();
  },

  /**
	 * List business in descending order of 'createdAt' timestamp.
	 * @param {number} skip - Number of business to be skipped.
	 * @param {number} limit - Limit number of business to be returned.
	 * @returns {Promise<Business[]>}
	 */
	getList({skip = 0, limit = 20, filter = {}, search} = {}) {

    let conditions,
        searchCondition,
        eventCondition,
        stateCondition,
        reportCondition;

    if (filter.state) {
      stateCondition = {
        "state": {
					"$in": filter.state
				}
      }
    }

    if (filter.event) {
      eventCondition = {
        "event" : {
          "$ne": null
        }
      }
    }

    if (filter.reports) {
      reportCondition = {
        "reports": {
					"$exists": true,
          "$not": {
            $size: 0
          },
				}
      }
    }

    if (search) {
			const escapedString =  _.escapeRegExp(search)
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
					}
				]
			}
		}

    if (stateCondition || searchCondition || eventCondition || reportCondition) {
      conditions = {
				"$and": [_.isEmpty(searchCondition) ? {} : searchCondition,
					_.isEmpty(stateCondition) ? {} : stateCondition,
          _.isEmpty(eventCondition) ? {} : eventCondition,
          _.isEmpty(reportCondition) ? {} : reportCondition,
        ]
			};
    }

		return this.find(
      _.isEmpty(conditions) ? {} : conditions,
      'krName cnName enName  status viewsCount ratingSum state thumbnailUri event chains reports'
    )
			.sort({ createdAt: -1 })
			.skip(+skip)
			.limit(+limit)
      .populate({
        path: 'chains',
        select: ['krName', 'cnName', 'enName', 'state'],
      })
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
   * Filtered business list count
   */
  getTotalCount({skip = 0, limit = 20, filter = {}, search} = {}) {
    let conditions,
        searchCondition,
        eventCondition,
        stateCondition,
        reportCondition;

    if (filter.state) {
      stateCondition = {
        "state": {
					"$in": filter.state
				}
      }
    }

    if (filter.event) {
      eventCondition = {
        "event" : {
          "$ne": null
        }
      }
    }

    if (filter.reports) {
      reportCondition = {
        "reports": {
					"$exists": true,
          "$not": {
            $size: 0
          },
				}
      }
    }

    if (search) {
			const escapedString =  _.escapeRegExp(search)
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
					}
				]
			}
		}

    if (stateCondition || searchCondition || eventCondition || reportCondition) {
      conditions = {
				"$and": [_.isEmpty(searchCondition) ? {} : searchCondition,
					_.isEmpty(stateCondition) ? {} : stateCondition,
          _.isEmpty(eventCondition) ? {} : eventCondition,
          _.isEmpty(reportCondition) ? {} : reportCondition,
        ]
			};
    }

    return this.count(_.isEmpty(conditions) ? {} : conditions).exec();
  },
};

export default mongoose.model('Business', BusinessSchema);
