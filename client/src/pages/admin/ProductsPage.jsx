import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { productAPI, categoryAPI, uploadAPI } from '../../services/api';

const EMPTY_FORM = {
  name: '',
  category: '',
  price: '',
  unit: 'piece',
  tax: 5,
  description: '',
  isActive: true,
  image: ''
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        productAPI.getAll(),
        categoryAPI.getAll()
      ]);
      setProducts(pRes.data);
      setCategories(cRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // 🔥 Upload Image via ImageKit
  const uploadImage = async () => {
    if (!imageFile) return "";

    setUploading(true);
    try {
      // Get signed auth params from our server (includes publicKey, signature, expire, token)
      const { data: auth } = await uploadAPI.getAuth();

      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("fileName", imageFile.name);
      formData.append("publicKey", auth.publicKey);
      formData.append("signature", auth.signature);
      formData.append("expire", auth.expire);
      formData.append("token", auth.token);

      const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'ImageKit upload failed');
      }

      return data.url;

    } catch (err) {
      toast.error(`Image upload failed: ${err.message}`);
      return "";
    } finally {
      setUploading(false);
    }
  };

  // 🧠 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = form.image || "";

      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const payload = { ...form, image: imageUrl };

      if (editId) {
        await productAPI.update(editId, payload);
        toast.success('Product updated');
      } else {
        await productAPI.create(payload);
        toast.success('Product created');
      }

      setShowModal(false);
      setForm(EMPTY_FORM);
      setEditId(null);
      setImageFile(null);
      setPreview(null);

      load();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name,
      category: p.category?._id || p.category,
      price: p.price,
      unit: p.unit,
      tax: p.tax,
      description: p.description,
      isActive: p.isActive,
      image: p.image || ''
    });

    setPreview(p.image || null);
    setEditId(p._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productAPI.delete(id);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = products.filter(p => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase());
    const mc = !filterCat || p.category?._id === filterCat;
    return ms && mc;
  });

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Products</h2>
          <p className="text-gray-500 text-sm">{products.length} items</p>
        </div>
        <button
          onClick={() => {
            setForm(EMPTY_FORM);
            setEditId(null);
            setPreview(null);
            setShowModal(true);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm"
        >
          + Add Product
        </button>
      </div>

      {/* FILTER */}
      <div className="flex gap-3">
        <input
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-xl"
        />

        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="px-4 py-2 border rounded-xl"
        >
          <option value="">All</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Name','Category','Price','Unit','Tax','Status','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-6">Loading...</td></tr>
            ) : filtered.map(p => (
              <tr key={p._id} className="border-t">

                {/* IMAGE + NAME */}
                <td className="px-4 py-3 flex items-center gap-3">
                  {p.image && (
                    <img src={p.image} className="w-10 h-10 rounded-lg object-cover" />
                  )}
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.description}</div>
                  </div>
                </td>

                <td className="px-4 py-3">{p.category?.name}</td>
                <td className="px-4 py-3">₹{p.price}</td>
                <td className="px-4 py-3">{p.unit}</td>
                <td className="px-4 py-3">{p.tax}%</td>

                <td className="px-4 py-3">
                  {p.isActive ? 'Active' : 'Inactive'}
                </td>

                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => handleEdit(p)}>Edit</button>
                  <button onClick={() => handleDelete(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg">

            <h3 className="font-bold mb-4">
              {editId ? 'Edit' : 'Add'} Product
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">

              <input
                placeholder="Product name"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border px-3 py-2 rounded-xl"
              />

              <select
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
                className="w-full border px-3 py-2 rounded-xl"
              >
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>

              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="Price"
                  value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                  className="border px-2 py-2 rounded-xl"
                />
                <input placeholder="Unit"
                  value={form.unit}
                  onChange={e => setForm({...form, unit: e.target.value})}
                  className="border px-2 py-2 rounded-xl"
                />
                <input type="number" placeholder="Tax"
                  value={form.tax}
                  onChange={e => setForm({...form, tax: e.target.value})}
                  className="border px-2 py-2 rounded-xl"
                />
              </div>

              {/* IMAGE INPUT */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setImageFile(file);
                  setPreview(URL.createObjectURL(file));
                }}
                className="w-full border px-3 py-2 rounded-xl"
              />

              {/* PREVIEW */}
              {preview && (
                <img src={preview} className="w-20 h-20 rounded-lg object-cover" />
              )}

              <textarea
                placeholder="Description"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                className="w-full border px-3 py-2 rounded-xl"
              />

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-xl"
              >
                {uploading ? 'Uploading...' : 'Save'}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}