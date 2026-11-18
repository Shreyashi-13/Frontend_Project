import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus } from 'lucide-react';

export default function Materials() {
  const { store, addToCart, activeRole, currentUser } = useApp();

  const handleAddToCart = (material) => {
    addToCart({
      id: material.id,
      type: 'MATERIAL',
      name: material.name,
      image: material.image,
      unit: material.unit,
      price: material.price,
      quantity: 1
    });
  };

  // Provider should only see materials they provided
  const displayedMaterials = activeRole === 'PROVIDER'
    ? store.materials.filter(m => m.providerId === currentUser?.id || !m.providerId)
    : store.materials;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          {activeRole === 'PROVIDER' ? 'My Materials Inventory' : 'Construction Materials Marketplace'}
        </h1>
        <p className="page-subtitle">
          {activeRole === 'PROVIDER'
            ? 'Manage and monitor your supplied building materials stock and pricing'
            : 'Direct factory & distributor procurement of cement, steel rebars, aggregates and bricks'}
        </p>
      </div>

      {displayedMaterials.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No materials found for your provider account.
        </div>
      ) : (
        <div className="card-grid">
          {displayedMaterials.map(m => (
            <div key={m.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '175px', width: '100%', position: 'relative', overflow: 'hidden', background: '#eceee6' }}>
                <img 
                  src={m.image} 
                  alt={m.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span className="role-badge" style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.95)', border: 'none', color: '#111' }}>
                  {m.category}
                </span>
              </div>

              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: 'var(--text-main)' }}>{m.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', flex: 1 }}>{m.description}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Unit: {m.unit}</span>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>₹{m.price.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', textAlign: 'right' }}>Stock: {m.stock}</span>
                    {activeRole !== 'PROVIDER' && (
                      <button 
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: '0.25rem' }}
                        onClick={() => handleAddToCart(m)}
                        disabled={m.stock <= 0}
                      >
                        <Plus size={14} /> Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
