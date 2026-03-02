const mongoose = require('mongoose');
const Product = require('../models/Product.model');
const Settings = require('../models/Settings.model');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/amt_modern';

const REAL_URLS = [
    'https://www.youtube.com/watch?v=fXW96EAn6Uo', // The Earthing Movie
    'https://www.youtube.com/watch?v=FmXREvYq3kE', // Grounding Therapy
    'https://www.youtube.com/watch?v=vV3Xv8p_B6Y', // How Earthing Works
    'https://www.youtube.com/watch?v=Xw80G5KzR58', // Physiotherapy
    'https://www.youtube.com/watch?v=mjG9-cM9u6k', // Sound Therapy
    'https://www.youtube.com/watch?v=YpS99vS_qEM', // Meditation
    'https://www.youtube.com/watch?v=8mG_7m_J_7Y'  // Bioresonance
];

async function updateRealUrls() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // 1. Update Homepage Video
        await Settings.findOneAndUpdate(
            { key: 'homepageVideoUrl' },
            { value: REAL_URLS[0] },
            { upsert: true }
        );
        console.log('Updated Homepage Video URL');

        // 2. Update Product Videos
        const products = await Product.find({});
        for (let i = 0; i < products.length; i++) {
            const url = REAL_URLS[(i + 1) % REAL_URLS.length];
            await Product.findByIdAndUpdate(products[i]._id, { videoUrl: url });
            console.log(`Updated product ${products[i].name} with video: ${url}`);
        }

        console.log('Successfully updated all URLs with real testing data');
        process.exit(0);
    } catch (err) {
        console.error('Error updating URLs:', err);
        process.exit(1);
    }
}

updateRealUrls();
