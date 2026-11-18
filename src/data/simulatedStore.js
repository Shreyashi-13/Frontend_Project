// Initial seed dataset storing all roles, projects, bids, materials, machinery, workers and payments
export const initialSeed = {
  version: 3,
  sessionUserId: 't1', // default demo user: Vikram Construction Co.
  theme: 'light',
  users: [
    {
      id: 't1',
      name: 'Vikram Construction Co.',
      email: 'contractor@obrix.demo',
      password: 'password123',
      roles: ['CONTRACTOR'],
      activeRole: 'CONTRACTOR',
      city: 'Delhi',
      phone: '9830012345',
      bio: 'Civil works, structural execution and reliable site teams. 12 years of experience.',
      skills: ['Civil works', 'RCC', 'Residential'],
      rating: 4.8,
      escrowBalance: 500000,
      pendingPenaltyDue: 0
    },
    {
      id: 'c1',
      name: 'Aravalli Infrastructure',
      email: 'company@obrix.demo',
      password: 'password123',
      roles: ['COMPANY'],
      activeRole: 'COMPANY',
      city: 'Gurgaon',
      phone: '9810012345',
      bio: 'Building thoughtful commercial and residential spaces across NCR.',
      escrowBalance: 12000000,
      pendingPenaltyDue: 0
    },
    {
      id: 'u1',
      name: 'Ananya Deshmukh',
      email: 'customer@obrix.demo',
      password: 'password123',
      roles: ['CUSTOMER', 'PROVIDER'],
      activeRole: 'CUSTOMER',
      city: 'Gurgaon',
      phone: '9811122334',
      bio: 'Homeowner building a custom sustainable duplex in Sector 54.',
      escrowBalance: 250000,
      pendingPenaltyDue: 0
    },
    {
      id: 'p1',
      name: 'Apex BuildPro & Machinery',
      email: 'provider@obrix.demo',
      password: 'password123',
      roles: ['PROVIDER', 'CUSTOMER'],
      activeRole: 'PROVIDER',
      city: 'Delhi',
      phone: '9877712345',
      bio: 'Premium certified construction supplies, TMT bars, and modern rental machinery.',
      capabilities: {
        materialSeller: true,
        equipmentRental: true,
        serviceProvider: false
      },
      escrowBalance: 850000,
      pendingPenaltyDue: 0
    },
    {
      id: 'w1',
      name: 'Ramesh Kumar',
      email: 'worker@obrix.demo',
      password: 'password123',
      roles: ['WORKER'],
      activeRole: 'WORKER',
      city: 'Delhi',
      phone: '9850012345',
      bio: 'Master mason with 14 years in brickwork, plastering, and RCC foundations.',
      skills: ['Masonry', 'Brickwork', 'Plastering'],
      dailyRate: 900,
      availability: 'AVAILABLE',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      escrowBalance: 14000,
      pendingPenaltyDue: 0
    },
    {
      id: 'w2',
      name: 'Suresh Yadav',
      email: 'suresh@obrix.demo',
      password: 'password123',
      roles: ['WORKER'],
      activeRole: 'WORKER',
      city: 'Noida',
      phone: '9860012345',
      bio: 'Certified industrial & residential wireman and conduit specialist.',
      skills: ['Electrical', 'Wiring', 'Conduiting'],
      dailyRate: 1100,
      availability: 'AVAILABLE',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      escrowBalance: 22000,
      pendingPenaltyDue: 0
    }
  ],
  projects: [
    {
      id: 'proj-1',
      companyId: 'c1',
      title: 'Skyline Residences · Phase II',
      city: 'Gurgaon',
      category: 'Residential',
      budget: 8500000,
      durationDays: 180,
      area: '42,000 sq ft',
      status: 'OPEN_FOR_BIDS',
      description: 'RCC structure, masonry, and finishing for a premium 48-unit residential development. Looking for an experienced execution contractor with active labor crew.',
      deadline: '2027-03-30',
      createdAt: '2026-11-14'
    },
    {
      id: 'proj-2',
      companyId: 'c1',
      title: 'Greenfield Community Centre',
      city: 'Delhi',
      category: 'Public Infrastructure',
      budget: 3200000,
      durationDays: 90,
      area: '12,500 sq ft',
      status: 'ACTIVE',
      contractorId: 't1',
      description: 'Neighbourhood community center with multipurpose halls, landscaped courtyard, and accessibility ramps.',
      deadline: '2027-02-28',
      createdAt: '2026-11-14'
    }
  ],
  bids: [
    {
      id: 'bid-1',
      projectId: 'proj-2',
      contractorId: 't1',
      contractorName: 'Vikram Construction Co.',
      totalAmount: 2980000,
      days: 90,
      proposalText: 'Dedicated 12-person civil team with weekly milestone audits and certified safety compliance.',
      breakdown: {
        materials: 1850000,
        labour: 780000,
        equipment: 350000
      },
      status: 'ACCEPTED',
      createdAt: '2026-11-14'
    }
  ],
  materials: [
    {
      id: 'mat-1',
      providerId: 'p1',
      name: 'UltraTech Super Cement (50kg Bag)',
      category: 'Cement',
      brand: 'UltraTech',
      unit: 'Bag (50kg)',
      price: 385,
      stock: 4500,
      description: 'PPC Grade cement offering higher strength, lower heat of hydration, and crack resistance.',
      image: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=600&auto=format&fit=crop&q=80',
      city: 'Delhi'
    },
    {
      id: 'mat-2',
      providerId: 'p1',
      name: 'Tata Tiscon 550D TMT Rebars (12mm)',
      category: 'Steel',
      brand: 'Tata Steel',
      unit: 'Metric Ton',
      price: 64500,
      stock: 180,
      description: 'Super-ductile Fe 550D TMT rebar for earthquake-resistant reinforced concrete beams and slabs.',
      image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=600&auto=format&fit=crop&q=80',
      city: 'Delhi'
    },
    {
      id: 'mat-3',
      providerId: 'p1',
      name: 'Red Clay Kiln-Fired Bricks (Class 1)',
      category: 'Bricks & Blocks',
      brand: 'Apex Local',
      unit: 'Pack of 1,000 Bricks',
      price: 7800,
      stock: 120,
      description: 'Standard size 9x4x3 inch high-density first-class kiln-baked bricks with sharp edges.',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
      city: 'Delhi'
    }
  ],
  equipment: [
    {
      id: 'eq-1',
      providerId: 'p1',
      name: 'JCB 3DX Plus Backhoe Loader',
      category: 'Earthmoving',
      dailyRate: 6500,
      city: 'Delhi',
      specs: '74 HP Turbocharged · 4.77m Digging Depth · Operator Included',
      description: 'Heavy duty excavation, trenching and site leveling. Cleaned and inspected prior to delivery.',
      image: 'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?w=600&auto=format&fit=crop&q=80',
      available: false
    },
    {
      id: 'eq-2',
      providerId: 'p1',
      name: 'ACE Hydra 14T Mobile Crane',
      category: 'Lifting & Rigging',
      dailyRate: 8200,
      city: 'Noida',
      specs: '14 Ton Capacity · 15m Telescopic Boom · Rigging Crew Included',
      description: 'Pick-and-carry mobile crane for precast erection, steel girder positioning, and unloading.',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?w=600&auto=format&fit=crop&q=80',
      available: true
    },
    {
      id: 'eq-3',
      providerId: 'p1',
      name: 'Schwing Stetter 6m³ Transit Mixer',
      category: 'Concrete Machinery',
      dailyRate: 4200,
      city: 'Gurgaon',
      specs: '6m³ Drum Capacity · High Discharge Slump Drum · Operator Provided',
      description: 'Transit mixer for continuous delivery to foundation footings and slab casting.',
      image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&auto=format&fit=crop&q=80',
      available: true
    }
  ],
  rentals: [
    {
      id: 'rent-demo-1',
      equipmentId: 'eq-1',
      equipmentName: 'JCB 3DX Plus Backhoe Loader',
      renterId: 't1',
      renterName: 'Vikram Construction Co.',
      providerId: 'p1',
      startDate: '2026-11-15',
      totalDays: 5,
      dailyRate: 6500,
      totalPrice: 32500,
      status: 'CONFIRMED',
      createdAt: '2026-11-15T10:00:00.000Z'
    }
  ],
  workerRequests: [
    {
      id: 'wr-1',
      fromId: 't1',
      fromName: 'Vikram Construction Co.',
      fromRole: 'CONTRACTOR',
      workerId: 'w1',
      workerName: 'Ramesh Kumar',
      projectId: 'proj-2',
      title: 'Master Mason Lead for Greenfield Project',
      dailyRate: 900,
      startDate: '2026-11-20',
      durationDays: 30,
      status: 'CONFIRMED',
      createdAt: '2026-11-14T09:00:00.000Z'
    }
  ],
  orders: [],
  payments: [
    {
      id: 'pay-1',
      payerId: 'c1',
      payerName: 'Aravalli Infrastructure',
      recipientId: 't1',
      payableType: 'PROJECT_MILESTONE',
      payableId: 'proj-2',
      amount: 250000,
      platformFee: 5000,
      netAmount: 245000,
      method: 'Bank Transfer / Escrow',
      note: 'Mobilisation advance tranche for Greenfield Community Centre',
      invoiceNumber: 'INV-882101',
      status: 'SUCCESS',
      createdAt: '2026-11-14T12:00:00.000Z'
    }
  ],
  cart: []
};

const STORAGE_KEY = 'obrix_local_store_v3';

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeed));
      return initialSeed;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== initialSeed.version) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeed));
      return initialSeed;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to parse localStorage, resetting to seed', err);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeed));
    return initialSeed;
  }
}

export function saveStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('LocalStorage write error', err);
  }
}
