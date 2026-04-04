import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: String,
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  variant: { type: String, default: '' },
  notes: { type: String, default: '' },
  kitchenStatus: {
    type: String,
    enum: ['pending', 'to-cook', 'preparing', 'completed'],
    default: 'pending'
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  tableName: String,
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [orderItemSchema],
  subtotal: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['open', 'sent-to-kitchen', 'preparing', 'ready', 'paid', 'cancelled'],
    default: 'open'
  },
  kitchenStatus: {
    type: String,
    enum: ['pending', 'to-cook', 'preparing', 'completed'],
    default: 'pending'
  },
  paymentMethod: { type: String, enum: ['cash', 'digital', 'upi', ''], default: '' },
  notes: { type: String, default: '' },
  type: { type: String, enum: ['dine-in', 'takeaway', 'delivery'], default: 'dine-in' },
  source: { type: String, enum: ['pos', 'self-order'], default: 'pos' }
}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    let nextNumber = 1;
    const lastOrder = await this.constructor.findOne().sort({ createdAt: -1 });
    
    if (lastOrder && lastOrder.orderNumber) {
      const match = lastOrder.orderNumber.match(/ORD-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      } else {
        nextNumber = (await this.constructor.countDocuments()) + 1;
      }
    } else {
      nextNumber = (await this.constructor.countDocuments()) + 1;
    }

    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      const candidate = `ORD-${String(nextNumber).padStart(4, '0')}`;
      const existing = await this.constructor.findOne({ orderNumber: candidate });
      if (existing) {
        nextNumber++;
        attempts++;
      } else {
        this.orderNumber = candidate;
        isUnique = true;
      }
    }

    if (!isUnique) {
      this.orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    }
  }
  next();
});

export default mongoose.model('Order', orderSchema);