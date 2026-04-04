import mongoose from 'mongoose';
import Order from './models/Order.js';

await mongoose.connect('mongodb://localhost:27017/odoo-pos-cafe'); // assuming local db
const orders = await Order.find().sort({_id:-1}).limit(2);
console.log(orders);
process.exit(0);
