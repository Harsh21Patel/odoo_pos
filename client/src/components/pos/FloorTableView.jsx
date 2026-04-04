import React from 'react';
import usePOSStore from '../../store/posStore';

const statusColors = {
  available: 'bg-white border-green-400 hover:border-green-500 hover:shadow-green-100',
  occupied: 'bg-orange-50 border-orange-400 hover:border-orange-500 hover:shadow-orange-100',
  reserved: 'bg-blue-50 border-blue-400 hover:border-blue-500 hover:shadow-blue-100'
};

const statusBadge = {
  available: 'bg-green-100 text-green-700',
  occupied: 'bg-orange-100 text-orange-700',
  reserved: 'bg-blue-100 text-blue-700'
};

export default function FloorTableView() {
  const { floors, tables, selectedFloor, selectFloor, selectTable } = usePOSStore();

  const filteredTables = selectedFloor
    ? tables.filter(t => t.floor?._id === selectedFloor || t.floor === selectedFloor)
    : tables;

  return (
    <div className="h-full flex flex-col p-4">
      {/* Floor Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => selectFloor(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!selectedFloor ? 'bg-purple-600 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
        >
          All Floors
        </button>
        {floors.map(floor => (
          <button
            key={floor._id}
            onClick={() => selectFloor(floor._id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedFloor === floor._id ? 'bg-purple-600 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
          >
            {floor.name}
          </button>
        ))}
      </div>


      {/* Tables Grid */}
      <div className="flex-1 overflow-y-auto">
        {filteredTables.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <span className="text-5xl mb-3">🪑</span>
            <p className="font-medium">No tables found</p>
            <p className="text-sm">Add tables from the admin panel</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {filteredTables.map(table => (
              <button
                key={table._id}
                onClick={() => selectTable(table)}
                className="relative p-4 rounded-xl border-2 shadow-sm hover:shadow-md transition-all text-left group bg-white border-gray-200 hover:border-purple-400"
              >
                <div className="text-center">
                  <span className="text-2xl mb-1 block">🪑</span>
                  <p className="font-bold text-gray-800 text-sm">{table.number}</p>
                  <p className="text-xs text-gray-500">{table.seats} seats</p>
                </div>
                {table.currentOrder && (
                  <div className="absolute top-1 right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}