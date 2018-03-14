import Express from 'express';
import validate from 'express-validation';

import PcaController from '../../controller/pca.controller';
import paramValidation from '../../config/param-validation';

const router = Express.Router();
const pcaController = new PcaController();

/** GET /api/v1/business - Get list of business **/
router.get('/provinces', pcaController.getProvinces);

export default router;
