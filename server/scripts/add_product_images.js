const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product.model.js');

dotenv.config();

const sampleImages = [
    {
        url: 'https://images.unsplash.com/photo-1551076805-e1869043e560?auto=format&fit=crop&q=80&w=800',
        publicId: 'sample/medical-device-1'
    },
    {
        url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
        publicId: 'sample/medical-device-2'
    },
    {
        url: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&q=80&w=800',
        publicId: 'sample/medical-device-3'
    },
    {
        url: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=80&w=800',
        publicId: 'sample/medical-device-4'
    }
];

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({});
        console.log(`Found ${products.length} products to check.`);

        let updatedCount = 0;

        for (const product of products) {
            // Check if product needs more images (has 1 or 0)
            if (!product.images || product.images.length <= 1) {
                // Keep existing images (usually 1), and push sample images
                const existingImages = product.images || [];

                // Shuffle sample images to get a random assortment
                const shuffledSamples = [...sampleImages].sort(() => 0.5 - Math.random());

                // We want to make sure the product has at least 3-4 images
                const imagesToAdd = shuffledSamples.slice(0, 3);

                product.images = [...existingImages, ...imagesToAdd];

                await product.save();
                console.log(`Updated product: ${product.name} with ${imagesToAdd.length} new images`);
                updatedCount++;
            }
        }

        console.log(`Completed database update. ${updatedCount} products updated.`);

    } catch (error) {
        console.error('Error in script:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
}

run();
