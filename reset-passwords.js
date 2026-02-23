require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const resetPasswords = async () => {
    try {
        await connectDB();
        console.log('🔄 Connected to database. Starting password reset...');

        const updates = [
            { email: 'admin@elms.com', password: process.env.DEMO_ADMIN_PASSWORD },
            { email: 'manager@elms.com', password: process.env.DEMO_MANAGER_PASSWORD },
            { email: 'mike@elms.com', password: process.env.DEMO_MANAGER_PASSWORD },
            { email: 'john@elms.com', password: process.env.DEMO_EMPLOYEE_PASSWORD },
            { email: 'anita@elms.com', password: process.env.DEMO_EMPLOYEE_PASSWORD },
            { email: 'raj@elms.com', password: process.env.DEMO_EMPLOYEE_PASSWORD }
        ];

        let updatedCount = 0;
        for (const update of updates) {
            if (!update.password) {
                console.warn(`⚠️ Skipping ${update.email}: Password not found in environment variables.`);
                continue;
            }

            const user = await User.findOne({ email: update.email });
            if (user) {
                user.password = update.password;
                await user.save();
                console.log(`✅ Updated password for: ${update.email}`);
                updatedCount++;
            } else {
                console.warn(`❓ User not found: ${update.email}`);
            }
        }

        console.log(`\n✨ Done! Updated ${updatedCount} users.`);
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Reset failed:', error);
        process.exit(1);
    }
};

resetPasswords();
