import express from 'express';
const router = express.Router();

import Table from '../models/Table.js';
import { v4 as uuidv4 } from 'uuid';
import { protect, adminOnly } from '../middleware/auth.js';

router.get('/', protect, async (req, res) => {
  try {
    const { floor } = req.query;
    const filter = floor ? { floor } : {};
    const tables = await Table.find(filter).populate('floor', 'name').populate('currentOrder').sort('number');
    res.json(tables);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const table = await Table.create(req.body);
    await table.populate('floor', 'name');
    res.status(201).json(table);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('floor', 'name');
    res.json(table);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Table.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET QR token info for a specific table (admin)
router.get('/:id/qr', protect, async (req, res) => {
  try {
    let table = await Table.findById(req.params.id).populate('floor', 'name');
    if (!table) return res.status(404).json({ message: 'Table not found' });

    // Generate token if missing (for tables created before this feature)
    if (!table.qrToken) {
      table.qrToken = uuidv4();
      await table.save();
    }

    const baseUrl = process.env.SELF_ORDER_BASE_URL || 'http://localhost:3000';
    res.json({
      tableId: table._id,
      tableNumber: table.number,
      floorName: table.floor?.name,
      qrToken: table.qrToken,
      selfOrderUrl: `${baseUrl}/s/${table.qrToken}`
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;