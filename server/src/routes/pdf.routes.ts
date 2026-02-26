import { Router } from 'express';
import { pdfController } from '../controllers/pdf.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import { uploadPdf } from '../middlewares/upload.js';

const router = Router();

router.use(authenticate, authorizeRoles('CLIENT'));

// POST /api/pdf/extract - Upload PDF e extrair tabela de precos
router.post('/extract', uploadPdf.single('file'), pdfController.extractPriceTable);

export default router;
