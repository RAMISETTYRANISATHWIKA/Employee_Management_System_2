import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import { generateSecurePassword, saveCredentialsToFile } from '../utils/generateCredentials.js';
import { generateEmployeeId } from '../utils/employeeIdGenerator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedStaff = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('ERROR: MONGO_URI is not set.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);

    const email = (process.env.INITIAL_STAFF_EMAIL || 'staff@example.com').toLowerCase();

    const existing = await User.findOne({ email, role: 'staff' });
    if (existing) {
      console.log('Initial staff already exists. Skipping creation.');
      await mongoose.disconnect();
      process.exit(0);
    }

    const password = generateSecurePassword(16);
    const employeeId = await generateEmployeeId();

    const employee = await Employee.create({
      employeeId,
      fullName: 'John Staff',
      officialEmail: email,
      phone: '+10000000001',
      department: 'Engineering',
      designation: 'Software Developer',
      joiningDate: new Date(),
      employmentType: 'full-time',
      employmentStatus: 'active',
      baseSalary: 75000,
      leaveBalance: { annual: 20, sick: 10, casual: 5 },
    });

    await User.create({
      email,
      password,
      role: 'staff',
      employee: employee._id,
      mustChangePassword: false,
    });

    const credentialsContent = `
Employee Management System - Initial Staff Credentials
Generated: ${new Date().toISOString()}

Staff Email: ${email}
Staff Password: ${password}
Employee ID: ${employeeId}
`;

    const filePath = saveCredentialsToFile('initial-staff.txt', credentialsContent);

    console.log('\n========================================');
    console.log('  INITIAL STAFF ACCOUNT CREATED');
    console.log('========================================');
    console.log(`Email:       ${email}`);
    console.log(`Password:    ${password}`);
    console.log(`Employee ID: ${employeeId}`);
    console.log(`\nCredentials saved to: ${filePath}`);
    console.log('========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Staff seeding failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedStaff();
