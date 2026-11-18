import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Trash2, ArrowRight, Package } from 'lucide-react';
import PaymentGatewayModal from './PaymentGatewayModal';

export default function UnifiedCartModal({ isOpen, onClose }) {
  const { cart, removeFromCart, clearCart, cartTotal, checkoutCart, currentUser } = useApp();
  const [showGateway, setShowGateway] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.city || 'Delhi NCR');

  if (!isOpen) return null;

  const handleProceedPayment = () => {
    if (!currentUser) return alert('Please sign in to complete checkout.');
    if (cart.length === 0) return;
    setShowGateway(true);
  };

  const handlePaymentSuccess = (gatewayResult) => {
    try {
      checkoutCart({
        deliveryAddress,
        paymentMethod: gatewayResult.method
      });
      setShowGateway(false);
      onClose();
      alert(`✅ Payment of ₹${cartTotal.toLocaleString('en-IN')} verified! Materials dispatched, equipment reserved, and trade crew confirmed in your workspace.`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}>
        <div 
          className="modal-content" 
          onClick={e => e.stopPropagation()} 
          style={{ maxWidth: '580px', width: '100%', padding: '1.75rem', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShoppingCart size={22} color="var(--accent-yellow)" />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Contractor Unified Cart</h3>
              <span className="role-badge" style={{ fontSize: '0.7rem' }}>{cart.length} Items</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          </div>

          {/* Cart Items List */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                <ShoppingCart size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Your procurement cart is empty</h4>
                <p style={{ fontSize: '0.85rem' }}>Add materials, lease machinery, or hire trade crew from their hubs.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {cart.map((item, idx) => {
                  let subtotal = 0;
                  if (item.type === 'MATERIAL') subtotal = item.price * (item.quantity || 1);
                  if (item.type === 'EQUIPMENT_LEASE') subtotal = item.dailyRate * (item.days || 1);
                  if (item.type === 'WORKER_HIRE') subtotal = item.dailyRate * (item.durationDays || 1);

                  return (
                    <div 
                      key={`${item.id}-${item.type}-${idx}`} 
                      style={{
                        display: 'flex',
                        gap: '0.85rem',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        alignItems: 'center'
                      }}
                    >
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)', flexShrink: 0 }}
                      />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2px' }}>
                          <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', background: 'var(--bg-card)', padding: '2px 5px', borderRadius: '3px', color: 'var(--text-dim)', border: '1px solid var(--border)' }}>
                            {item.type.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main)' }}>
                          {item.name}
                        </h4>
                        
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                          {item.type === 'MATERIAL' && `Quantity: ${item.quantity} · ₹${item.price}/${item.unit || 'unit'}`}
                          {item.type === 'EQUIPMENT_LEASE' && `Lease: ${item.days} Days · ₹${item.dailyRate}/day`}
                          {item.type === 'WORKER_HIRE' && `Hire: ${item.durationDays} Days · ₹${item.dailyRate}/day wage`}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-main)', display: 'block' }}>
                          ₹{subtotal.toLocaleString('en-IN')}
                        </strong>
                        <button 
                          onClick={() => removeFromCart(item.id, item.type)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px', marginTop: '2px' }}
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Site Delivery / Deployment Address
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  placeholder="Enter project site address in Delhi NCR"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Package Amount:</span>
                <strong style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  ₹{cartTotal.toLocaleString('en-IN')}
                </strong>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '0.85rem' }}
                  onClick={handleProceedPayment}
                >
                  Pay & Confirm All ({cart.length} Items) <ArrowRight size={16} />
                </button>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={clearCart}
                  title="Clear All Items"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <PaymentGatewayModal
        isOpen={showGateway}
        onClose={() => setShowGateway(false)}
        amount={cartTotal}
        title="Unified Construction Procurement & Crew Settlement"
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}
