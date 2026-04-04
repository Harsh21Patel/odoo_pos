import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { floorAPI } from '../../services/api';

export default function FloorsPage() {
  const [floors, setFloors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);

  const load = () => floorAPI.getAll().then(r => setFloors(r.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      editId ? await floorAPI.update(editId, { name }) : await floorAPI.create({ name });
      toast.success(editId ? 'Floor updated' : 'Floor created');
      setShowModal(false); setName(''); setEditId(null); load();
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete floor?')) return;
    try { await floorAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-gray-800">Floors</h2><p className="text-gray-500 text-sm">{floors.length} floors configured</p></div>
        <button onClick={() => { setName(''); setEditId(null); setShowModal(true); }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium">+ Add Floor</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {floors.map(floor => (
          <div key={floor._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">🏢</div>
              <div>
                <p className="font-semibold text-gray-800">{floor.name}</p>
                <p className="text-xs text-gray-500">Active floor</p>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setName(floor.name); setEditId(floor._id); setShowModal(true); }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
              <button onClick={() => handleDelete(floor._id)} className="text-xs text-red-600 hover:text-red-800 font-medium">Delete</button>
            </div>
          </div>
        ))}
        {floors.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <span className="text-5xl block mb-3">🏢</span>
            <p>No floors yet. Add your first floor.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-bold text-lg mb-4">{editId ? 'Edit' : 'Add'} Floor</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Floor name (e.g. Ground Floor)" value={name} onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium">{editId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}