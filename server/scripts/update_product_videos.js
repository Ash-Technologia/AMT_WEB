const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('../models/Product.model');

dotenv.config({ path: path.join(__dirname, '../.env') });

const dummyVideos = [
    'https://www.youtube.com/watch?v=FmXREvYq3kE', // Ayurvedic Principles
    'https://www.youtube.com/watch?v=_f88vS52X3I', // Therapy Demo
    'https://www.youtube.com/watch?v=sI5FsqSNo_I', // Wellness Guide
    'https://www.youtube.com/watch?v=6p_yaNFSYao', // Holistic Living
];

const updateProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const products = await Product.find({});
        console.log(`🔍 Found ${products.length} products`);

        for (let i = 0; i < products.length; i++) {
            const videoUrl = dummyVideos[i % dummyVideos.length];
            await Product.findByIdAndUpdate(products[i]._id, { videoUrl });
        }

        console.log('✨ All products updated with dummy video URLs');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating products:', error);
        process.exit(1);
    }
};

updateProducts();
