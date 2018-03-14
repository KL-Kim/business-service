import Express from 'express';
import businessRoute from './business.route';
import pcaRoute from './pca.route';

const router = Express.Router();

router.use('/business', businessRoute);
router.use('/pca', pcaRoute);

export default router;
