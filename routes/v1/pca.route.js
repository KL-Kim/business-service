import Express from 'express';
import validate from 'express-validation';

import PcaController from '../../controller/pca.controller';
import paramValidation from '../../config/param-validation';

const router = Express.Router();
const pcaController = new PcaController();
validate.options({
  allowUnknownBody: false,
  allowUnknownHeaders: true,
  allowUnknownQuery: true,
  allowUnknownParams: true,
  allowUnknownCookies: true
});

/** GET /api/v1/pca/provinces - Get list of business **/
router.get('/provinces', pcaController.getProvincesList);

/** GET /api/v1/pca/cities - Get cities by province code **/
router.get('/cities/:code', validate(paramValidation.getCities), pcaController.getCitiesByCode);

/** GET /api/v1/pca/areas - Get areas by city code **/
router.get('/areas/:code', validate(paramValidation.getAreas), pcaController.getAreasByCode);

export default router;
