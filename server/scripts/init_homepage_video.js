const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Settings = require('../models/Settings.model');

dotenv.config({ path: path.join(__dirname, '../.env') });

const initHomepageVideo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const key = 'homepageVideoUrl';
        const defaultValue = 'https://www.youtube.com/watch?v=FmXREvYq3kE';

        const existing = await Settings.findOne({ key });
        if (existing) {
            console.log('ℹ️ homepageVideoUrl already exists');
        } else {
            await Settings.create({ key, value: defaultValue });
            console.log('✨ homepageVideoUrl initialized with default value');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing homepage video setting:', error);
        process.exit(1);
    }
};

initHomepageVideo();
