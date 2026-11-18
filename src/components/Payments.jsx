import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowDownLeft, ArrowUpRight, FileText, CheckCircle2 } from 'lucide-react';

export default function Payments() {
  const { store, currentUser } = useApp();
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  if (!currentUser) return <p style={{ color: 'var(--text-muted)' }}>Please log in to view financial records.</p>;

  const userPayments = store.payments.filter(
    p => p.payerId === currentUser.id || p.recipientId === currentUser.id
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Transaction History & Tax Invoices</h1>
        <p className="page-subtitle">Audited financial ledger, milestone releases, and GST compliant invoice generation</p>
      </div>

      {userPayments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No recorded transactions for this account yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {userPayments.map(item => {
            const isPayer = item.payerId === currentUser.id;
            return (
              <div key={item.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: isPayer ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', padding: '0.75rem', borderRadius: '50%', color: isPayer ? 'var(--danger)' : 'var(--success)' }}>
                    {isPayer ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{item.payableType?.replace(/_/g, ' ')}</strong>
                      <span className="role-badge" style={{ fontSize: '0.65rem' }}>{item.status}</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '3px 0' }}>
                      {item.note} · Method: {item.method}
                    </p>
                    <small style={{ color: 'var(--text-dim)' }}>
                      Timestamp: {new Date(item.createdAt).toLocaleString('en-IN')}
                    </small>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>
                      {isPayer ? 'Debit Amount' : 'Credit Amount'}
                    </span>
                    <strong style={{ fontSize: '1.25rem', color: isPayer ? 'var(--text-main)' : 'var(--success)' }}>
                      {isPayer ? '-' : '+'}₹{(item.amount).toLocaleString('en-IN')}
                    </strong>
                    {item.platformFee > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>
                        Platform Fee: ₹{item.platformFee}
                      </span>
                    )}
                  </div>

                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedInvoice(item)}
                  >
                    <FileText size={14} /> View Invoice
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tax Invoice Modal */}
      {selectedInvoice && (
        <div className="modal-backdrop" onClick={() => setSelectedInvoice(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-yellow)' }}>OBRIX TAX INVOICE</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Connected Construction Ecosystem Pvt Ltd</p>
                <small style={{ color: 'var(--text-dim)' }}>GSTIN: 07AAFCO1234F1Z9</small>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="role-badge">{selectedInvoice.invoiceNumber || 'INV-2026-981'}</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Date: {new Date(selectedInvoice.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>Billed To:</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedInvoice.payerName || currentUser.name}</strong>
                <p style={{ color: 'var(--text-muted)' }}>City: Delhi NCR, India</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>Payment Reference:</span>
                <code>{selectedInvoice.id}</code>
                <p style={{ color: 'var(--text-muted)' }}>Status: {selectedInvoice.status}</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem 0' }}>Description</th>
                  <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 0', color: 'var(--text-main)' }}>{selectedInvoice.payableType} · {selectedInvoice.note}</td>
                  <td style={{ padding: '0.75rem 0', textAlign: 'right', color: 'var(--text-main)' }}>₹{selectedInvoice.amount.toLocaleString('en-IN')}</td>
                </tr>
                {selectedInvoice.platformFee > 0 && (
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <td style={{ padding: '0.5rem 0' }}>OBRIX Escrow & Protection Fee</td>
                    <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>₹{selectedInvoice.platformFee.toLocaleString('en-IN')}</td>
                  </tr>
                )}
                <tr>
                  <td style={{ padding: '1rem 0', fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>Total Settled:</td>
                  <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-yellow)' }}>
                    ₹{selectedInvoice.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedInvoice(null)}>Close Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
