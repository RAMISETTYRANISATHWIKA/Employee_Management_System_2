import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import crypto from 'crypto';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import { generateSecurePassword, saveCredentialsToFile } from '../utils/generateCredentials.js';
import { generateEmployeeId } from '../utils/employeeIdGenerator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const adminPermissions = {
  manageEmployees: true,
  manageLeaves: true,
  manageSalaries: true,
  manageHolidays: true,
  manageAnnouncements: true,
  viewEODReports: true,
  viewAuditLogs: true,
  viewReports: true,
};

const seedAdmin = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('ERROR: MONGO_URI is not set. Copy .env.example to .env and configure MongoDB.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const email = (process.env.INITIAL_ADMIN_EMAIL || 'admin@example.com').toLowerCase();

    const existing = await User.findOne({ email, role: 'admin' });
    if (existing) {
      console.log('Initial admin already exists. Skipping creation (idempotent).');
      console.log(`Admin email: ${email}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    const password = generateSecurePassword(16);
    const employeeId = await generateEmployeeId();

    const employee = await Employee.create({
      employeeId,
      fullName: 'System Administrator',
      officialEmail: email,
      phone: '+10000000000',
      department: 'Administration',
      designation: 'HR Admin',
      joiningDate: new Date(),
      employmentType: 'full-time',
      employmentStatus: 'active',
      baseSalary: 0,
    });

    await User.create({
      email,
      password,
      role: 'admin',
      employee: employee._id,
      permissions: adminPermissions,
      mustChangePassword: true,
    });

    if (!process.env.JWT_SECRET) {
      const jwtSecret = crypto.randomBytes(64).toString('hex');
      console.log('\nWARNING: JWT_SECRET not set. Add this to your .env file:');
      console.log(`JWT_SECRET=${jwtSecret}`);
    }

    const credentialsContent = `
Employee Management System - Initial Admin Credentials
Generated: ${new Date().toISOString()}

Admin Email: ${email}
Admin Password: ${password}
Employee ID: ${employeeId}

IMPORTANT:
- Change this password on first login
- Delete this file after saving credentials securely
- This file is excluded from Git
`;

    const filePath = saveCredentialsToFile('initial-admin.txt', credentialsContent);

    console.log('\n========================================');
    console.log('  INITIAL ADMIN ACCOUNT CREATED');
    console.log('========================================');
    console.log(`Email:       ${email}`);
    console.log(`Password:    ${password}`);
    console.log(`Employee ID: ${employeeId}`);
    console.log(`\nCredentials saved to: ${filePath}`);
    console.log('You MUST change password on first login.');
    console.log('========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();
