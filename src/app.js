// HTML provides the page, CSS the design, and these functions the interactions.
// Native JavaScript modules need only a static server, not a build or backend.
import { seed, today, money, cities } from './data.js';
import { STORAGE_KEY, restore, transition, earned, paid } from './model.js';

const page = document.body.dataset.page || 'home';
const query = new URLSearchParams(location.search);
let state;
let user;
let formCount = 0;
let toastTimer;
const main = document.getElementById('main');
const roles = ['company', 'contractor'];
const views = {
  company: ['dashboard', 'projects', 'create-project', 'bids', 'contractors', 'equipment', 'payments', 'expenses', 'notifications', 'profile', 'settings'],
  contractor: ['dashboard', 'projects', 'bids', 'active-projects', 'payments', 'equipment', 'expenses', 'notifications', 'profile', 'settings']
};

// Escape data before inserting it into HTML, including values in attributes.
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
}
const e = escapeHTML;
function label(value) { return value.replaceAll('-', ' ').replace(/\b\w/g, c => c.toUpperCase()); }
function getData() { return restore(localStorage.getItem(STORAGE_KEY)); }
function saveData(value) { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); }
function calculateEarnings(workerId, projectId) { return earned(state, workerId, projectId); }
function calculateExpenses(projectId) {
  return visibleExpenses().filter(x => !projectId || x.projectId === projectId).reduce((sum, x) => sum + x.amount, 0);
}
function showNotification(message) {
  const box = document.getElementById('toast');
  box.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { box.textContent = ''; }, 5000);
}
function person(id) { return state.users.find(u => u.id === id); }
function project(id) { return state.projects.find(p => p.id === id); }
function name(id) { return e(person(id)?.name || 'Unknown account'); }
function projectLink(id) { return `<a href="project.html?id=${encodeURIComponent(id)}">${e(project(id)?.title || 'Project')}</a>`; }
function workspaceLink(view = 'dashboard') { return `${user.role}.html?view=${view}`; }
function myProjects() {
  return state.projects.filter(p => user.role === 'company' ? p.companyId === user.id : user.role === 'contractor' ? p.contractorId === user.id : state.assignments.some(a => a.projectId === p.id && a.workerId === user.id));
}
function myAttendance() {
  return state.attendance.filter(a => user.role === 'worker' ? a.workerId === user.id : user.role === 'contractor' ? a.contractorId === user.id : project(a.projectId)?.companyId === user.id);
}
function visibleExpenses() {
  return state.expenses.filter(x => user.role === 'company' ? project(x.projectId)?.companyId === user.id : x.contractorId === user.id);
}
function badge(text) { return `<span class="badge ${e(String(text).toLowerCase().replaceAll(' ', '-'))}">${e(text)}</span>`; }
function empty(text = 'No records yet. Your next action will appear here.') { return `<div class="empty"><h3>Nothing here yet</h3><p>${e(text)}</p></div>`; }
function heading(title, description = '') { return `<div class="page-heading"><div><span class="eyebrow">OBRIX / ${e(user?.role || 'CONNECTED CONSTRUCTION')}</span><h1>${e(title)}</h1><p>${e(description)}</p></div></div>`; }
function button(action, text, data = {}, confirm = '') {
  return `<button type="button" class="btn small secondary" data-action="${e(action)}" data-values="${e(JSON.stringify(data))}" ${confirm ? `data-confirm="${e(confirm)}"` : ''}>${e(text)}</button>`;
}
function table(headers, rows) {
  if (!rows.length) return empty();
  return `<div class="table-scroll"><table><thead><tr>${headers.map(h => `<th scope="col">${e(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function options(items) { return items.map(x => ({value:x.id, label:x.title || x.name})); }
function field(name, title, type = 'text', extra = {}) { return {name, title, type, ...extra}; }
function select(name, title, items) { return field(name, title, 'select', {items}); }
function form(action, fields, initial = {}, hidden = {}, submit = 'Save changes') {
  const prefix = `form-${++formCount}`;
  const controls = fields.map(f => {
    const id = `${prefix}-${f.name}`;
    const value = initial[f.name] ?? f.value ?? '';
    const common = `id="${id}" name="${e(f.name)}" ${f.optional ? '' : 'required'}`;
    let control;
    if (f.type === 'select') {
      control = `<select ${common}>${f.items.length ? '' : '<option value="">No options available</option>'}${f.items.map(item => {
        const v = typeof item === 'object' ? item.value : item;
        const title = typeof item === 'object' ? item.label : item;
        return `<option value="${e(v)}" ${String(v) === String(value) ? 'selected' : ''}>${e(title)}</option>`;
      }).join('')}</select>`;
    } else if (f.type === 'textarea') {
      control = `<textarea ${common} rows="4" maxlength="4000">${e(value)}</textarea>`;
    } else {
      control = `<input ${common} type="${e(f.type)}" value="${e(value)}" ${f.type === 'number' ? `min="${e(f.min ?? 1)}" step="${e(f.step ?? 1)}"` : 'maxlength="200"'} ${f.min !== undefined && f.type !== 'number' ? `min="${e(f.min)}"` : ''} ${f.max !== undefined ? `max="${e(f.max)}"` : ''}>`;
    }
    return `<label for="${id}" class="${f.type === 'textarea' ? 'wide' : ''}">${e(f.title)}${control}</label>`;
  }).join('');
  return `<form data-form="${e(action)}" class="form-grid">${Object.entries(hidden).map(([key,value]) => `<input type="hidden" name="${e(key)}" value="${e(value)}">`).join('')}${controls}<p class="error wide" role="alert"></p><div class="wide"><button class="btn" type="submit">${e(submit)}</button></div></form>`;
}
const projectFields = [field('title','Project title'), select('city','City',cities), select('category','Category',['Residential','Commercial','Industrial','Public infrastructure']), field('budget','Budget (₹)','number'), field('duration','Duration (days)','number'), field('area','Built-up area'), field('deadline','Application deadline','date',{min:today()}), field('description','Scope and requirements','textarea')];
function projectCard(p) {
  return `<article class="listing-card"><div class="project-art"><div class="building-lines"></div>${badge(p.status)}</div><div class="card-body"><span class="eyebrow">${e(p.category)} / ${e(p.city)}</span><h3>${e(p.title)}</h3><p>${e(p.description.slice(0,125))}…</p><div class="card-bottom"><div><small>Project budget</small><strong>${money(p.budget)}</strong></div><a class="btn small" href="project.html?id=${encodeURIComponent(p.id)}">View project →</a></div></div></article>`;
}
function equipmentCard(item) {
  return `<article class="listing-card"><div class="equipment-art"><img src="assets/equipment.svg" alt="Representative construction equipment illustration" loading="lazy">${badge(item.available ? 'Available' : 'Rented')}</div><div class="card-body"><span class="eyebrow">${e(item.category)} / ${e(item.city)}</span><h3>${e(item.name)}</h3><p>★ ${e(item.rating || 4.8)} · ${e(item.specs)}</p><div class="card-bottom"><div><small>Daily rental</small><strong>${money(item.rate)}</strong></div><a class="btn small" href="equipment-detail.html?id=${encodeURIComponent(item.id)}">Details →</a></div></div></article>`;
}
function personCard(p) {
  return `<article class="panel person-card"><div class="avatar">${e(p.name.split(' ').slice(0,2).map(x => x[0]).join(''))}</div><h2>${e(p.name)}</h2><p>${e(p.city)} · ★ ${e(p.rating || 'New')}</p>${badge(p.availability)}<p>${e(p.bio || 'Ready to build new connections.')}</p><div class="tags">${p.skills.map(s => `<span>${e(s)}</span>`).join('')}</div>${p.role === 'worker' ? `<strong>${money(p.rate)} / day</strong>` : ''}<div class="actions">${button('PERSON','View profile',{id:p.id})}</div></article>`;
}
function explorer(kind, items) {
  const filters = `<div class="filters"><label class="search">Search <input id="search" type="search" placeholder="Name, city or skill" aria-label="Search listings"></label><label>City<select id="filter-city"><option value="">All cities</option>${cities.map(c => `<option>${e(c)}</option>`).join('')}</select></label><label>Status<select id="filter-status"><option value="">All statuses</option>${[...new Set(items.map(x => x.status || x.availability || (x.available ? 'Available' : 'Rented')))].map(s => `<option>${e(s)}</option>`).join('')}</select></label><label>Sort<select id="sort"><option value="name">Name A–Z</option><option value="low">Price / wage: low first</option><option value="high">Price / wage: high first</option><option value="rating">Rating: high first</option></select></label></div><p id="result-count" class="result-count"></p><div id="results" class="card-grid"></div>`;
  // A callback runs after this HTML is placed in the document.
  afterRender = () => {
    function filterList() {
      const term = document.getElementById('search').value.toLowerCase();
      const city = document.getElementById('filter-city').value;
      const status = document.getElementById('filter-status').value;
      const sort = document.getElementById('sort').value;
      const list = items.filter(x => (!city || x.city === city) && (!status || (x.status || x.availability || (x.available ? 'Available' : 'Rented')) === status) && `${x.title || x.name} ${x.city} ${x.category || ''} ${x.skills || ''}`.toLowerCase().includes(term));
      list.sort((a,b) => sort === 'name' ? (a.title || a.name).localeCompare(b.title || b.name) : sort === 'rating' ? (b.rating || 0) - (a.rating || 0) : ((a.budget || a.rate || 0) - (b.budget || b.rate || 0)) * (sort === 'high' ? -1 : 1));
      document.getElementById('result-count').textContent = `${list.length} results`;
      document.getElementById('results').innerHTML = list.length ? list.map(kind === 'projects' ? projectCard : kind === 'equipment' ? equipmentCard : personCard).join('') : empty('Try another search or filter.');
    }
    ['search','filter-city','filter-status','sort'].forEach(id => document.getElementById(id).addEventListener('input',filterList));
    filterList();
  };
  return filters;
}
let afterRender = null;
function logo() { return '<a class="logo" href="index.html"><span>O</span>OBRIX</a>'; }
function publicHeader() {
  return `<header class="public-header"><div class="container nav-row">${logo()}</div></header>`;
}
function home() {
  return `<section class="hero"><div class="container hero-grid"><div class="hero-copy"><div class="hero-kicker">THE CONSTRUCTION ECOSYSTEM, CONNECTED</div><h1>Build better.<br>Build smarter.<br><em>Build together.</em></h1><p>From the first blueprint to the final brick. Find the right projects, people and equipment in one connected workspace.</p><div class="actions"><a class="btn" href="projects.html">Explore projects ↗</a><a class="btn dark-outline" href="how-it-works.html">How it works →</a></div><p><small>Built for companies, contractors and people on the ground.</small></p></div><div class="hero-visual"><img src="assets/construction.svg" alt="Construction site with a tower crane"><div class="floating-card"><div><strong>One ecosystem. Zero silos.</strong><small>Projects → People → Progress</small></div></div></div></div><div class="container hero-metrics"><div><strong>${state.projects.length}</strong><span>Demo projects</span></div><div><strong>08</strong><span>Indian cities</span></div><div><strong>03</strong><span>Connected roles</span></div><div><strong>01</strong><span>Shared workspace</span></div></div></section><div class="partner-strip"><div class="container"><strong>ARAVALLI</strong><strong>DECCAN BUILDWORKS</strong><strong>VIKRAM CONSTRUCTION</strong><strong>PATIL CIVIL</strong></div></div><section class="container section">${heading('Your next big project starts here.','Clear scope. Realistic budgets. A stronger pipeline.')}<div class="card-grid">${state.projects.slice(0,3).map(projectCard).join('')}</div></section><section class="ecosystem section"><div class="container">${heading('Every role. Moving forward.')}<div class="card-grid">${roles.map((role,i) => `<article class="ecosystem-card"><span class="outline-number">0${i+1}</span><h2>For ${role === 'company' ? 'companies' : role + 's'}</h2><p>${['Publish projects, compare bids and keep every site in view.','Find work, build a team, record hajri and track site costs.','See assigned sites, attendance, earnings and payment history.'][i]}</p><a class="btn secondary" href="login.html?role=${role}">Explore workspace →</a></article>`).join('')}</div></div></section><section class="container section">${heading('Big tasks. The right machines.')}<div class="card-grid">${state.equipment.slice(0,3).map(equipmentCard).join('')}</div></section><section class="container"><div class="cta-band"><h2>Your next connection<br>could change everything.</h2><a href="signup.html" class="btn black">Join the demo →</a></div></section>`;
}
function information() {
  const steps = [['Publish & discover','A company publishes scope, location and budget. Contractors see the same project.'],['Bid & award','A contractor submits a proposal. The company accepts one bid and rejects competing bids.'],['Assign & build','The awarded contractor assigns available workers and updates site progress.'],['Record hajri','Present counts as 1 payable day; Half Day as 0.5; Absent and Leave as 0.'],['Earn & settle','Payable days × agreed daily wage produces earnings. Payments are separate settlement records.'],['Request & return','Rent equipment, switch to the owner account to approve, then record its return.']];
  return heading(page === 'about' ? 'Construction is a team effort.' : 'Three roles. One source of truth.','OBRIX is a student-built frontend demonstration, not a live marketplace.') + `<div class="info-hero"><img src="assets/construction.svg" alt="Construction site illustration"><section><h2>Simple technology.<br>Connected possibilities.</h2><p>HTML gives this project structure. CSS creates the design. Vanilla JavaScript handles forms and calculations. Browser localStorage keeps the shared workspace between visits.</p><p>No backend, database, real authentication, employment offers or money transfers. Use the same browser and origin when switching roles.</p><a class="btn" href="login.html">Try the connected workflow →</a></section></div><div class="card-grid mt-8">${steps.map(([title,copy],i) => `<article class="panel"><span class="outline-number">0${i+1}</span><h2>${title}</h2><p>${copy}</p></article>`).join('')}</div>`;
}
function auth() {
  const role = roles.includes(query.get('role')) ? query.get('role') : 'company';
  afterRender = () => {
    const picker = document.getElementById('demo-role');
    if (picker) picker.addEventListener('change', () => {
      document.querySelector('[name=userId]').innerHTML = state.users.filter(u => u.role === picker.value).map(u => `<option value="${e(u.id)}">${e(u.name)} · ${e(u.city)}</option>`).join('');
    });
  };
  return `<div class="auth-layout"><section class="auth-story"><span class="eyebrow">BUILD YOUR NEXT CHAPTER</span><h1>Great things<br>are built<br><em>together.</em></h1><img src="assets/construction.svg" alt="Construction site"></section><section class="panel auth-form">${badge('Frontend demo only')}<h1>${page === 'signup' ? 'Build your network.' : 'Welcome to OBRIX.'}</h1><p>No passwords or real authentication. All profiles and transactions stay in this browser. Do not enter sensitive personal information.</p>${page === 'signup' ? form('SIGNUP',[field('name','Name / organisation'),field('email','Demo email','email'),select('role','Role',roles),select('city','City',cities)],{}, {},'Create demo account') : `<label for="demo-role">Demo role<select id="demo-role">${roles.map(r => `<option ${r === role ? 'selected' : ''}>${r}</option>`).join('')}</select></label>${form('LOGIN',[select('userId','Demo account',options(state.users.filter(u => u.role === role)))],{}, {},'Enter workspace')}`}<div class="notice">Switch accounts from the workspace to follow a project across all three roles. Existing records stay shared.</div><a class="text-link" href="${page === 'signup' ? 'login.html' : 'signup.html'}">${page === 'signup' ? 'Choose an existing account' : 'Create a demo account'} →</a></section></div>`;
}
function projectDetails() {
  const p = project(query.get('id'));
  if (!p) return empty('Project not found. Browse the Projects marketplace.');
  const owner = user?.id === p.companyId;
  const assigned = user?.id === p.contractorId;
  const bid = state.bids.find(b => b.projectId === p.id && b.contractorId === user?.id && b.status !== 'Withdrawn');
  let actions = user ? '' : '<a class="btn" href="login.html">Demo login to collaborate</a>';
  if (user?.role === 'contractor' && p.status === 'Open') actions = bid ? `<p>Your bid: ${money(bid.amount)} ${badge(bid.status)}</p><a class="btn" href="contractor.html?view=bids">Track bids</a>` : `<h3>Submit a bid</h3>${form('BID_SUBMIT',[field('amount','Quote (₹)','number'),field('days','Delivery (days)','number'),field('proposal','Execution proposal','textarea')],{}, {projectId:p.id},'Submit bid')}`;
  if (owner) actions += `<a class="btn" href="company.html?view=bids">Review bids</a>${p.status === 'Open' ? `<details><summary>Edit this project</summary>${form('PROJECT_SAVE',projectFields,p,{projectId:p.id})}</details>` : ''}${p.status === 'Active' && p.progress === 100 ? button('PROJECT_COMPLETE','Mark completed',{projectId:p.id},'Complete this project?') : ''}`;
  if (assigned && p.status === 'Active') actions += form('PROJECT_PROGRESS',[field('progress','Completion (%)','number',{min:0,max:100})],p,{projectId:p.id},'Update progress');
  return heading(p.title,`${p.city} · ${p.category}`) + `<div class="detail-grid"><article class="panel"><div class="detail-art"><img src="assets/construction.svg" alt="Representative site illustration"></div><h2>Built around a clear vision.</h2><p class="prose">${e(p.description)}</p><div class="metric-grid"><div><small>Published by</small><strong>${name(p.companyId)}</strong></div><div><small>Area</small><strong>${e(p.area)}</strong></div><div><small>Duration</small><strong>${p.duration} days</strong></div><div><small>Applications close</small><strong>${e(p.deadline)}</strong></div></div><p>Completion: ${p.progress}%</p><progress aria-label="Project completion" value="${p.progress}" max="100"></progress>${p.contractorId ? `<p>Execution partner: ${name(p.contractorId)}</p>` : ''}</article><aside class="panel stack">${badge(p.status)}<h2 class="price">${money(p.budget)}</h2>${actions}<p class="muted">Demo project. No contractual commitment.</p></aside></div>`;
}
function equipmentDetails() {
  const item = state.equipment.find(x => x.id === query.get('id'));
  if (!item) return empty('Equipment not found. Browse the Equipment marketplace.');
  const canRent = user && user.role !== 'worker' && user.id !== item.ownerId && item.available;
  return heading(item.name,`${item.city} · ${item.category}`) + `<div class="detail-grid"><article class="panel"><img src="assets/equipment.svg" alt="Representative construction machine"><h2>Ready for the heavy lifting.</h2><p>${e(item.description)}</p><p>${e(item.specs)} · ★ ${e(item.rating || 4.8)}</p><p>Owner: ${name(item.ownerId)}</p><small>Illustration is representative, not a photograph of the listed machine.</small></article><aside class="panel">${badge(item.available ? 'Available' : 'Rented')}<h2 class="price">${money(item.rate)} / day</h2><p>Total rental commitment = daily price × requested days.</p>${canRent ? form('RENTAL',[field('start','Start date','date',{min:today(),value:today()}),field('days','Rental days','number',{value:1}),field('note','Delivery site / requirements','textarea')],{}, {equipmentId:item.id},'Request rental') : `<p>${!user ? 'Choose a demo company or contractor to request equipment.' : user.id === item.ownerId ? 'Manage incoming requests in your Equipment workspace.' : 'Rental requests are only available to companies and contractors for available equipment.'}</p><a class="btn" href="${user ? workspaceLink() : 'login.html'}">${user ? 'My workspace' : 'Demo login'}</a>`}</aside></div>`;
}
function stats(items) { return `<div class="stats-grid">${items.map(([title,value]) => `<article class="stat"><div class="stat-label">${e(title)}</div><strong>${e(value)}</strong></article>`).join('')}</div>`; }
function dashboard() {
  const projects = myProjects();
  const notes = state.notifications.filter(n => n.userId === user.id).slice(0,4);
  const pending = state.bids.filter(b => b.status === 'Pending' && (user.role === 'company' ? project(b.projectId)?.companyId === user.id : b.contractorId === user.id)).length;
  const summary = user.role === 'worker' ? [['Assigned projects',projects.length],['Earned',money(calculateEarnings(user.id))],['Received',money(paid(state,user.id))],['Outstanding',money(calculateEarnings(user.id)-paid(state,user.id))]] : [['My projects',projects.length],['Active sites',projects.filter(p => p.status === 'Active').length],['Pending bids',pending],['Recorded expenses',money(calculateExpenses())]];
  return `<section class="welcome-band"><div>${badge('YOUR CONNECTED WORKSPACE')}<h2>Welcome, ${name(user.id)}.</h2><p>Every project, person and payment. Finally connected.</p></div><a class="btn" href="${user.role === 'company' ? 'company.html?view=create-project' : user.role === 'contractor' ? 'contractor.html?view=projects' : 'worker.html?view=earnings'}">${user.role === 'company' ? 'Create project' : user.role === 'contractor' ? 'Find projects' : 'View earnings'} →</a></section>${stats(summary)}<div class="dashboard-grid"><section class="panel"><h2>Site progress</h2><p>Live from the shared project records.</p>${projects.length ? projects.map(p => `<div class="chart-row"><div class="section-title">${projectLink(p.id)}<strong>${p.progress}%</strong></div><progress aria-label="${e(p.title)} completion" value="${p.progress}" max="100"></progress></div>`).join('') : empty('Create a project, win a bid or receive a worker assignment to get started.')}</section><section class="panel"><h2>Recent activity</h2>${notes.length ? notes.map(n => `<article class="activity-item"><div><strong>${e(n.title)}</strong><p>${e(n.message)}</p><small>${e(n.date)}</small></div></article>`).join('') : empty()}<a class="btn secondary" href="${workspaceLink('notifications')}">All notifications</a></section></div>`;
}
function bidsPage() {
  const bids = state.bids.filter(b => user.role === 'company' ? project(b.projectId)?.companyId === user.id : b.contractorId === user.id);
  return `<section class="panel">${table(['Project / proposal','Contractor','Quote','Timeline','Status','Actions'],bids.map(b => [projectLink(b.projectId)+`<p class="table-note">${e(b.proposal)}</p>`,name(b.contractorId),money(b.amount),`${b.days} days`,badge(b.status), b.status === 'Pending' ? `<div class="actions">${user.role === 'company' ? button('BID_DECIDE','Accept',{bidId:b.id,status:'Accepted'},'Accept this bid and reject competing pending bids?')+button('BID_DECIDE','Reject',{bidId:b.id,status:'Rejected'},'Reject this bid?') : button('BID_WITHDRAW','Withdraw',{bidId:b.id},'Withdraw this bid?')}</div>` : '—']))}</section>`;
}
function workersPage() {
  const assignments = state.assignments.filter(a => user.role === 'company' ? project(a.projectId)?.companyId === user.id : a.contractorId === user.id);
  const active = myProjects().filter(p => p.status === 'Active');
  let content = `<section class="panel"><h2>Assigned site team</h2>${table(['Worker','Project','Agreed daily wage','Actions'],assignments.map(a => [name(a.workerId),projectLink(a.projectId),money(a.rate),user.role === 'contractor' ? button('UNASSIGN','End assignment',{assignmentId:a.id},'End this assignment? Attendance and payment history will stay intact.') : badge('Assigned')]))}</section>`;
  if (user.role === 'contractor') content += `<section class="panel mt-8"><h2>Assign a worker</h2>${active.length ? form('ASSIGN',[select('projectId','Active project',options(active)),select('workerId','Available worker',options(state.users.filter(u => u.role === 'worker' && u.availability === 'Available'))),field('rate','Agreed daily wage (₹)','number',{value:900})],{}, {},'Assign worker') : empty('Accept an award before assigning workers.')}</section>`;
  return content + `<section class="mt-8">${heading('Discover skilled people.')}${explorer('workers',state.users.filter(u => u.role === 'worker'))}</section>`;
}
function attendancePage() {
  const records = myAttendance();
  const units = records.reduce((sum,a) => sum + (a.status === 'Present' ? 1 : a.status === 'Half day' ? .5 : 0),0);
  let content = `<div class="notice">Present = 1 day; Half Day = 0.5; Absent and Leave = 0. Attendance percentage = payable units ÷ recorded worker/site days × 100. Unrecorded dates are excluded. Editing a record replaces it, rather than adding earnings twice.</div>${stats([['Recorded days',records.length],['Payable days',units],['Attendance',`${records.length ? (units / records.length * 100).toFixed(1) : 0}%`]])}`;
  if (user.role === 'contractor') {
    const assignments = state.assignments.filter(a => a.contractorId === user.id && project(a.projectId)?.status === 'Active');
    content += `<section class="panel"><h2>Mark or correct daily hajri</h2>${assignments.length ? form('ATTENDANCE',[select('assignmentId','Worker / project',assignments.map(a => ({value:a.id,label:`${person(a.workerId)?.name} / ${project(a.projectId)?.title}`}))),field('date','Attendance date','date',{max:today(),value:today()}),select('status','Status',[{value:'Present',label:'Present'},{value:'Half day',label:'Half Day'},'Absent','Leave'])],{}, {},'Save attendance') : empty('Assign workers to an active project first.')}</section>`;
  }
  return content + `<section class="panel mt-8">${table(['Date','Worker','Project','Status','Daily wage','Earned'],records.slice().sort((a,b) => b.date.localeCompare(a.date)).map(a => [e(a.date),name(a.workerId),projectLink(a.projectId),badge(a.status),money(a.rate),money(a.rate * (a.status === 'Present' ? 1 : a.status === 'Half day' ? .5 : 0))]))}</section>`;
}
function earningsPage() {
  const ids = [...new Set(state.attendance.filter(a => a.workerId === user.id).map(a => a.projectId))];
  const earnedTotal = calculateEarnings(user.id);
  const received = paid(state,user.id);
  return `<div class="notice">Payable Days × Daily Wage = Earnings. Each attendance record keeps its agreed wage; changing your profile rate does not rewrite history.</div>${stats([['Total earnings',money(earnedTotal)],['Payments received',money(received)],['Outstanding',money(earnedTotal-received)]])}<section class="panel">${table(['Project','Earned','Received','Outstanding'],ids.map(id => [projectLink(id),money(calculateEarnings(user.id,id)),money(paid(state,user.id,id)),money(calculateEarnings(user.id,id)-paid(state,user.id,id))]))}</section>`;
}
function paymentsPage() {
  const payments = state.payments.filter(p => p.fromId === user.id || p.toId === user.id);
  const received = payments.filter(p => p.toId === user.id).reduce((s,p) => s+p.amount,0);
  const sent = payments.filter(p => p.fromId === user.id).reduce((s,p) => s+p.amount,0);
  let content = stats([['Received',money(received)],['Paid out',money(sent)],['Records',payments.length]]) + `<div class="notice">These are local demo records, not transfers. Company payments cannot exceed the awarded contract. Worker payments cannot exceed earned, unpaid wages.</div>`;
  const projects = myProjects().filter(p => ['Active','Completed'].includes(p.status));
  if (user.role !== 'worker') content += `<section class="panel"><h2>Record a payment</h2>${projects.length ? form('PAYMENT',[select('projectId','Project',options(projects)),...(user.role === 'contractor' ? [select('toId','Worker',options(state.users.filter(u => u.role === 'worker' && state.attendance.some(a => a.workerId === u.id && a.contractorId === user.id))))] : []),field('amount','Amount (₹)','number'),select('method','Recorded method',['UPI','Bank transfer','Cash']),field('note','Reference / reason')],{}, {},'Record demo payment') : empty('Payments require an awarded project.')}</section>`;
  return content + `<section class="panel mt-8">${table(['Date','From','To','Project','Amount','Method / reference'],payments.map(p => [e(p.date),name(p.fromId),name(p.toId),projectLink(p.projectId),money(p.amount),`${e(p.method)}<p>${e(p.note)}</p>`]))}</section>`;
}
function expensesPage() {
  const expenses = visibleExpenses();
  const total = calculateExpenses();
  const projectIds = myProjects().map(p => p.id);
  const payroll = state.payments.filter(p => projectIds.includes(p.projectId) && person(p.toId)?.role === 'worker').reduce((sum,p) => sum+p.amount,0);
  const rentals = state.rentals.filter(r => r.requesterId === user.id && ['Approved','Returned'].includes(r.status)).reduce((sum,r) => sum+r.total,0);
  let content = stats([['Site expenses',money(total)],['Recorded worker payments',money(payroll)],['Rental commitments',money(rentals)],['Combined cost view',money(total+payroll+rentals)]]) + '<p class="notice">Manual site expenses exclude payroll and rentals, which appear separately. Rental commitments are estimates, not recorded payments. Do not enter these again as manual expenses.</p>';
  if (user.role === 'contractor') {
    const active = myProjects().filter(p => p.status === 'Active');
    content += `<section class="panel"><h2>Add a site expense</h2>${active.length ? form('EXPENSE',[field('note','Expense title'),field('amount','Amount (₹)','number'),select('category','Category',['Materials','Transport','Tools','Utilities','Other']),field('date','Expense date','date',{value:today(),max:today()}),select('projectId','Project',options(active))],{}, {},'Add expense') : empty('An active project is required.')}</section>`;
  }
  const categories = [...new Set(expenses.map(x => x.category))];
  return content + `<section class="panel mt-8"><h2>Expense breakdown</h2>${categories.map(c => { const amount = expenses.filter(x => x.category === c).reduce((sum,x) => sum+x.amount,0); return `<div class="chart-row"><p>${e(c)} · ${money(amount)}</p><progress value="${amount}" max="${total || 1}" aria-label="${e(c)} share of expenses"></progress></div>`; }).join('')}${table(['Title','Date','Project','Category','Amount'],expenses.map(x => [e(x.note),e(x.date),projectLink(x.projectId),e(x.category),money(x.amount)]))}</section>`;
}
function rentalWorkspace() {
  const rentals = state.rentals.filter(r => r.ownerId === user.id || r.requesterId === user.id);
  const rows = rentals.map(r => {
    const item = state.equipment.find(x => x.id === r.equipmentId);
    let actions = '';
    if (r.status === 'Requested' && r.ownerId === user.id) actions = button('RENTAL_STATUS','Approve',{rentalId:r.id,status:'Approved'},'Approve and reserve this machine?')+button('RENTAL_STATUS','Reject',{rentalId:r.id,status:'Rejected'},'Reject this request?');
    if (r.status === 'Requested' && r.requesterId === user.id) actions = button('RENTAL_STATUS','Cancel',{rentalId:r.id,status:'Cancelled'},'Cancel this request?');
    if (r.status === 'Approved') actions = button('RENTAL_STATUS','Mark returned',{rentalId:r.id,status:'Returned'},'Confirm the equipment has been returned?');
    return [e(item?.name),name(r.requesterId),`${e(r.start)} / ${r.days} days`,money(r.total),badge(r.status),`<div class="actions">${actions || '—'}</div>`];
  });
  return `<section class="panel"><h2>Rental activity</h2>${table(['Equipment','Requested by','Start / duration','Total commitment','Status','Actions'],rows)}</section><section class="mt-8">${heading('Find the right equipment.')}${explorer('equipment',state.equipment)}</section>`;
}
function notificationsPage() {
  const notes = state.notifications.filter(n => n.userId === user.id);
  return `<section class="panel"><div class="section-title"><h2>Your notifications</h2>${button('READ','Mark all read')}</div>${notes.length ? notes.map(n => `<article class="notification-row ${n.read ? '' : 'unread'}"><div><h3>${e(n.title)}</h3><p>${e(n.message)}</p><small>${e(n.date)}</small></div>${n.read ? badge('Read') : button('READ','Mark read',{notificationId:n.id})}</article>`).join('') : empty()}</section>`;
}
function profilePage() {
  return `<section class="panel"><div class="profile-banner"><div class="avatar large">${e(user.name[0])}</div><div><h2>${name(user.id)}</h2>${badge(user.role)}</div></div>${form('PROFILE',[field('name','Name / organisation'),field('email','Demo email','email'),select('city','City',cities),field('phone','Phone','tel',{optional:true}),field('bio','About you','textarea',{optional:true})],user)}</section>`;
}
function settingsPage() {
  const settings = state.settings[user.id] || {};
  return `<section class="panel"><h2>Workspace preferences</h2>${form('SETTINGS',[select('notifications','Success pop-ups',['On','Off']),select('compact','Density',['Comfortable','Compact'])],{notifications:settings.notifications === false ? 'Off' : 'On',compact:settings.compact ? 'Compact' : 'Comfortable'})}<div class="notice">Important errors always appear. Turning off success pop-ups does not delete notifications. This demo uses localStorage on this browser and origin. Native JavaScript modules require a static web server (for example, your editor's Live Server), with no build step or application backend.</div><div class="actions">${button('EXPORT','Export demo data')}${button('RESET','Reset ALL demo data',{},'This resets every account and record in this browser to the demo seed. Export first if you need a backup. Continue?')}</div></section>`;
}
function workspacePage(view) {
  if (view === 'dashboard') return dashboard();
  if (view === 'create-project') return `<section class="panel">${form('PROJECT_SAVE',projectFields,{}, {},'Publish project')}</section>`;
  if (view === 'projects' || view === 'active-projects') {
    const projects = user.role === 'contractor' && view === 'projects' ? state.projects : myProjects();
    return explorer('projects',view === 'active-projects' ? projects.filter(p => p.status === 'Active') : projects);
  }
  if (view === 'bids') return bidsPage();
  if (view === 'contractors') return explorer('contractors',state.users.filter(u => u.role === 'contractor'));
  if (view === 'earnings') return earningsPage();
  if (view === 'payments' || view === 'payment-history') return paymentsPage();
  if (view === 'expenses') return expensesPage();
  if (view === 'equipment') return rentalWorkspace();
  if (view === 'notifications') return notificationsPage();
  if (view === 'profile') return profilePage();
  if (view === 'settings') return settingsPage();
  if (view === 'skills') return `<section class="panel"><h2>Your skills and asking wage</h2>${form('SKILLS',[field('skills','Skills, separated by commas'),field('rate','Asking daily wage (₹)','number')],{skills:user.skills.join(', '),rate:user.rate})}</section>`;
  if (view === 'availability') return `<section class="panel"><h2>Let contractors know when you are available</h2>${form('AVAILABILITY',[select('availability','Availability',['Available','Busy','On leave'])],user)}</section>`;
  if (view === 'reviews') {
    const reviews = state.reviews.filter(r => r.workerId === user.id);
    return reviews.length ? `<div class="card-grid">${reviews.map(r => `<article class="panel"><div class="stars">${'★'.repeat(r.rating)}</div><h2>${e(r.author)}</h2><p>${e(r.text)}</p><small>${e(r.date)} · Demo review</small></article>`).join('')}</div>` : empty('No reviews have been recorded for this profile.');
  }
  return empty('This workspace page does not exist. Choose a link from the menu.');
}
function render() {
  if (page === 'home') { location.replace('login.html'); return; }
  user = person(state.session);
  afterRender = null;
  formCount = 0;
  document.body.classList.toggle('compact',Boolean(user && state.settings[user.id]?.compact));
  if (roles.includes(page)) {
    if (!user) { location.replace('login.html'); return; }
    if (user.role !== page) { location.replace(workspaceLink()); return; }
    const view = views[user.role].includes(query.get('view')) ? query.get('view') : 'dashboard';
    document.title = `${label(view)} | ${label(user.role)} | OBRIX`;
    document.getElementById('header').innerHTML = '';
    main.innerHTML = `<div class="workspace"><aside class="sidebar" id="sidebar">${logo()}<p class="workspace-label">${e(user.role)} workspace</p><nav aria-label="Workspace navigation">${views[user.role].map(v => `<a href="${workspaceLink(v)}" class="${view === v ? 'active' : ''}" ${view === v ? 'aria-current="page"' : ''}>${label(v)}</a>`).join('')}</nav><div class="sidebar-bottom"><a href="index.html">← Marketplace</a><a href="login.html">Switch demo account</a>${button('LOGOUT','Log out')}</div></aside><div class="workspace-main"><header class="topbar"><button class="btn small mobile-toggle" data-action="SIDEBAR" aria-controls="sidebar" aria-expanded="false">Menu</button><span>${name(user.id)}</span><a class="demo-switch" href="login.html">Switch demo account</a></header><div class="dashboard-content">${heading(label(view),'Local demo workspace · No real transactions')}${workspacePage(view)}</div></div></div>`;
  } else {
    document.getElementById('header').innerHTML = publicHeader();
    let content;
    if (page === 'home') content = home();
    else if (page === 'about' || page === 'how-it-works') content = information();
    else if (page === 'login' || page === 'signup') content = auth();
    else if (page === 'project') content = projectDetails();
    else if (page === 'equipment-detail') content = equipmentDetails();
    else content = heading(label(page),'The right opportunity, people and tools for your next build.') + explorer(page,page === 'projects' ? state.projects : page === 'equipment' ? state.equipment : state.users.filter(u => u.role === (page === 'workers' ? 'worker' : 'contractor')));
    main.innerHTML = page === 'home' ? content : `<div class="container section">${content}</div>`;
  }
  document.getElementById('footer').innerHTML = '';
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.insertAdjacentHTML('afterbegin','<button type="button" class="btn secondary mobile-toggle" data-action="SIDEBAR" aria-controls="sidebar" aria-label="Close workspace menu">Close menu</button>');
  if (afterRender) afterRender();
}

// One delegated listener handles forms, including those rendered after a change.
function execute(action, data = {}) {
  const latest = getData();
  if (!['LOGIN','SIGNUP'].includes(action) && latest.session !== state.session) {
    state = latest;
    render();
    throw new Error('The demo account changed in another tab. Review this page and try again.');
  }
  const next = transition(latest, {type:action, data});
  try { saveData(next); }
  catch { throw new Error('Browser storage is unavailable or full. Nothing was saved. Enable storage or export and reset demo data.'); }
  state = next;
  user = person(state.session);
  if (action === 'LOGIN' || action === 'SIGNUP') { location.href = workspaceLink(); return; }
  if (action === 'LOGOUT') { location.href = 'login.html'; return; }
  render();
  if (action === 'SETTINGS' || state.settings[state.session]?.notifications !== false) showNotification('Changes saved in this browser.');
}
function openDialog(title, content) {
  const dialog = document.getElementById('dialog');
  dialog.innerHTML = `<div class="section-title"><h2 id="dialog-title">${e(title)}</h2><button type="button" class="btn small secondary" data-close>Close</button></div>${content}`;
  dialog.showModal();
  return dialog;
}
function confirmAction(message, callback) {
  const dialog = openDialog('Confirm action', `<p>${e(message)}</p><div class="actions"><button type="button" class="btn" id="confirm-action">Confirm</button><button type="button" class="btn secondary" data-close>Cancel</button></div>`);
  document.getElementById('confirm-action').addEventListener('click', () => {
    dialog.close();
    try { callback(); } catch (error) { showNotification(error.message); }
  }, {once:true});
}
function exportData() {
  const blob = new Blob([localStorage.getItem(STORAGE_KEY) || JSON.stringify(state)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `obrix-demo-${today()}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
document.addEventListener('submit', event => {
  const element = event.target.closest('form[data-form]');
  if (!element) return;
  event.preventDefault();
  if (!element.reportValidity()) return;
  const action = element.dataset.form;
  const data = Object.fromEntries(new FormData(element));
  try {
    if (action === 'ATTENDANCE') {
      const assignment = state.assignments.find(a => a.id === data.assignmentId);
      if (!assignment) throw new Error('Choose a valid worker assignment.');
      data.projectId = assignment.projectId;
      data.workerId = assignment.workerId;
    }
    execute(action,data);
  } catch (error) {
    const feedback = element.querySelector('.error');
    if (feedback?.isConnected) {
      feedback.textContent = error.message;
      feedback.setAttribute('tabindex','-1');
      feedback.focus();
    } else showNotification(error.message);
  }
});
document.addEventListener('click', event => {
  if (event.target.closest('[data-close]')) { document.getElementById('dialog').close(); return; }
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const action = control.dataset.action;
  const data = JSON.parse(control.dataset.values || '{}');
  function run() {
    if (action === 'MENU' || action === 'SIDEBAR') {
      const target = document.getElementById(action === 'MENU' ? 'public-nav' : 'sidebar');
      const expanded = target.classList.toggle('open');
      control.setAttribute('aria-expanded',String(expanded));
      return;
    }
    if (action === 'PERSON') {
      const p = person(data.id);
      if (!p) throw new Error('Profile not found.');
      openDialog(p.name, `<p>${e(p.city)} · ${e(p.role)}</p>${badge(p.availability)}<p>${e(p.bio)}</p><div class="tags">${p.skills.map(s => `<span>${e(s)}</span>`).join('')}</div><p>★ ${e(p.rating || 'New')}${p.role === 'worker' ? ` · ${money(p.rate)} / day` : ''}</p><p class="muted">Demo profile. ${p.role === 'worker' ? 'Contractors can assign available workers from their Workers workspace.' : 'Publish a project from a company account so contractors can submit bids.'}</p><a class="btn" href="${user ? workspaceLink() : 'login.html'}">Go to workspace</a>`);
      return;
    }
    if (action === 'EXPORT') { exportData(); return; }
    if (action === 'RESET') { saveData(seed()); location.href = 'login.html'; return; }
    execute(action,data);
  }
  try {
    if (control.dataset.confirm) confirmAction(control.dataset.confirm,run);
    else run();
  } catch (error) { showNotification(error.message); }
});
function storageFailure(error) {
  main.innerHTML = `<section class="container section"><h1>Demo storage needs attention</h1><p class="error">${e(error.message)}</p><p>No existing data has been overwritten. Enable browser storage, export a backup, or reset this demo.</p><div class="actions">${button('EXPORT','Export existing data')}${button('RESET','Reset demo',{},'Permanently replace the saved demo data with fresh sample records?')}</div></section>`;
}
document.body.insertAdjacentHTML('beforeend','<div id="toast" class="toast" role="status" aria-live="polite"></div><dialog id="dialog" class="modal" aria-labelledby="dialog-title"></dialog>');
try {
  state = getData();
  if (!localStorage.getItem(STORAGE_KEY)) saveData(state);
  render();
} catch (error) { storageFailure(error); }
window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  try { state = getData(); render(); showNotification('Workspace refreshed from another tab.'); }
  catch (error) { storageFailure(error); }
});
