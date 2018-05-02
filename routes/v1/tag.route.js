import Express from 'express';
import validate from 'express-validation';

import TagController from '../../controller/tag.controller';
import paramValidation from '../../config/param-validation';

const router = Express.Router();
const tagController = new TagController();

validate.options({
  allowUnknownBody: false,
  allowUnknownHeaders: true,
  allowUnknownQuery: true,
  allowUnknownParams: true,
  allowUnknownCookies: true
});

/** GET /api/v1/business/tag - Get business tag list **/
router.get('/', validate(paramValidation.getBusinessTags), tagController.getTagsList);

/** POST /api/v1/business/tag - Add business tag **/
router.post('/', validate(paramValidation.addBusinessTag), tagController.addBusinessTag);

/** PUT /api/v1/business/tag - Update business tag **/
router.put('/', validate(paramValidation.updateBusinessTag), tagController.updateBusinessTag);

/** DELETE /api/v1/business/tag - Delete business tag **/
router.delete('/', validate(paramValidation.deleteBusinessTag), tagController.deleteBusinessTag);

export default router;
