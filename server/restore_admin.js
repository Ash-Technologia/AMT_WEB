const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User.model');

const restoreAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const clientEmail = process.env.ADMIN_EMAIL || 'aayushsinghavi@gmail.com'; // Fallback just in case

        const user = await User.findOneAndUpdate(
            { email: clientEmail },
            { role: 'admin' },
            { new: true }
        );

        if (user) {
            console.log(`✅ Successfully restored admin access for: ${user.email}`);
            console.log(`New Role: ${user.role}`);
        } else {
            console.log(`❌ User not found with email: ${clientEmail}`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

restoreAdmin();
