import express from 'express';
import { uploadImage, getImage } from '../controllers/imageController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/', upload.single('image'), uploadImage);
router.get('/:filename', getImage);

export default router;
