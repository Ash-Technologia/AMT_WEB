// Adds 2–3 extra Unsplash images to each product,
// so the ProductCard carousel has multiple images to show.
require('dotenv').config();
const mongoose = require('mongoose');

// Extra Ayurveda product image pool
const EXTRA_IMAGES = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600',
    'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600',
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',
    'https://images.unsplash.com/photo-1585435417610-3ca8a7e3e4d8?w=600',
    'https://images.unsplash.com/photo-1611072337226-1e9a12e49e7a?w=600',
];

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const col = mongoose.connection.collection('products');
        const products = await col.find({}).toArray();
        console.log(`Found ${products.length} products`);

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const existingImages = product.images || [];

            if (existingImages.length >= 3) {
                console.log(`${product.name}: already has ${existingImages.length} images, skipping`);
                continue;
            }

            // Pick 2 random extra images (different from existing)
            const shuffled = [...EXTRA_IMAGES].sort(() => Math.random() - 0.5);
            const extras = shuffled.slice(0, 3 - existingImages.length).map(url => ({
                url,
                public_id: `demo_extra_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            }));

            const newImages = [...existingImages, ...extras];
            await col.updateOne({ _id: product._id }, { $set: { images: newImages } });
            console.log(`${product.name}: updated to ${newImages.length} images`);
        }

        console.log('Done.');
        await mongoose.disconnect();
    })
    .catch(err => { console.error(err); process.exit(1); });
