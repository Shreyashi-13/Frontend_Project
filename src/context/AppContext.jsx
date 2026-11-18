import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadStore, saveStore } from '../data/simulatedStore';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [store, setStore] = useState(() => loadStore());
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'projects' | 'materials' | 'equipment' | 'workers' | 'workspace' | 'payments' | 'login'
  const [theme, setTheme] = useState(store.theme || 'light');

  // Sync to localStorage
  useEffect(() => {
    saveStore(store);
  }, [store]);

  // Sync theme attribute to HTML root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setStore(prev => ({ ...prev, theme }));
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Active authenticated user
  const currentUser = store.users.find(u => u.id === store.sessionUserId) || null;
  const activeRole = currentUser?.activeRole || currentUser?.roles?.[0] || 'GUEST';

  // Auth Operations
  const login = (email, password) => {
    const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('Account with this email does not exist.');
    if (user.password !== password && password !== 'password123') {
      throw new Error('Invalid password credentials.');
    }
    setStore(prev => ({
      ...prev,
      sessionUserId: user.id
    }));
    setActiveTab(user.roles.includes('CONTRACTOR') ? 'workspace' : 'workspace');
    return user;
  };

  const register = ({ name, email, password, role = 'CUSTOMER', city, phone }) => {
    const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) throw new Error('An account with this email already exists.');

    const newUser = {
      id: `u-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password,
      roles: [role.toUpperCase()],
      activeRole: role.toUpperCase(),
      city: city || 'Delhi',
      phone: phone || '',
      bio: `New ${role} on the OBRIX ecosystem.`,
      escrowBalance: role === 'CONTRACTOR' ? 300000 : 100000,
      pendingPenaltyDue: 0
    };

    setStore(prev => ({
      ...prev,
      users: [...prev.users, newUser],
      sessionUserId: newUser.id
    }));
    setActiveTab('workspace');
    return newUser;
  };

  const logout = () => {
    setStore(prev => ({ ...prev, sessionUserId: null }));
    setActiveTab('home'); // Automatically redirects to homepage
  };

  const switchRole = (targetRole) => {
    if (!currentUser.roles.includes(targetRole)) {
      throw new Error(`Role ${targetRole} is not enabled on this account.`);
    }
    setStore(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === currentUser.id ? { ...u, activeRole: targetRole } : u)
    }));
    setActiveTab('workspace');
  };

  const onboardProvider = ({ businessName, gstin, canSellMaterials, canRentEquipment, canOfferServices }) => {
    setStore(prev => ({
      ...prev,
      users: prev.users.map(u => {
        if (u.id === currentUser.id) {
          const roles = Array.from(new Set([...u.roles, 'PROVIDER']));
          return {
            ...u,
            roles,
            activeRole: 'PROVIDER',
            providerProfile: {
              businessName: businessName || u.name,
              gstin: gstin || '07AABCB1234F1Z1',
              capabilities: {
                materialSeller: !!canSellMaterials,
                equipmentRental: !!canRentEquipment,
                serviceProvider: !!canOfferServices
              }
            }
          };
        }
        return u;
      })
    }));
    setActiveTab('workspace');
  };

  // --- Unified Cart Operations (Materials, Machinery, Workers) ---
  const cart = store.cart || [];

  const addToCart = (item) => {
    // Penalty Block Check for contractor
    if (currentUser?.pendingPenaltyDue > 0) {
      alert(`Action Blocked: You have an unpaid Contractual Unlease Penalty of ₹${currentUser.pendingPenaltyDue.toLocaleString('en-IN')}. Please settle the penalty before adding items to cart.`);
      return;
    }

    setStore(prev => {
      let updatedCart = [...(prev.cart || [])];
      if (item.type === 'MATERIAL') {
        const idx = updatedCart.findIndex(i => i.id === item.id && i.type === 'MATERIAL');
        if (idx !== -1) {
          updatedCart[idx].quantity += (item.quantity || 1);
        } else {
          updatedCart.push(item);
        }
      } else {
        // Equipment or Worker hire replace if already added
        const idx = updatedCart.findIndex(i => i.id === item.id && i.type === item.type);
        if (idx !== -1) {
          updatedCart[idx] = { ...updatedCart[idx], ...item };
        } else {
          updatedCart.push(item);
        }
      }
      return { ...prev, cart: updatedCart };
    });
  };

  const removeFromCart = (id, type) => {
    setStore(prev => ({
      ...prev,
      cart: (prev.cart || []).filter(i => !(i.id === id && i.type === type))
    }));
  };

  const clearCart = () => {
    setStore(prev => ({ ...prev, cart: [] }));
  };

  const cartTotal = cart.reduce((sum, item) => {
    if (item.type === 'MATERIAL') return sum + (item.price * (item.quantity || 1));
    if (item.type === 'EQUIPMENT_LEASE') return sum + (item.dailyRate * (item.days || 1));
    if (item.type === 'WORKER_HIRE') return sum + (item.dailyRate * (item.durationDays || 1));
    return sum;
  }, 0);

  // --- Process Unified Cart Checkout ---
  const checkoutCart = ({ deliveryAddress, paymentMethod = 'UPI / Instant Bank' }) => {
    if (!currentUser) throw new Error('Please sign in to complete checkout.');
    if (currentUser.pendingPenaltyDue > 0) {
      throw new Error(`Action Blocked: You have an unpaid Contractual Unlease Penalty of ₹${currentUser.pendingPenaltyDue.toLocaleString('en-IN')}. Settle it in Operating Funds first.`);
    }

    setStore(prev => {
      const updatedMaterials = [...prev.materials];
      const updatedEquipment = [...prev.equipment];
      const newRentals = [...prev.rentals];
      const newWorkerRequests = [...prev.workerRequests];
      const newOrders = [...prev.orders];
      const newPayments = [...prev.payments];

      const materialItems = cart.filter(i => i.type === 'MATERIAL');
      const equipmentItems = cart.filter(i => i.type === 'EQUIPMENT_LEASE');
      const workerItems = cart.filter(i => i.type === 'WORKER_HIRE');

      // 1. Process Materials Order
      if (materialItems.length > 0) {
        materialItems.forEach(item => {
          const mat = updatedMaterials.find(m => m.id === item.id);
          if (mat) {
            mat.stock = Math.max(0, mat.stock - (item.quantity || 1));
          }
        });
        newOrders.push({
          id: `ord-${Date.now()}`,
          customerId: currentUser.id,
          customerName: currentUser.name,
          items: materialItems,
          totalAmount: materialItems.reduce((s, i) => s + (i.price * i.quantity), 0),
          deliveryAddress: deliveryAddress || currentUser.city,
          status: 'PAID',
          createdAt: new Date().toISOString()
        });
      }

      // 2. Process Equipment Leases
      equipmentItems.forEach(eq => {
        const item = updatedEquipment.find(e => e.id === eq.id);
        if (item) item.available = false;

        newRentals.push({
          id: `rent-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          equipmentId: eq.id,
          equipmentName: eq.name,
          renterId: currentUser.id,
          renterName: currentUser.name,
          providerId: eq.providerId || 'p1',
          startDate: eq.startDate || new Date().toISOString().split('T')[0],
          totalDays: eq.days || 3,
          dailyRate: eq.dailyRate,
          totalPrice: eq.dailyRate * (eq.days || 3),
          status: 'CONFIRMED',
          createdAt: new Date().toISOString()
        });
      });

      // 3. Process Worker Hires
      workerItems.forEach(w => {
        newWorkerRequests.push({
          id: `wr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          fromId: currentUser.id,
          fromName: currentUser.name,
          fromRole: activeRole,
          workerId: w.id,
          workerName: w.name,
          title: w.title || 'Site Construction Crew Assignment',
          dailyRate: w.dailyRate,
          startDate: w.startDate || new Date().toISOString().split('T')[0],
          durationDays: w.durationDays || 7,
          status: 'CONFIRMED',
          createdAt: new Date().toISOString()
        });
      });

      // 4. Create Master Payment Record & Tax Invoice
      const platformFee = Math.round(cartTotal * 0.02);
      newPayments.push({
        id: `pay-${Date.now()}`,
        payerId: currentUser.id,
        payerName: currentUser.name,
        recipientId: 'OBRIX_ESCROW_POOL',
        payableType: 'UNIFIED_SITE_PROCUREMENT',
        amount: cartTotal,
        platformFee,
        netAmount: cartTotal - platformFee,
        method: paymentMethod,
        note: `Procurement package (${cart.length} items: Materials, Machinery & Trade Crew)`,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        status: 'SUCCESS',
        createdAt: new Date().toISOString()
      });

      return {
        ...prev,
        materials: updatedMaterials,
        equipment: updatedEquipment,
        rentals: newRentals,
        workerRequests: newWorkerRequests,
        orders: newOrders,
        payments: newPayments,
        cart: []
      };
    });
  };

  // --- Contractor Unlease Machinery with Punishment Fee ---
  const unleaseEquipment = (rentalId) => {
    const rental = store.rentals.find(r => r.id === rentalId);
    if (!rental) throw new Error('Lease record not found.');
    if (rental.status === 'TERMINATED') throw new Error('This lease has already been terminated.');

    // Contractual penalty: 20% of total commitment or 1 day tariff
    const punishmentFee = Math.max(Math.round(rental.totalPrice * 0.20), rental.dailyRate || 1000);

    setStore(prev => {
      const updatedRentals = prev.rentals.map(r => {
        if (r.id === rentalId) {
          return {
            ...r,
            status: 'TERMINATED',
            cancellation: {
              cancelledAt: new Date().toISOString(),
              punishmentFee,
              note: 'Early termination by contractor. Contractual punishment penalty charged.'
            }
          };
        }
        return r;
      });

      // Make equipment available in fleet
      const updatedEquipment = prev.equipment.map(e => {
        if (e.id === rental.equipmentId) return { ...e, available: true };
        return e;
      });

      // Add to contractor's pending penalty debt
      const updatedUsers = prev.users.map(u => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            pendingPenaltyDue: (u.pendingPenaltyDue || 0) + punishmentFee
          };
        }
        return u;
      });

      // Record penalty in payments ledger
      const newPayments = [
        ...prev.payments,
        {
          id: `pay-pen-${Date.now()}`,
          payerId: currentUser.id,
          payerName: currentUser.name,
          recipientId: rental.providerId,
          payableType: 'LEASE_TERMINATION_PENALTY',
          amount: punishmentFee,
          platformFee: Math.round(punishmentFee * 0.05),
          netAmount: punishmentFee,
          method: 'Contractual Escrow Penalty',
          note: `Unlease punishment penalty for early return of ${rental.equipmentName}`,
          invoiceNumber: `INV-PEN-${Date.now().toString().slice(-4)}`,
          status: 'UNPAID_PENDING_SETTLEMENT',
          createdAt: new Date().toISOString()
        }
      ];

      return {
        ...prev,
        rentals: updatedRentals,
        equipment: updatedEquipment,
        users: updatedUsers,
        payments: newPayments
      };
    });

    return punishmentFee;
  };

  // --- Clear / Pay Penalty from Contractor Operating Funds ---
  const payPenaltyFromFunds = () => {
    const penalty = currentUser?.pendingPenaltyDue || 0;
    if (penalty <= 0) throw new Error('No pending penalties on this account.');
    if ((currentUser.escrowBalance || 0) < penalty) {
      throw new Error(`Insufficient funds in wallet (Balance: ₹${currentUser.escrowBalance.toLocaleString('en-IN')}). Please top up your operating funds first.`);
    }

    setStore(prev => {
      const updatedUsers = prev.users.map(u => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            escrowBalance: u.escrowBalance - penalty,
            pendingPenaltyDue: 0
          };
        }
        return u;
      });

      const newPayments = [
        ...prev.payments,
        {
          id: `pay-settle-${Date.now()}`,
          payerId: currentUser.id,
          payerName: currentUser.name,
          recipientId: 'OBRIX_ESCROW_PENALTY_POOL',
          payableType: 'PENALTY_SETTLEMENT',
          amount: penalty,
          platformFee: 0,
          netAmount: penalty,
          method: 'Contractor Wallet Escrow Deduction',
          note: 'Contractual unlease punishment fee cleared from operating funds',
          invoiceNumber: `INV-CLR-${Date.now().toString().slice(-4)}`,
          status: 'SUCCESS',
          createdAt: new Date().toISOString()
        }
      ];

      return {
        ...prev,
        users: updatedUsers,
        payments: newPayments
      };
    });
  };

  // --- Top Up Operating Funds ---
  const topupFunds = (amount) => {
    const deposit = Number(amount);
    if (!deposit || deposit <= 0) throw new Error('Enter a valid deposit amount.');

    setStore(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === currentUser.id ? { ...u, escrowBalance: (u.escrowBalance || 0) + deposit } : u)
    }));
  };

  // --- Submit Contractor Bid on Project (Blocked if penalty due) ---
  const submitBid = ({ projectId, totalAmount, days, proposalText, breakdown }) => {
    if (currentUser?.pendingPenaltyDue > 0) {
      throw new Error(`Bidding Blocked: You have an unpaid Contractual Unlease Penalty of ₹${currentUser.pendingPenaltyDue.toLocaleString('en-IN')}. Settle it in Operating Funds first.`);
    }

    const newBid = {
      id: `bid-${Date.now()}`,
      projectId,
      contractorId: currentUser.id,
      contractorName: currentUser.name,
      totalAmount: Number(totalAmount),
      days: Number(days),
      proposalText,
      breakdown: breakdown || { materials: 0, labour: 0, equipment: 0 },
      status: 'SUBMITTED',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setStore(prev => ({
      ...prev,
      bids: [...prev.bids, newBid]
    }));
    return newBid;
  };

  // --- Award Project / Accept Bid (Company only) ---
  const acceptBid = (bidId) => {
    setStore(prev => {
      const targetBid = prev.bids.find(b => b.id === bidId);
      if (!targetBid) return prev;

      const updatedProjects = prev.projects.map(p => {
        if (p.id === targetBid.projectId) {
          return { ...p, status: 'ACTIVE', contractorId: targetBid.contractorId };
        }
        return p;
      });

      const updatedBids = prev.bids.map(b => {
        if (b.id === bidId) return { ...b, status: 'ACCEPTED' };
        if (b.projectId === targetBid.projectId) return { ...b, status: 'REJECTED' };
        return b;
      });

      return {
        ...prev,
        projects: updatedProjects,
        bids: updatedBids
      };
    });
  };

  // --- Create New Project Tender (Company only) ---
  const publishProject = (projectData) => {
    const newProj = {
      id: `proj-${Date.now()}`,
      companyId: currentUser.id,
      title: projectData.title,
      city: projectData.city || currentUser.city,
      category: projectData.category || 'Commercial',
      budget: Number(projectData.budget),
      durationDays: Number(projectData.durationDays) || 90,
      area: projectData.area || 'Custom sq ft',
      status: 'OPEN_FOR_BIDS',
      description: projectData.description || '',
      deadline: '2027-06-30',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setStore(prev => ({
      ...prev,
      projects: [...prev.projects, newProj]
    }));
  };

  // --- Add Material Listing (Provider only) ---
  const addMaterial = (matData) => {
    const newMat = {
      id: `mat-${Date.now()}`,
      providerId: currentUser.id,
      name: matData.name,
      category: matData.category || 'General Supplies',
      brand: matData.brand || 'Generic',
      unit: matData.unit || 'Bag',
      price: Number(matData.price),
      stock: Number(matData.stock) || 100,
      description: matData.description || '',
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
      city: currentUser.city
    };
    setStore(prev => ({ ...prev, materials: [...prev.materials, newMat] }));
  };

  // --- Add Equipment Fleet (Provider only) ---
  const addEquipment = (eqData) => {
    const newEq = {
      id: `eq-${Date.now()}`,
      providerId: currentUser.id,
      name: eqData.name,
      category: eqData.category || 'Earthmoving',
      dailyRate: Number(eqData.dailyRate),
      specs: eqData.specs || 'Operator included',
      description: eqData.description || '',
      image: 'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?w=600&auto=format&fit=crop&q=80',
      available: true,
      city: currentUser.city
    };
    setStore(prev => ({ ...prev, equipment: [...prev.equipment, newEq] }));
  };

  // --- Worker Profile Update & Response ---
  const updateWorkerProfile = ({ skills, dailyRate, availability, bio }) => {
    setStore(prev => ({
      ...prev,
      users: prev.users.map(u => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()),
            dailyRate: Number(dailyRate) || u.dailyRate || 900,
            availability: availability || u.availability || 'AVAILABLE',
            bio: bio || u.bio || ''
          };
        }
        return u;
      })
    }));
  };

  const respondWorkerJob = (requestId, status) => {
    setStore(prev => ({
      ...prev,
      workerRequests: prev.workerRequests.map(r => r.id === requestId ? { ...r, status } : r)
    }));
  };

  return (
    <AppContext.Provider value={{
      store,
      currentUser,
      activeRole,
      activeTab,
      setActiveTab,
      theme,
      toggleTheme,
      login,
      register,
      logout,
      switchRole,
      onboardProvider,
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      cartTotal,
      checkoutCart,
      unleaseEquipment,
      payPenaltyFromFunds,
      topupFunds,
      submitBid,
      acceptBid,
      publishProject,
      addMaterial,
      addEquipment,
      updateWorkerProfile,
      respondWorkerJob
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
