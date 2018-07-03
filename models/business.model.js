/**
 * Business Model
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

const BusinessSchema = new Schema({
  "status": {
    type: String,
    required: true,
    enum: ['DRAFT', 'PUBLISHED', 'TRASH'],
    default: "DRAFT",
  },
  "businessState": {
    type: String,
    required: true,
    enum: ['NORMAL', 'DISSOLUTE'],
    default: 'NORMAL',
  },
  "cnName": {
    type: String,
    required: true,
    unique: true,
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
    text: true,
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
        required: true,
        default: "北京",
			},
			code: {
				type: Number,
        required: true,
        default: 11,
			}
		},
		city: {
			name: {
				type: String,
        required: true,
        default: "市辖区",
			},
			code: {
				type: Number,
        required: true,
        default: 1101,
			}
		},
		area: {
			name: {
				type: String,
        required: true,
        default: "东城区",
			},
			code: {
				type: Number,
        required: true,
        default: 110101,
			}
		},
		street: {
			type: String,
		},
	},
  "geo": {
    type:{
      type: String,
      default: "Point",
    },
    coordinates: {
      type: Array,
      default: [0, 0]
    },
  },
  "description": {
    type: String
  },
  "priceRange": {
    type: String
  },
  "viewsCount": {
    type: Number,
    required: true,
    default: 0,
    index: true,
  },
  "weekViewsCount": {
    type: Number,
    required: true,
    default: 0,
    index: true,
  },
  "monthViewsCount": {
    type: Number,
    required: true,
    default: 0,
    index: true,
  },
  "favoredUser": [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
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
    type: String,
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
  "ratingAverage": {
    type: Number,
    default: 0,
    index: true,
  },
  "reports": [{
    "checked": {
      type: Boolean,
      default: false,
    },
    "type": {
      type: String
    },
    "content": {
      type: String
    },
    "contact": {
      type: String
    },
  }],
  "priority": {
    type: Number,
    default: 0,
    min: 0,
    max: 9,
    index: true,
  },
  "updatedAt": {
    type: Date,
    default: Date.now,
    index: true,
  },
  "createdAt": {
		type: Date,
		default: Date.now,
    index: true
	},
});

/**
 * Compound Indexes
 */
BusinessSchema.index({
  priority: -1,
  viewsCount: -1,
  ratingSum: -1,
});

BusinessSchema.index({
  geo: "2dsphere",
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
	 * List business in descending order of 'createdAt' timestamp.
	 * @param {number} skip - Number of business to be skipped.
	 * @param {number} limit - Limit number of business to be returned.
	 * @returns {Promise<Business[]>}
	 */
	getList({ skip = 0, limit = 20, filter = {}, orderBy, search, selectItems } = {}) {

    let conditions,
        order,
        searchCondition,
        eventCondition,
        statusCondition,
        reportCondition,
        listCondition,
        categoryCondition,
        tagCondition,
        areaCondition;

    if (filter.status) {
      statusCondition = {
        "status": {
  				"$in": filter.status
  			}
      };
    }

    if (!_.isEmpty(filter.category)) {
      categoryCondition = {
        "category": {
          "$in": filter.category
        }
      };
    }

    if (!_.isEmpty(filter.tag)) {
      tagCondition = {
        "tags": {
          "$all": [filter.tag]
        }
      };
    }

    if (filter.area) {
      areaCondition = {
        "address.area.code": filter.area
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

    if (filter.ids) {
      const ids = _.split(filter.ids, ',');

      listCondition = {
        '_id': {
          "$in": ids
        }
      };
    }

    switch (orderBy) {
      case 'new':
        order = {
          createdAt: -1
        };
        break;

      case 'rating':
        order = {
          ratingAverage: -1
        };
        break;

      default:
        order = {
          priority: -1,
          viewsCount: -1,
          ratingSum: -1,
        };
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

    if (statusCondition
      || searchCondition
      || eventCondition
      || reportCondition
      || listCondition
      || categoryCondition
      || areaCondition
      || tagCondition
     )
    {
      conditions = {
				"$and": [
          _.isEmpty(searchCondition) ? {} : searchCondition,
					_.isEmpty(statusCondition) ? {} : statusCondition,
          _.isEmpty(eventCondition) ? {} : eventCondition,
          _.isEmpty(reportCondition) ? {} : reportCondition,
          _.isEmpty(listCondition) ? {} : listCondition,
          _.isEmpty(categoryCondition) ? {} : categoryCondition,
          _.isEmpty(tagCondition) ? {} : tagCondition,
          _.isEmpty(areaCondition) ? {} : areaCondition,
        ]
			};
    }

		return this.find(_.isEmpty(conditions) ? {} : conditions, selectItems)
			.sort(order)
			.skip(+skip)
			.limit(+limit)
      .populate({
        path: 'chains',
        select: ['krName', 'cnName', 'enName', 'status'],
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
  getTotalCount({filter = {}, search} = {}) {
    let conditions,
        searchCondition,
        eventCondition,
        statusCondition,
        reportCondition,
        listCondition,
        categoryCondition,
        tagCondition,
        areaCondition;

    if (filter.status) {
      statusCondition = {
        "status": {
  				"$in": filter.status
  			}
      };
    }

    if (!_.isEmpty(filter.category)) {
      categoryCondition = {
        "category": {
          "$in": filter.category
        }
      };
    }

    if (!_.isEmpty(filter.tag)) {
      tagCondition = {
        "tags": {
          "$all": [filter.tag]
        }
      };
    }

    if (filter.area) {
      areaCondition = {
        "address.area.code": filter.area
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

    if (filter.ids) {
      const ids = _.split(filter.ids, ',');

      listCondition = {
        '_id': {
          "$in": ids
        }
      };
    }

    if (search) {
			const escapedString =  _.escapeRegExp(search);
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

    if (statusCondition
      || searchCondition
      || eventCondition
      || reportCondition
      || listCondition
      || categoryCondition
      || tagCondition
      || areaCondition
    ) {
      conditions = {
				"$and": [_.isEmpty(searchCondition) ? {} : searchCondition,
					_.isEmpty(statusCondition) ? {} : statusCondition,
          _.isEmpty(eventCondition) ? {} : eventCondition,
          _.isEmpty(reportCondition) ? {} : reportCondition,
          _.isEmpty(listCondition) ? {} : listCondition,
          _.isEmpty(categoryCondition) ? {} : categoryCondition,
          _.isEmpty(tagCondition) ? {} : tagCondition,
          _.isEmpty(areaCondition) ? {} : areaCondition,
        ]
			};
    }

    return this.count(_.isEmpty(conditions) ? {} : conditions).exec();
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
        path: 'chains',
        select: ['krName', 'cnName', 'enName'],
      })
      .exec();
  },

  /**
   * Get single business by English name
   * @param {Object} params - id, enName
   */
  getByName(name) {
    return this.findOne({ enName: name })
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
};

export default mongoose.model('Business', BusinessSchema);
