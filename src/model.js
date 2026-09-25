import { seed, today } from './data.js';
export const STORAGE_KEY = 'obrix.workspace.v1';
export const earned = (s, workerId, projectId) => s.attendance.filter(a => a.workerId === workerId && (!projectId || a.projectId === projectId)).reduce((n, a) => n + a.rate * (a.status === 'Present' ? 1 : a.status === 'Half day' ? 0.5 : 0), 0);
export const paid = (s, userId, projectId) => s.payments.filter(p => p.toId === userId && (!projectId || p.projectId === projectId)).reduce((n, p) => n + p.amount, 0);
export function restore(raw) {
  if (!raw) return seed();
  const value = JSON.parse(raw);
  // Version 1 included the retired worker module. Start the simplified two-role demo fresh.
  if (value.version === 1) return seed();
  const template = seed();
  if (value.version !== 2 || Object.keys(template).some(k => !(k in value)) || Object.keys(template).filter(k => Array.isArray(template[k])).some(k => !Array.isArray(value[k])) || !value.settings || typeof value.settings !== 'object') throw new Error('Saved data is incompatible. Export or reset the workspace in Settings.');
  if (value.session && !value.users.some(u => u.id === value.session)) value.session = null;
  return value;
}
export function transition(state, action) {
  const s = structuredClone(state), d = action.data || {};
  const uid = action.id || globalThis.crypto.randomUUID();
  const actor = s.users.find(u => u.id === s.session);
  const fail = message => { throw new Error(message); };
  const requireRole = (...roles) => { if (!actor || !roles.includes(actor.role)) fail('This action is not available for this demo role.'); };
  const number = (v, label, min = 1) => { const n = Number(v); if (!Number.isFinite(n) || n < min) fail(`${label} must be at least ${min}.`); return n; };
  const text = (v, label) => { if (!String(v || '').trim()) fail(`${label} is required.`); return String(v).trim(); };
  const notify = (userId, title, message, path) => { if (userId) s.notifications.unshift({ id: `${uid}-n-${s.notifications.length}`, userId, title, message, path, read: false, date: today() }); };
  const project = id => { const p = s.projects.find(p => p.id === id); if (!p) fail('Project not found.'); return p; };
  const active = id => { const p = project(id); if (p.contractorId !== actor?.id || p.status !== 'Active') fail('Choose one of your active projects.'); return p; };
  switch (action.type) {
    case 'LOGIN': if (!s.users.some(u => u.id === d.userId)) fail('Choose a demo account.'); s.session = d.userId; break;
    case 'LOGOUT': s.session = null; break;
    case 'SIGNUP': {
      if (!['company', 'contractor'].includes(d.role)) fail('Choose a role.');
      const email = text(d.email, 'Email').toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('Enter a valid email.');
      if (s.users.some(u => u.email.toLowerCase() === email)) fail('That demo email already exists. Choose it on the login screen.');
      s.users.push({ id: uid, name: text(d.name, 'Name'), email, role: d.role, city: text(d.city, 'City'), phone: '', bio: '', skills: [], availability: 'Available', rate: 900 }); s.session = uid; break;
    }
    case 'PROJECT_SAVE': {
      requireRole('company'); const old = d.projectId ? project(d.projectId) : null;
      if (old && (old.companyId !== actor.id || old.status !== 'Open')) fail('Only your open projects can be edited.');
      if (!d.deadline || d.deadline < today()) fail('Choose a future application deadline.');
      const values = { title: text(d.title, 'Title'), city: text(d.city, 'City'), category: text(d.category, 'Category'), budget: number(d.budget, 'Budget'), duration: number(d.duration, 'Duration'), area: text(d.area, 'Area'), description: text(d.description, 'Description'), deadline: d.deadline };
      if (old) Object.assign(old, values); else s.projects.unshift({ ...values, id: uid, companyId: actor.id, status: 'Open', progress: 0, createdAt: today() }); break;
    }
    case 'BID_SUBMIT': {
      requireRole('contractor'); const p = project(d.projectId);
      if (p.status !== 'Open' || p.deadline < today()) fail('This project is no longer accepting bids.');
      if (s.bids.some(b => b.projectId === p.id && b.contractorId === actor.id && b.status !== 'Withdrawn')) fail('You already have a bid on this project.');
      s.bids.unshift({ id: uid, projectId: p.id, contractorId: actor.id, amount: number(d.amount, 'Bid amount'), days: number(d.days, 'Delivery days'), proposal: text(d.proposal, 'Proposal'), status: 'Pending', date: today() });
      notify(p.companyId, 'New project bid', `${actor.name} submitted a bid for ${p.title}.`, '/company/bids'); break;
    }
    case 'BID_DECIDE': {
      requireRole('company'); const b = s.bids.find(b => b.id === d.bidId); if (!b) fail('Bid not found.'); const p = project(b.projectId);
      if (p.companyId !== actor.id || b.status !== 'Pending' || p.status !== 'Open') fail('This bid cannot be changed.');
      if (!['Accepted', 'Rejected'].includes(d.status)) fail('Invalid bid status.'); b.status = d.status;
      if (d.status === 'Accepted') { p.status = 'Active'; p.contractorId = b.contractorId; for (const other of s.bids.filter(x => x.projectId === p.id && x.id !== b.id && x.status === 'Pending')) { other.status = 'Rejected'; notify(other.contractorId, 'Bid update', `Another bid was selected for ${p.title}.`, '/contractor/bids'); } }
      notify(b.contractorId, `Bid ${d.status.toLowerCase()}`, p.title, d.status === 'Accepted' ? '/contractor/active-projects' : '/contractor/bids'); break;
    }
    case 'BID_WITHDRAW': {
      requireRole('contractor'); const b = s.bids.find(b => b.id === d.bidId); if (!b || b.contractorId !== actor.id || b.status !== 'Pending') fail('Only pending bids can be withdrawn.'); b.status = 'Withdrawn'; notify(project(b.projectId).companyId, 'Bid withdrawn', actor.name, '/company/bids'); break;
    }
    case 'PROJECT_PROGRESS': {
      requireRole('contractor'); const p = active(d.projectId); const progress = number(d.progress, 'Progress', 0); if (progress > 100) fail('Progress cannot exceed 100%.'); p.progress = progress; notify(p.companyId, 'Site progress updated', `${p.title}: ${progress}%`, `/company/projects/${p.id}`); break;
    }
    case 'PROJECT_COMPLETE': {
      requireRole('company'); const p = project(d.projectId); if (p.companyId !== actor.id || p.status !== 'Active' || p.progress !== 100) fail('The active project must reach 100% before completion.'); p.status = 'Completed'; notify(p.contractorId, 'Project completed', p.title, '/contractor/projects'); break;
    }
    case 'ASSIGN': {
      requireRole('contractor'); const p = active(d.projectId), w = s.users.find(u => u.id === d.workerId && u.role === 'worker');
      if (!w || w.availability !== 'Available') fail('Choose an available worker.');
      if (s.assignments.some(a => a.projectId === p.id && a.workerId === w.id)) fail('This worker is already assigned to the project.');
      s.assignments.push({ id: uid, projectId: p.id, contractorId: actor.id, workerId: w.id, rate: number(d.rate, 'Daily wage') }); notify(w.id, 'Project assignment', `You joined ${p.title}.`, '/worker/projects'); break;
    }
    case 'UNASSIGN': {
      requireRole('contractor'); const a = s.assignments.find(a => a.id === d.assignmentId); if (!a || a.contractorId !== actor.id) fail('Assignment not found.'); s.assignments = s.assignments.filter(x => x.id !== a.id); notify(a.workerId, 'Assignment ended', project(a.projectId).title, '/worker/projects'); break;
    }
    case 'ATTENDANCE': {
      requireRole('contractor'); const p = active(d.projectId), a = s.assignments.find(a => a.projectId === p.id && a.workerId === d.workerId && a.contractorId === actor.id);
      if (!a) fail('Assign the worker to this project first.'); if (!d.date || d.date > today()) fail('Attendance cannot be in the future.');
      if (!['Present', 'Half day', 'Absent', 'Leave'].includes(d.status)) fail('Choose an attendance status.');
      const previous = s.attendance.find(h => h.workerId === a.workerId && h.projectId === p.id && h.date === d.date);
      const units = value => value === 'Present' ? 1 : value === 'Half day' ? 0.5 : 0;
      const sameDay = s.attendance.filter(h => h.workerId === a.workerId && h.date === d.date && h.id !== previous?.id).reduce((n, h) => n + units(h.status), 0);
      if (sameDay + units(d.status) > 1) fail('Attendance across all projects cannot exceed one day.');
      const record = { id: previous?.id || uid, projectId: p.id, workerId: a.workerId, contractorId: actor.id, rate: previous?.rate || a.rate, status: d.status, date: d.date };
      s.attendance = [...s.attendance.filter(h => h.id !== record.id), record];
      if (earned(s, a.workerId, p.id) < paid(s, a.workerId, p.id)) fail('This correction would reduce earnings below already paid wages.');
      notify(a.workerId, 'Attendance updated', `${p.title}: ${d.status} on ${d.date}.`, '/worker/attendance'); break;
    }
    case 'PAYMENT': {
      requireRole('company', 'contractor'); const p = project(d.projectId); if (!['Active', 'Completed'].includes(p.status)) fail('Payments require an awarded project.'); const amount = number(d.amount, 'Payment');
      let toId;
      if (actor.role === 'company') { if (p.companyId !== actor.id) fail('Choose your project.'); toId = p.contractorId; const contract = s.bids.find(b => b.projectId === p.id && b.status === 'Accepted'); if (amount + paid(s, toId, p.id) > (contract?.amount || p.budget)) fail('Payment exceeds the remaining contract value.'); }
      else { if (p.contractorId !== actor.id) fail('Choose your project.'); toId = d.toId; if (!s.attendance.some(h => h.projectId === p.id && h.workerId === toId && h.contractorId === actor.id)) fail('Record attendance for this worker first.'); if (amount > earned(s, toId, p.id) - paid(s, toId, p.id)) fail('Payment exceeds this worker’s outstanding wages.'); }
      s.payments.unshift({ id: uid, fromId: actor.id, toId, projectId: p.id, amount, date: today(), method: text(d.method, 'Method'), note: text(d.note, 'Reference'), status: 'Paid' });
      notify(toId, 'Payment recorded', `${actor.name} recorded a payment for ${p.title}.`, actor.role === 'company' ? '/contractor/payments' : '/worker/payment-history'); break;
    }
    case 'EXPENSE': {
      requireRole('contractor');
      active(d.projectId);
      const date = d.date || today();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || date > today()) fail('Choose a valid expense date, not in the future.');
      s.expenses.unshift({ id: uid, contractorId: actor.id, projectId: d.projectId, category: text(d.category, 'Category'), amount: number(d.amount, 'Expense'), date, note: text(d.note, 'Description') });
      break;
    }
    case 'RENTAL': {
      requireRole('company', 'contractor'); const e = s.equipment.find(e => e.id === d.equipmentId); if (!e || e.ownerId === actor.id || !e.available) fail('This equipment is not available to rent.');
      if (!d.start || d.start < today()) fail('Choose today or a future start date.'); const days = number(d.days, 'Rental days'); if (!Number.isInteger(days)) fail('Rental days must be a whole number.');
      if (s.rentals.some(r => r.equipmentId === e.id && r.requesterId === actor.id && ['Requested', 'Approved'].includes(r.status))) fail('You already have an open request for this equipment.');
      s.rentals.unshift({ id: uid, equipmentId: e.id, requesterId: actor.id, ownerId: e.ownerId, start: d.start, days, total: days * e.rate, status: 'Requested', note: text(d.note, 'Site address') }); notify(e.ownerId, 'Rental request', `${actor.name} requested ${e.name}.`, '/company/equipment'); break;
    }
    case 'RENTAL_STATUS': {
      requireRole('company', 'contractor'); const r = s.rentals.find(r => r.id === d.rentalId); if (!r) fail('Rental not found.'); const owner = r.ownerId === actor.id, requester = r.requesterId === actor.id;
      if (!(owner && r.status === 'Requested' && ['Approved', 'Rejected'].includes(d.status)) && !(requester && r.status === 'Requested' && d.status === 'Cancelled') && !((owner || requester) && r.status === 'Approved' && d.status === 'Returned')) fail('This rental transition is not allowed.');
      const e = s.equipment.find(e => e.id === r.equipmentId); if (d.status === 'Approved' && !e.available) fail('Equipment is already rented.'); r.status = d.status; if (d.status === 'Approved') e.available = false; if (d.status === 'Returned') e.available = true;
      notify(owner ? r.requesterId : r.ownerId, `Rental ${d.status.toLowerCase()}`, e.name, '/'+s.users.find(u => u.id === (owner ? r.requesterId : r.ownerId)).role+'/equipment'); break;
    }
    case 'PROFILE': {
      requireRole('company', 'contractor'); const email = text(d.email, 'Email').toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('Enter a valid email.'); if (s.users.some(u => u.id !== actor.id && u.email.toLowerCase() === email)) fail('Email already in use.'); Object.assign(actor, { name: text(d.name, 'Name'), email, city: text(d.city, 'City'), phone: String(d.phone || ''), bio: String(d.bio || '') }); break;
    }
    case 'SKILLS': requireRole('worker'); actor.skills = [...new Set(text(d.skills, 'Skills').split(',').map(x => x.trim()).filter(Boolean))]; actor.rate = number(d.rate, 'Daily rate'); break;
    case 'AVAILABILITY': requireRole('worker'); if (!['Available', 'Busy', 'On leave'].includes(d.availability)) fail('Invalid availability.'); actor.availability = d.availability; break;
    case 'SETTINGS': requireRole('company', 'contractor'); s.settings[actor.id] = { notifications: d.notifications === 'On', compact: d.compact === 'Compact' }; break;
    case 'READ': requireRole('company', 'contractor'); s.notifications.filter(n => n.userId === actor.id && (!d.notificationId || n.id === d.notificationId)).forEach(n => { n.read = true; }); break;
    case 'RESET': return seed();
    default: fail('Unknown action.');
  }
  return s;
}
