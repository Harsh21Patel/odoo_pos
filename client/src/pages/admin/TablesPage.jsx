import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { tableAPI, floorAPI } from '../../services/api';

const EMPTY = { number: '', floor: '', seats: 4, isActive: true };
const BASE_URL = 'http://localhost:3000';

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [floors, setFloors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [filterFloor, setFilterFloor] = useState('');

  // QR state
  const [qrModal, setQrModal] = useState(null); // { tableNumber, floorName, qrToken, selfOrderUrl }
  const [qrLoading, setQrLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const qrRef = useRef(null);

  const load = async () => {
    const [tRes, fRes] = await Promise.all([tableAPI.getAll(), floorAPI.getAll()]);
    setTables(tRes.data);
    setFloors(fRes.data);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      editId ? await tableAPI.update(editId, form) : await tableAPI.create(form);
      toast.success(editId ? 'Table updated' : 'Table created');
      setShowModal(false); setForm(EMPTY); setEditId(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete table?')) return;
    try { await tableAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  // Open QR modal for a single table
  const handleViewQR = async (e, tableId) => {
    e.stopPropagation();
    setQrLoading(true);
    try {
      const res = await tableAPI.getQR(tableId);
      setQrModal(res.data);
    } catch {
      toast.error('Failed to load QR code');
    } finally {
      setQrLoading(false);
    }
  };

  // Download PDF with ALL table QR codes
  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      // Fetch QR data for all filtered tables
      const filtered = filterFloor
        ? tables.filter(t => t.floor?._id === filterFloor || t.floor === filterFloor)
        : tables;

      const qrDataArr = await Promise.all(
        filtered.map(t => tableAPI.getQR(t._id).then(r => r.data))
      );

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = 210;
      const pageH = 297;
      const colCount = 2;
      const cardW = 80;
      const cardH = 95;
      const padX = (pageW - colCount * cardW) / (colCount + 1);
      const padY = 20;
      const rowH = cardH + 10;

      // Title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 20, 180);
      doc.text('Table QR Codes', pageW / 2, 14, { align: 'center' });
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.setFont('helvetica', 'normal');
      doc.text(`Scan to self-order · ${new Date().toLocaleDateString()}`, pageW / 2, 20, { align: 'center' });

      let yStart = 28;

      for (let i = 0; i < qrDataArr.length; i++) {
        const col = i % colCount;
        const row = Math.floor(i / colCount);

        // Check page overflow — add new page after first set
        const totalRows = Math.ceil(qrDataArr.length / colCount);
        const pageRows = Math.floor((pageH - yStart - padY) / rowH);

        if (row > 0 && row % pageRows === 0 && col === 0) {
          doc.addPage();
          yStart = 20;
        }

        const rowOnPage = row % pageRows;
        const x = padX + col * (cardW + padX);
        const y = yStart + rowOnPage * rowH;

        const qrInfo = qrDataArr[i];

        // Card background
        doc.setFillColor(248, 245, 255);
        doc.roundedRect(x, y, cardW, cardH, 4, 4, 'F');
        doc.setDrawColor(147, 51, 234);
        doc.setLineWidth(0.4);
        doc.roundedRect(x, y, cardW, cardH, 4, 4, 'S');

        // Table name
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 10, 100);
        doc.text(`Table ${qrInfo.tableNumber}`, x + cardW / 2, y + 9, { align: 'center' });

        // Floor name
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(130, 100, 160);
        doc.text(qrInfo.floorName || '', x + cardW / 2, y + 14, { align: 'center' });

        // Generate QR as canvas then get data url
        const canvas = document.createElement('canvas');
        // Use qrcode library to draw on canvas
        const QRCodeLib = await import('qrcode');
        await QRCodeLib.default.toCanvas(canvas, qrInfo.selfOrderUrl, {
          width: 200, margin: 1,
          color: { dark: '#1a0050', light: '#f8f5ff' }
        });
        const qrImgData = canvas.toDataURL('image/png');

        const qrSize = 52;
        const qrX = x + (cardW - qrSize) / 2;
        doc.addImage(qrImgData, 'PNG', qrX, y + 17, qrSize, qrSize);

        // "SCAN ME" label
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(147, 51, 234);
        doc.text('SCAN ME', x + cardW / 2, y + 72, { align: 'center' });

        // URL (truncated)
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(160, 140, 180);
        const shortUrl = qrInfo.selfOrderUrl.replace('http://', '').replace('https://', '');
        doc.text(shortUrl, x + cardW / 2, y + 78, { align: 'center' });

        // Token badge
        doc.setFontSize(6.5);
        doc.setTextColor(180, 160, 200);
        doc.text(`Token: ${qrInfo.qrToken.slice(0, 8)}…`, x + cardW / 2, y + 84, { align: 'center' });
      }

      doc.save('table-qr-codes.pdf');
      toast.success('QR PDF downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const filtered = filterFloor
    ? tables.filter(t => t.floor?._id === filterFloor || t.floor === filterFloor)
    : tables;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Tables</h2>
          <p className="text-gray-500 text-sm">{tables.length} tables configured</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading || filtered.length === 0}
            className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {pdfLoading ? (
              <>⏳ Generating…</>
            ) : (
              <><span>📄</span> Download QR PDF</>
            )}
          </button>
          <button
            onClick={() => { setForm(EMPTY); setEditId(null); setShowModal(true); }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            + Add Table
          </button>
        </div>
      </div>

      {/* Floor filter */}
      <div className="flex gap-3">
        <select
          value={filterFloor} onChange={e => setFilterFloor(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="">All Floors</option>
          {floors.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
        </select>
      </div>

      {/* Table grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {filtered.map(table => (
          <div
            key={table._id}
            className="relative p-3 rounded-xl border-2 text-center group hover:shadow-md transition-all cursor-pointer border-purple-100 bg-purple-50 hover:border-purple-300"
            onClick={() => {
              setForm({ number: table.number, floor: table.floor?._id || table.floor, seats: table.seats, isActive: table.isActive });
              setEditId(table._id);
              setShowModal(true);
            }}
          >
            <span className="text-2xl block">🪑</span>
            <p className="font-bold text-sm text-gray-800">{table.number}</p>
            <p className="text-xs text-gray-500">{table.seats}p · {table.floor?.name}</p>

            {/* QR button */}
            <button
              onClick={(e) => handleViewQR(e, table._id)}
              className="mt-1 w-full text-xs bg-purple-600 text-white rounded-lg py-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-700"
              title="View QR Code"
            >
              {qrLoading ? '…' : '📱 QR'}
            </button>

            {/* Delete */}
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(table._id); }}
              className="absolute top-1 right-1 w-5 h-5 bg-red-100 text-red-600 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >×</button>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <span className="text-5xl block mb-3">🪑</span>
            <p>No tables found</p>
          </div>
        )}
      </div>

      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-bold text-lg mb-4">{editId ? 'Edit' : 'Add'} Table</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required placeholder="Table number (e.g. T1)"
                value={form.number} onChange={e => setForm({ ...form, number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <select
                required value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">Select floor</option>
                {floors.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
              </select>
              <input
                type="number" placeholder="Seats" min={1} max={20}
                value={form.seats} onChange={e => setForm({ ...form, seats: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <div className="flex items-center gap-2">
                <input type="checkbox" id="tactive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                <label htmlFor="tactive" className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex gap-3">
                <button
                  type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm"
                >Cancel</button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium"
                >{editId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── QR Modal ── */}
      {qrModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setQrModal(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-xs text-center"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4">
              <span className="text-3xl">📱</span>
              <h3 className="font-bold text-xl text-gray-800 mt-1">Table {qrModal.tableNumber}</h3>
              <p className="text-gray-500 text-sm">{qrModal.floorName}</p>
            </div>

            {/* QR Code */}
            <div
              ref={qrRef}
              className="inline-block p-3 bg-white border-2 border-purple-200 rounded-2xl shadow-sm mb-4"
            >
              <QRCodeSVG
                value={qrModal.selfOrderUrl}
                size={200}
                level="H"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#1a0050"
              />
            </div>

            {/* URL */}
            <div className="bg-purple-50 border border-purple-100 rounded-xl px-3 py-2 mb-4 text-left">
              <p className="text-xs text-purple-400 font-medium mb-0.5">SCAN URL</p>
              <p className="text-xs text-purple-700 font-mono break-all leading-relaxed">
                {qrModal.selfOrderUrl}
              </p>
            </div>

            {/* Token */}
            <p className="text-xs text-gray-400 mb-4">
              Token: <span className="font-mono text-gray-500">{qrModal.qrToken}</span>
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(qrModal.selfOrderUrl);
                  toast.success('URL copied!');
                }}
                className="flex-1 py-2 border border-purple-200 text-purple-700 rounded-xl text-sm font-medium hover:bg-purple-50 transition-colors"
              >
                📋 Copy URL
              </button>
              <button
                onClick={() => setQrModal(null)}
                className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}