require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const testLogin = async () => {
    try {
        await connectDB();
        console.log('🔄 Connected to database for testing...');

        const testUsers = [
            { email: 'admin@elms.com', password: process.env.DEMO_ADMIN_PASSWORD },
            { email: 'manager@elms.com', password: process.env.DEMO_MANAGER_PASSWORD },
            { email: 'john@elms.com', password: process.env.DEMO_EMPLOYEE_PASSWORD }
        ];

        for (const test of testUsers) {
            console.log(`\n🔍 Testing login for: ${test.email}`);
            const user = await User.findOne({ email: test.email }).select('+password');

            if (!user) {
                console.error(`❌ User not found in database: ${test.email}`);
                continue;
            }

            console.log(`✅ User found. Hashed password in DB: ${user.password.substring(0, 10)}...`);

            const isMatch = await user.matchPassword(test.password);
            if (isMatch) {
                console.log(`✨ SUCCESS: Password matches for ${test.email}`);
            } else {
                console.error(`❌ FAILURE: Password does NOT match for ${test.email}`);
                console.log(`   Expected password from env: ${test.password}`);
            }
        }

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
};

testLogin();
