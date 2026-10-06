// admin.js - CoopCore Enterprise Admin Workstation Backend Logic

let adminState = CoopStore.get();

function togglePassword() {
  const password = document.getElementById('password');
  const eye = document.getElementById('password-eye');

  if (password.type === 'password') {
    password.type = 'text';
    eye.setAttribute('data-lucide', 'eye-off');
  } else {
    password.type = 'password';
    eye.setAttribute('data-lucide', 'eye');
  }

  lucide.createIcons();
}

function formatPeso(val) {
  return CoopStore.formatPeso(val);
}

function handleAdminLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById('admin-email');
  const passwordInput = document.getElementById('password');
  const email = emailInput ? emailInput.value.trim().toLowerCase() : "admin@coopcore.ph";
  const pass = passwordInput ? passwordInput.value : "";

  // Validate admin email and password
  if (email !== "admin@coopcore.ph" && !email.includes("admin")) {
    alert("Invalid credentials. Access restricted to cooperative administrative staff.");
    return;
  }

  if (pass && pass.length < 3) {
    alert("Please enter a valid password.");
    return;
  }

  CoopStore.setAdminLoggedIn(true);
  document.getElementById('admin-auth-screen').style.display = 'none';
  document.getElementById('admin-app-screen').style.display = 'flex';
  renderAdminPortal();
}

function adminLogout() {
  CoopStore.setAdminLoggedIn(false);
  document.getElementById('admin-app-screen').style.display = 'none';
  document.getElementById('admin-auth-screen').style.display = 'flex';
}

function switchAdminTab(tabId) {
  document.querySelectorAll('.admin-pane').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.admin-menu .menu-item').forEach(el => el.classList.remove('active'));

  const pane = document.getElementById(`admin-tab-${tabId}`);
  if (pane) pane.style.display = 'block';

  const menuItems = document.querySelectorAll('.admin-menu .menu-item');
  const tabMap = { 'dashboard': 0, 'approvals': 1, 'registry': 2, 'savings': 3, 'loans': 4, 'repayments': 5 };
  if (tabMap[tabId] !== undefined && menuItems[tabMap[tabId]]) {
    menuItems[tabMap[tabId]].classList.add('active');
  }

  lucide.createIcons();
}

function renderAdminPortal() {
  // Sync state from shared store
  adminState = CoopStore.get();

  // Update Overview Stats
  const activeMembersCount = adminState.members.filter(m => (m.status || 'ACTIVE') === 'ACTIVE').length;
  document.getElementById('stat-members-count').innerText = activeMembersCount;

  const totalSavings = adminState.members.reduce((acc, m) => acc + (Number(m.savingsBalance) || 0), 0);
  document.getElementById('stat-total-savings').innerText = formatPeso(totalSavings);

  const pendingLoansCount = adminState.loanApplications.length;
  document.getElementById('stat-pending-loans').innerText = pendingLoansCount;

  const totalPortfolio = adminState.members.reduce((acc, m) => acc + (Number(m.activeLoanBalance) || 0), 0);
  document.getElementById('stat-loan-portfolio').innerText = formatPeso(totalPortfolio);

  // Overview Table (Recent general ledger postings)
  const recentLedger = (adminState.savingsLedger || []).slice(-5).reverse();
  document.getElementById('admin-dash-tx-tbody').innerHTML = recentLedger.length > 0 ? recentLedger.map(t => `
    <tr>
      <td><code>${t.ref}</code></td>
      <td><strong>${t.name}</strong></td>
      <td>${t.category}</td>
      <td style="color:${t.amount >= 0 ? 'var(--admin-green)' : 'var(--crimson)'}; font-weight:700;">
        ${t.amount >= 0 ? '+' : ''}${formatPeso(t.amount)}
      </td>
      <td>${t.date ? t.date.split(' ')[0] : 'Today'}</td>
    </tr>
  `).join('') : `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:16px;">No ledger postings found</td></tr>`;

  // Apply filters / Render all sections
  filterApprovals();
  filterMemberRegistry();
  filterSavingsLedger();
  filterLoanApps();
  filterPaymentRecords();

  lucide.createIcons();
}

// 1. MEMBER APPROVALS FILTER & RENDER
function filterApprovals() {
  const query = (document.getElementById('approvals-search-input')?.value || "").toLowerCase().trim();
  const pmesFilter = document.getElementById('approvals-filter-pmes')?.value || "ALL";

  const filtered = (adminState.pendingApprovals || []).filter(app => {
    const matchesQuery = !query ||
      (app.name && app.name.toLowerCase().includes(query)) ||
      (app.phone && app.phone.toLowerCase().includes(query)) ||
      (app.employment && app.employment.toLowerCase().includes(query)) ||
      (app.occupation && app.occupation.toLowerCase().includes(query)) ||
      (app.email && app.email.toLowerCase().includes(query));

    let matchesPmes = true;
    if (pmesFilter === "VERIFIED") matchesPmes = !!app.pmesCompleted;
    if (pmesFilter === "PENDING") matchesPmes = !app.pmesCompleted;

    return matchesQuery && matchesPmes;
  });

  renderApprovals(filtered);
  lucide.createIcons();
}

function renderApprovals(list = adminState.pendingApprovals) {
  const tbody = document.getElementById('approvals-table-tbody');
  if (!tbody) return;

  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:18px;">No pending applicant qualifications match filter criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(app => `
    <tr>
      <td><strong>${app.name}</strong></td>
      <td>${app.phone || '-'}</td>
      <td>${app.employment || app.occupation || 'Regular Member'}</td>
      <td>
        <span class="badge ${app.pmesCompleted ? 'badge-green' : 'badge-red'}">
          ${app.pmesCompleted ? 'PMES Verified' : 'PMES Pending'}
        </span>
      </td>
      <td style="font-weight:700; color:var(--admin-green);">${formatPeso(app.initialShareCapital || 0)}</td>
      <td>
        <button class="btn btn-primary" style="padding:4px 8px; font-size:11px;" onclick="approveMember('${app.id}')">Approve & Issue ID</button>
        <button class="btn btn-danger" style="padding:4px 8px; font-size:11px;" onclick="rejectMember('${app.id}')">Decline</button>
      </td>
    </tr>
  `).join('');
}

function approveMember(id) {
  const newMember = CoopStore.approvePendingApproval(id);
  if (!newMember) {
    alert("Applicant record not found.");
    return;
  }
  alert(`Member ${newMember.name} successfully approved!\nAssigned Member ID: ${newMember.id}\nAccount Number: ${newMember.accountNumber}`);
  renderAdminPortal();
}

function rejectMember(id) {
  const app = adminState.pendingApprovals.find(a => a.id === id);
  const name = app ? app.name : "applicant";
  if (confirm(`Are you sure you want to decline the membership application for ${name}?`)) {
    CoopStore.rejectPendingApproval(id);
    alert(`Membership application for ${name} has been declined.`);
    renderAdminPortal();
  }
}

// 2. MEMBER REGISTRY FILTER & RENDER
function filterMemberRegistry() {
  const searchEl = document.getElementById('registry-search-input');
  const tierEl = document.getElementById('registry-filter-tier');
  const query = (searchEl ? searchEl.value : "").toLowerCase().trim();
  const filterVal = tierEl ? tierEl.value : "ALL";

  const filtered = (adminState.members || []).filter(m => {
    const matchesQuery = !query ||
      (m.name && m.name.toLowerCase().includes(query)) ||
      (m.id && m.id.toLowerCase().includes(query)) ||
      (m.accountNumber && m.accountNumber.toLowerCase().includes(query)) ||
      (m.email && m.email.toLowerCase().includes(query)) ||
      (m.phone && m.phone.toLowerCase().includes(query));

    let matchesFilter = true;
    if (filterVal !== "ALL") {
      if (filterVal === "ACTIVE" || filterVal === "INACTIVE" || filterVal === "SUSPENDED") {
        matchesFilter = (m.status || 'ACTIVE') === filterVal;
      } else {
        const standing = ((m.accountStanding || '') + ' ' + (m.creditTier || '')).toLowerCase();
        matchesFilter = standing.includes(filterVal.toLowerCase());
      }
    }

    return matchesQuery && matchesFilter;
  });

  renderRegistry(filtered);
  lucide.createIcons();
}

function renderRegistry(list = adminState.members) {
  const tbody = document.getElementById('registry-table-tbody');
  if (!tbody) return;

  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:18px;">No members found matching filter criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(m => {
    const status = m.status || 'ACTIVE';
    let badgeClass = 'badge-green';
    if (status === 'INACTIVE') badgeClass = 'badge-amber';
    else if (status === 'SUSPENDED') badgeClass = 'badge-red';

    return `
    <tr>
      <td><strong>${m.id}</strong></td>
      <td><code>${m.accountNumber}</code></td>
      <td><strong>${m.name}</strong></td>
      <td style="color:var(--admin-green); font-weight:700;">${formatPeso(m.savingsBalance)}</td>
      <td><span class="badge ${badgeClass}">${status}</span></td>
      <td>
        <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
          <button class="btn btn-outline" style="padding:4px 8px; font-size:11px;" onclick="viewMemberDetails('${m.id}')">
            <i data-lucide="eye" style="width:13px; height:13px;"></i> Details
          </button>
          <select class="form-input" style="padding:3px 6px; font-size:11px; width:auto; font-weight:700;" onchange="changeMemberStatusDirect('${m.id}', this.value)" title="Change account status in database">
            <option value="ACTIVE" ${status === 'ACTIVE' ? 'selected' : ''}>Active</option>
            <option value="INACTIVE" ${status === 'INACTIVE' ? 'selected' : ''}>Inactive</option>
            <option value="SUSPENDED" ${status === 'SUSPENDED' ? 'selected' : ''}>Suspended</option>
          </select>
        </div>
      </td>
    </tr>
  `}).join('');
}

function changeMemberStatusDirect(memberId, newStatus) {
  const updated = CoopStore.setMemberStatus(memberId, newStatus);
  if (updated) {
    alert(`Member ${updated.name} account status has been updated to "${newStatus}" in the database.`);
    renderAdminPortal();
  }
}

function viewMemberDetails(memberId) {
  const m = CoopStore.getMemberById(memberId);
  if (!m) return;
  const status = m.status || 'ACTIVE';
  let badgeClass = 'badge-green';
  if (status === 'INACTIVE') badgeClass = 'badge-amber';
  else if (status === 'SUSPENDED') badgeClass = 'badge-red';

  const modalBody = document.getElementById('account-details-modal-body');
  modalBody.innerHTML = `
    <div style="background:var(--admin-light); border:1px solid var(--admin-border-green); padding:16px; border-radius:10px; margin-bottom:14px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div>
          <h3 style="color:var(--admin-dark); font-size:18px; font-weight:800;">${m.name}</h3>
          <p style="font-size:13px; color:var(--text-muted); margin-top:2px;">Member ID: <strong>${m.id}</strong> &bull; Account: <strong>${m.accountNumber}</strong></p>
        </div>
        <span class="badge ${badgeClass}" style="font-size:12px; padding:4px 12px;">Status: ${status}</span>
      </div>
    </div>

    <!-- Interactive Database Account Status Control -->
    <div style="background:#F8FAFC; border:1px solid var(--border); border-radius:8px; padding:12px 14px; margin-bottom:16px;">
      <label style="font-size:11px; text-transform:uppercase; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">Update Database Account Status</label>
      <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
        <select id="modal-status-select-${m.id}" class="form-input" style="max-width:200px; padding:6px 10px; font-size:12px; font-weight:700;">
          <option value="ACTIVE" ${status === 'ACTIVE' ? 'selected' : ''}>ACTIVE (Full Access)</option>
          <option value="INACTIVE" ${status === 'INACTIVE' ? 'selected' : ''}>INACTIVE (Dormant)</option>
          <option value="SUSPENDED" ${status === 'SUSPENDED' ? 'selected' : ''}>SUSPENDED (Restricted)</option>
        </select>
        <button class="btn btn-primary" style="padding:6px 12px; font-size:12px;" onclick="changeMemberStatusDirect('${m.id}', document.getElementById('modal-status-select-${m.id}').value); viewMemberDetails('${m.id}');">
          Save Status
        </button>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:13px; margin-bottom:16px;">
      <div><span style="color:var(--text-muted);">Phone:</span> <strong>${m.phone || '-'}</strong></div>
      <div><span style="color:var(--text-muted);">Email:</span> <strong>${m.email || '-'}</strong></div>
      <div><span style="color:var(--text-muted);">Registered Savings:</span> <strong style="color:var(--admin-green);">${formatPeso(m.savingsBalance)}</strong></div>
      <div><span style="color:var(--text-muted);">Active Loan Balance:</span> <strong style="color:var(--crimson);">${formatPeso(m.activeLoanBalance)}</strong></div>
      <div><span style="color:var(--text-muted);">Occupation:</span> <strong>${m.occupation || '-'}</strong></div>
      <div><span style="color:var(--text-muted);">Monthly Due:</span> <strong>${formatPeso(m.monthlyDue || 0)}</strong></div>
      <div style="grid-column:span 2;"><span style="color:var(--text-muted);">Registered Address:</span> <strong>${m.address || '-'}</strong></div>
      <div style="grid-column:span 2;"><span style="color:var(--text-muted);">Account Standing:</span> <strong style="color:var(--admin-green);">${m.accountStanding || m.creditTier || 'Good Standing'}</strong></div>
    </div>
    <button class="btn btn-outline" style="width:100%; justify-content:center;" onclick="closeModal('account-details-modal')">Close Account Details</button>
  `;
  document.getElementById('account-details-modal').classList.add('active');
  lucide.createIcons();
}

// 3. SAVINGS LEDGER FILTER & RENDER
function filterSavingsLedger() {
  const searchEl = document.getElementById('savings-search-input');
  const catEl = document.getElementById('savings-filter-category');
  const query = (searchEl ? searchEl.value : "").toLowerCase().trim();
  const catFilter = catEl ? catEl.value : "ALL";

  const filtered = (adminState.savingsLedger || []).filter(s => {
    const matchesQuery = !query ||
      (s.name && s.name.toLowerCase().includes(query)) ||
      (s.memberId && s.memberId.toLowerCase().includes(query)) ||
      (s.ref && s.ref.toLowerCase().includes(query)) ||
      (s.category && s.category.toLowerCase().includes(query));

    let matchesCat = true;
    if (catFilter !== "ALL") {
      matchesCat = (s.category || '').toLowerCase().includes(catFilter.toLowerCase());
    }

    return matchesQuery && matchesCat;
  });

  renderSavings(filtered);
}

function renderSavings(list = adminState.savingsLedger) {
  const tbody = document.getElementById('savings-ledger-tbody');
  if (!tbody) return;

  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:18px;">No savings ledger entries match filter criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.slice().reverse().map(s => `
    <tr>
      <td><code>${s.ref}</code></td>
      <td><strong>${s.memberId || '-'}</strong></td>
      <td>${s.name}</td>
      <td>${s.category}</td>
      <td style="color:${s.amount >= 0 ? 'var(--admin-green)' : 'var(--crimson)'}; font-weight:700;">
        ${s.amount >= 0 ? '+' : ''}${formatPeso(s.amount)}
      </td>
      <td style="font-weight:700;">${formatPeso(s.balance)}</td>
    </tr>
  `).join('');
}

// 4. LOAN APPLICATIONS FILTER & RENDER
function filterLoanApps() {
  const searchEl = document.getElementById('loans-search-input');
  const pkgEl = document.getElementById('loans-filter-package');
  const query = (searchEl ? searchEl.value : "").toLowerCase().trim();
  const pkgFilter = pkgEl ? pkgEl.value : "ALL";

  const filtered = (adminState.loanApplications || []).filter(a => {
    const matchesQuery = !query ||
      (a.ref && a.ref.toLowerCase().includes(query)) ||
      (a.applicantName && a.applicantName.toLowerCase().includes(query)) ||
      (a.purpose && a.purpose.toLowerCase().includes(query)) ||
      (a.accountNumber && a.accountNumber.toLowerCase().includes(query));

    let matchesPkg = true;
    if (pkgFilter !== "ALL") {
      const pkgName = ((a.package || '') + ' ' + (a.purpose || '')).toLowerCase();
      matchesPkg = pkgName.includes(pkgFilter.toLowerCase());
    }

    return matchesQuery && matchesPkg;
  });

  renderLoans(filtered);
  lucide.createIcons();
}

function renderLoans(list = adminState.loanApplications) {
  const tbody = document.getElementById('loans-review-tbody');
  if (!tbody) return;

  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:18px;">No loan applications match filter criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(app => `
    <tr>
      <td><code>${app.ref}</code></td>
      <td><strong>${app.applicantName}</strong></td>
      <td style="font-weight:700; color:var(--admin-green);">${formatPeso(app.requestedAmount)}</td>
      <td>${app.term} mos</td>
      <td>${app.purpose}</td>
      <td><span class="badge badge-green">${app.standing || 'Prime'}</span></td>
      <td>
        <button class="btn btn-outline" style="padding:4px 8px; font-size:11px;" onclick="viewAccountStatus('${app.ref}')">
          <i data-lucide="eye" style="width:13px; height:13px;"></i> View Account Status
        </button>
      </td>
    </tr>
  `).join('');
}

function viewAccountStatus(ref) {
  const app = adminState.loanApplications.find(a => a.ref === ref);
  if (!app) return;
  const modalBody = document.getElementById('account-status-modal-body');
  modalBody.innerHTML = `
    <div style="background:var(--admin-light); border:1px solid var(--admin-border-green); padding:16px; border-radius:10px; margin-bottom:14px;">
      <h3 style="font-weight:800; color:var(--admin-dark);">${app.applicantName} (${app.accountNumber})</h3>
      <div style="font-size:13px; color:var(--text-muted);">Application Docket: <strong>${app.ref}</strong></div>
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:13px; margin-bottom:16px;">
      <div><span style="color:var(--text-muted);">Requested Amount:</span> <strong style="color:var(--admin-green);">${formatPeso(app.requestedAmount)}</strong></div>
      <div><span style="color:var(--text-muted);">Repayment Term:</span> <strong>${app.term} Months</strong></div>
      <div><span style="color:var(--text-muted);">Member Savings Balance:</span> <strong style="color:var(--admin-green);">${formatPeso(app.savingsBalance)}</strong></div>
      <div><span style="color:var(--text-muted);">Current Active Loan:</span> <strong style="color:var(--crimson);">${formatPeso(app.currentLoanBalance)}</strong></div>
      <div style="grid-column:span 2;"><span style="color:var(--text-muted);">Account Standing:</span> <strong>${app.standing}</strong></div>
      <div style="grid-column:span 2;"><span style="color:var(--text-muted);">Loan Purpose:</span> <p style="margin-top:4px; font-style:italic;">"${app.purpose}"</p></div>
    </div>
    <div style="display:flex; gap:10px;">
      <button class="btn btn-primary" style="flex:1; justify-content:center;" onclick="grantLoan('${app.ref}')">Approve & Disburse</button>
      <button class="btn btn-danger" style="flex:1; justify-content:center;" onclick="declineLoan('${app.ref}')">Decline</button>
    </div>
  `;
  document.getElementById('account-status-modal').classList.add('active');
  lucide.createIcons();
}

function grantLoan(ref) {
  const result = CoopStore.grantLoan(ref);
  if (!result.success) {
    alert(result.message || "Failed to approve loan.");
    return;
  }
  alert(`Loan application approved! Disbursal transaction generated for ${result.application.applicantName}.`);
  closeModal('account-status-modal');
  renderAdminPortal();
}

function declineLoan(ref) {
  if (confirm(`Are you sure you want to decline loan application ${ref}?`)) {
    const result = CoopStore.rejectLoan(ref);
    if (!result.success) {
      alert(result.message || "Failed to decline loan.");
      return;
    }
    alert(`Loan application ${ref} has been declined.`);
    closeModal('account-status-modal');
    renderAdminPortal();
  }
}

// 5. RECORD PAYMENT FILTER & RENDER
function filterPaymentRecords() {
  const searchEl = document.getElementById('pay-search-ref');
  const chanEl = document.getElementById('pay-filter-channel');
  const query = (searchEl ? searchEl.value : "").toLowerCase().trim();
  const chanFilter = chanEl ? chanEl.value : "ALL";

  const filtered = (adminState.payments || []).filter(p => {
    const matchesQuery = !query ||
      (p.ref && p.ref.toLowerCase().includes(query)) ||
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.bankAccount && p.bankAccount.toLowerCase().includes(query));

    let matchesChan = true;
    if (chanFilter !== "ALL") {
      matchesChan = (p.bankAccount || '').toLowerCase().includes(chanFilter.toLowerCase());
    }

    return matchesQuery && matchesChan;
  });

  renderPayments(filtered);
  lucide.createIcons();
}

function renderPayments(list = adminState.payments) {
  const tbody = document.getElementById('payment-ledger-tbody');
  if (!tbody) return;

  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted); padding:18px;">No payment settlement records match filter criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(p => `
    <tr>
      <td><code>${p.ref}</code></td>
      <td><strong>${p.name}</strong></td>
      <td>${p.bankAccount}</td>
      <td style="color:var(--admin-green); font-weight:700;">${formatPeso(p.received)}</td>
      <td>${formatPeso(p.charges || 0)}</td>
      <td style="color:var(--crimson);">${formatPeso(p.penalties || 0)}</td>
      <td style="font-weight:700;">${formatPeso(p.remainingBalance)}</td>
      <td>
        <button class="btn btn-outline" style="padding:4px 8px; font-size:11px;" onclick="selectPaymentAudit('${p.ref}')">
          <i data-lucide="check-square" style="width:13px; height:13px;"></i> Verify
        </button>
      </td>
    </tr>
  `).join('');
}

function selectPaymentAudit(ref) {
  const p = adminState.payments.find(pay => pay.ref === ref);
  if (!p) return;
  document.getElementById('payment-audit-display').style.display = 'block';
  document.getElementById('audit-name').innerText = p.name;
  document.getElementById('audit-ref').innerText = p.ref;
  document.getElementById('audit-acc').innerText = p.bankAccount;
  document.getElementById('audit-received').innerText = formatPeso(p.received);
  document.getElementById('audit-charges').innerText = formatPeso(p.charges || 0);
  document.getElementById('audit-penalties').innerText = formatPeso(p.penalties || 0);
  document.getElementById('audit-balance').innerText = formatPeso(p.remainingBalance);
  lucide.createIcons();
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

// Reactivity & Cross-tab synchronization
window.addEventListener('storage', function () {
  if (document.getElementById('admin-app-screen').style.display !== 'none') {
    renderAdminPortal();
  }
});

window.addEventListener('coop-data-updated', function () {
  if (document.getElementById('admin-app-screen').style.display !== 'none') {
    renderAdminPortal();
  }
});

window.onload = () => {
  // Check if admin was previously logged in
  if (CoopStore.getAdminLoggedIn()) {
    document.getElementById('admin-auth-screen').style.display = 'none';
    document.getElementById('admin-app-screen').style.display = 'flex';
    renderAdminPortal();
  } else {
    document.getElementById('admin-auth-screen').style.display = 'flex';
    document.getElementById('admin-app-screen').style.display = 'none';
  }
  lucide.createIcons();
};