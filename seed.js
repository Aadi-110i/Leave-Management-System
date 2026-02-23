require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Leave = require('./models/Leave');
const connectDB = require('./config/db');

const seed = async () => {
    try {
        await connectDB();

        console.log('🌱 Seeding database...');

        // Clear existing data
        await User.deleteMany({});
        await Leave.deleteMany({});
        console.log('🗑️ Existing data cleared');

        // Create users
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@elms.com',
            password: 'admin123',
            role: 'admin',
            department: 'IT',
        });

        const manager = await User.create({
            name: 'Sarah Johnson',
            email: 'manager@elms.com',
            password: 'manager123',
            role: 'manager',
            department: 'Engineering',
        });

        const manager2 = await User.create({
            name: 'Mike Williams',
            email: 'mike@elms.com',
            password: 'manager123',
            role: 'manager',
            department: 'HR',
        });

        const emp1 = await User.create({
            name: 'John Doe',
            email: 'john@elms.com',
            password: 'emp123',
            role: 'employee',
            department: 'Engineering',
        });

        const emp2 = await User.create({
            name: 'Anita Singh',
            email: 'anita@elms.com',
            password: 'emp123',
            role: 'employee',
            department: 'Marketing',
        });

        const emp3 = await User.create({
            name: 'Raj Kumar',
            email: 'raj@elms.com',
            password: 'emp123',
            role: 'employee',
            department: 'Finance',
        });

        // Create sample leaves
        await Leave.create([
            {
                employee: emp1._id,
                leaveType: 'Sick Leave',
                fromDate: new Date('2024-06-23'),
                toDate: new Date('2024-06-25'),
                reason: 'Medical appointment and recovery',
                status: 'Pending',
            },
            {
                employee: emp1._id,
                leaveType: 'Annual Leave',
                fromDate: new Date('2024-07-01'),
                toDate: new Date('2024-07-05'),
                reason: 'Family vacation',
                status: 'Approved',
                reviewedBy: manager._id,
                reviewNote: 'Approved. Enjoy!',
            },
            {
                employee: emp2._id,
                leaveType: 'Casual Leave',
                fromDate: new Date('2024-06-21'),
                toDate: new Date('2024-06-22'),
                reason: 'Personal work',
                status: 'Approved',
                reviewedBy: manager._id,
            },
            {
                employee: emp2._id,
                leaveType: 'Sick Leave',
                fromDate: new Date('2024-06-28'),
                toDate: new Date('2024-06-28'),
                reason: 'Fever',
                status: 'Pending',
            },
            {
                employee: emp3._id,
                leaveType: 'Annual Leave',
                fromDate: new Date('2024-07-10'),
                toDate: new Date('2024-07-15'),
                reason: 'Planned holiday trip',
                status: 'Rejected',
                reviewedBy: manager._id,
                reviewNote: 'Project delivery period. Please reschedule.',
            },
            {
                employee: emp3._id,
                leaveType: 'Casual Leave',
                fromDate: new Date('2024-06-29'),
                toDate: new Date('2024-06-29'),
                reason: 'Personal work',
                status: 'Pending',
            },
        ]);

        console.log('✅ Seeding complete!');
        console.log('\n📋 Demo Accounts:');
        console.log('  Admin:    admin@elms.com    / admin123');
        console.log('  Manager:  manager@elms.com  / manager123');
        console.log('  Employee: john@elms.com     / emp123');
        console.log('  Employee: anita@elms.com    / emp123');
        console.log('  Employee: raj@elms.com      / emp123');

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seed();
