// seed/adminSeeder.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');  
const connectToMongo = require('../db/db'); 

connectToMongo(); 

const seedAdmin = async () => {
    try {
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        console.log('Admin already exists');
      } else {
        const password = await bcrypt.hash('12345678', 10);
        const confirmPassword = await bcrypt.hash('12345678', 10);
        const admin = new User({
          username: 'admin',
          email: 'admin@mail.com',
          role: 'admin',
          fname: 'CH',
          lname: 'Admin',
          password: password,
          confirmPassword: confirmPassword,
        });
        await admin.save();
        console.log('Admin user created successfully');
      }
    } catch (error) {
      console.error('Error seeding admin:', error);
    }finally {
      mongoose.connection.close();  // Close the connection after the operation
    }
  };


seedAdmin();