import Image from '../models/Image.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc Upload image (accepts multipart file or base64)
// @route POST /api/images
// @access Public (or protected)
export const uploadImage = asyncHandler(async (req, res) => {
    let imageDoc;

    // If file is uploaded via multer (MemoryStorage)
    if (req.file) {
        imageDoc = await Image.create({
            name: req.file.originalname,
            data: req.file.buffer,
            contentType: req.file.mimetype,
            size: req.file.size
        });
    } else {
        // Fallback to base64 payload
        const { filename, data } = req.body || {};
        if (!filename || !data) {
            return res.status(400).json({ success: false, message: 'File or (filename and data) are required' });
        }

        const matches = String(data).match(/^data:(.+);base64,(.+)$/);
        let buffer, contentType;
        if (matches) {
            contentType = matches[1];
            buffer = Buffer.from(matches[2], 'base64');
        } else {
            contentType = 'image/jpeg'; // fallback
            buffer = Buffer.from(data, 'base64');
        }

        imageDoc = await Image.create({
            name: filename,
            data: buffer,
            contentType,
            size: buffer.length
        });
    }

    const publicUrl = `/api/images/${imageDoc._id}`;
    res.status(201).json({
        success: true,
        url: publicUrl,
        id: imageDoc._id
    });
});

// @desc Serve image from MongoDB
// @route GET /api/images/:id
export const getImage = asyncHandler(async (req, res) => {
    const { filename } = req.params;

    // Support both ID and filename (if filename is an ID)
    const image = await Image.findById(filename);

    if (!image) {
        return res.status(404).json({ success: false, message: 'Image not found' });
    }

    const buffer = image.data;

    res.set({
        "Content-Type": image.contentType,
        "Content-Length": buffer.length,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Cross-Origin-Resource-Policy": "cross-origin",
        "ETag": `"${filename}-${buffer.length}"`
    });

    return res.end(buffer);
});

export default { uploadImage, getImage };
