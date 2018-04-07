import Express from 'express';
import validate from 'express-validation';

import BusinessController from '../../controller/business.controller';
import CategoryController from '../../controller/category.controller';
import TagController from '../../controller/tag.controller';
import paramValidation from '../../config/param-validation';

const router = Express.Router();
const businessController = new BusinessController();
const categoryController = new CategoryController();
const tagController = new TagController();
validate.options({
  allowUnknownBody: false,
  allowUnknownHeaders: true,
  allowUnknownQuery: true,
  allowUnknownParams: true,
  allowUnknownCookies: true
});

/** GET /api/v1/business - Get list of business **/
router.get('/', validate(paramValidation.getBusinessList), businessController.getBusinessList);

/** GET /api/v1/business/:id - Get single business **/
router.get('/single/:id', validate(paramValidation.getSingleBusiness), businessController.getSingleBusiness);

/** POST /api/v1/business - Add business **/
router.post('/', validate(paramValidation.addBusiness), businessController.addBusiness);

/** PUT /api/v1/business - Update business **/
router.put('/', validate(paramValidation.updateBusiness), businessController.updateBusiness);

/** DELETE /api/v1/business - Delete business **/
router.delete('/', validate(paramValidation.deleteBusiness), businessController.deleteBusiness);

/** GET /api/v1/business/category - Get business category list **/
router.get('/category', validate(paramValidation.getBusinessCategory), categoryController.getCategoriesList);

/** POST /api/v1/business/category - Add business category **/
router.post('/category', validate(paramValidation.addBusinessCategory), categoryController.addBusinessCategory);

/** PUT /api/v1/business/category - Update business category **/
router.put('/category', validate(paramValidation.updateBusinessCategory), categoryController.updateBusinessCategory);

/** DELETE /api/v1/business/category - Delete business category **/
router.delete('/category', validate(paramValidation.deleteBusinessCategory), categoryController.deleteBusinessCategory);

/** GET /api/v1/business/tag - Get business tag list **/
router.get('/tag', validate(paramValidation.getBusinessTags), tagController.getTagsList);

/** POST /api/v1/business/tag - Add business tag **/
router.post('/tag', validate(paramValidation.addBusinessTag), tagController.addBusinessTag);

/** PUT /api/v1/business/tag - Update business tag **/
router.put('/tag', validate(paramValidation.updateBusinessTag), tagController.updateBusinessTag);

/** DELETE /api/v1/business/tag - Delete business tag **/
router.delete('/tag', validate(paramValidation.deleteBusinessTag), tagController.deleteBusinessTag);

export default router;
