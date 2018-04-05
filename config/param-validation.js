/**
 * Parameters Validation Config
 * @export {Object}
 * @version 0.0.1
 */
import Joi from 'joi';

export default {

	/** GET /api/v1/business - Get list of business **/
	"getBusinessList": {
		query: {
			search: Joi.string().trim().strip(),
		}
	},

	/** POST /api/v1/business - Add business **/
	"addBusiness": {
		"body":{
			"_id": Joi.string().hex().allow(''),
			"state": Joi.string().valid(['draft', 'published', 'deleted']),
			"enName": Joi.string().trim().required(),
			"cnName": Joi.string().trim().required(),
			"krName": Joi.string().trim().required(),
			"subDepartments": Joi.array().items(Joi.string().hex()).allow(''),
			"category": Joi.string().hex().required(),
			"tags": Joi.array().items(Joi.string().hex()).allow(''),
			"tel": Joi.string().trim().required(),
			"address": {
				province: {
					name: Joi.string().trim().required(),
					code: Joi.number().required(),
				},
				city:{
					name: Joi.string().trim().required(),
					code: Joi.number().required(),
				},
				area: {
					name: Joi.string().trim().required(),
					code: Joi.number().required(),
				},
				street: Joi.string().trim().required(),
			},
			"geo": {
				lat: Joi.number().required(),
				long: Joi.number().required(),
			},
			"rating": {
				average: Joi.number().required(),
				count: Joi.number().required(),
			},
			"description": Joi.string().trim().allow(''),
			"priceRange": Joi.string().trim().allow(''),
			"status": Joi.string().valid(['normal', 'dissolute']),
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
			"event": Joi.string().trim().allow(''),
			"menu": Joi.array().items(Joi.object().keys({
				name: Joi.string().trim(),
				price: Joi.number(),
				hot: Joi.boolean(),
				new: Joi.boolean(),
			})),
			"thumbnailUri": {
				default: Joi.string().uri().allow(''),
				hd: Joi.string().uri().allow(''),
			},
			"imagesUri": Joi.array().items(Joi.string().uri()).allow(''),
		}
	},

	/** GET /api/v1/business/category - Get business category list **/
	"getBusinessCategory": {
		"query": {
			search: Joi.string().trim().strip(),
		}
	},

	/** POST /api/v1/business/cateogory - Add business cateogory**/
	"addBusinessCategory": {
		"body": {
			"code": Joi.number().required(),
			"enName": Joi.string().trim().required(),
			"cnName": Joi.string().trim().required(),
			"krName": Joi.string().trim().required(),
			"parent": Joi.number().allow(''),
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
			"parent": Joi.number().allow(''),
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
			limit: Joi.number(),
			skip: Joi.number(),
		}
	},

	/** POST /api/v1/business/tag - Add business tag**/
	"addBusinessTag": {
		"body": {
			"code": Joi.number().required(),
			"enName": Joi.string().trim().required(),
			"cnName": Joi.string().trim().required(),
			"krName": Joi.string().trim().required(),
		}
	},

	/** PUT /api/v1/business/tag - Update business tag**/
	"updateBusinessTag": {
		"body": {
			"_id": Joi.string().hex().required(),
			"code": Joi.number().required(),
			"enName": Joi.string().trim().required(),
			"cnName": Joi.string().trim().required(),
			"krName": Joi.string().trim().required(),
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
