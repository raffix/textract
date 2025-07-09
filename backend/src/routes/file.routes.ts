import { Router } from 'express';
import { uploadFiles, getAllFiles, getFiles, deleteFile, getFile } from '../controllers/file.controller';

const router = Router();

router.get('/', getAllFiles);
router.get('/:search', getFiles);
router.get('/:id/content', getFile);
router.post('/upload', uploadFiles);
router.delete('/:id', deleteFile);

export default router;