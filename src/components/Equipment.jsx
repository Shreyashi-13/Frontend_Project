import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus } from 'lucide-react';

export default function Equipment() {
  const { store, addToCart } = useApp();
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rentalDays, setRentalDays] = useState(3);

  const handleOpenLeaseModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleAddLeaseToCart = (e) => {
    e.preventDefault();
    addToCart({
      id: selectedItem.id,
      type: 'EQUIPMENT_LEASE',
      name: selectedItem.name,
      image: selectedItem.image,
      dailyRate: selectedItem.dailyRate,
      days: rentalDays,
      startDate: new Date().toISOString().split('T')[0]
    });
    setShowModal(false);
    alert(`🚜 ${selectedItem.name} (${rentalDays} Days Lease) added to your procurement cart!`);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Machinery & Heavy Equipment Rental</h1>
        <p className="page-subtitle">Reserve JCBs, hydraulic mobile cranes, transit mixers, and site machinery with verified operators</p>
      </div>

      <div className="card-grid">
        {store.equipment.map(item => (
          <div key={item.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '185px', width: '100%', position: 'relative', overflow: 'hidden', background: '#eceee6' }}>
              <img 
                src={item.image} 
                alt={item.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span className="role-badge" style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.95)', border: 'none', color: '#111' }}>
                {item.category}
              </span>
              <span style={{
                position: 'absolute',
                bottom: '10px',
                left: '12px',
                background: item.available ? 'rgba(37, 133, 68, 0.9)' : 'rgba(180, 35, 24, 0.9)',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px'
              }}>
                {item.available ? '● Ready for Site Lease' : '● Currently Leased'}
              </span>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.3rem 0', color: 'var(--text-main)' }}>{item.name}</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '0.6rem' }}>{item.specs}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', flex: 1 }}>{item.description}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Daily Tariff</span>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>₹{item.dailyRate.toLocaleString('en-IN')}</strong>
                </div>
                <button 
                  className="btn btn-primary btn-sm"
                  disabled={!item.available}
                  onClick={() => handleOpenLeaseModal(item)}
                >
                  <Plus size={14} /> Add Lease to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lease Days Modal */}
      {showModal && selectedItem && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <img src={selectedItem.image} alt={selectedItem.name} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-main)' }}>{selectedItem.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                  ₹{selectedItem.dailyRate.toLocaleString('en-IN')} / Day · Certified operator included
                </p>
              </div>
            </div>

            <form onSubmit={handleAddLeaseToCart}>
              <div className="form-group">
                <label className="form-label">Rental Duration (Days)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="60"
                  className="form-input" 
                  required 
                  value={rentalDays}
                  onChange={e => setRentalDays(Number(e.target.value))}
                />
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: '6px', margin: '1rem 0', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Duration:</span>
                  <span>{rentalDays} Days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, borderTop: '1px solid var(--border)', paddingTop: '6px', marginTop: '6px' }}>
                  <span>Estimated Total:</span>
                  <span style={{ color: 'var(--text-main)' }}>₹{(selectedItem.dailyRate * rentalDays).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add Lease to Unified Cart</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
