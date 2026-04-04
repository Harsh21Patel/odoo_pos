import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { categoryAPI } from '../../services/api';

const ICONS = ['☕','🍔','🍕','🥤','🍰','🍟','🥗','🍜','🍣','🥪','🍩','🧃','🫖','🍺','🥩'];
const COLORS = ['#6b4423','#e67e22','#c0392b','#2980b9','#8e44ad','#27ae60','#16a085','#d35400','#f39c12','#2c3e50'];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '🍽️', color: '#6366f1' });
  const [editId, setEditId] = useState(null);

  const load = () => categoryAPI.getAll().then(r => setCategories(r.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      editId ? await categoryAPI.update(editId, form) : await categoryAPI.create(form);
      toast.success(editId ? 'Updated' : 'Created');
      setShowModal(false); setForm({ name: '', icon: '🍽️', color: '#6366f1' }); setEditId(null); load();
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete category?')) return;
    try { await categoryAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-gray-800">Categories</h2><p className="text-gray-500 text-sm">{categories.length} categories</p></div>
        <button onClick={() => { setForm({ name: '', icon: '🍽️', color: '#6366f1' }); setEditId(null); setShowModal(true); }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium">+ Add Category</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map(cat => (
          <div key={cat._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center group hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3" style={{ backgroundColor: cat.color + '20' }}>
              {cat.icon}
            </div>
            <p className="font-semibold text-gray-800">{cat.name}</p>
            <div className="flex gap-2 mt-3 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setForm({ name: cat.name, icon: cat.icon, color: cat.color }); setEditId(cat._id); setShowModal(true); }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
              <button onClick={() => handleDelete(cat._id)} className="text-xs text-red-600 hover:text-red-800 font-medium">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">{editId ? 'Edit' : 'Add'} Category</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Category name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(i => (
                    <button key={i} type="button" onClick={() => setForm({...form, icon: i})}
                      className={`w-9 h-9 text-xl rounded-lg border-2 transition-all ${form.icon === i ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm({...form, color: c})}
                      className={`w-8 h-8 rounded-full border-4 transition-all ${form.color === c ? 'border-gray-400 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium">{editId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}