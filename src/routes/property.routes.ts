import { Router } from 'express'
// import { propertyController } from '../controllers/property.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js'
import { uploadImages } from '../middlewares/upload.js'
import { listPropertiesController } from '@/controllers/properties/listPropertiesController.js'
import { getPropertyByIdController } from '@/controllers/properties/getPropertyByIdController.js'
import { savePropertyController } from '@/controllers/properties/savePropertyController.js'
import { deletePropertyController } from '@/controllers/properties/deletePropertyController.js'
import { savePropertyUnitController } from '@/controllers/properties/savePropertyUnitController.js'
import { deletePropertyUnitController } from '@/controllers/properties/deletePropertyUnitController.js'
import { uploadImageController } from '@/controllers/properties/uploadImageController.js'
import { deleteImageController } from '@/controllers/properties/deleteImageController.js'

const router = Router()

router.use(authenticate, authorizeRoles('CLIENT'))

router.get('/', listPropertiesController)
router.get('/:id', getPropertyByIdController)
router.post('/:clientId', savePropertyController)
// router.put('/:id', propertyController.update);
router.delete('/:propertyId', deletePropertyController)

router.post('/:id/units', savePropertyUnitController)
// router.post('/:id/units/bulk', propertyController.bulkCreateUnits);
// router.put('/:id/units/:unitId', propertyController.updateUnit);
router.delete('/:id/units/:unitId', deletePropertyUnitController)

router.post(
  '/:id/images',
  uploadImages.array('images', 20),
  uploadImageController
)
// router.put('/:id/images/:imageId', propertyController.updateImage);
router.delete('/:id/images/:imageId', deleteImageController)

// router.put('/:id/ad-links', propertyController.setAdLinks);

export default router
