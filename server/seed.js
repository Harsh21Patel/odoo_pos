require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Floor = require('./models/Floor');
const Table = require('./models/Table');
const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany(),
    Category.deleteMany(),
    Product.deleteMany(),
    Floor.deleteMany(),
    Table.deleteMany()
  ]);

  console.log('🗑️  Cleared existing data');

  // Users
  const users = await User.create([
    { name: 'Admin User', email: 'admin@cafe.com', password: 'admin123', role: 'admin' },
    { name: 'Staff Alice', email: 'alice@cafe.com', password: 'staff123', role: 'staff' },
    { name: 'Staff Bob', email: 'bob@cafe.com', password: 'staff123', role: 'staff' }
  ]);
  console.log('👤 Users created');

  // Categories
  const categories = await Category.create([
    { name: 'Coffee', color: '#6b4423', icon: '☕' },
    { name: 'Food', color: '#e67e22', icon: '🍔' },
    { name: 'Pizza', color: '#c0392b', icon: '🍕' },
    { name: 'Beverages', color: '#2980b9', icon: '🥤' },
    { name: 'Desserts', color: '#8e44ad', icon: '🍰' },
    { name: 'Snacks', color: '#27ae60', icon: '🍟' }
  ]);
  console.log('📂 Categories created');

  const [coffee, food, pizza, beverages, desserts, snacks] = categories;

  // Products
  await Product.create([
    // Coffee
    { name: 'Espresso', category: coffee._id, price: 120, unit: 'cup', tax: 5, description: 'Strong Italian espresso' },
    { name: 'Cappuccino', category: coffee._id, price: 180, unit: 'cup', tax: 5, description: 'Espresso with steamed milk foam',
      variants: [{ name: 'Size', options: [{ label: 'Small', priceModifier: 0 }, { label: 'Large', priceModifier: 40 }] }] },
    { name: 'Latte', category: coffee._id, price: 200, unit: 'cup', tax: 5, description: 'Espresso with steamed milk' },
    { name: 'Cold Brew', category: coffee._id, price: 220, unit: 'cup', tax: 5, description: 'Slow-steeped cold coffee' },
    { name: 'Americano', category: coffee._id, price: 150, unit: 'cup', tax: 5 },
    // Food
    { name: 'Veg Burger', category: food._id, price: 199, unit: 'piece', tax: 5, description: 'Crispy veg patty burger' },
    { name: 'Chicken Burger', category: food._id, price: 249, unit: 'piece', tax: 5 },
    { name: 'Club Sandwich', category: food._id, price: 229, unit: 'piece', tax: 5 },
    { name: 'Grilled Paneer', category: food._id, price: 279, unit: 'plate', tax: 5 },
    // Pizza
    { name: 'Margherita', category: pizza._id, price: 299, unit: 'piece', tax: 5,
      variants: [{ name: 'Size', options: [{ label: 'Small', priceModifier: 0 }, { label: 'Medium', priceModifier: 100 }, { label: 'Large', priceModifier: 200 }] }] },
    { name: 'Pepperoni', category: pizza._id, price: 379, unit: 'piece', tax: 5 },
    { name: 'BBQ Chicken', category: pizza._id, price: 399, unit: 'piece', tax: 5 },
    { name: 'Veggie Delight', category: pizza._id, price: 329, unit: 'piece', tax: 5 },
    // Beverages
    { name: 'Fresh Lime Soda', category: beverages._id, price: 99, unit: 'glass', tax: 5 },
    { name: 'Mango Shake', category: beverages._id, price: 149, unit: 'glass', tax: 5 },
    { name: 'Iced Tea', category: beverages._id, price: 119, unit: 'glass', tax: 5 },
    { name: 'Cold Coffee', category: beverages._id, price: 179, unit: 'glass', tax: 5 },
    // Desserts
    { name: 'Chocolate Brownie', category: desserts._id, price: 149, unit: 'piece', tax: 5 },
    { name: 'Cheesecake', category: desserts._id, price: 199, unit: 'slice', tax: 5 },
    { name: 'Tiramisu', category: desserts._id, price: 229, unit: 'piece', tax: 5 },
    // Snacks
    { name: 'French Fries', category: snacks._id, price: 149, unit: 'plate', tax: 5 },
    { name: 'Onion Rings', category: snacks._id, price: 129, unit: 'plate', tax: 5 },
    { name: 'Garlic Bread', category: snacks._id, price: 119, unit: 'piece', tax: 5 }
  ]);
  console.log('🍕 Products created');

  // Floors & Tables
  const [ground, first] = await Floor.create([
    { name: 'Ground Floor' },
    { name: 'First Floor' }
  ]);
  console.log('🏢 Floors created');

  const tableData = [];
  for (let i = 1; i <= 6; i++) {
    tableData.push({ number: `T${i}`, floor: ground._id, seats: i <= 3 ? 2 : 4 });
  }
  for (let i = 7; i <= 12; i++) {
    tableData.push({ number: `T${i}`, floor: first._id, seats: i <= 9 ? 4 : 6 });
  }
  await Table.create(tableData);
  console.log('🪑 Tables created');

  console.log('\n✅ Seed complete!');
  console.log('-------------------');
  console.log('Admin: admin@cafe.com / admin123');
  console.log('Staff: alice@cafe.com / staff123');
  console.log('-------------------');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });