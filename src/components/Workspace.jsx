import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Briefcase, 
  Users, 
  Truck, 
  ShoppingBag, 
  Store, 
  Plus, 
  AlertTriangle, 
  Wallet, 
  Check, 
  X, 
  Calendar,
  ShieldAlert
} from 'lucide-react';

export default function Workspace() {
  const { 
    currentUser, 
    activeRole, 
    store, 
    unleaseEquipment, 
    payPenaltyFromFunds, 
    topupFunds, 
    publishProject, 
    acceptBid, 
    addMaterial, 
    addEquipment, 
    updateWorkerProfile, 
    respondWorkerJob 
  } = useApp();

  // Modals state
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('50000');
  const [showProjModal, setShowProjModal] = useState(false);
  const [newProj, setNewProj] = useState({ title: '', budget: '', durationDays: 120, area: '20,000 sq ft', description: '' });
  const [showMatModal, setShowMatModal] = useState(false);
  const [newMat, setNewMat] = useState({ name: '', price: '', unit: 'Bag (50kg)', stock: 500, description: '' });
  const [showEqModal, setShowEqModal] = useState(false);
  const [newEq, setNewEq] = useState({ name: '', dailyRate: '', specs: '', description: '' });

  if (!currentUser) return <p style={{ color: 'var(--text-muted)' }}>Please log in to view workspace.</p>;

  const pendingPenalty = currentUser.pendingPenaltyDue || 0;
  const escrowBalance = currentUser.escrowBalance || 0;

  // Contractor Unlease Action
  const handleUnlease = (rentalId, equipmentName, dailyRate, totalPrice) => {
    const penaltyEstimate = Math.max(Math.round(totalPrice * 0.20), dailyRate || 1000);
    const confirmed = window.confirm(
      `⚠️ CONTRACTUAL UNLEASE WARNING\n\nEarly termination of '${equipmentName}' will incur a mandatory contractual punishment penalty of ₹${penaltyEstimate.toLocaleString('en-IN')}.\n\nThis penalty will be added to your account debt. You will NOT be able to bid on projects, lease machinery, or order materials until this penalty is cleared.\n\nProceed with unlease?`
    );
    if (!confirmed) return;

    try {
      const fee = unleaseEquipment(rentalId);
      alert(`✅ Machinery ${equipmentName} unleased. An unpaid contractual penalty fee of ₹${fee.toLocaleString('en-IN')} has been added to your Contractor Funds.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePayPenalty = () => {
    try {
      payPenaltyFromFunds();
      alert('✅ Penalty paid and cleared from Contractor Funds! All bidding and procurement restrictions have been lifted.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTopup = (e) => {
    e.preventDefault();
    try {
      topupFunds(topupAmount);
      setShowTopupModal(false);
      alert(`✅ ₹${Number(topupAmount).toLocaleString('en-IN')} added to Operating Funds!`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Workspace Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="role-badge">{activeRole} WORKSPACE</span>
          <h1 className="page-title" style={{ marginTop: '0.4rem' }}>{currentUser.name}</h1>
          <p className="page-subtitle">City: {currentUser.city} · Registered Account Dashboard</p>
        </div>

        {/* Contractor Operating Funds & Penalty Widget */}
        {activeRole === 'CONTRACTOR' && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
          }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Wallet size={13} color="var(--accent-yellow)" /> Contractor Operating Funds
              </span>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                ₹{escrowBalance.toLocaleString('en-IN')}
              </div>
            </div>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setShowTopupModal(true)}
              style={{ fontWeight: 700 }}
            >
              <Plus size={14} /> Add Funds
            </button>
          </div>
        )}
      </div>

      {/* PENALTY WARNING BANNER IF CONTRACTOR OWES UNLEASE PUNISHMENT FEES */}
      {activeRole === 'CONTRACTOR' && pendingPenalty > 0 && (
        <div style={{
          background: 'rgba(180, 35, 24, 0.08)',
          border: '1px solid rgba(180, 35, 24, 0.4)',
          borderRadius: '10px',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          animation: 'smoothFadeUp 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: '#b42318', color: '#fff', padding: '0.5rem', borderRadius: '50%' }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#b42318', margin: 0 }}>
                Unpaid Unlease Punishment Penalty: ₹{pendingPenalty.toLocaleString('en-IN')}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Account Restricted: You are blocked from bidding on tenders, leasing machinery, and checking out materials until this penalty is cleared.
              </p>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ background: '#b42318', color: '#fff', borderColor: '#991b1b' }}
            disabled={escrowBalance < pendingPenalty}
            onClick={handlePayPenalty}
          >
            {escrowBalance < pendingPenalty 
              ? 'Insufficient Funds (Top-up required)' 
              : `Deduct & Settle ₹${pendingPenalty.toLocaleString('en-IN')}`}
          </button>
        </div>
      )}

      {/* 1. CONTRACTOR WORKSPACE VIEW */}
      {activeRole === 'CONTRACTOR' && (
        <div>
          {/* Leased Fleet with UNLEASE control */}
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>Leased Heavy Machinery Fleet on Site</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
            {store.rentals.filter(r => r.renterId === currentUser.id).length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No machinery leased right now. Browse Machinery Leases to rent excavators, cranes or mixers.
              </div>
            ) : (
              store.rentals.filter(r => r.renterId === currentUser.id).map(rental => {
                const isTerminated = rental.status === 'TERMINATED';
                return (
                  <div 
                    key={rental.id} 
                    className="card" 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      flexWrap: 'wrap', 
                      gap: '1rem',
                      borderLeft: isTerminated ? '4px solid #b42318' : '4px solid #258544'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{rental.equipmentName}</strong>
                        <span className="role-badge" style={{ fontSize: '0.65rem' }}>{rental.status}</span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                        Leased for {rental.totalDays} Days · Starts: {rental.startDate} · Tariff: ₹{(rental.dailyRate || 6500).toLocaleString('en-IN')}/day
                      </p>
                      {isTerminated && rental.cancellation && (
                        <small style={{ color: '#b42318', display: 'block', marginTop: '0.35rem', fontWeight: 600 }}>
                          Contract Terminated Early · Punishment fee incurred: ₹{rental.cancellation.punishmentFee.toLocaleString('en-IN')}
                        </small>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Total Commitment</span>
                        <strong style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>₹{rental.totalPrice.toLocaleString('en-IN')}</strong>
                      </div>

                      {!isTerminated && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#b42318', borderColor: 'rgba(180, 35, 24, 0.3)', background: 'rgba(180, 35, 24, 0.05)' }}
                          onClick={() => handleUnlease(rental.id, rental.equipmentName, rental.dailyRate || 6500, rental.totalPrice)}
                        >
                          <AlertTriangle size={14} /> Unlease Machine (Penalty fee)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Awarded Project Sites */}
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>Awarded Project Contracts</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
            {store.projects.filter(p => p.contractorId === currentUser.id).map(proj => (
              <div key={proj.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="role-badge" style={{ fontSize: '0.7rem' }}>{proj.category}</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0.3rem 0', color: 'var(--text-main)' }}>{proj.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Location: {proj.city} · Duration: {proj.durationDays} Days</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Contract Value</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>₹{proj.budget.toLocaleString('en-IN')}</strong>
                  <span className="role-badge" style={{ marginTop: '0.25rem', display: 'inline-block' }}>{proj.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Hired Workforce Team */}
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>Assigned Site Tradesmen</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {store.workerRequests.filter(r => r.fromId === currentUser.id).map(req => (
              <div key={req.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{req.workerName} · {req.title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Start Date: {req.startDate} · Duration: {req.durationDays} Days</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Daily Wage</span>
                  <strong style={{ color: 'var(--text-main)' }}>₹{req.dailyRate} / Day</strong>
                  <span className="role-badge" style={{ fontSize: '0.7rem', marginTop: '0.2rem', display: 'inline-block' }}>{req.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. COMPANY WORKSPACE VIEW */}
      {activeRole === 'COMPANY' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Company Project Tenders</h2>
            <button className="btn btn-primary" onClick={() => setShowProjModal(true)}>
              <Plus size={16} /> Publish Project Tender
            </button>
          </div>

          {/* Published Projects & Received Bids */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {store.projects.filter(p => p.companyId === currentUser.id).map(proj => {
              const projectBids = store.bids.filter(b => b.projectId === proj.id);
              return (
                <div key={proj.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <span className="role-badge">{proj.category}</span>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.3rem 0', color: 'var(--text-main)' }}>{proj.title}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{proj.description}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Project Budget</span>
                      <strong style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>₹{proj.budget.toLocaleString('en-IN')}</strong>
                      <span className="role-badge" style={{ marginTop: '0.25rem', display: 'inline-block' }}>{proj.status}</span>
                    </div>
                  </div>

                  {/* Bids received for this project */}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-dim)' }}>
                      CONTRACTOR BIDS RECEIVED ({projectBids.length})
                    </h4>
                    {projectBids.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>No contractor quotations submitted yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {projectBids.map(bid => (
                          <div key={bid.id} style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>{bid.contractorName}</strong>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '2px 0' }}>{bid.proposalText}</p>
                              <small style={{ color: 'var(--text-dim)' }}>
                                Breakdown: Materials ₹{bid.breakdown?.materials?.toLocaleString('en-IN')} | Labour ₹{bid.breakdown?.labour?.toLocaleString('en-IN')} | Machinery ₹{bid.breakdown?.equipment?.toLocaleString('en-IN')}
                              </small>
                            </div>
                            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div>
                                <strong style={{ fontSize: '1.15rem', color: 'var(--text-main)', display: 'block' }}>₹{bid.totalAmount.toLocaleString('en-IN')}</strong>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{bid.days} Days</span>
                              </div>
                              {bid.status === 'SUBMITTED' && (
                                <button className="btn btn-primary btn-sm" onClick={() => acceptBid(bid.id)}>
                                  Award Contract
                                </button>
                              )}
                              {bid.status === 'ACCEPTED' && (
                                <span className="role-badge" style={{ background: '#258544', color: '#fff' }}>AWARDED</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. PROVIDER WORKSPACE VIEW */}
      {activeRole === 'PROVIDER' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Provider Catalog & Machinery Fleet</h2>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowMatModal(true)}>
                <Plus size={14} /> Add Material Listing
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowEqModal(true)}>
                <Plus size={14} /> Add Machinery Fleet
              </button>
            </div>
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Listed Materials for Sale</h3>
          <div className="card-grid" style={{ marginBottom: '2.5rem' }}>
            {store.materials.filter(m => m.providerId === currentUser.id).map(m => (
              <div key={m.id} className="card">
                <span className="role-badge">{m.category}</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.4rem 0', color: 'var(--text-main)' }}>{m.name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  <span>Price: <strong>₹{m.price}</strong> / {m.unit}</span>
                  <span>Stock: <strong>{m.stock}</strong></span>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Heavy Equipment Fleet for Lease</h3>
          <div className="card-grid">
            {store.equipment.filter(e => e.providerId === currentUser.id).map(e => (
              <div key={e.id} className="card">
                <span className="role-badge">{e.category}</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.4rem 0', color: 'var(--text-main)' }}>{e.name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  <span>Tariff: <strong>₹{e.dailyRate} / day</strong></span>
                  <span style={{ color: e.available ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                    {e.available ? '● Available' : '● Leased Out'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CUSTOMER WORKSPACE VIEW */}
      {activeRole === 'CUSTOMER' && (
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>Your Orders & Bookings</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {store.orders.filter(o => o.customerId === currentUser.id).length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No material orders placed yet. Browse the Materials Marketplace to purchase supplies.
              </div>
            ) : (
              store.orders.filter(o => o.customerId === currentUser.id).map(ord => (
                <div key={ord.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Order #{ord.id}</strong>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0' }}>
                      {ord.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                    </p>
                    <small style={{ color: 'var(--text-dim)' }}>Delivery to: {ord.deliveryAddress}</small>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="role-badge" style={{ marginBottom: '0.25rem', display: 'inline-block' }}>{ord.status}</span>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)', display: 'block' }}>₹{ord.totalAmount.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. WORKER WORKSPACE VIEW */}
      {activeRole === 'WORKER' && (
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>Incoming Job Invitations from Contractors & Customers</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {store.workerRequests.filter(r => r.workerId === currentUser.id).length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No active invitations right now. Your profile is set to Available.
              </div>
            ) : (
              store.workerRequests.filter(r => r.workerId === currentUser.id).map(req => (
                <div key={req.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span className="role-badge" style={{ fontSize: '0.7rem' }}>From {req.fromRole}: {req.fromName}</span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.3rem 0', color: 'var(--text-main)' }}>{req.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Starts: {req.startDate} · Expected Duration: {req.durationDays} Days
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)', display: 'block' }}>₹{req.dailyRate} / Day</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Total: ₹{(req.dailyRate * req.durationDays).toLocaleString('en-IN')}</span>
                    </div>
                    {req.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => respondWorkerJob(req.id, 'ACCEPTED')}>
                          Accept Job
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => respondWorkerJob(req.id, 'REJECTED')}>
                          Decline
                        </button>
                      </div>
                    ) : (
                      <span className="role-badge">{req.status}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Topup Modal */}
      {showTopupModal && (
        <div className="modal-backdrop" onClick={() => setShowTopupModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Top Up Operating Funds</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Add funds to cover project material purchases, machinery lease escrow, and penalty settlements.
            </p>

            <form onSubmit={handleTopup}>
              <div className="form-group">
                <label className="form-label">Deposit Amount (₹)</label>
                <input 
                  type="number" 
                  step="5000"
                  min="5000"
                  className="form-input" 
                  required 
                  value={topupAmount}
                  onChange={e => setTopupAmount(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setTopupAmount('25000')}>+ ₹25,000</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setTopupAmount('50000')}>+ ₹50,000</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setTopupAmount('100000')}>+ ₹1,00,000</button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirm Deposit</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTopupModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Publish Project Modal */}
      {showProjModal && (
        <div className="modal-backdrop" onClick={() => setShowProjModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Publish Construction Tender</h3>
            <form onSubmit={(e) => { e.preventDefault(); publishProject(newProj); setShowProjModal(false); }}>
              <div className="form-group">
                <label className="form-label">Project Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="e.g. Cyber City Tower IV Finishing"
                  value={newProj.title}
                  onChange={e => setNewProj({ ...newProj, title: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Budget (₹)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required 
                    value={newProj.budget}
                    onChange={e => setNewProj({ ...newProj, budget: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (Days)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required 
                    value={newProj.durationDays}
                    onChange={e => setNewProj({ ...newProj, durationDays: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Scope & Requirements</label>
                <textarea 
                  className="form-textarea" 
                  rows={3} 
                  required
                  value={newProj.description}
                  onChange={e => setNewProj({ ...newProj, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Publish Tender</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowProjModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Material Modal */}
      {showMatModal && (
        <div className="modal-backdrop" onClick={() => setShowMatModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>List Construction Material</h3>
            <form onSubmit={(e) => { e.preventDefault(); addMaterial(newMat); setShowMatModal(false); }}>
              <div className="form-group">
                <label className="form-label">Material Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="e.g. ACC Gold Shield Cement"
                  value={newMat.name}
                  onChange={e => setNewMat({ ...newMat, name: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Price per Unit (₹)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required 
                    value={newMat.price}
                    onChange={e => setNewMat({ ...newMat, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Available Stock</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required 
                    value={newMat.stock}
                    onChange={e => setNewMat({ ...newMat, stock: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>List Product</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowMatModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Equipment Modal */}
      {showEqModal && (
        <div className="modal-backdrop" onClick={() => setShowEqModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Add Machinery to Rental Fleet</h3>
            <form onSubmit={(e) => { e.preventDefault(); addEquipment(newEq); setShowEqModal(false); }}>
              <div className="form-group">
                <label className="form-label">Machine Model & Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="e.g. CAT 320D Hydraulic Excavator"
                  value={newEq.name}
                  onChange={e => setNewEq({ ...newEq, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Daily Tariff (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  required 
                  placeholder="8500"
                  value={newEq.dailyRate}
                  onChange={e => setNewEq({ ...newEq, dailyRate: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add Machine</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEqModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
