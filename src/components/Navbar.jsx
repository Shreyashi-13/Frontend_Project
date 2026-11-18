import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  LogOut, 
  ArrowRightLeft, 
  PlusCircle, 
  Receipt,
  ShoppingCart,
  Sun,
  Moon,
  Wallet
} from 'lucide-react';
import UnifiedCartModal from './UnifiedCartModal';

export default function Navbar() {
  const { 
    currentUser, 
    activeRole, 
    activeTab, 
    setActiveTab, 
    logout, 
    switchRole, 
    onboardProvider, 
    cart, 
    theme, 
    toggleTheme 
  } = useApp();

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  const [providerForm, setProviderForm] = useState({
    businessName: '',
    gstin: '',
    canSellMaterials: true,
    canRentEquipment: true,
    canOfferServices: false
  });

  const cartCount = cart.length;

  const handleRoleSwitch = (role) => {
    switchRole(role);
    setShowRoleModal(false);
  };

  const handleOnboardingSubmit = (e) => {
    e.preventDefault();
    onboardProvider(providerForm);
    setShowOnboardModal(false);
    alert('Account upgraded to Provider! You can now list materials and heavy equipment.');
  };

  // Visibility flags based on exact requested role permissions:
  // COMPANY: my workspace, projects and tenders, payments
  // WORKER: my workspace, workforce, payments, materials
  // PROVIDER: my workspace, machinery (equipment), materials (provider's own), payments
  // CONTRACTOR: full ecosystem access (workspace, projects, materials, equipment, workers, payments)
  // CUSTOMER / GUEST: standard marketplace access

  const showProjects = !currentUser || activeRole === 'COMPANY' || activeRole === 'CONTRACTOR';
  const showMaterials = !currentUser || activeRole === 'WORKER' || activeRole === 'PROVIDER' || activeRole === 'CONTRACTOR' || activeRole === 'CUSTOMER';
  const showEquipment = !currentUser || activeRole === 'PROVIDER' || activeRole === 'CONTRACTOR' || activeRole === 'CUSTOMER';
  const showWorkers = !currentUser || activeRole === 'WORKER' || activeRole === 'CONTRACTOR' || activeRole === 'CUSTOMER';
  const showCart = !currentUser || activeRole === 'CONTRACTOR' || activeRole === 'CUSTOMER';

  return (
    <>
      <nav className="navbar">
        <button className="nav-brand" onClick={() => setActiveTab('home')}>
          <div className="nav-brand-icon">O</div>
          <span>OBRIX</span>
        </button>

        <div className="nav-links">
          {currentUser && (
            <button 
              className={`nav-btn ${activeTab === 'workspace' ? 'active' : ''}`}
              onClick={() => setActiveTab('workspace')}
              style={{ fontWeight: 700 }}
            >
              My Workspace
            </button>
          )}

          {showProjects && (
            <button 
              className={`nav-btn ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              Projects & Tenders
            </button>
          )}

          {showMaterials && (
            <button 
              className={`nav-btn ${activeTab === 'materials' ? 'active' : ''}`}
              onClick={() => setActiveTab('materials')}
            >
              Materials Marketplace
            </button>
          )}

          {showEquipment && (
            <button 
              className={`nav-btn ${activeTab === 'equipment' ? 'active' : ''}`}
              onClick={() => setActiveTab('equipment')}
            >
              Machinery Leases
            </button>
          )}

          {showWorkers && (
            <button 
              className={`nav-btn ${activeTab === 'workers' ? 'active' : ''}`}
              onClick={() => setActiveTab('workers')}
            >
              Workforce
            </button>
          )}

          {currentUser && (
            <button 
              className={`nav-btn ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Receipt size={15} /> Payments & Invoices
            </button>
          )}
        </div>

        <div className="nav-user">
          {/* Dark / Light Mode Switcher */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{ padding: '0.45rem', borderRadius: '50%', width: '34px', height: '34px' }}
          >
            {theme === 'dark' ? <Sun size={16} color="#f7c600" /> : <Moon size={16} color="#111" />}
          </button>

          {/* Unified Procurement Cart Trigger (Shown for buyers/contractors) */}
          {showCart && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setShowCartModal(true)}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
            >
              <ShoppingCart size={15} />
              <span>Cart</span>
              {cartCount > 0 && (
                <span style={{
                  background: '#f7c600',
                  color: '#111',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '10px',
                  fontWeight: 900
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {currentUser ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span className="role-badge">{activeRole}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{currentUser.name}</span>
              </div>

              {/* Multi-role switch button */}
              {currentUser.roles.length > 1 && (
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowRoleModal(true)}
                  title="Switch Active Portal Mode"
                >
                  <ArrowRightLeft size={14} /> Switch
                </button>
              )}

              {/* Customer to Provider Onboarding trigger */}
              {currentUser.roles.includes('CUSTOMER') && !currentUser.roles.includes('PROVIDER') && (
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowOnboardModal(true)}
                >
                  <PlusCircle size={14} /> Become Provider
                </button>
              )}

              {/* Logout with automatic redirect to Home */}
              <button className="btn btn-secondary btn-sm" onClick={logout} title="Sign Out & Return Home">
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('login')}>
              Enter Workspace
            </button>
          )}
        </div>
      </nav>

      {/* Unified Cart Slide-over Modal */}
      <UnifiedCartModal 
        isOpen={showCartModal} 
        onClose={() => setShowCartModal(false)} 
      />

      {/* Switch Role Modal */}
      {showRoleModal && currentUser && (
        <div className="modal-backdrop" onClick={() => setShowRoleModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 800 }}>Switch Active Portal Context</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Select a portal associated with your verified OBRIX account:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {currentUser.roles.map(r => (
                <button
                  key={r}
                  className={`btn ${r === activeRole ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'space-between', padding: '0.85rem 1.25rem' }}
                  onClick={() => handleRoleSwitch(r)}
                >
                  <span>{r} Workspace</span>
                  {r === activeRole && <span style={{ fontSize: '0.8rem' }}>(Current Active)</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Provider Onboarding Modal */}
      {showOnboardModal && (
        <div className="modal-backdrop" onClick={() => setShowOnboardModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 800 }}>Become an OBRIX Provider</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Enable supplier & machinery leasing capabilities on your existing customer account.
            </p>
            <form onSubmit={handleOnboardingSubmit}>
              <div className="form-group">
                <label className="form-label">Business / Entity Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  placeholder="e.g. Apex Building Solutions"
                  value={providerForm.businessName}
                  onChange={e => setProviderForm({ ...providerForm, businessName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">GSTIN / Business Registration ID</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  placeholder="07AAAAA0000A1Z5"
                  value={providerForm.gstin}
                  onChange={e => setProviderForm({ ...providerForm, gstin: e.target.value })}
                />
              </div>
              <div style={{ margin: '1rem 0' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Select Capabilities</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={providerForm.canSellMaterials}
                    onChange={e => setProviderForm({ ...providerForm, canSellMaterials: e.target.checked })}
                  />
                  <span>Sell Construction Materials (Cement, Steel, Bricks)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={providerForm.canRentEquipment}
                    onChange={e => setProviderForm({ ...providerForm, canRentEquipment: e.target.checked })}
                  />
                  <span>Rent Construction Machinery & Equipment (JCB, Cranes, Mixers)</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Complete Onboarding</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowOnboardModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
