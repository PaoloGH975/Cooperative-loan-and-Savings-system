let memberState = {
  profile: {
    name: "Elena Rostova",
    accountNumber: "COOP-2024-884102",
    savingsBalance: 8500.00,
    loanBalance: 6183.34,
    monthlyDue: 883.33,
    creditTier: "Tier A (Prime)",
    status: "ACTIVE"
  },
  transactions: [
    {
      ref: "TX-PH-99201",
      date: "2026-10-01 10:30 AM",
      type: "Savings Deposit",
      category: "Compulsory Monthly Savings",
      channel: "GCash Direct Pay",
      amount: 3500.00,
      fee: 0.00,
      balanceAfter: 8500.00,
      status: "COMPLETED",
      remarks: "Monthly mandatory capital replenishment"
    },
    {
      ref: "TX-PH-88102",
      date: "2026-09-10 02:15 PM",
      type: "Loan Repayment",
      category: "Installment #2 Settlement",
      channel: "Savings Auto-Debit",
      amount: -883.33,
      fee: 0.00,
      balanceAfter: 5000.00,
      status: "COMPLETED",
      remarks: "Regular monthly amortization for LN-2024-089"
    },
    {
      ref: "TX-PH-77001",
      date: "2026-08-01 09:00 AM",
      type: "Share Capital Deposit",
      category: "Initial Membership Equity",
      channel: "Co-op Teller Over-the-counter",
      amount: 5000.00,
      fee: 0.00,
      balanceAfter: 5000.00,
      status: "COMPLETED",
      remarks: "Required minimum equity deposit"
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

function toggleAuthMode(mode) {
  const isReg = mode === 'signup';
  document.getElementById('reg-name-group').style.display = isReg ? 'block' : 'none';
  document.getElementById('auth-submit-btn').innerHTML = `<i data-lucide="${isReg ? 'user-plus' : 'log-in'}" class="icon"></i> ${isReg ? 'Submit Registration' : 'Authenticate'}`;
  document.getElementById('auth-login-tab').className = isReg ? 'btn btn-outline' : 'btn btn-primary';
  document.getElementById('auth-reg-tab').className = isReg ? 'btn btn-primary' : 'btn btn-outline';
  lucide.createIcons();
}

function handleAuthSubmit(e) {
  e.preventDefault();
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'block';
  renderMemberPortal();
}

function logout() {
  document.getElementById('app-screen').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
}

function switchView(viewName) {
  document.querySelectorAll('.page-pane').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.sidebar-link').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`view-${viewName}`).style.display = 'block';
  event.currentTarget.classList.add('active');
  lucide.createIcons();
}

function renderMemberPortal() {
  
  document.getElementById('user-display-name').innerText = memberState.profile.name;
  document.getElementById('user-display-acc').innerText = memberState.profile.accountNumber;
  document.getElementById('user-display-balance').innerText = formatPeso(memberState.profile.savingsBalance);
  document.getElementById('user-loan-balance').innerText = formatPeso(memberState.profile.loanBalance);
  document.getElementById('userloanBal').innerText = formatPeso(memberState.profile.loanBalance);
  document.getElementById('userSavingsBal').innerText = formatPeso(memberState.profile.savingsBalance);
  document.getElementById('user-monthly-due').innerText = formatPeso(memberState.profile.monthlyDue);

  // Render Recent Table (Dashboard)
  const dashTbody = document.getElementById('dash-recent-tbody');
  dashTbody.innerHTML = memberState.transactions.slice(0, 3).map(tx => `
    <tr>
      <td><strong>${tx.ref}</strong></td>
      <td>${tx.date}</td>
      <td>${tx.type}</td>
      <td style="font-weight:700; color:${tx.amount > 0 ? 'var(--primary-green)' : 'var(--crimson)'};">
        ${tx.amount > 0 ? '+' : ''}${formatPeso(tx.amount)}
      </td>
      <td>
        <button class="btn btn-outline" style="padding: 4px 8px; font-size: 11px;" onclick="viewTxDetails('${tx.ref}')">
          <i data-lucide="eye" style="width:13px; height:13px;"></i> Details
        </button>
      </td>
    </tr>
  `).join('');

  // Render Full Transactions Table
  renderTransactionsTable(memberState.transactions);
  lucide.createIcons();
}

function renderTransactionsTable(data) {
  const tbody = document.getElementById('tx-full-tbody');
  tbody.innerHTML = data.map(tx => `
    <tr>
      <td><code>${tx.ref}</code></td>
      <td>${tx.date}</td>
      <td>${tx.type} <br><small style="color:var(--text-muted);">${tx.channel}</small></td>
      <td style="font-weight:700; color:${tx.amount > 0 ? 'var(--primary-green)' : 'var(--crimson)'};">
        ${tx.amount > 0 ? '+' : ''}${formatPeso(tx.amount)}
      </td>
      <td><strong>${formatPeso(tx.balanceAfter)}</strong></td>
      <td>
        <button class="btn btn-outline" style="padding: 4px 10px; font-size: 12px;" onclick="viewTxDetails('${tx.ref}')">
          <i data-lucide="receipt" class="icon"></i> View Details
        </button>
      </td>
    </tr>
  `).join('');
}

function viewTxDetails(ref) {
  const tx = memberState.transactions.find(t => t.ref === ref);
  if (!tx) return;

  const modalBody = document.getElementById('tx-modal-body');
  modalBody.innerHTML = `
    <div style="background: var(--light-green); border:1px solid var(--border-green); padding:16px; border-radius:10px; text-align:center; margin-bottom:16px;">
      <span style="font-size:12px; color:var(--text-muted); font-weight:600;">Transaction Amount</span>
      <div style="font-size:28px; font-weight:800; color:${tx.amount > 0 ? 'var(--primary-green)' : 'var(--crimson)'};">
        ${tx.amount > 0 ? '+' : ''}${formatPeso(tx.amount)}
      </div>
      <span class="badge badge-green" style="margin-top:6px;">Status: ${tx.status}</span>
    </div>

    <table style="width:100%; font-size:13.5px; border-collapse:collapse;">
      <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 0; color:var(--text-muted);">Reference Number</td><td style="text-align:right; font-weight:700;">${tx.ref}</td></tr>
      <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 0; color:var(--text-muted);">Timestamp</td><td style="text-align:right;">${tx.date}</td></tr>
      <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 0; color:var(--text-muted);">Category / Description</td><td style="text-align:right;">${tx.category}</td></tr>
      <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 0; color:var(--text-muted);">Payment Channel</td><td style="text-align:right;">${tx.channel}</td></tr>
      <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 0; color:var(--text-muted);">Processing Fee</td><td style="text-align:right;">${formatPeso(tx.fee)}</td></tr>
      <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 0; color:var(--text-muted);">Resulting Savings Balance</td><td style="text-align:right; font-weight:700; color:var(--dark-green);">${formatPeso(tx.balanceAfter)}</td></tr>
      <tr><td style="padding:8px 0; color:var(--text-muted);">Official Remarks</td><td style="text-align:right; font-style:italic;">${tx.remarks}</td></tr>
    </table>

    <button class="btn btn-outline" style="width:100%; justify-content:center; margin-top:18px;" onclick="closeModal('tx-modal')">Close Details</button>
  `;

  document.getElementById('tx-modal').classList.add('active');
  lucide.createIcons();
}

function handleDepositSubmit(e) {
  e.preventDefault();
  const amt = parseFloat(document.getElementById('dep-amount').value);
  const type = document.getElementById('dep-type').value;

  memberState.profile.savingsBalance += amt;
  const newRef = "TX-PH-" + Math.floor(10000 + Math.random() * 90000);

  memberState.transactions.unshift({
    ref: newRef,
    date: new Date().toLocaleString(),
    type: "Savings Deposit",
    category: type,
    channel: "GCash Direct Pay",
    amount: amt,
    fee: 0.00,
    balanceAfter: memberState.profile.savingsBalance,
    status: "COMPLETED",
    remarks: "Self-service online funding deposit"
  });

  alert(`Deposit reference ${newRef} generated! ${formatPeso(amt)} credited to your account.`);
  renderMemberPortal();
  switchView('dashboard');
}

function handleBankTransfer(e) {
  e.preventDefault();
  const amt = parseFloat(document.getElementById('transfer-amount').value);
  if (amt > memberState.profile.savingsBalance) return alert("Insufficient savings balance.");

  memberState.profile.savingsBalance -= amt;
  const newRef = "TX-BNK-" + Math.floor(10000 + Math.random() * 90000);

  memberState.transactions.unshift({
    ref: newRef,
    date: new Date().toLocaleString(),
    type: "Bank Withdrawal Transfer",
    category: "InstaPay Bank Transfer Out",
    channel: "InstaPay National Clearing Switch",
    amount: -amt,
    fee: 15.00,
    balanceAfter: memberState.profile.savingsBalance,
    status: "COMPLETED",
    remarks: "Withdrawal transfer to beneficiary bank"
  });

  alert(`Bank transfer ${newRef} for ${formatPeso(amt-15)} was executed successfully.`);
  renderMemberPortal();
  switchView('dashboard');
}

function handleLoanRepayment(e) {
  e.preventDefault();
  const amt = parseFloat(document.getElementById('repay-amount').value);
  if (amt > memberState.profile.loanBalance) return alert("Amount exceeds remaining loan balance.");

  
  memberState.profile.loanBalance -= amt;
  const newRef = "TX-PAY-" + Math.floor(10000 + Math.random() * 90000);

  memberState.transactions.unshift({
    ref: newRef,
    date: new Date().toLocaleString(),
    type: "Loan Repayment",
    category: "Amortization Installment",
    channel: "Savings Debit",
    amount: -amt,
    fee: 0.00,
    balanceAfter: memberState.profile.loanBalance,
    status: "COMPLETED",
    remarks: "Repayment credited to LN-2024-089"
  });

  alert(`Loan repayment ${newRef} processed! Remaining balance: ${formatPeso(memberState.profile.loanBalance)}`);
  renderMemberPortal();
  switchView('dashboard');
}

function calcLoanQuote() {
  const p = parseFloat(document.getElementById('apply-amount').value) || 0;
  const t = parseInt(document.getElementById('apply-term').value) || 12;
  const total = p + (p * 0.06 * (t / 12));
  document.getElementById('apply-quote').innerText = formatPeso(total / t) + " / month";
}

function handleLoanApplication(e) {
  e.preventDefault();
  // Enforcement of 6,000 Pesos minimum threshold
  if (memberState.profile.savingsBalance < 6000) {
    alert("Qualification Error: Cooperative bylaws require at least ₱6,000.00 in verified savings before submitting loan applications.");
    return;
  }
  if (memberState.profile.creditTier == "Tier A (Prime)") {
      if(parseFloat(document.getElementById('apply-amount').value) > 150000) {
          alert("Loan Application Error: As a Tier A (Prime) member, your maximum loan application limit is ₱150,000.00.");
          return;
      }
  } else if (memberState.profile.creditTier == "Tier B (Standard)") {
      if(parseFloat(document.getElementById('apply-amount').value) > 100000) {
          alert("Loan Application Error: As a Tier B (Standard) member, your maximum loan application limit is ₱100,000.00.");
          return;
      }
  } else if (memberState.profile.creditTier == "Tier C (Sub Standard)") {
      if(parseFloat(document.getElementById('apply-amount').value) > 50000) {
          alert("Loan Application Error: As a Tier C (Sub Standard) member, your maximum loan application limit is ₱50,000.00.");
          return;
      }
  alert("Application submitted! Your loan docket has been forwarded to the Credit Committee.");
  switchView('dashboard');
}

function toggleTerms() {
    const content = document.getElementById('terms-content');
    const icon = document.getElementById('terms-icon');

    content.classList.toggle('show');

    if (content.classList.contains('show')) {
        icon.setAttribute('data-lucide', 'chevron-up');
    } else {
        icon.setAttribute('data-lucide', 'chevron-down');
    }

    lucide.createIcons();
}

function filterTx(q) {
  const filtered = memberState.transactions.filter(t => 
    t.ref.toLowerCase().includes(q.toLowerCase()) || 
    t.type.toLowerCase().includes(q.toLowerCase())
  );
  renderTransactionsTable(filtered);
  lucide.createIcons();
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

window.onload = () => {
  lucide.createIcons();
}}