import React from 'react';
import { useApp } from '../context/AppContext';
import { Building2, ShoppingCart, Truck, Users, ArrowRight } from 'lucide-react';

export default function Home() {
  const { setActiveTab } = useApp();

  return (
    <div>
      <div style={{ textAlign: 'center', margin: '3rem auto 4rem', maxWidth: '800px' }}>
        <span className="role-badge" style={{ marginBottom: '1rem', display: 'inline-block' }}>
          End-to-End Construction Infrastructure
        </span>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
          One Unified Platform for <span style={{ color: 'var(--accent-yellow)' }}>Building India</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          Connecting companies, certified contractors, skilled workforce, material suppliers, and heavy equipment leasing in one transparent ecosystem.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }} onClick={() => setActiveTab('projects')}>
            Explore Active Projects <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }} onClick={() => setActiveTab('materials')}>
            Procure Materials
          </button>
        </div>
      </div>

      <div className="card-grid" style={{ marginTop: '3rem' }}>
        <div className="card" onClick={() => setActiveTab('projects')} style={{ cursor: 'pointer' }}>
          <div style={{ color: 'var(--accent-yellow)', marginBottom: '1rem' }}>
            <Building2 size={32} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Company Tender Management</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Publish projects, review contractor bids with itemized breakdowns for materials, labour, and machinery.
          </p>
        </div>

        <div className="card" onClick={() => setActiveTab('materials')} style={{ cursor: 'pointer' }}>
          <div style={{ color: 'var(--accent-yellow)', marginBottom: '1rem' }}>
            <ShoppingCart size={32} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Materials Marketplace</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Direct factory procurement of UltraTech cement, Tata Tiscon TMT rebars, and kiln-fired bricks with cart checkout.
          </p>
        </div>

        <div className="card" onClick={() => setActiveTab('equipment')} style={{ cursor: 'pointer' }}>
          <div style={{ color: 'var(--accent-yellow)', marginBottom: '1rem' }}>
            <Truck size={32} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Heavy Machinery Leasing</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Book JCB backhoe loaders, hydraulic mobile cranes, and transit mixers with operators and unlease controls.
          </p>
        </div>

        <div className="card" onClick={() => setActiveTab('workers')} style={{ cursor: 'pointer' }}>
          <div style={{ color: 'var(--accent-yellow)', marginBottom: '1rem' }}>
            <Users size={32} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Skilled Labor On-Demand</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Direct contractor and customer hiring of verified masons, certified electricians, and structural supervisors.
          </p>
        </div>
      </div>
    </div>
  );
}
