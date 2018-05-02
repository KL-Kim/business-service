import Express from 'express';
import validate from 'express-validation';

import CategoryController from '../../controller/category.controller';
import paramValidation from '../../config/param-validation';

const router = Express.Router();
const categoryController = new CategoryController();

validate.options({
  allowUnknownBody: false,
  allowUnknownHeaders: true,
  allowUnknownQuery: true,
  allowUnknownParams: true,
  allowUnknownCookies: true
});

/** GET /api/v1/business/category - Get business category list **/
router.get('/', validate(paramValidation.getCategoriesList), categoryController.getCategoriesList);

/** POST /api/v1/business/category - Add business category **/
router.post('/', validate(paramValidation.addBusinessCategory), categoryController.addBusinessCategory);

/** PUT /api/v1/business/category - Update business category **/
router.put('/', validate(paramValidation.updateBusinessCategory), categoryController.updateBusinessCategory);

/** DELETE /api/v1/business/category - Delete business category **/
router.delete('/', validate(paramValidation.deleteBusinessCategory), categoryController.deleteBusinessCategory);

export default router;
