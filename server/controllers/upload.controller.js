const cloudinary = require('../config/cloudinary');

// ─── UPLOAD SINGLE IMAGE ──────────────────────────────────────────────────────
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
        res.json({
            success: true,
            url: req.file.path,
            publicId: req.file.filename,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── UPLOAD MULTIPLE IMAGES ───────────────────────────────────────────────────
exports.uploadImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0)
            return res.status(400).json({ success: false, message: 'No files uploaded.' });

        const images = req.files.map(file => ({
            url: file.path,
            publicId: file.filename,
        }));

        res.json({ success: true, images });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── DELETE IMAGE ─────────────────────────────────────────────────────────────
exports.deleteImage = async (req, res) => {
    try {
        const { publicId } = req.body;
        await cloudinary.uploader.destroy(publicId);
        res.json({ success: true, message: 'Image deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
