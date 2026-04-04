import 'dotenv/config';
import connectDB from './config/db.js';
import User from './models/User.js';
import jwt from 'jsonwebtoken';

async function test() {
  await connectDB();
  const user = await User.findOne();
  if (user) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log("TOKEN=" + token);
    console.log("USER=" + user._id);
  }
  process.exit();
}
test();
