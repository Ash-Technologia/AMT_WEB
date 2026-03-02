require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const col = mongoose.connection.collection('products');
        // Set isVisible=true on any doc missing the field
        const result = await col.updateMany(
            { isVisible: { $exists: false } },
            { $set: { isVisible: true } }
        );
        console.log('Migration done. Updated:', result.modifiedCount, 'products');
        // Also log total visible
        const total = await col.countDocuments({ isVisible: { $ne: false } });
        console.log('Total visible products now:', total);
        await mongoose.disconnect();
    })
    .catch(err => { console.error(err); process.exit(1); });
