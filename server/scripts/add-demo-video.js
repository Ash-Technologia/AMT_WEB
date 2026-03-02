require('dotenv').config();
const mongoose = require('mongoose');

// A short, publicly embeddable YouTube video (YouTube official test video)
const DEMO_VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const col = mongoose.connection.collection('products');

        // Update all products that don't yet have a videoUrl
        const result = await col.updateMany(
            { $or: [{ videoUrl: { $exists: false } }, { videoUrl: '' }, { videoUrl: null }] },
            { $set: { videoUrl: DEMO_VIDEO_URL } }
        );

        console.log('Updated:', result.modifiedCount, 'products with demo YouTube URL');
        const total = await col.countDocuments({ videoUrl: DEMO_VIDEO_URL });
        console.log('Total products with demo video:', total);

        await mongoose.disconnect();
    })
    .catch(err => { console.error(err); process.exit(1); });
