import 'dotenv/config';
import connectDB from './config/db.js';
import Order from './models/Order.js';

async function test() {
  try {
    await connectDB();
    console.log('connected');
  } catch(e) {
    console.error(e);
  }
  process.exit();
}
test();
