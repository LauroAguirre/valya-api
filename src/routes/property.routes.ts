import { Router } from 'express'
import { authenticate, authorizeRoles } from '../middlewares/auth.js'
import { uploadImages } from '../middlewares/upload.js'
import { validate } from '../middlewares/validate.js'
import { savePropertySchema } from '@/schemas/property.schema.js'
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
router.post('/:userId', validate(savePropertySchema), savePropertyController)
router.put('/:userId', validate(savePropertySchema), savePropertyController)
router.delete('/:propertyId', deletePropertyController)

router.post('/:id/units', savePropertyUnitController)
router.delete('/:id/units/:unitId', deletePropertyUnitController)

router.post('/:id/images', uploadImages.array('images', 20), uploadImageController)
router.delete('/:id/images/:imageId', deleteImageController)

export default router
