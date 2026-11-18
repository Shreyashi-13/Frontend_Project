import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, CreditCard, Smartphone, Building, CheckCircle, Lock } from 'lucide-react';

export default function PaymentGatewayModal({ isOpen, onClose, amount, title, onSuccess }) {
  const [method, setMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'NETBANKING'
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', exp: '', cvv: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePay = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Realistic simulated bank processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        onSuccess({
          gatewayOrderId: `rzp_sim_${Date.now()}`,
          paymentId: `pay_${Date.now()}_instant`,
          method
        });
      }, 900);
    }, 1200);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', padding: 0, overflow: 'hidden' }}>
        {/* Gateway Header */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-yellow)', fontSize: '0.85rem', fontWeight: 800 }}>
              <Lock size={14} /> OBRIX SECURE PAY GATEWAY
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--text-main)' }}>{title || 'Checkout Settlement'}</h4>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Total Payable</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--accent-yellow)' }}>₹{Number(amount).toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {paymentSuccess ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--success)', display: 'inline-block', marginBottom: '1rem' }}>
              <CheckCircle size={52} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Payment Authorized & Verified!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Transaction signed with 256-bit banking encryption. Generating tax invoice...
            </p>
          </div>
        ) : (
          <form onSubmit={handlePay} style={{ padding: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Select Payment Mode</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${method === 'UPI' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flexDirection: 'column', gap: '0.3rem', padding: '0.75rem 0.5rem' }}
                onClick={() => setMethod('UPI')}
              >
                <Smartphone size={18} />
                <span style={{ fontSize: '0.75rem' }}>UPI / QR</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${method === 'CARD' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flexDirection: 'column', gap: '0.3rem', padding: '0.75rem 0.5rem' }}
                onClick={() => setMethod('CARD')}
              >
                <CreditCard size={18} />
                <span style={{ fontSize: '0.75rem' }}>Cards</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${method === 'NETBANKING' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flexDirection: 'column', gap: '0.3rem', padding: '0.75rem 0.5rem' }}
                onClick={() => setMethod('NETBANKING')}
              >
                <Building size={18} />
                <span style={{ fontSize: '0.75rem' }}>NetBanking</span>
              </button>
            </div>

            {method === 'UPI' && (
              <div className="form-group">
                <label className="form-label">Virtual Payment Address (VPA) / UPI ID</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="name@okhdfcbank or 9810012345@upi"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                />
                <small style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Supported: Google Pay, PhonePe, Paytm, BHIM UPI
                </small>
              </div>
            )}

            {method === 'CARD' && (
              <>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    maxLength={19}
                    placeholder="4532 •••• •••• 8821"
                    value={cardDetails.number}
                    onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="08/28"
                      value={cardDetails.exp}
                      onChange={e => setCardDetails({ ...cardDetails, exp: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input
                      type="password"
                      className="form-input"
                      required
                      maxLength={4}
                      placeholder="•••"
                      value={cardDetails.cvv}
                      onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            {method === 'NETBANKING' && (
              <div className="form-group">
                <label className="form-label">Select Primary Bank</label>
                <select className="form-select">
                  <option>HDFC Bank Corporate / Retail</option>
                  <option>State Bank of India (SBI)</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '0.5rem', margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={18} color="var(--success)" />
              <span>OBRIX Escrow Protection: Funds safely released upon verified delivery or milestone confirmation.</span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '0.75rem' }}
                disabled={isProcessing}
              >
                {isProcessing ? 'Verifying with Bank...' : `Authorize ₹${Number(amount).toLocaleString('en-IN')}`}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isProcessing}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
