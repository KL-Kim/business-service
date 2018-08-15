/**
 * Parameters Validation Config
 * @export {Object}
 * @version 0.0.1
 */
import Joi from 'joi';

export default {

	/** GET /api/v1/business - Get list of business **/
	"getBusinessList": {
		"query": {
			skip: Joi.number(),
			limit: Joi.number(),
			category: Joi.string().trim().allow(''),
			search: Joi.string().trim().strip().allow(''),
			event: Joi.number(),
			area: Joi.number().allow(''),
			category: Joi.string().trim(),
			tag: Joi.string().trim(),
			ids: Joi.string(),
			orderBy: Joi.string().valid(['recommend', 'rating', 'new', 'useful', '']),
		}
	},

	/** GET /api/v1/business/single/:slug - Get single business **/
	"getSingleBusiness": {
		"params": {
			slug: Joi.string().trim().required(),
		}
	},

	// Get business list by admin
	"getBusinessListByAdmin": {
		"query": {
			skip: Joi.number(),
			limit: Joi.number(),
			search: Joi.string().trim().strip().allow(''),
			event: Joi.number(),
			status: Joi.string().valid(['DRAFT', 'PUBLISHED', 'TRASH']),
			reports: Joi.number(),
			orderBy: Joi.string().valid(['recommend', 'rating', 'new', 'useful', '']),
		}
	},

	/** POST /api/v1/business - Add business **/
	"addBusiness": {
		"body":{
			"status": Joi.string().valid(['DRAFT', 'PUBLISHED', 'TRASH']),
			"enName": Joi.string().trim().required(),
			"cnName": Joi.string().trim().required(),
			"krName": Joi.string().trim().required(),
			"chains": Joi.array().items(Joi.string().hex()).allow(''),
			"category": Joi.string().hex().required(),
			"tags": Joi.array().items(Joi.string().hex()).allow(''),
			"tel": Joi.string().trim().required(),
			"address": {
				province: {
					name: Joi.string().trim().allow(''),
					code: Joi.number().allow(''),
				},
				city:{
					name: Joi.string().trim().allow(''),
					code: Joi.number().allow(''),
				},
				area: {
					name: Joi.string().trim().allow(''),
					code: Joi.number().allow(''),
				},
				street: Joi.string().trim().allow(''),
			},
			"geo": {
				type: Joi.string().trim().allow(''),
				coordinates: Joi.array().items(Joi.number()).allow(null),
			},
			"description": Joi.string().trim().allow(''),
			"priceRange": Joi.string().trim().allow(''),
			"businessState": Joi.string().valid(['NORMAL', 'DISSOLUTE']),
			"openningHoursSpec": {
				mon: Joi.string().trim().allow(''),
				tue: Joi.string().trim().allow(''),
				wed: Joi.string().trim().allow(''),
				thu: Joi.string().trim().allow(''),
				fri: Joi.string().trim().allow(''),
				sat: Joi.string().trim().allow(''),
				sun: Joi.string().trim().allow(''),
			},
			"supportedLanguage": Joi.array().items(Joi.string().trim()).allow(''),
			"rest": Joi.string().trim().allow(''),
			"payment": Joi.array().items(Joi.string().trim()).allow([]),
			"delivery": Joi.string().trim().allow(''),
			"event": Joi.string().trim().allow('', null),
			"menu": Joi.array().items(Joi.object().keys({
				name: Joi.string().trim(),
				price: Joi.number(),
				hot: Joi.boolean(),
				new: Joi.boolean(),
			})).allow([]),
			"reports": Joi.array().items(Joi.object().keys({
				checked: Joi.boolean(),
				content: Joi.string().trim(),
			})),
			"thumbnailUri": {
				default: Joi.string().uri().allow(''),
				hd: Joi.string().uri().allow(''),
			},
			"imagesUri": Joi.array().items(Joi.string().uri()).allow(''),
			"priority": Joi.number(),
		}
	},

	/** PUT /api/v1/business - Update business **/
	"updateBusiness": {
		"params": {
			"id": Joi.string().hex().required(),
		},
		"body":{
			"status": Joi.string().valid(['DRAFT', 'PUBLISHED', 'TRASH']),
			"enName": Joi.string().trim(),
			"cnName": Joi.string().trim(),
			"krName": Joi.string().trim(),
			"chains": Joi.array().items(Joi.string().hex()).allow(''),
			"category": Joi.string().hex(),
			"tags": Joi.array().items(Joi.string().hex()).allow(''),
			"tel": Joi.string().trim(),
			"address": {
				province: {
					name: Joi.string().trim().allow(''),
					code: Joi.number().allow(''),
				},
				city:{
					name: Joi.string().trim().allow(''),
					code: Joi.number().allow(''),
				},
				area: {
					name: Joi.string().trim().allow(''),
					code: Joi.number().allow(''),
				},
				street: Joi.string().trim().allow(''),
			},
			"geo": {
				type: Joi.string().trim().allow(''),
				coordinates: Joi.array().items(Joi.number()).allow(null),
			},
			"description": Joi.string().trim().allow(''),
			"priceRange": Joi.string().trim().allow(''),
			"businessState": Joi.string().valid(['NORMAL', 'DISSOLUTE']),
			"openningHoursSpec": {
				mon: Joi.string().trim().allow(''),
				tue: Joi.string().trim().allow(''),
				wed: Joi.string().trim().allow(''),
				thu: Joi.string().trim().allow(''),
				fri: Joi.string().trim().allow(''),
				sat: Joi.string().trim().allow(''),
				sun: Joi.string().trim().allow(''),
			},
			"supportedLanguage": Joi.array().items(Joi.string().trim()).allow(''),
			"rest": Joi.string().trim().allow(''),
			"payment": Joi.array().items(Joi.string().trim()).allow(''),
			"delivery": Joi.string().trim().allow(''),
			"event": Joi.string().trim().allow('', null),
			"menu": Joi.array().items(Joi.object().keys({
				_id: Joi.string().hex(),
				name: Joi.string().trim(),
				price: Joi.number(),
				hot: Joi.boolean(),
				new: Joi.boolean(),
			})),
			"reports": Joi.array().items(Joi.object().keys({
				_id: Joi.string().hex(),
				"checked": Joi.boolean(),
				"content": Joi.string().trim(),
			})),
			"thumbnailUri": {
				default: Joi.string().uri().allow(''),
				hd: Joi.string().uri().allow(''),
			},
			"imagesUri": Joi.array().items(Joi.string().uri()).allow(''),
			"priority": Joi.number(),
		}
	},

	/** DELETE /api/v1/business - Delete business **/
	"deleteBusiness": {
		"params": {
			"id": Joi.string().hex().required(),
		},
	},

	/** DELETE /api/v1/business/images/:id - Delete business images **/
	"deleteBusinessImage": {
		"params": {
			id: Joi.string().hex().required(),
		},
		"body": {
			image: Joi.string().trim().required(),
		},
	},

	/** POST /api/v1/business/report/:id - Report business **/
	"reportBusiness": {
		"params": {
			id: Joi.string().hex().required(),
		},
		"body": {
			type: Joi.string().trim(),
			content: Joi.string().trim().required(),
			contact: Joi.string().trim().allow(''),
		},
	},

	/** GET /api/v1/business/category - Get business category list **/
	"getCategoriesList": {
		"query": {
			skip: Joi.number(),
			limit: Joi.number(),
			search: Joi.string().trim().strip(),
			orderBy: Joi.string().valid(['priority', '']),
		}
	},

	/** POST /api/v1/business/category - Add business category**/
	"addBusinessCategory": {
		"body": {
			"code": Joi.number().required(),
			"enName": Joi.string().trim().required(),
			"cnName": Joi.string().trim().required(),
			"krName": Joi.string().trim().required(),
			"priority": Joi.number().min(0).max(9),
			"thumbnailUrl": Joi.string().trim(),
		}
	},

	/** PUT /api/v1/business/category - Update business category **/
	"updateBusinessCategory": {
		"body": {
			"_id": Joi.string().hex().required(),
			"code": Joi.number().required(),
			"enName": Joi.string().trim().required(),
			"cnName": Joi.string().trim().required(),
			"krName": Joi.string().trim().required(),
			"priority": Joi.number().min(0).max(9),
			"thumbnailUrl": Joi.string().trim(),
		}
	},

	/** DELETE /api/v1/business/category - Delete business category **/
	"deleteBusinessCategory": {
		"body": {
			"_id": Joi.string().hex().required(),
		}
	},

	/** GET /api/v1/business/tag - Get business tags list **/
	"getBusinessTags": {
		query: {
			skip: Joi.number(),
			limit: Joi.number(),
			search: Joi.string().trim().strip(),
			orderBy: Joi.string().valid(['priority', '']),
		}
	},

	/** POST /api/v1/business/tag - Add business tag **/
	"addBusinessTag": {
		"body": {
			"code": Joi.number().required(),
			"enName": Joi.string().trim().required(),
			"cnName": Joi.string().trim().required(),
			"krName": Joi.string().trim().required(),
			"priority": Joi.number().min(0).max(9),
		}
	},

	/** PUT /api/v1/business/tag - Update business tag **/
	"updateBusinessTag": {
		"body": {
			"_id": Joi.string().hex().required(),
			"code": Joi.number().required(),
			"enName": Joi.string().trim().required(),
			"cnName": Joi.string().trim().required(),
			"krName": Joi.string().trim().required(),
			"priority": Joi.number().min(0).max(9),
			
		}
	},

	/** DELETE /api/v1/business/tag - Delete business tag**/
	"deleteBusinessTag": {
		"body": {
			"_id": Joi.string().hex().required(),
		}
	},

	/** GET /api/v1/pca/cities **/
	"getCities": {
		params: {
			code: Joi.number().required(),
		},
	},

	/** GET /api/v1/pca/areas **/
	"getAreas": {
		params: {
			code: Joi.number().required(),
		},
	},
};
