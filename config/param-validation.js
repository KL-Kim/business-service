/**
 * Parameters Validation Config
 * @export {Object}
 * @version 0.0.1
 */
import Joi from 'joi';

export default {

	/** GET /api/v1/business **/
	getBusinessList: {
		query: {
			limit: Joi.number(),
			skip: Joi.number(),
		}
	},
};
