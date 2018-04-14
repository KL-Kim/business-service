import Express from 'express';
import validate from 'express-validation';
import multer from 'multer';
import mkdirp from 'mkdirp';

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

const storage = multer.diskStorage({
  "destination": (req, file, cb) => {
    const dir = './public/images/' + req.params.id;
    mkdirp(dir, err => cb(err, dir))
  },
  "filename": (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      cb(null, 'thumbnail.hd.' + file.originalname.split('.').pop());
    } else {
      cb(null, file.originalname);
    }
  }
});

const upload = multer({
  "storage": storage,
  "fileFilter": (req, file, cb) => {
    if (file.mimetype === 'image/jpeg'
      || file.mimetype === 'image/png'
      || file.mimetype === 'image/gif'
      || file.mimetype === 'image/webp') {
        cb(null, true);
    } else {
      cb(new Error("Image - Not supported format"));
    }
  }
});

/** GET /api/v1/business - Get list of business **/
router.get('/', validate(paramValidation.getBusinessList), businessController.getBusinessList);

/** GET /api/v1/business - Get single business **/
router.get('/single', validate(paramValidation.getSingleBusiness), businessController.getSingleBusiness);

/** POST /api/v1/business/images/:id - Add business thumbnail & images **/
router.post('/images/:id', upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "images", maxCount:9 }
]), businessController.addBusinessImages);

/** DELETE /api/v1/business/images/:id - Delete business images **/
router.delete('/images/:id', validate(paramValidation.deleteBusinessImage), businessController.deleteBusinessImage);

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
