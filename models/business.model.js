import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';

import APIError from '../helper/api-error';

const BusinessSchema = new mongoose.Schema({
  "cnName": {
    type: String,
    required: true,
  },
  "krName": {
    type: String,
    required: true,
  },
  "state": {
    type: String,
    required: true,
    default: "draft",
    enum: ['draft', 'published', 'deleted']
  },
  "subDepartments": [{
    id: {
      type: String
    },
    cnName: {
      type: String
    },
    krName: {
      type: String
    },
  }],
  "category": {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
    },
  },
  "tags": [{
    id: {
      type: String
    },
    name: {
      type: String
    },
  }],
  "tel": [{
    type: String,
    required: true,
  }],
  "address": {
		province: {
			name: {
				type: String,
        required: true,
			},
			code: {
				type: Number,
        required: true,
			}
		},
		city: {
			name: {
				type: String,
        required: true,
			},
			code: {
				type: Number,
        required: true,
			}
		},
		area: {
			name: {
				type: String,
        required: true,
			},
			code: {
				type: Number,
        required: true,
			}
		},
		street: {
			type: String,
		},
	},
  "geo": {
    lat: {
      type: String,
      required: true,
    },
    long: {
      type: String,
      required: true,
    }
  },
  "rating": {
    value: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
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
  "viewCount": {
    type: Number,
    required: true,
    default: 0,
  },
  "favoredCount": {
    type: Number,
    required: true,
    default: 0,
  },
  "openingHoursSpec": {
    mon: {
      open: {
        type: String
      },
      close: {
        type: String
      }
    },
    tue: {
      open: {
        type: String
      },
      close: {
        type: String
      }
    },
    wed: {
      open: {
        type: String
      },
      close: {
        type: String
      }
    },
    thu: {
      open: {
        type: String
      },
      close: {
        type: String
      }
    },
    fri: {
      open: {
        type: String
      },
      close: {
        type: String
      }
    },
    sat: {
      open: {
        type: String
      },
      close: {
        type: String
      }
    },
    sun: {
      open: {
        type: String
      },
      close: {
        type: String
      }
    }
  },
  "language": [{
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
  "event": [{
    type: String
  }],
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
  "thumbnailUri": [{
    default: {
      type: String
    },
    hd: {
      type: String
    },
  }],
  "imagesUri": [{
    type: String
  }],
  "reviewsCount": {
    type: Number,
    default: 0
  },
  "reviewsList": [{
    type: String
  }],
  "storiesCount": {
    type: Number,
    default: 0,
  },
  "storiesList": [{
    type: String
  }]
});

BusinessSchema.index({cnName: 'text', krName: 'text', description: 'text'});

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
