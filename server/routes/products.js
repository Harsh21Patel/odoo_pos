import express from 'express';
const router = express.Router();

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';

import { protect, adminOnly } from '../middleware/auth.js';

// Routes
router.get('/', protect, getProducts);
router.get('/:id', protect, getProduct);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;