import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Order from './models/Order.js';

async function run() {
  try {
    await connectDB();
    const users = await User.find();
    console.log('Users:', users.map(u => u.email));
    console.log('Last order error can be found if we simulate creating an order...');
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
