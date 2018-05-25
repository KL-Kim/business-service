import Express from 'express';
import validate from 'express-validation';
import multer from 'multer';
import mkdirp from 'mkdirp';

import BusinessController from '../../controller/business.controller';
import paramValidation from '../../config/param-validation';

const router = Express.Router();
const businessController = new BusinessController();

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

/** GET /api/v1/business - Get list of business by category **/
router.get('/', validate(paramValidation.getBusiness), businessController.getBusiness);

/** GET /api/v1/business - Get single business **/
router.get('/single', validate(paramValidation.getSingleBusiness), businessController.getSingleBusiness);

/** DELETE /api/v1/business/images/:id - Delete business images **/
router.delete('/images/:id', validate(paramValidation.deleteBusinessImage), businessController.deleteBusinessImage);

/** POST /api/v1/business - Add new business **/
router.post('/', validate(paramValidation.addBusiness), businessController.addBusiness);

/** PUT /api/v1/business - Update business **/
router.put('/', validate(paramValidation.updateBusiness), businessController.updateBusiness);

/** DELETE /api/v1/business - Delete business **/
router.delete('/', validate(paramValidation.deleteBusiness), businessController.deleteBusiness);

/** POST /api/v1/business/images/:id - Add business thumbnail & images **/
router.post('/images/:id', upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "images", maxCount:9 }
]), businessController.addBusinessImages);

/** POST /api/v1/business/report/:id - Report business **/
router.post('/report/:id', validate(paramValidation.reportBusiness), businessController.reportBusiness);

/** GET /api/v1/business - Get business list by admin **/
router.get('/admin', validate(paramValidation.adminGetBusinessList), businessController.adminGetBusinessList);

export default router;
