import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Send } from 'lucide-react';

export default function Projects() {
  const { store, currentUser, activeRole, submitBid, setActiveTab } = useApp();
  const [selectedProject, setSelectedProject] = useState(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidForm, setBidForm] = useState({
    totalAmount: '',
    days: '',
    proposalText: '',
    materialCost: '',
    labourCost: '',
    equipmentCost: ''
  });

  // Only registered CONTRACTORS can bid on projects
  const canBid = activeRole === 'CONTRACTOR';

  const handleOpenBid = (p) => {
    if (!currentUser) {
      alert('Please sign in to place a quotation');
      setActiveTab('login');
      return;
    }

    if (!canBid) return;

    if (currentUser?.pendingPenaltyDue > 0) {
      alert(`Bidding Blocked: You have an unpaid Contractual Unlease Penalty of ₹${currentUser.pendingPenaltyDue.toLocaleString('en-IN')}. Settle it in your Operating Funds first.`);
      return;
    }

    setSelectedProject(p);
    setShowBidModal(true);
  };

  const handleBidSubmit = (e) => {
    e.preventDefault();
    try {
      submitBid({
        projectId: selectedProject.id,
        totalAmount: bidForm.totalAmount,
        days: bidForm.days,
        proposalText: bidForm.proposalText,
        breakdown: {
          materials: Number(bidForm.materialCost) || 0,
          labour: Number(bidForm.labourCost) || 0,
          equipment: Number(bidForm.equipmentCost) || 0
        }
      });
      alert('✅ Contractor bid and quotation submitted to the company!');
      setShowBidModal(false);
      setBidForm({ totalAmount: '', days: '', proposalText: '', materialCost: '', labourCost: '', equipmentCost: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Construction Projects & Tenders</h1>
        <p className="page-subtitle">Commercial & residential projects published by Companies for verified Contractor bidding</p>
      </div>

      <div className="card-grid">
        {store.projects.map(p => (
          <div key={p.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className="role-badge" style={{ fontSize: '0.7rem' }}>{p.category}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={13} /> {p.city}
              </span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>{p.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', minHeight: '50px' }}>
              {p.description.slice(0, 140)}...
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ display: 'block', color: 'var(--text-dim)', fontSize: '0.75rem' }}>Budget</span>
                <strong style={{ color: 'var(--text-main)' }}>₹{(p.budget).toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span style={{ display: 'block', color: 'var(--text-dim)', fontSize: '0.75rem' }}>Duration</span>
                <strong>{p.durationDays} Days</strong>
              </div>
              <div>
                <span style={{ display: 'block', color: 'var(--text-dim)', fontSize: '0.75rem' }}>Status</span>
                <strong style={{ color: p.status === 'ACTIVE' ? 'var(--success)' : '#2563eb' }}>{p.status}</strong>
              </div>
            </div>

            {/* ONLY DISPLAY BID BUTTON IF LOGGED IN AS CONTRACTOR OR GUEST */}
            {p.status === 'OPEN_FOR_BIDS' && (canBid || !currentUser) && (
              <button 
                className="btn btn-primary btn-sm" 
                style={{ width: '100%' }}
                onClick={() => handleOpenBid(p)}
              >
                <Send size={14} /> Submit Contractor Bid & Quotation
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Bid Modal */}
      {showBidModal && selectedProject && (
        <div className="modal-backdrop" onClick={() => setShowBidModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>Contractor Bid: {selectedProject.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Project Budget: ₹{selectedProject.budget.toLocaleString('en-IN')} · Provide detailed cost breakdown
            </p>

            <form onSubmit={handleBidSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Total Bid Amount (₹)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required 
                    value={bidForm.totalAmount}
                    onChange={e => setBidForm({ ...bidForm, totalAmount: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Days</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required 
                    value={bidForm.days}
                    onChange={e => setBidForm({ ...bidForm, days: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>RESOURCE & COST BREAKDOWN</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Materials (₹)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                      value={bidForm.materialCost}
                      onChange={e => setBidForm({ ...bidForm, materialCost: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Labour (₹)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                      value={bidForm.labourCost}
                      onChange={e => setBidForm({ ...bidForm, labourCost: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Machinery (₹)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                      value={bidForm.equipmentCost}
                      onChange={e => setBidForm({ ...bidForm, equipmentCost: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Execution Strategy & Team Proposal</label>
                <textarea 
                  className="form-textarea" 
                  rows={3} 
                  required
                  placeholder="Workforce size, structural compliance, safety protocols..."
                  value={bidForm.proposalText}
                  onChange={e => setBidForm({ ...bidForm, proposalText: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirm Bid</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBidModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
