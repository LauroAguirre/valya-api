import { Router } from 'express';
import { propertyController } from '../controllers/property.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import { uploadImages } from '../middlewares/upload.js';

const router = Router();

router.use(authenticate, authorizeRoles('CLIENT'));

// CRUD Imoveis
router.get('/', propertyController.list);
router.get('/:id', propertyController.getById);
router.post('/', propertyController.create);
router.put('/:id', propertyController.update);
router.delete('/:id', propertyController.delete);

// Unidades
router.post('/:id/units', propertyController.createUnit);
router.post('/:id/units/bulk', propertyController.bulkCreateUnits);
router.put('/:id/units/:unitId', propertyController.updateUnit);
router.delete('/:id/units/:unitId', propertyController.deleteUnit);

// Imagens (upload multiplo)
router.post('/:id/images', uploadImages.array('images', 20), propertyController.addImages);
router.put('/:id/images/:imageId', propertyController.updateImage);
router.delete('/:id/images/:imageId', propertyController.deleteImage);

// Ad Links
router.put('/:id/ad-links', propertyController.setAdLinks);

export default router;
