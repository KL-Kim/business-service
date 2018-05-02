import Express from 'express';
import businessRoute from './business.route';
import categoryRoute from './category.route';
import tagRoute from './tag.route';
import pcaRoute from './pca.route';

const router = Express.Router();

router.use('/business', businessRoute);
router.use('/category', categoryRoute);
router.use('/tag', tagRoute);
router.use('/pca', pcaRoute);

export default router;
