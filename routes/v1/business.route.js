import Express from 'express';
import validate from 'express-validation';

import BusinessController from '../../controller/business.controller';
import paramValidation from '../../config/param-validation';

const router = Express.Router();
const businessController = new BusinessController();

/** GET /api/v1/business - Get list of business **/
router.get('/', validate(paramValidation.getBusinessList), businessController.getBusinessList);

export default router;
