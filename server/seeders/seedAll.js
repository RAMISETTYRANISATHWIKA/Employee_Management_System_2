import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import crypto from 'crypto';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Holiday from '../models/Holiday.js';
import Announcement from '../models/Announcement.js';
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

const seedAll = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('ERROR: MONGO_URI is not set. Copy .env.example to .env');
    process.exit(1);
  }

  const credentials = [];

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB\n');

    // Admin
    const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@example.com').toLowerCase();
    let adminUser = await User.findOne({ email: adminEmail, role: 'admin' });

    if (!adminUser) {
      const adminPassword = generateSecurePassword(16);
      const adminEmpId = await generateEmployeeId();
      const adminEmployee = await Employee.create({
        employeeId: adminEmpId,
        fullName: 'System Administrator',
        officialEmail: adminEmail,
        department: 'Administration',
        designation: 'HR Admin',
        joiningDate: new Date(),
        employmentStatus: 'active',
      });
      adminUser = await User.create({
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        employee: adminEmployee._id,
        permissions: adminPermissions,
        mustChangePassword: true,
      });
      credentials.push({ role: 'Admin', email: adminEmail, password: adminPassword, employeeId: adminEmpId });
    } else {
      console.log('Admin already exists, skipping.');
    }

    // Staff
    const staffEmail = (process.env.INITIAL_STAFF_EMAIL || 'staff@example.com').toLowerCase();
    let staffUser = await User.findOne({ email: staffEmail, role: 'staff' });

    if (!staffUser) {
      const staffPassword = generateSecurePassword(16);
      const staffEmpId = await generateEmployeeId();
      const staffEmployee = await Employee.create({
        employeeId: staffEmpId,
        fullName: 'John Staff',
        officialEmail: staffEmail,
        department: 'Engineering',
        designation: 'Software Developer',
        joiningDate: new Date(),
        employmentStatus: 'active',
        baseSalary: 75000,
      });
      staffUser = await User.create({
        email: staffEmail,
        password: staffPassword,
        role: 'staff',
        employee: staffEmployee._id,
      });
      credentials.push({ role: 'Staff', email: staffEmail, password: staffPassword, employeeId: staffEmpId });
    } else {
      console.log('Staff already exists, skipping.');
    }

    // Sample holidays
    const holidayCount = await Holiday.countDocuments();
    if (holidayCount === 0 && adminUser) {
      await Holiday.insertMany([
        { name: 'New Year', date: new Date('2026-01-01'), type: 'public', isPublished: true, createdBy: adminUser._id },
        { name: 'Independence Day', date: new Date('2026-08-15'), type: 'public', isPublished: true, createdBy: adminUser._id },
        { name: 'Company Anniversary', date: new Date('2026-12-01'), type: 'company', isPublished: true, createdBy: adminUser._id },
      ]);
      console.log('Sample holidays created.');
    }

    // Sample announcement
    const announcementCount = await Announcement.countDocuments();
    if (announcementCount === 0 && adminUser) {
      await Announcement.create({
        title: 'Welcome to Employee Management System',
        content: 'This is your new HR portal. Please update your profile and submit daily EOD reports.',
        priority: 'high',
        audience: 'all',
        isPublished: true,
        author: adminUser._id,
      });
      console.log('Sample announcement created.');
    }

    if (credentials.length > 0) {
      const content = credentials
        .map(
          (c) => `${c.role} Account\nEmail: ${c.email}\nPassword: ${c.password}\nEmployee ID: ${c.employeeId}\n`
        )
        .join('\n---\n\n');

      const filePath = saveCredentialsToFile('initial-credentials.txt', content);

      console.log('\n========================================');
      console.log('  CREDENTIALS GENERATED');
      console.log('========================================');
      credentials.forEach((c) => {
        console.log(`\n${c.role}:`);
        console.log(`  Email: ${c.email}`);
        console.log(`  Password: ${c.password}`);
        console.log(`  Employee ID: ${c.employeeId}`);
      });
      console.log(`\nSaved to: ${filePath}`);
      console.log('========================================\n');
    }

    if (!process.env.JWT_SECRET) {
      console.log(`Add to .env: JWT_SECRET=${crypto.randomBytes(64).toString('hex')}\n`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAll();
