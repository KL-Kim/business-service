/**
 * Parameters Validation Config
 * @export {Object}
 * @version 0.0.1
 */
import Joi from 'joi';

export default {

	/** GET /api/v1/business **/
	"getBusinessList": {
		query: {
			limit: Joi.number(),
			skip: Joi.number(),
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
