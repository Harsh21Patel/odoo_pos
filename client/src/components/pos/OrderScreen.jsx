import React, { useState } from 'react';
import toast from 'react-hot-toast';
import usePOSStore from '../../store/posStore';

const CATEGORY_COLORS = ['#6b4423','#e67e22','#c0392b','#2980b9','#8e44ad','#27ae60','#16a085','#d35400'];

export default function OrderScreen() {
  const {
    selectedTable, products, categories, selectedCategory, selectCategory,
    cart, cartSubtotal, cartTax, cartTotal,
    addToCart, removeFromCart, updateCartQty, clearCart,
    placeOrder, setView, resetPOS
  } = usePOSStore();

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredProducts = products.filter(p => {
    const matchCat = !selectedCategory || p.category?._id === selectedCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleOrder = async () => {
    if (!cart.length) return toast.error('Add items to cart first');
    setLoading(true);
    try {
      await placeOrder();
      setView('payment');
    } catch (e) {
      console.error("Order creation failed:", e.response?.data || e.message);
      toast.error(e.response?.data?.message || e.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex">
      {/* LEFT: Product Panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
        {/* Table header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={resetPOS} className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1">
            ← Back
          </button>
          <div className="flex-1">
            <span className="font-semibold text-gray-800">Table {selectedTable?.number}</span>
            <span className="text-xs text-gray-500 ml-2">{selectedTable?.seats} seats · {selectedTable?.floor?.name}</span>
          </div>
          <input
            type="text" placeholder="🔍 Search products..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 w-48"
          />
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => selectCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${!selectedCategory ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All Items
          </button>
          {categories.map((cat, i) => (
            <button
              key={cat._id}
              onClick={() => selectCategory(cat._id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${selectedCategory === cat._id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              style={selectedCategory === cat._id ? { backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] } : {}}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <span className="text-4xl mb-2">🔍</span>
              <p>No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredProducts.map(product => (
                <ProductCard key={product._id} product={product} onAdd={addToCart} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart Panel */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg">
        {/* Cart header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">🛒 Order</h3>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-700">Clear all</button>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-300">
              <span className="text-5xl mb-3">🛒</span>
              <p className="text-sm">Cart is empty</p>
              <p className="text-xs">Click products to add</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <CartItem key={idx} item={item} index={idx}
                onQtyChange={updateCartQty} onRemove={removeFromCart} />
            ))
          )}
        </div>

        {/* Cart totals */}
        <div className="border-t border-gray-200 p-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>₹{cartSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tax (GST)</span>
            <span>₹{cartTax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
            <span>Total</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={handleOrder} disabled={loading || !cart.length}
            className="w-full mt-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            {loading ? 'Processing...' : `Proceed to Payment · ₹${cartTotal.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, onAdd }) {
  return (
    <button
      onClick={() => onAdd(product)}
      className="bg-white rounded-xl border border-gray-200 p-3 text-left hover:border-purple-400 hover:shadow-md transition-all group"
    >
      <div className="aspect-square bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg flex items-center justify-center text-3xl mb-2 overflow-hidden">
        {product.image ? (
          <img src={product.image.startsWith('http') ? product.image : `/uploads/${product.image}`} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          product.category?.icon || '🍽️'
        )}
      </div>
      <p className="text-xs font-semibold text-gray-800 leading-tight truncate">{product.name}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-sm font-bold text-purple-700">₹{product.price}</span>
        <span className="w-5 h-5 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold group-hover:bg-purple-600 group-hover:text-white transition-colors">+</span>
      </div>
    </button>
  );
}

function CartItem({ item, index, onQtyChange, onRemove }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 truncate">{item.productName}</p>
        {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
        <p className="text-xs font-medium text-purple-700">₹{(item.price * item.quantity).toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={() => onQtyChange(index, item.quantity - 1)}
          className="w-6 h-6 bg-gray-200 hover:bg-red-100 hover:text-red-600 rounded text-xs font-bold transition-colors">−</button>
        <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
        <button onClick={() => onQtyChange(index, item.quantity + 1)}
          className="w-6 h-6 bg-gray-200 hover:bg-green-100 hover:text-green-600 rounded text-xs font-bold transition-colors">+</button>
      </div>
    </div>
  );
}