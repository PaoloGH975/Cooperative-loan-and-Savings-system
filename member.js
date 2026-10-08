// member.js - CoopCore Member Portal Backend Logic

let memberState = {
  profile: {},
  transactions: []
};

let currentMemberId = "MEM-001";

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

function toggleAuthMode(mode) {
  const isReg = mode === 'signup';
  const regGroup = document.getElementById('reg-name-group');
  if (regGroup) regGroup.style.display = isReg ? 'block' : 'none';

  const submitBtn = document.getElementById('auth-submit-btn');
  if (submitBtn) {
    submitBtn.innerHTML = `<i data-lucide="${isReg ? 'user-plus' : 'log-in'}" class="icon"></i> ${isReg ? 'Submit Registration' : 'Login'}`;
  }

  const switchPrompt = document.getElementById('auth-switch-prompt');
  if (switchPrompt) {
    if (isReg) {
      switchPrompt.innerHTML = `Already have an account? <a href="javascript:void(0)" onclick="toggleAuthMode('login')" style="color: var(--primary-green); font-weight: 700; text-decoration: none;">Login here</a>`;
    } else {
      switchPrompt.innerHTML = `Don't have an account? <a href="javascript:void(0)" onclick="toggleAuthMode('signup')" style="color: var(--primary-green); font-weight: 700; text-decoration: none;">Create here</a>`;
    }
  }

  const subtitle = document.getElementById('auth-subtitle');
  if (subtitle) {
    subtitle.innerText = isReg ? "New Member Registration & Application" : "Savings & Credit Cooperative Access";
  }

  lucide.createIcons();
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const regGroup = document.getElementById('reg-name-group');
  const isSignUp = regGroup && regGroup.style.display !== 'none';

  const emailInput = document.getElementById('auth-email');
  const passwordInput = document.getElementById('password');
  const email = emailInput ? emailInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value : "";

  if (isSignUp) {
    // 1. REGISTRATION WORKFLOW
    const fullNameInput = document.getElementById('auth-full-name');
    const fullLegalName = fullNameInput ? fullNameInput.value.trim() : "";

    // Auto-parse parts for backwards-compatible object structures
    const nameParts = fullLegalName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || "";
    const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "";
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

    const birthday = document.getElementById('auth-birthday').value;
    const placeOfBirth = (document.getElementById('auth-place-birth').value || "").trim();
    const address = (document.getElementById('auth-address').value || "").trim();
    const occupation = (document.getElementById('auth-occupation').value || "").trim();
    const gender = document.getElementById('auth-gender').value;
    const nationality = (document.getElementById('auth-nationality').value || "Filipino").trim();
    const income = document.getElementById('auth-income').value;

    if (!fullLegalName || !email || !password) {
      alert("Please complete required registration fields (Full Legal Name, Email, and Password).");
      return;
    }

    // Check if email already registered as member
    const existingMember = CoopStore.getMemberByEmail(email);
    if (existingMember) {
      alert("An account with this email address already exists. Please Sign In.");
      toggleAuthMode('login');
      return;
    }

    // Check if pending approval exists
    const state = CoopStore.get();
    const isPending = (state.pendingApprovals || []).some(a =>
      a.email && a.email.toLowerCase() === email.toLowerCase()
    );
    if (isPending) {
      alert("A registration with this email is already under review by the cooperative credit committee. Please await administrator verification.");
      return;
    }

    // Create pending approval
    CoopStore.createPendingApproval({
      name: fullLegalName,
      fullLegalName: fullLegalName,
      firstName,
      middleName,
      lastName,
      birthday,
      placeOfBirth,
      address,
      occupation,
      gender,
      nationality,
      income,
      email,
      password,
      initialShareCapital: 3000.00,
      pmesCompleted: false
    });

    alert("Registration submitted successfully!\nYour application has been forwarded to the cooperative administration for qualification review and PMES verification.\nOnce approved by the cooperative officer, you can log in to your account.");

    // Reset registration form fields and switch to login
    if (fullNameInput) fullNameInput.value = "";
    document.getElementById('auth-birthday').value = "";
    document.getElementById('auth-place-birth').value = "";
    document.getElementById('auth-address').value = "";
    document.getElementById('auth-occupation').value = "";
    document.getElementById('auth-gender').value = "";
    document.getElementById('auth-income').value = "";
    if (passwordInput) passwordInput.value = "";

    toggleAuthMode('login');
    return;
  }

  // 2. SIGN IN WORKFLOW
  if (!email) {
    alert("Please enter your registered cooperative email.");
    return;
  }

  // Check if still pending qualification approval
  const state = CoopStore.get();
  const pendingApplicant = (state.pendingApprovals || []).find(a =>
    (a.email && a.email.toLowerCase() === email.toLowerCase()) ||
    (a.name && a.name.toLowerCase() === email.toLowerCase())
  );
  if (pendingApplicant) {
    alert("Your membership application is currently undergoing credit committee evaluation and PMES seminar verification. Access will be unlocked upon administrator approval.");
    return;
  }

  // Find member
  const member = CoopStore.getMemberByEmail(email);
  if (!member) {
    alert("Member account not found. Please verify your email or sign up for cooperative membership.");
    return;
  }

  // Account status verification
  if (member.status === "SUSPENDED") {
    alert("Access Denied: Your member account has been SUSPENDED by cooperative administration. Please contact the cooperative office to resolve your account status.");
    return;
  }

  // Password verification
  if (member.password && password && member.password !== password) {
    alert("Incorrect password. Please verify your credentials.");
    return;
  }

  if (member.status === "INACTIVE") {
    alert("Notice: Your account is currently marked as INACTIVE in the cooperative registry. Financial operations are restricted until reactivated.");
  }

  // Successful login
  currentMemberId = member.id;
  CoopStore.setCurrentMemberId(member.id);

  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'block';
  renderMemberPortal();
  switchView('dashboard');
}

function logout() {
  CoopStore.clearCurrentMemberId();
  document.getElementById('app-screen').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
}

function switchView(viewName) {
  document.querySelectorAll('.page-pane').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.sidebar-link').forEach(btn => btn.classList.remove('active'));

  const pane = document.getElementById(`view-${viewName}`);
  if (pane) pane.style.display = 'block';

  const links = document.querySelectorAll('.sidebar-link');
  links.forEach(l => {
    const oc = l.getAttribute('onclick') || '';
    if (oc.includes(`'${viewName}'`)) {
      l.classList.add('active');
    }
  });

  lucide.createIcons();
}

function renderMemberPortal() {
  const member = CoopStore.getMemberById(currentMemberId) || CoopStore.getMemberById("MEM-001");
  if (!member) return;
  currentMemberId = member.id;

  memberState.profile = member;
  memberState.transactions = member.transactions || [];

  // Dynamic overdue assessment based on system date vs loan due date
  const overdueInfo = CoopStore.checkMemberLoanOverdue(member);

  // Update Dashboard Overview
  document.getElementById('user-display-name').innerText = member.name;
  document.getElementById('user-display-acc').innerText = member.accountNumber;
  document.getElementById('user-display-balance').innerText = formatPeso(member.savingsBalance);
  document.getElementById('user-loan-balance').innerText = formatPeso(member.activeLoanBalance);

  // Due date & Overdue penalty indicators on dashboard
  const loanDueSub = document.getElementById('user-loan-due-sub');
  if (loanDueSub) {
    if (member.activeLoanBalance > 0) {
      if (overdueInfo.isOverdue) {
        loanDueSub.innerHTML = `<strong style="color:var(--crimson);">Due: ${overdueInfo.dueDate} (Past Due ${overdueInfo.daysOverdue}d)</strong>`;
      } else {
        loanDueSub.innerText = `Due date: ${overdueInfo.dueDate || 'Current'}`;
      }
    } else {
      loanDueSub.innerText = 'No active loan';
    }
  }

  const monthlyDueEl = document.getElementById('user-monthly-due');
  const monthlyDueSub = document.getElementById('user-monthly-due-sub');
  if (monthlyDueEl) {
    if (overdueInfo.isOverdue) {
      monthlyDueEl.innerText = formatPeso(overdueInfo.totalDue);
      monthlyDueEl.style.color = 'var(--crimson)';
      if (monthlyDueSub) monthlyDueSub.innerHTML = `<span style="color:var(--crimson);">Includes ${formatPeso(overdueInfo.penalty)} late penalty</span>`;
    } else {
      monthlyDueEl.innerText = formatPeso(member.monthlyDue);
      monthlyDueEl.style.color = 'inherit';
      if (monthlyDueSub) monthlyDueSub.innerText = 'Principal + Interest';
    }
  }

  // Dashboard Overdue Alert Banner
  const dashOverdueAlert = document.getElementById('dash-overdue-alert');
  const dashOverdueMsg = document.getElementById('dash-overdue-msg');
  if (dashOverdueAlert) {
    if (overdueInfo.isOverdue) {
      dashOverdueAlert.style.display = 'block';
      if (dashOverdueMsg) {
        dashOverdueMsg.innerText = `Your monthly loan amortization due on ${overdueInfo.dueDate} is past due by ${overdueInfo.daysOverdue} day(s). Pursuant to cooperative bylaws, a 5% late penalty surcharge (${formatPeso(overdueInfo.penalty)}) has been assessed. Total payable: ${formatPeso(overdueInfo.totalDue)}.`;
      }
    } else {
      dashOverdueAlert.style.display = 'none';
    }
  }

  const standingEl = document.getElementById('user-credit-standing');
  if (standingEl) standingEl.innerText = member.creditTier || "Tier C (Sub Standard)";
  const accStandingEl = document.getElementById('user-account-standing');
  if (accStandingEl) {
    const st = (member.status || 'ACTIVE').toUpperCase();
    if (st === 'ACTIVE') {
      accStandingEl.innerText = 'Account Active';
      accStandingEl.style.color = 'var(--primary-green)';
    } else if (st === 'INACTIVE') {
      accStandingEl.innerText = 'Account Inactive';
      accStandingEl.style.color = 'var(--amber)';
    } else if (st === 'SUSPENDED') {
      accStandingEl.innerText = 'Account Suspended';
      accStandingEl.style.color = 'var(--crimson)';
    } else {
      accStandingEl.innerText = member.status;
      accStandingEl.style.color = 'var(--text-muted)';
    }
  }

  // Dashboard Recent Activities (Top 3)
  const dashTbody = document.getElementById('dash-recent-tbody');
  if (dashTbody) {
    if (memberState.transactions.length === 0) {
      dashTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:16px;">No recent transactions on record.</td></tr>`;
    } else {
      dashTbody.innerHTML = memberState.transactions.slice(0, 3).map(tx => `
        <tr>
          <td><strong>${tx.ref}</strong></td>
          <td>${tx.date}</td>
          <td>${tx.type}</td>
          <td style="font-weight:700; color:${tx.amount >= 0 ? 'var(--primary-green)' : 'var(--crimson)'};">
            ${tx.amount >= 0 ? '+' : ''}${formatPeso(tx.amount)}
          </td>
          <td>
            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 11px;" onclick="viewTxDetails('${tx.ref}')">
              <i data-lucide="eye" style="width:13px; height:13px;"></i> Details
            </button>
          </td>
        </tr>
      `).join('');
    }
  }

  // Full Transactions Table (respecting active filters)
  filterTx();

  // Update Deposit Page Recipient Info
  const depRecipient = document.getElementById('deposit-recipient-label');
  if (depRecipient) {
    depRecipient.innerHTML = `${member.name} &bull; ${member.accountNumber}`;
  }

  // Update Bank Transfer Page
  const transferSource = document.getElementById('transfer-source-input');
  if (transferSource) {
    transferSource.value = `Coop Savings (Available: ${formatPeso(member.savingsBalance)})`;
  }
  const transferAmtInput = document.getElementById('transfer-amount');
  if (transferAmtInput) {
    transferAmtInput.max = member.savingsBalance;
  }

  // Update Repayment Page
  const repayLoanRef = document.getElementById('repay-loan-ref');
  if (repayLoanRef) {
    repayLoanRef.innerText = member.activeLoanRef || (member.activeLoanBalance > 0 ? 'Active Loan Docket' : 'None');
  }
  const userLoanBal = document.getElementById('userloanBal');
  if (userLoanBal) userLoanBal.innerText = formatPeso(member.activeLoanBalance);
  const repayMonthlyDue = document.getElementById('repay-monthly-due');
  if (repayMonthlyDue) repayMonthlyDue.innerText = formatPeso(member.monthlyDue);

  const repayDueDate = document.getElementById('repay-due-date');
  if (repayDueDate) repayDueDate.innerText = overdueInfo.dueDate || 'N/A';

  const repayPenaltyRow = document.getElementById('repay-penalty-row');
  const repayPenaltyVal = document.getElementById('repay-penalty-val');
  const repayTotalPayable = document.getElementById('repay-total-payable');
  const repayAmtInput = document.getElementById('repay-amount');

  if (repayPenaltyRow && repayTotalPayable) {
    if (overdueInfo.isOverdue) {
      repayPenaltyRow.style.display = 'flex';
      if (repayPenaltyVal) repayPenaltyVal.innerText = `+${formatPeso(overdueInfo.penalty)}`;
      repayTotalPayable.innerText = formatPeso(overdueInfo.totalDue);
      repayTotalPayable.style.color = 'var(--crimson)';
      if (repayAmtInput && (!repayAmtInput.value || Number(repayAmtInput.value) === Number(member.monthlyDue))) {
        repayAmtInput.value = overdueInfo.totalDue;
      }
    } else {
      repayPenaltyRow.style.display = 'none';
      repayTotalPayable.innerText = formatPeso(member.monthlyDue);
      repayTotalPayable.style.color = 'var(--dark-green)';
      if (repayAmtInput && (!repayAmtInput.value || Number(repayAmtInput.value) === Number(overdueInfo.totalDue))) {
        repayAmtInput.value = member.monthlyDue > 0 ? member.monthlyDue : '';
      }
    }
  }

  // Update Apply Loan Tier Cap
  const applyTierName = document.getElementById('apply-tier-name');
  const applyTierLimit = document.getElementById('apply-tier-limit');
  if (applyTierName && applyTierLimit) {
    const tier = member.creditTier || "Tier C (Sub Standard)";
    applyTierName.innerText = tier;
    let cap = "₱50,000.00";
    if (tier.includes("Tier A")) cap = "₱150,000.00";
    else if (tier.includes("Tier B")) cap = "₱100,000.00";
    applyTierLimit.innerText = `Eligible Borrowing Cap: ${cap}`;
  }

  // Update Apply Loan Page Pre-Check Alert
  const savingsBalEl = document.getElementById('userSavingsBal');
  if (savingsBalEl) savingsBalEl.innerText = formatPeso(member.savingsBalance);

  const thresholdContainer = document.getElementById('loan-threshold-container');
  const thresholdText = document.getElementById('loan-threshold-text');
  const thresholdIcon = document.getElementById('loan-threshold-icon');

  if (thresholdContainer && thresholdText) {
    if (member.savingsBalance >= 6000) {
      thresholdContainer.style.background = "var(--light-green)";
      thresholdContainer.style.borderColor = "var(--border-green)";
      if (thresholdIcon) {
        thresholdIcon.setAttribute('data-lucide', 'check-circle');
        thresholdIcon.style.color = "var(--primary-green)";
      }
      thresholdText.innerHTML = `<strong>Savings Threshold Met:</strong> You currently have <strong>${formatPeso(member.savingsBalance)}</strong> in verified savings, which exceeds the mandatory <strong>₱6,000.00 minimum qualification threshold</strong>.`;
      thresholdText.style.color = "var(--dark-green)";
    } else {
      thresholdContainer.style.background = "#FEF3C7";
      thresholdContainer.style.borderColor = "#FCD34D";
      if (thresholdIcon) {
        thresholdIcon.setAttribute('data-lucide', 'alert-circle');
        thresholdIcon.style.color = "var(--amber)";
      }
      thresholdText.innerHTML = `<strong style="color:var(--amber);">Savings Threshold Not Met:</strong> You currently have <strong>${formatPeso(member.savingsBalance)}</strong> in savings, which is below the mandatory <strong>₱6,000.00 minimum threshold</strong>. Additional savings deposit required before submitting loan applications.`;
      thresholdText.style.color = "var(--amber)";
    }
  }

  // Recalculate quote
  calcLoanQuote();

  // Update Profile Page Fields
  renderProfilePage(member);

  lucide.createIcons();
}

function renderProfilePage(member) {
  const tierBadge = document.getElementById('prof-tier-badge');
  if (tierBadge) tierBadge.innerText = member.creditTier || "Tier C (Sub Standard)";

  const tierLimit = document.getElementById('prof-tier-limit');
  if (tierLimit) {
    let max = "₱50,000";
    if (member.creditTier && member.creditTier.includes("Tier A")) max = "₱150,000";
    else if (member.creditTier && member.creditTier.includes("Tier B")) max = "₱100,000";
    tierLimit.innerText = `Max Credit: ${max}`;
  }

  // Account Status Badge & Box (connected to database)
  const statusBox = document.getElementById('prof-status-box');
  const statusBadge = document.getElementById('prof-status-badge');
  const statusSub = document.getElementById('prof-status-sub');
  const status = (member.status || 'ACTIVE').toUpperCase();

  if (statusBadge) statusBadge.innerText = status;
  if (statusBox && statusSub) {
    if (status === 'ACTIVE') {
      statusBox.style.background = "var(--light-green)";
      statusBox.style.borderColor = "var(--border-green)";
      if (statusBadge) statusBadge.style.color = "var(--primary-green)";
      statusSub.innerText = "Database Verified";
    } else if (status === 'INACTIVE') {
      statusBox.style.background = "#FEF3C7";
      statusBox.style.borderColor = "#FCD34D";
      if (statusBadge) statusBadge.style.color = "var(--amber)";
      statusSub.innerText = "Dormant Record";
    } else if (status === 'SUSPENDED') {
      statusBox.style.background = "#FEE2E2";
      statusBox.style.borderColor = "#FCA5A5";
      if (statusBadge) statusBadge.style.color = "var(--crimson)";
      statusSub.innerText = "Account Restricted";
    }
  }

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val !== undefined && val !== null ? val : "";
  };

  setVal('prof-first-name', member.firstName || (member.name ? member.name.split(' ')[0] : ''));
  setVal('prof-middle-name', member.middleName || '');
  setVal('prof-last-name', member.lastName || (member.name ? member.name.split(' ').slice(1).join(' ') : ''));
  setVal('prof-account-number', member.accountNumber || '');
  setVal('prof-birthday', member.birthday || '1998-05-15');
  setVal('prof-birthplace', member.placeOfBirth || 'Cabuyao, Laguna');
  setVal('prof-phone', member.phone || '');
  setVal('prof-email', member.email || member.alternateEmail || '');
  setVal('prof-occupation', member.occupation || 'Employee');
  setVal('prof-gender', member.gender || 'Female');
  setVal('prof-nationality', member.nationality || 'Filipino');
  setVal('prof-income', member.income || '20000-29999');
  setVal('prof-address', member.address || '');
}

function handleProfileUpdate(e) {
  if (e && e.preventDefault) e.preventDefault();

  const phone = document.getElementById('prof-phone').value.trim();
  const occupation = document.getElementById('prof-occupation').value.trim();
  const gender = document.getElementById('prof-gender').value;
  const nationality = document.getElementById('prof-nationality').value.trim();
  const income = document.getElementById('prof-income').value;
  const address = document.getElementById('prof-address').value.trim();

  const updated = CoopStore.updateMember(currentMemberId, {
    phone,
    occupation,
    gender,
    nationality,
    income,
    address
  });

  if (updated) {
    memberState.profile = updated;
    alert("Profile contact details updated successfully!");
    renderMemberPortal();
  }
}

function renderTransactionsTable(data) {
  const tbody = document.getElementById('tx-full-tbody');
  if (!tbody) return;

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:20px;">No transaction activities recorded.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(tx => `
    <tr>
      <td><code>${tx.ref}</code></td>
      <td>${tx.date}</td>
      <td>${tx.type} <br><small style="color:var(--text-muted);">${tx.channel || '-'}</small></td>
      <td style="font-weight:700; color:${tx.amount >= 0 ? 'var(--primary-green)' : 'var(--crimson)'};">
        ${tx.amount >= 0 ? '+' : ''}${formatPeso(tx.amount)}
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
  const tx = (memberState.transactions || []).find(t => t.ref === ref);
  if (!tx) return;

  const modalBody = document.getElementById('tx-modal-body');
  modalBody.innerHTML = `
    <div style="background: var(--light-green); border:1px solid var(--border-green); padding:16px; border-radius:10px; text-align:center; margin-bottom:16px;">
      <span style="font-size:12px; color:var(--text-muted); font-weight:600;">Transaction Amount</span>
      <div style="font-size:28px; font-weight:800; color:${tx.amount >= 0 ? 'var(--primary-green)' : 'var(--crimson)'};">
        ${tx.amount >= 0 ? '+' : ''}${formatPeso(tx.amount)}
      </div>
      <span class="badge badge-green" style="margin-top:6px;">Status: ${tx.status || 'COMPLETED'}</span>
    </div>

    <table style="width:100%; font-size:13.5px; border-collapse:collapse;">
      <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 0; color:var(--text-muted);">Reference Number</td><td style="text-align:right; font-weight:700;">${tx.ref}</td></tr>
      <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 0; color:var(--text-muted);">Timestamp</td><td style="text-align:right;">${tx.date}</td></tr>
      <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 0; color:var(--text-muted);">Category / Description</td><td style="text-align:right;">${tx.category || tx.type}</td></tr>
      <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 0; color:var(--text-muted);">Payment Channel</td><td style="text-align:right;">${tx.channel || 'Cooperative System'}</td></tr>
      <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 0; color:var(--text-muted);">Processing Fee</td><td style="text-align:right;">${formatPeso(tx.fee || 0)}</td></tr>
      <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 0; color:var(--text-muted);">Resulting Balance</td><td style="text-align:right; font-weight:700; color:var(--dark-green);">${formatPeso(tx.balanceAfter)}</td></tr>
      <tr><td style="padding:8px 0; color:var(--text-muted);">Official Remarks</td><td style="text-align:right; font-style:italic;">${tx.remarks || 'Standard transaction'}</td></tr>
    </table>

    <button class="btn btn-outline" style="width:100%; justify-content:center; margin-top:18px;" onclick="closeModal('tx-modal')">Close Details</button>
  `;

  document.getElementById('tx-modal').classList.add('active');
  lucide.createIcons();
}

function handleDepositSubmit(e) {
  e.preventDefault();
  const member = CoopStore.getMemberById(currentMemberId);
  if (!member || member.status !== 'ACTIVE') {
    alert(`Deposit Blocked: Your account status is currently ${member ? member.status : 'INACTIVE'}. Only ACTIVE members in good standing may deposit funds.`);
    return;
  }

  const amtInput = document.getElementById('dep-amount');
  const typeInput = document.getElementById('dep-type');
  const channelInput = document.getElementById('dep-channel');

  const amt = parseFloat(amtInput ? amtInput.value : 0);
  const type = typeInput ? typeInput.value : "Compulsory Monthly Savings";
  const channel = channelInput ? channelInput.value : "GCash Online Cash-in";

  if (!amt || amt < 100) {
    alert("Minimum deposit amount is ₱100.00.");
    return;
  }

  const result = CoopStore.depositSavings(currentMemberId, amt, type, channel);
  if (!result) {
    alert("Deposit transaction failed.");
    return;
  }

  alert(`Deposit reference ${result.transaction.ref} generated!\n${formatPeso(amt)} has been successfully credited to your cooperative savings account.`);

  if (amtInput) amtInput.value = "";
  renderMemberPortal();
  switchView('dashboard');
}

function handleBankTransfer(e) {
  e.preventDefault();
  const member = CoopStore.getMemberById(currentMemberId);
  if (!member || member.status !== 'ACTIVE') {
    alert(`Transfer Blocked: Your account status is currently ${member ? member.status : 'INACTIVE'}. Only ACTIVE members in good standing may execute transfers.`);
    return;
  }

  const bankInput = document.getElementById('transfer-bank');
  const accNumInput = document.getElementById('transfer-acc-num');
  const accNameInput = document.getElementById('transfer-acc-name');
  const amtInput = document.getElementById('transfer-amount');

  const bank = bankInput ? bankInput.value : "BDO";
  const accNum = accNumInput ? accNumInput.value.trim() : "";
  const accName = accNameInput ? accNameInput.value.trim() : "";
  const amt = parseFloat(amtInput ? amtInput.value : 0);

  const result = CoopStore.transferToBank(currentMemberId, amt, bank, accNum, accName);
  if (!result.success) {
    alert(result.message);
    return;
  }

  alert(`Bank transfer ${result.ref} for ${formatPeso(result.netReceived)} to ${bank} account ${accNum} was executed successfully.`);

  if (accNumInput) accNumInput.value = "";
  if (accNameInput) accNameInput.value = "";
  if (amtInput) amtInput.value = "";

  renderMemberPortal();
  switchView('dashboard');
}

function handleLoanRepayment(e) {
  e.preventDefault();
  const member = CoopStore.getMemberById(currentMemberId);
  if (!member || member.status === 'SUSPENDED') {
    alert(`Repayment Blocked: Your account status is currently ${member ? member.status : 'SUSPENDED'}. Please visit the cooperative cashier directly.`);
    return;
  }

  const sourceInput = document.getElementById('repay-source');
  const amtInput = document.getElementById('repay-amount');

  const source = sourceInput ? sourceInput.value : "Savings";
  const amt = parseFloat(amtInput ? amtInput.value : 0);

  if (!amt || amt <= 0) {
    alert("Please enter a valid repayment amount.");
    return;
  }

  const result = CoopStore.repayLoan(currentMemberId, amt, source);
  if (!result.success) {
    alert(result.message);
    return;
  }

  const msg = result.penaltyPaid > 0
    ? `Loan repayment ${result.ref} processed!\n\nPayment of ${formatPeso(amt)} acknowledged:\n• Late Penalty Fee Settled: ${formatPeso(result.penaltyPaid)}\n• Principal Repaid: ${formatPeso(amt - result.penaltyPaid)}\n\nRemaining loan balance: ${formatPeso(result.member.activeLoanBalance)}\nNext Due Date: ${result.member.loanDueDate || 'None (Fully Settled)'}`
    : `Loan repayment ${result.ref} processed!\n\nPayment of ${formatPeso(amt)} acknowledged.\nRemaining loan balance: ${formatPeso(result.member.activeLoanBalance)}\nNext Due Date: ${result.member.loanDueDate || 'None (Fully Settled)'}`;

  alert(msg);

  if (amtInput) amtInput.value = "";
  renderMemberPortal();
  switchView('dashboard');
}

function calcLoanQuote() {
  const amtInput = document.getElementById('apply-amount');
  const termInput = document.getElementById('apply-term');
  const typeInput = document.getElementById('apply-type');
  const quoteEl = document.getElementById('apply-quote');
  if (!quoteEl) return;

  const p = parseFloat(amtInput ? amtInput.value : 0) || 0;
  const t = parseInt(termInput ? termInput.value : 12) || 12;
  const pkg = typeInput ? typeInput.value : "Regular Productive";

  let rate = 0.06;
  if (pkg.includes("Emergency")) rate = 0.03;
  else if (pkg.includes("Micro")) rate = 0.05;

  const total = p + (p * rate * (t / 12));
  const monthly = t > 0 ? total / t : 0;
  quoteEl.innerText = formatPeso(monthly) + " / month";
}

function handleLoanApplication(e) {
  e.preventDefault();
  const member = CoopStore.getMemberById(currentMemberId);
  if (!member) return;

  // Account status verification
  if (member.status !== 'ACTIVE') {
    alert(`Loan Application Blocked: Only ACTIVE members in good standing are eligible to apply for cooperative loans. Current account status: ${member.status}.`);
    return;
  }

  // 1. Mandatory ₱6,000 savings threshold
  if (member.savingsBalance < 6000) {
    alert("Qualification Error: Cooperative bylaws require at least ₱6,000.00 in verified savings before submitting loan applications.");
    return;
  }

  const amtInput = document.getElementById('apply-amount');
  const amt = parseFloat(amtInput ? amtInput.value : 0) || 0;
  const tier = member.creditTier || "Tier C (Sub Standard)";

  // 2. Member credit tier borrowing limit verification
  if (tier.includes("Tier A") && amt > 150000) {
    alert("Loan Application Error: As a Tier A (Prime) member, your maximum loan application limit is ₱150,000.00.");
    return;
  }
  else if (tier.includes("Tier B") && amt > 100000) {
    alert("Loan Application Error: As a Tier B (Standard) member, your maximum loan application limit is ₱100,000.00.");
    return;
  }
  else if (amt > 50000) {
    alert("Loan Application Error: As a Tier C (Sub Standard) member, your maximum loan application limit is ₱50,000.00.");
    return;
  }

  const type = document.getElementById('apply-type').value;
  const term = parseInt(document.getElementById('apply-term').value) || 12;
  const purpose = (document.getElementById('apply-purpose').value || "").trim();
  const termsAgree = document.getElementById('terms-agree').checked;

  if (!termsAgree) {
    alert("You must agree to the Cooperative Terms, Bylaws, and Undertakings before applying.");
    return;
  }

  if (!purpose) {
    alert("Please provide the specific purpose for the loan.");
    return;
  }

  const result = CoopStore.applyLoan(currentMemberId, {
    package: type,
    amount: amt,
    term: term,
    purpose: purpose
  });

  if (!result.success) {
    alert(result.message);
    return;
  }

  alert(`Loan application submitted successfully!\nDocket Reference: ${result.application.ref}\nYour application has been forwarded to the Credit Committee for qualification review.`);

  document.getElementById('apply-amount').value = "";
  document.getElementById('apply-purpose').value = "";
  document.getElementById('terms-agree').checked = false;
  calcLoanQuote();

  renderMemberPortal();
  switchView('dashboard');
}

function filterTx() {
  const searchEl = document.getElementById('tx-search-input');
  const typeEl = document.getElementById('tx-filter-type');
  const query = (searchEl ? searchEl.value : "").toLowerCase().trim();
  const typeFilter = typeEl ? typeEl.value : "ALL";

  const filtered = (memberState.transactions || []).filter(t => {
    const matchesQuery = !query ||
      (t.ref && t.ref.toLowerCase().includes(query)) ||
      (t.type && t.type.toLowerCase().includes(query)) ||
      (t.category && t.category.toLowerCase().includes(query)) ||
      (t.channel && t.channel.toLowerCase().includes(query)) ||
      (t.remarks && t.remarks.toLowerCase().includes(query));

    let matchesType = true;
    if (typeFilter !== "ALL") {
      const typeStr = ((t.type || '') + ' ' + (t.category || '')).toLowerCase();
      matchesType = typeStr.includes(typeFilter.toLowerCase());
    }

    return matchesQuery && matchesType;
  });

  renderTransactionsTable(filtered);
  lucide.createIcons();
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

// Reactivity & Cross-tab synchronization
window.addEventListener('storage', function () {
  if (document.getElementById('app-screen').style.display !== 'none') {
    const member = CoopStore.getMemberById(currentMemberId);
    if (member && member.status === 'SUSPENDED') {
      alert("Notice: Your session has ended because your account was placed on SUSPENDED status by cooperative administration.");
      logout();
      return;
    }
    renderMemberPortal();
  }
});

window.addEventListener('coop-data-updated', function () {
  if (document.getElementById('app-screen').style.display !== 'none') {
    const member = CoopStore.getMemberById(currentMemberId);
    if (member && member.status === 'SUSPENDED') {
      alert("Notice: Your session has ended because your account was placed on SUSPENDED status by cooperative administration.");
      logout();
      return;
    }
    renderMemberPortal();
  }
});

window.onload = () => {
  const savedMemberId = CoopStore.getCurrentMemberId();
  const member = CoopStore.getMemberById(savedMemberId);

  if (member) {
    if (member.status === 'SUSPENDED') {
      CoopStore.clearCurrentMemberId();
      document.getElementById('auth-screen').style.display = 'flex';
      document.getElementById('app-screen').style.display = 'none';
      alert("Notice: Your member account is currently SUSPENDED by cooperative administration.");
    } else {
      currentMemberId = member.id;
      document.getElementById('auth-screen').style.display = 'none';
      document.getElementById('app-screen').style.display = 'block';
      renderMemberPortal();
    }
  } else {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('app-screen').style.display = 'none';
  }

  lucide.createIcons();
};