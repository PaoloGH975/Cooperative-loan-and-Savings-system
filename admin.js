let adminState = {
  pendingApprovals: [
    {
      id: "APP-MEM-001",
      name: "Danilo Estrada",
      phone: "+63 (918) 291-0021",
      employment: "Full-Time Cooperative Staff",
      pmesCompleted: true,
      initialShareCapital: 6500.00
    },
    {
      id: "APP-MEM-002",
      name: "Teresa Gomez",
      phone: "+63 (922) 881-4412",
      employment: "Self-Employed Entrepreneur",
      pmesCompleted: false,
      initialShareCapital: 3000.00
    }
  ],
  members: [
    {
      id: "MEM-001",
      accountNumber: "COOP-2024-884102",
      name: "Elena Rostova",
      phone: "+63 (917) 349-2041",
      email: "elena.rostova@coopmail.org",
      address: "Bgy. Bucal, Calamba City, Laguna",
      savingsBalance: 8500.00,
      activeLoanBalance: 6183.34,
      accountStanding: "In Good Standing (Prime)",
      status: "ACTIVE"
    },
    {
      id: "MEM-002",
      accountNumber: "COOP-2024-551980",
      name: "Marcus Vance",
      phone: "+63 (915) 782-9901",
      email: "marcus.vance@coopmail.org",
      address: "Bgy. Real, Calamba City, Laguna",
      savingsBalance: 1200.00,
      activeLoanBalance: 4100.00,
      accountStanding: "Probationary (< ₱6,000 threshold)",
      status: "ACTIVE"
    },
    {
      id: "MEM-003",
      accountNumber: "COOP-2024-119832",
      name: "Amina Diallo",
      phone: "+63 (920) 670-1284",
      email: "amina.diallo@coopmail.org",
      address: "Bgy. Halang, Calamba City, Laguna",
      savingsBalance: 15000.00,
      activeLoanBalance: 0.00,
      accountStanding: "In Good Standing (Prime)",
      status: "ACTIVE"
    }
  ],
  savingsLedger: [
    { ref: "SAV-TX-1001", memberId: "MEM-001", name: "Elena Rostova", category: "Initial Share Capital", amount: 5000.00, balance: 5000.00 },
    { ref: "SAV-TX-1002", memberId: "MEM-002", name: "Marcus Vance", category: "Share Capital Contribution", amount: 1200.00, balance: 1200.00 },
    { ref: "SAV-TX-1003", memberId: "MEM-003", name: "Amina Diallo", category: "Fixed High-Yield Savings", amount: 15000.00, balance: 15000.00 },
    { ref: "SAV-TX-1004", memberId: "MEM-001", name: "Elena Rostova", category: "Compulsory Monthly Savings", amount: 3500.00, balance: 8500.00 }
  ],
  loanApplications: [
    {
      ref: "APP-LN-2026-102",
      memberId: "MEM-003",
      applicantName: "Amina Diallo",
      accountNumber: "COOP-2024-119832",
      requestedAmount: 25000.00,
      term: 24,
      purpose: "Procurement of commercial agricultural milling machinery",
      savingsBalance: 15000.00,
      currentLoanBalance: 0.00,
      standing: "Prime (Exceeds ₱6k threshold)"
    }
  ],
  payments: [
    {
      ref: "RCT-8841",
      name: "Elena Rostova",
      bankAccount: "BDO Unibank 1092-4819-22",
      received: 883.33,
      charges: 0.00,
      penalties: 0.00,
      remainingBalance: 6183.34
    },
    {
      ref: "RCT-8842",
      name: "Marcus Vance",
      bankAccount: "BPI 8412-0091-44",
      received: 683.33,
      charges: 25.00,
      penalties: 50.00,
      remainingBalance: 4100.00
    }
  ]
};

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
  return "₱" + Number(val).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function handleAdminLogin(e) {
  e.preventDefault();
  document.getElementById('admin-auth-screen').style.display = 'none';
  document.getElementById('admin-app-screen').style.display = 'flex';
  renderAdminPortal();
}

function adminLogout() {
  document.getElementById('admin-app-screen').style.display = 'none';
  document.getElementById('admin-auth-screen').style.display = 'flex';
}

function switchAdminTab(tabId) {
  document.querySelectorAll('.admin-pane').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
  document.getElementById(`admin-tab-${tabId}`).style.display = 'block';
  event.currentTarget.classList.add('active');
  lucide.createIcons();
}

function renderAdminPortal() {
  // Update Overview Stats
  document.getElementById('stat-members-count').innerText = adminState.members.length;
  const totalSavings = adminState.members.reduce((acc, m) => acc + m.savingsBalance, 0);
  document.getElementById('stat-total-savings').innerText = formatPeso(totalSavings);
  document.getElementById('stat-pending-loans').innerText = adminState.loanApplications.length;
  const totalPortfolio = adminState.members.reduce((acc, m) => acc + m.activeLoanBalance, 0);
  document.getElementById('stat-loan-portfolio').innerText = formatPeso(totalPortfolio);

  // Overview Table
  document.getElementById('admin-dash-tx-tbody').innerHTML = adminState.savingsLedger.slice(-3).reverse().map(t => `
    <tr>
      <td><code>${t.ref}</code></td>
      <td><strong>${t.name}</strong></td>
      <td>${t.category}</td>
      <td style="color:var(--admin-green); font-weight:700;">+${formatPeso(t.amount)}</td>
      <td>Today</td>
    </tr>
  `).join('');

  // 1. Render Approvals
  renderApprovals();

  // 2. Render Registry
  renderRegistry(adminState.members);

  // 3. Render Savings Ledger
  renderSavings(adminState.savingsLedger);

  // 4. Render Loans
  renderLoans(adminState.loanApplications);

  // 5. Render Payments (Non-Input)
  renderPayments(adminState.payments);

  lucide.createIcons();
}

function renderApprovals() {
  const tbody = document.getElementById('approvals-table-tbody');
  tbody.innerHTML = adminState.pendingApprovals.map(app => `
    <tr>
      <td><strong>${app.name}</strong></td>
      <td>${app.phone}</td>
      <td>${app.employment}</td>
      <td>
        <span class="badge badge-red">PMES Pending</span>
      </td>
      <td style="font-weight:700; color:var(--admin-green);">${formatPeso(app.initialShareCapital)}</td>
      <td>
        <button class="btn btn-primary" style="padding:4px 8px; font-size:11px;" onclick="approveMember('${app.id}')">Approve & Issue ID</button>
        <button class="btn btn-danger" style="padding:4px 8px; font-size:11px;" onclick="rejectMember('${app.id}')">Decline</button>
      </td>
    </tr>
  `).join('');
}

function approveMember(id) {
  const app = adminState.pendingApprovals.find(a => a.id === id);
  if (!app) return;
  adminState.members.push({
    id: "MEM-00" + (adminState.members.length + 1),
    accountNumber: "COOP-2024-" + Math.floor(100000 + Math.random() * 900000),
    name: app.name,
    phone: app.phone,
    email: app.name.toLowerCase().replace(' ', '.') + "@coopmail.org",
    address: "Calamba City, Laguna",
    savingsBalance: app.initialShareCapital,
    activeLoanBalance: 0.00,
    accountStanding: "In Good Standing",
    status: "ACTIVE"
  });
  adminState.pendingApprovals = adminState.pendingApprovals.filter(a => a.id !== id);
  alert(`Member ${app.name} successfully approved and registered into cooperative database.`);
  renderAdminPortal();
}

function rejectMember(id) {
  adminState.pendingApprovals = adminState.pendingApprovals.filter(a => a.id !== id);
  renderAdminPortal();
}

function renderRegistry(list) {
  const tbody = document.getElementById('registry-table-tbody');
  tbody.innerHTML = list.map(m => `
    <tr>
      <td><strong>${m.id}</strong></td>
      <td><code>${m.accountNumber}</code></td>
      <td><strong>${m.name}</strong></td>
      <td style="color:var(--admin-green); font-weight:700;">${formatPeso(m.savingsBalance)}</td>
      <td><span class="badge badge-green">${m.status}</span></td>
      <td>
        <button class="btn btn-outline" style="padding:4px 8px; font-size:11px;" onclick="viewMemberDetails('${m.id}')">
          <i data-lucide="eye" style="width:13px; height:13px;"></i> View Account Details
        </button>
      </td>
    </tr>
  `).join('');
}

function viewMemberDetails(memberId) {
  const m = adminState.members.find(mem => mem.id === memberId);
  if (!m) return;
  const modalBody = document.getElementById('account-details-modal-body');
  modalBody.innerHTML = `
    <div style="background:var(--admin-light); border:1px solid var(--admin-border-green); padding:16px; border-radius:10px; margin-bottom:16px;">
      <h3 style="color:var(--admin-dark); font-size:18px; font-weight:800;">${m.name}</h3>
      <p style="font-size:13px; color:var(--text-muted);">Member ID: <strong>${m.id}</strong> &bull; Account: <strong>${m.accountNumber}</strong></p>
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:13px; margin-bottom:16px;">
      <div><span style="color:var(--text-muted);">Phone:</span> <strong>${m.phone}</strong></div>
      <div><span style="color:var(--text-muted);">Email:</span> <strong>${m.email}</strong></div>
      <div><span style="color:var(--text-muted);">Registered Savings:</span> <strong style="color:var(--admin-green);">${formatPeso(m.savingsBalance)}</strong></div>
      <div><span style="color:var(--text-muted);">Active Loan Balance:</span> <strong style="color:var(--crimson);">${formatPeso(m.activeLoanBalance)}</strong></div>
      <div style="grid-column:span 2;"><span style="color:var(--text-muted);">Registered Address:</span> <strong>${m.address}</strong></div>
      <div style="grid-column:span 2;"><span style="color:var(--text-muted);">Account Standing:</span> <strong style="color:var(--admin-green);">${m.accountStanding}</strong></div>
    </div>
    <button class="btn btn-outline" style="width:100%; justify-content:center;" onclick="closeModal('account-details-modal')">Close Account Details</button>
  `;
  document.getElementById('account-details-modal').classList.add('active');
  lucide.createIcons();
}

function filterMemberRegistry(q) {
  const filtered = adminState.members.filter(m => 
    m.name.toLowerCase().includes(q.toLowerCase()) || 
    m.id.toLowerCase().includes(q.toLowerCase()) ||
    m.accountNumber.toLowerCase().includes(q.toLowerCase())
  );
  renderRegistry(filtered);
  lucide.createIcons();
}

function renderSavings(list) {
  const tbody = document.getElementById('savings-ledger-tbody');
  tbody.innerHTML = list.map(s => `
    <tr>
      <td><code>${s.ref}</code></td>
      <td><strong>${s.memberId}</strong></td>
      <td>${s.name}</td>
      <td>${s.category}</td>
      <td style="color:var(--admin-green); font-weight:700;">+${formatPeso(s.amount)}</td>
      <td style="font-weight:700;">${formatPeso(s.balance)}</td>
    </tr>
  `).join('');
}

function filterSavingsLedger(q) {
  const filtered = adminState.savingsLedger.filter(s => 
    s.name.toLowerCase().includes(q.toLowerCase()) || 
    s.memberId.toLowerCase().includes(q.toLowerCase())
  );
  renderSavings(filtered);
}

function renderLoans(list) {
  const tbody = document.getElementById('loans-review-tbody');
  tbody.innerHTML = list.map(app => `
    <tr>
      <td><code>${app.ref}</code></td>
      <td><strong>${app.applicantName}</strong></td>
      <td style="font-weight:700; color:var(--admin-green);">${formatPeso(app.requestedAmount)}</td>
      <td>${app.term} mos</td>
      <td>${app.purpose}</td>
      <td><span class="badge badge-green">${app.standing}</span></td>
      <td>
        <button class="btn btn-outline" style="padding:4px 8px; font-size:11px;" onclick="viewAccountStatus('${app.ref}')">
          <i data-lucide="eye" style="width:13px; height:13px;"></i> View Account Status
        </button>
      </td>
    </tr>
  `).join('');
}

function filterLoanApps(q) {
  const filtered = adminState.loanApplications.filter(a => 
    a.ref.toLowerCase().includes(q.toLowerCase()) ||
    a.applicantName.toLowerCase().includes(q.toLowerCase())
  );
  renderLoans(filtered);
  lucide.createIcons();
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
      <div><span style="color:var(--text-muted);">Member Savings Balance:</span> <strong style="color:var(--admin-green);">${formatPeso(app.savingsBalance)}</strong></div>
      <div><span style="color:var(--text-muted);">Current Active Loan:</span> <strong style="color:var(--crimson);">${formatPeso(app.currentLoanBalance)}</strong></div>
      <div style="grid-column:span 2;"><span style="color:var(--text-muted);">Account Standing:</span> <strong>${app.standing}</strong></div>
      <div style="grid-column:span 2;"><span style="color:var(--text-muted);">Loan Purpose:</span> <p style="margin-top:4px; font-style:italic;">"${app.purpose}"</p></div>
    </div>
    <div style="display:flex; gap:10px;">
      <button class="btn btn-primary" style="flex:1; justify-content:center;" onclick="grantLoan('${app.ref}')">Approve & Disburse</button>
      <button class="btn btn-danger" style="flex:1; justify-content:center;" onclick="closeModal('account-status-modal')">Decline</button>
    </div>
  `;
  document.getElementById('account-status-modal').classList.add('active');
  lucide.createIcons();
}

function grantLoan(ref) {
  adminState.loanApplications = adminState.loanApplications.filter(a => a.ref !== ref);
  alert("Loan application approved! Disbursal transaction generated.");
  closeModal('account-status-modal');
  renderAdminPortal();
}

function renderPayments(list) {
  const tbody = document.getElementById('payment-ledger-tbody');
  tbody.innerHTML = list.map(p => `
    <tr>
      <td><code>${p.ref}</code></td>
      <td><strong>${p.name}</strong></td>
      <td>${p.bankAccount}</td>
      <td style="color:var(--admin-green); font-weight:700;">${formatPeso(p.received)}</td>
      <td>${formatPeso(p.charges)}</td>
      <td style="color:var(--crimson);">${formatPeso(p.penalties)}</td>
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
  document.getElementById('audit-charges').innerText = formatPeso(p.charges);
  document.getElementById('audit-penalties').innerText = formatPeso(p.penalties);
  document.getElementById('audit-balance').innerText = formatPeso(p.remainingBalance);
  lucide.createIcons();
}

function filterPaymentRecords(q) {
  const filtered = adminState.payments.filter(p => 
    p.ref.toLowerCase().includes(q.toLowerCase()) || 
    p.name.toLowerCase().includes(q.toLowerCase())
  );
  renderPayments(filtered);
  lucide.createIcons();
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

window.onload = () => {
  lucide.createIcons();
};