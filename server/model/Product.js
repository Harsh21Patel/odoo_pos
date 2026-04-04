import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },      // e.g., "Size", "Pack"
  options: [{
    label: String,       // e.g., "Small", "Medium", "Large"
    priceModifier: { type: Number, default: 0 }
  }]
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true, min: 0 },
  unit: { type: String, default: 'piece' },
  tax: { type: Number, default: 0 },           // tax percentage
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  variants: [variantSchema],
  isActive: { type: Boolean, default: true },
  stock: { type: Number, default: -1 }         // -1 means unlimited
}, { timestamps: true });

export default mongoose.model('Product', productSchema);