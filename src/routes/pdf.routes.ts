import { Router } from 'express'
// import { pdfController } from '../controllers/pdf.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js'
import { uploadPdf } from '../middlewares/upload.js'
import { extractPriceTableController } from '@/controllers/pricingTablesPdf/extractPriceTableController.js'

const router = Router()

router.use(authenticate, authorizeRoles('CLIENT'))

router.post('/extract', uploadPdf.single('file'), extractPriceTableController)

export default router
