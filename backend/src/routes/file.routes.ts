import { Router } from 'express';
import { uploadFiles, getFiles } from '../controllers/file.controller';

const router = Router();

router.post('/upload', uploadFiles);
router.get('/files', getFiles);

export default router;