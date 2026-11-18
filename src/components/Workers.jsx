import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, UserPlus } from 'lucide-react';

export default function Workers() {
  const { store, currentUser, activeRole, addToCart, setActiveTab } = useApp();
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hireDuration, setHireDuration] = useState(7);
  const [roleTitle, setRoleTitle] = useState('Site Construction Crew Member');

  // ONLY Contractors and Customers can hire workers.
  // Workers and Providers cannot hire workers.
  const canHire = activeRole === 'CONTRACTOR' || activeRole === 'CUSTOMER';
  const workerList = store.users.filter(u => u.roles.includes('WORKER'));

  const handleHireClick = (w) => {
    if (!currentUser) {
      alert('Please sign in to hire site crew.');
      setActiveTab('login');
      return;
    }

    if (!canHire) return;

    if (currentUser.id === w.id) {
      alert('You cannot hire yourself.');
      return;
    }

    setSelectedWorker(w);
    setShowModal(true);
  };

  const handleAddHireToCart = (e) => {
    e.preventDefault();
    addToCart({
      id: selectedWorker.id,
      type: 'WORKER_HIRE',
      name: `${selectedWorker.name} (${roleTitle})`,
      image: selectedWorker.image,
      dailyRate: selectedWorker.dailyRate,
      durationDays: hireDuration,
      title: roleTitle,
      startDate: new Date().toISOString().split('T')[0]
    });
    setShowModal(false);
    alert(`👷 ${selectedWorker.name} (${hireDuration} Days assignment) added to your procurement cart!`);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Direct Skilled Workforce Hiring</h1>
        <p className="page-subtitle">
          Verified Indian construction tradesmen (Master Masons, Wiremen, Formwork Carpenters, Site Supervisors)
        </p>
      </div>

      <div className="card-grid">
        {workerList.map(w => {
          const isMe = currentUser?.id === w.id;
          return (
            <div key={w.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '175px', width: '100%', position: 'relative', overflow: 'hidden', background: '#eceee6' }}>
                <img 
                  src={w.image} 
                  alt={w.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span className="role-badge" style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.95)', border: 'none', color: '#111' }}>
                  ★ {w.rating || '4.9'} Verified
                </span>
                <span style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '12px',
                  background: 'rgba(17, 24, 39, 0.85)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <MapPin size={11} /> {w.city}
                </span>
              </div>

              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.3rem 0', color: 'var(--text-main)' }}>
                  {w.name} {isMe && <span style={{ fontSize: '0.75rem', color: 'var(--accent-yellow)' }}>(You)</span>}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem', flex: 1 }}>{w.bio}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                  {w.skills?.map(skill => (
                    <span key={skill} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {skill}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Daily Wage</span>
                    <strong style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>₹{w.dailyRate} / Day</strong>
                  </div>

                  {/* ONLY SHOW HIRE BUTTON IF CONTRACTOR OR CUSTOMER (OR GUEST PROMPTING LOGIN).
                      COMPLETELY HIDDEN FOR WORKERS AND RESTRICTED ROLES */}
                  {(canHire || !currentUser) && !isMe && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleHireClick(w)}
                    >
                      <UserPlus size={14} /> Add Hire to Cart
                    </button>
                  )}

                  {isMe && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>Your Profile</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hire Modal for Cart */}
      {showModal && selectedWorker && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
              <img src={selectedWorker.image} alt={selectedWorker.name} style={{ width: '65px', height: '65px', objectFit: 'cover', borderRadius: '50%' }} />
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-main)' }}>Hire {selectedWorker.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  ₹{selectedWorker.dailyRate} / Day · {selectedWorker.city}
                </p>
              </div>
            </div>

            <form onSubmit={handleAddHireToCart}>
              <div className="form-group">
                <label className="form-label">Job Role & Scope</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={roleTitle}
                  onChange={e => setRoleTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Work Assignment Duration (Days)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="90"
                  className="form-input" 
                  required 
                  value={hireDuration}
                  onChange={e => setHireDuration(Number(e.target.value))}
                />
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: '6px', margin: '1rem 0', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Duration:</span>
                  <span>{hireDuration} Days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, borderTop: '1px solid var(--border)', paddingTop: '6px', marginTop: '6px' }}>
                  <span>Total Wage Commitment:</span>
                  <span style={{ color: 'var(--text-main)' }}>₹{(selectedWorker.dailyRate * hireDuration).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add Hire to Unified Cart</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
