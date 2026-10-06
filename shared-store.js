// shared-store.js
// Enterprise Cooperative Data Store & Shared Backend Service

(function (global) {
  const STORAGE_KEY = "coop_core_enterprise_data";
  const SESSION_MEMBER_KEY = "coop_current_member_id";
  const SESSION_ADMIN_KEY = "coop_admin_logged_in";

  const DEFAULT_INITIAL_STATE = {
    members: [
      {
        id: "MEM-001",
        accountNumber: "COOP-2024-884102",
        name: "Elena Rostova",
        firstName: "Elena",
        middleName: "Maria",
        lastName: "Rostova",
        phone: "+63 (917) 349-2041",
        email: "elena.rostova@coopmail.org",
        alternateEmail: "elena.rostova@gmail.com",
        birthday: "1998-05-15",
        placeOfBirth: "Cabuyao, Laguna",
        occupation: "Employee",
        gender: "Female",
        nationality: "Filipino",
        income: "20000-29999",
        address: "Bgy. Bucal, Calamba City, Laguna",
        savingsBalance: 8500.00,
        activeLoanBalance: 6183.34,
        monthlyDue: 883.33,
        creditTier: "Tier A (Prime)",
        accountStanding: "In Good Standing (Prime)",
        status: "ACTIVE",
        password: "password123",
        activeLoanRef: "LN-2024-089",
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
      },
      {
        id: "MEM-002",
        accountNumber: "COOP-2024-551980",
        name: "Marcus Vance",
        firstName: "Marcus",
        middleName: "Alexander",
        lastName: "Vance",
        phone: "+63 (915) 782-9901",
        email: "marcus.vance@coopmail.org",
        alternateEmail: "marcus.vance@gmail.com",
        birthday: "1992-08-20",
        placeOfBirth: "Calamba, Laguna",
        occupation: "Self-Employed Entrepreneur",
        gender: "Male",
        nationality: "Filipino",
        income: "10000-19999",
        address: "Bgy. Real, Calamba City, Laguna",
        savingsBalance: 1200.00,
        activeLoanBalance: 4100.00,
        monthlyDue: 683.33,
        creditTier: "Tier C (Sub Standard)",
        accountStanding: "Probationary (< ₱6,000 threshold)",
        status: "ACTIVE",
        password: "password123",
        activeLoanRef: "LN-2024-055",
        transactions: [
          {
            ref: "TX-PH-8842",
            date: "2026-09-12 04:30 PM",
            type: "Loan Repayment",
            category: "Amortization Installment",
            channel: "BPI Online Banking",
            amount: -683.33,
            fee: 0.00,
            balanceAfter: 1200.00,
            status: "COMPLETED",
            remarks: "Monthly amortization payment"
          },
          {
            ref: "TX-PH-1002",
            date: "2026-08-15 11:20 AM",
            type: "Share Capital Deposit",
            category: "Share Capital Contribution",
            channel: "Co-op Teller Over-the-counter",
            amount: 1200.00,
            fee: 0.00,
            balanceAfter: 1200.00,
            status: "COMPLETED",
            remarks: "Share capital contribution"
          }
        ]
      },
      {
        id: "MEM-003",
        accountNumber: "COOP-2024-119832",
        name: "Amina Diallo",
        firstName: "Amina",
        middleName: "Khadija",
        lastName: "Diallo",
        phone: "+63 (920) 670-1284",
        email: "amina.diallo@coopmail.org",
        alternateEmail: "amina.diallo@gmail.com",
        birthday: "1989-11-03",
        placeOfBirth: "Santa Rosa, Laguna",
        occupation: "Business Owner",
        gender: "Female",
        nationality: "Filipino",
        income: "50000-above",
        address: "Bgy. Halang, Calamba City, Laguna",
        savingsBalance: 15000.00,
        activeLoanBalance: 0.00,
        monthlyDue: 0.00,
        creditTier: "Tier A (Prime)",
        accountStanding: "In Good Standing (Prime)",
        status: "ACTIVE",
        password: "password123",
        activeLoanRef: "",
        transactions: [
          {
            ref: "TX-PH-1003",
            date: "2026-09-01 02:00 PM",
            type: "Savings Deposit",
            category: "Fixed High-Yield Savings",
            channel: "BDO Online Banking",
            amount: 15000.00,
            fee: 0.00,
            balanceAfter: 15000.00,
            status: "COMPLETED",
            remarks: "Fixed high-yield savings placement"
          }
        ]
      }
    ],
    pendingApprovals: [
      {
        id: "APP-MEM-001",
        name: "Danilo Estrada",
        firstName: "Danilo",
        middleName: "Jose",
        lastName: "Estrada",
        phone: "+63 (918) 291-0021",
        email: "danilo.estrada@coopmail.org",
        employment: "Full-Time Cooperative Staff",
        occupation: "Cooperative Staff",
        gender: "Male",
        nationality: "Filipino",
        income: "20000-29999",
        address: "Calamba City, Laguna",
        birthday: "1994-03-12",
        placeOfBirth: "Calamba City",
        pmesCompleted: true,
        initialShareCapital: 6500.00,
        password: "password123"
      },
      {
        id: "APP-MEM-002",
        name: "Teresa Gomez",
        firstName: "Teresa",
        middleName: "Santos",
        lastName: "Gomez",
        phone: "+63 (922) 881-4412",
        email: "teresa.gomez@coopmail.org",
        employment: "Self-Employed Entrepreneur",
        occupation: "Entrepreneur",
        gender: "Female",
        nationality: "Filipino",
        income: "30000-39999",
        address: "Cabuyao City, Laguna",
        birthday: "1991-07-25",
        placeOfBirth: "Cabuyao City",
        pmesCompleted: false,
        initialShareCapital: 3000.00,
        password: "password123"
      }
    ],
    savingsLedger: [
      { ref: "SAV-TX-1001", memberId: "MEM-001", name: "Elena Rostova", category: "Initial Share Capital", amount: 5000.00, balance: 5000.00, date: "2026-08-01 09:00 AM" },
      { ref: "SAV-TX-1002", memberId: "MEM-002", name: "Marcus Vance", category: "Share Capital Contribution", amount: 1200.00, balance: 1200.00, date: "2026-08-15 11:20 AM" },
      { ref: "SAV-TX-1003", memberId: "MEM-003", name: "Amina Diallo", category: "Fixed High-Yield Savings", amount: 15000.00, balance: 15000.00, date: "2026-09-01 02:00 PM" },
      { ref: "SAV-TX-1004", memberId: "MEM-001", name: "Elena Rostova", category: "Compulsory Monthly Savings", amount: 3500.00, balance: 8500.00, date: "2026-10-01 10:30 AM" }
    ],
    loanApplications: [
      {
        ref: "APP-LN-2026-102",
        memberId: "MEM-003",
        applicantName: "Amina Diallo",
        accountNumber: "COOP-2024-119832",
        requestedAmount: 25000.00,
        term: 24,
        package: "Regular Productive",
        purpose: "Procurement of commercial agricultural milling machinery",
        savingsBalance: 15000.00,
        currentLoanBalance: 0.00,
        standing: "Prime (Exceeds ₱6k threshold)",
        date: "2026-10-02"
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
        remainingBalance: 6183.34,
        date: "2026-09-10"
      },
      {
        ref: "RCT-8842",
        name: "Marcus Vance",
        bankAccount: "BPI 8412-0091-44",
        received: 683.33,
        charges: 25.00,
        penalties: 50.00,
        remainingBalance: 4100.00,
        date: "2026-09-12"
      }
    ]
  };

  // Safe storage helper with memory fallback
  let memoryStore = null;

  function loadState() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const item = window.localStorage.getItem(STORAGE_KEY);
        if (item) {
          const parsed = JSON.parse(item);
          // Verify that state contains necessary arrays
          if (parsed && Array.isArray(parsed.members)) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn("localStorage not available, using in-memory state:", e);
    }

    if (!memoryStore) {
      memoryStore = JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
      saveState(memoryStore);
    }
    return memoryStore;
  }

  function saveState(state) {
    memoryStore = state;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        // Dispatch custom event for same-tab reactivity
        window.dispatchEvent(new CustomEvent("coop-data-updated", { detail: state }));
      }
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }

  const CoopStore = {
    formatPeso: function (val) {
      const num = Number(val) || 0;
      return "₱" + num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    get: function () {
      return loadState();
    },

    save: function (state) {
      saveState(state);
    },

    resetToDefault: function () {
      const fresh = JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
      saveState(fresh);
      return fresh;
    },

    // Session Management
    getCurrentMemberId: function () {
      try {
        return window.localStorage.getItem(SESSION_MEMBER_KEY) || "MEM-001";
      } catch (e) {
        return "MEM-001";
      }
    },

    setCurrentMemberId: function (id) {
      try {
        window.localStorage.setItem(SESSION_MEMBER_KEY, id);
      } catch (e) { }
    },

    clearCurrentMemberId: function () {
      try {
        window.localStorage.removeItem(SESSION_MEMBER_KEY);
      } catch (e) { }
    },

    getAdminLoggedIn: function () {
      try {
        return window.localStorage.getItem(SESSION_ADMIN_KEY) === "true";
      } catch (e) {
        return false;
      }
    },

    setAdminLoggedIn: function (val) {
      try {
        window.localStorage.setItem(SESSION_ADMIN_KEY, val ? "true" : "false");
      } catch (e) { }
    },

    // Member methods
    getMemberById: function (id) {
      const state = loadState();
      return state.members.find(m => m.id === id) || null;
    },

    getMemberByEmail: function (email) {
      if (!email) return null;
      const clean = email.trim().toLowerCase();
      const state = loadState();
      return state.members.find(m =>
        (m.email && m.email.toLowerCase() === clean) ||
        (m.alternateEmail && m.alternateEmail.toLowerCase() === clean) ||
        (m.accountNumber && m.accountNumber.toLowerCase() === clean)
      ) || null;
    },

    updateMember: function (id, updates) {
      const state = loadState();
      const idx = state.members.findIndex(m => m.id === id);
      if (idx !== -1) {
        state.members[idx] = { ...state.members[idx], ...updates };
        saveState(state);
        return state.members[idx];
      }
      return null;
    },

    setMemberStatus: function (memberId, newStatus) {
      const state = loadState();
      const member = state.members.find(m => m.id === memberId);
      if (!member) return null;

      member.status = newStatus;
      if (newStatus === "SUSPENDED") {
        member.accountStanding = "Account Suspended (Restricted)";
      } else if (newStatus === "INACTIVE") {
        member.accountStanding = "Inactive / Dormant Account";
      } else if (newStatus === "ACTIVE") {
        member.accountStanding = (member.savingsBalance >= 6000) ? "In Good Standing (Prime)" : "Probationary (< ₱6,000 threshold)";
      }

      saveState(state);
      return member;
    },

    // Sign up / Pending application
    createPendingApproval: function (applicant) {
      const state = loadState();
      const nextNum = state.pendingApprovals.length + state.members.length + 1;
      const id = "APP-MEM-" + String(nextNum).padStart(3, "0");

      const newApp = {
        id: id,
        name: `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim() || applicant.name || "New Applicant",
        firstName: applicant.firstName || "",
        middleName: applicant.middleName || "",
        lastName: applicant.lastName || "",
        phone: applicant.phone || "+63 (900) 000-0000",
        email: applicant.email || "",
        employment: applicant.occupation || applicant.employment || "Self-Employed",
        occupation: applicant.occupation || "Employee",
        gender: applicant.gender || "Female",
        nationality: applicant.nationality || "Filipino",
        income: applicant.income || "20000-29999",
        address: applicant.address || "Calamba City, Laguna",
        birthday: applicant.birthday || "1998-01-01",
        placeOfBirth: applicant.placeOfBirth || "Calamba City",
        pmesCompleted: applicant.pmesCompleted !== undefined ? applicant.pmesCompleted : false,
        initialShareCapital: Number(applicant.initialShareCapital) || 3000.00,
        password: applicant.password || "password123",
        date: new Date().toLocaleDateString()
      };

      state.pendingApprovals.push(newApp);
      saveState(state);
      return newApp;
    },

    approvePendingApproval: function (id) {
      const state = loadState();
      const app = state.pendingApprovals.find(a => a.id === id);
      if (!app) return null;

      const memNum = state.members.length + 1;
      const memberId = "MEM-" + String(memNum).padStart(3, "0");
      const accountNumber = "COOP-2024-" + Math.floor(100000 + Math.random() * 900000);
      const initialCapital = Number(app.initialShareCapital) || 0;

      const newMember = {
        id: memberId,
        accountNumber: accountNumber,
        name: app.name,
        firstName: app.firstName || app.name.split(" ")[0] || "",
        middleName: app.middleName || "",
        lastName: app.lastName || app.name.split(" ").slice(1).join(" ") || "",
        phone: app.phone,
        email: app.email || (app.name.toLowerCase().replace(/\s+/g, ".") + "@coopmail.org"),
        alternateEmail: app.email || "",
        birthday: app.birthday || "1998-01-01",
        placeOfBirth: app.placeOfBirth || "Calamba City, Laguna",
        occupation: app.occupation || app.employment || "Employee",
        gender: app.gender || "Female",
        nationality: app.nationality || "Filipino",
        income: app.income || "20000-29999",
        address: app.address || "Calamba City, Laguna",
        savingsBalance: initialCapital,
        activeLoanBalance: 0.00,
        monthlyDue: 0.00,
        creditTier: "Tier A (Prime)",
        accountStanding: "In Good Standing (Prime)",
        status: "ACTIVE",
        password: app.password || "password123",
        activeLoanRef: "",
        transactions: []
      };

      if (initialCapital > 0) {
        const txRef = "SAV-TX-" + Math.floor(1000 + Math.random() * 9000);
        newMember.transactions.push({
          ref: txRef,
          date: new Date().toLocaleString(),
          type: "Share Capital Deposit",
          category: "Initial Share Capital",
          channel: "Cooperative Workstation",
          amount: initialCapital,
          fee: 0.00,
          balanceAfter: initialCapital,
          status: "COMPLETED",
          remarks: "Initial share capital equity registered upon approval"
        });

        state.savingsLedger.push({
          ref: txRef,
          memberId: memberId,
          name: app.name,
          category: "Initial Share Capital",
          amount: initialCapital,
          balance: initialCapital,
          date: new Date().toLocaleString()
        });
      }

      state.members.push(newMember);
      state.pendingApprovals = state.pendingApprovals.filter(a => a.id !== id);
      saveState(state);
      return newMember;
    },

    rejectPendingApproval: function (id) {
      const state = loadState();
      const app = state.pendingApprovals.find(a => a.id === id);
      if (!app) return null;
      state.pendingApprovals = state.pendingApprovals.filter(a => a.id !== id);
      saveState(state);
      return app;
    },

    // Deposit
    depositSavings: function (memberId, amount, type, channel) {
      const state = loadState();
      const member = state.members.find(m => m.id === memberId);
      if (!member) return null;

      const amt = Number(amount);
      if (amt <= 0) return null;

      member.savingsBalance += amt;
      const ref = "TX-PH-" + Math.floor(10000 + Math.random() * 90000);
      const now = new Date().toLocaleString();

      const tx = {
        ref: ref,
        date: now,
        type: "Savings Deposit",
        category: type || "Compulsory Monthly Savings",
        channel: channel || "GCash Direct Pay",
        amount: amt,
        fee: 0.00,
        balanceAfter: member.savingsBalance,
        status: "COMPLETED",
        remarks: "Self-service online funding deposit"
      };

      member.transactions.unshift(tx);

      state.savingsLedger.push({
        ref: ref,
        memberId: member.id,
        name: member.name,
        category: type || "Compulsory Monthly Savings",
        amount: amt,
        balance: member.savingsBalance,
        date: now
      });

      saveState(state);
      return { member, transaction: tx };
    },

    // Transfer out to bank
    transferToBank: function (memberId, amount, bank, accNum, accName) {
      const state = loadState();
      const member = state.members.find(m => m.id === memberId);
      if (!member) return { success: false, message: "Member not found" };

      const amt = Number(amount);
      const fee = 15.00;
      if (amt < 200) return { success: false, message: "Minimum transfer amount is ₱200.00." };
      if (amt > member.savingsBalance) return { success: false, message: "Insufficient savings balance." };

      member.savingsBalance -= amt;
      const ref = "TX-BNK-" + Math.floor(10000 + Math.random() * 90000);
      const now = new Date().toLocaleString();

      const tx = {
        ref: ref,
        date: now,
        type: "Bank Withdrawal Transfer",
        category: "InstaPay Bank Transfer Out",
        channel: `${bank} (${accNum})`,
        amount: -amt,
        fee: fee,
        balanceAfter: member.savingsBalance,
        status: "COMPLETED",
        remarks: `Withdrawal transfer of ${CoopStore.formatPeso(amt - fee)} to ${accName} via ${bank}`
      };

      member.transactions.unshift(tx);

      state.savingsLedger.push({
        ref: ref,
        memberId: member.id,
        name: member.name,
        category: "InstaPay Bank Withdrawal",
        amount: -amt,
        balance: member.savingsBalance,
        date: now
      });

      saveState(state);
      return { success: true, ref: ref, member, transaction: tx, netReceived: amt - fee };
    },

    // Loan repayment
    repayLoan: function (memberId, amount, source) {
      const state = loadState();
      const member = state.members.find(m => m.id === memberId);
      if (!member) return { success: false, message: "Member not found" };

      const amt = Number(amount);
      if (amt <= 0) return { success: false, message: "Invalid payment amount." };
      if (member.activeLoanBalance <= 0) return { success: false, message: "No active loan balance to repay." };
      if (amt > member.activeLoanBalance) return { success: false, message: "Amount exceeds remaining loan balance." };

      if (source === "Savings") {
        if (member.savingsBalance < amt) {
          return { success: false, message: "Insufficient savings balance for automatic debit." };
        }
        member.savingsBalance -= amt;
      }

      member.activeLoanBalance = Math.max(0, member.activeLoanBalance - amt);
      if (member.activeLoanBalance === 0) {
        member.monthlyDue = 0.00;
        member.activeLoanRef = "";
      } else {
        member.monthlyDue = Math.min(member.monthlyDue, member.activeLoanBalance);
      }

      const receiptRef = "RCT-" + Math.floor(8840 + Math.random() * 1000);
      const now = new Date().toLocaleString();
      const channelLabel = source === "Savings" ? "Savings Auto-Debit" : (source === "GCash" ? "GCash / Maya QR Payment" : "Direct Online Banking");

      const tx = {
        ref: receiptRef,
        date: now,
        type: "Loan Repayment",
        category: "Amortization Settlement",
        channel: channelLabel,
        amount: -amt,
        fee: 0.00,
        balanceAfter: member.savingsBalance,
        status: "COMPLETED",
        remarks: `Repayment credited to ${member.activeLoanRef || 'Active Loan'}. Remaining balance: ${CoopStore.formatPeso(member.activeLoanBalance)}`
      };

      member.transactions.unshift(tx);

      // Record in Admin Payments Audit Log
      state.payments.unshift({
        ref: receiptRef,
        name: member.name,
        bankAccount: `${channelLabel} (${member.accountNumber})`,
        received: amt,
        charges: 0.00,
        penalties: 0.00,
        remainingBalance: member.activeLoanBalance,
        date: new Date().toLocaleDateString()
      });

      if (source === "Savings") {
        state.savingsLedger.push({
          ref: receiptRef,
          memberId: member.id,
          name: member.name,
          category: "Loan Repayment Auto-Debit",
          amount: -amt,
          balance: member.savingsBalance,
          date: now
        });
      }

      saveState(state);
      return { success: true, ref: receiptRef, member, transaction: tx };
    },

    // Apply for loan
    applyLoan: function (memberId, data) {
      const state = loadState();
      const member = state.members.find(m => m.id === memberId);
      if (!member) return { success: false, message: "Member not found" };

      // Mandatory ₱6,000 threshold check
      if (member.savingsBalance < 6000) {
        return {
          success: false,
          message: "Qualification Error: Cooperative bylaws require at least ₱6,000.00 in verified savings before submitting loan applications."
        };
      }

      const amt = Number(data.amount);
      const term = parseInt(data.term) || 12;

      // Tier check
      let maxLimit = 150000;
      if (member.creditTier.includes("Tier B")) maxLimit = 100000;
      else if (member.creditTier.includes("Tier C")) maxLimit = 50000;

      if (amt > maxLimit) {
        return {
          success: false,
          message: `Loan Application Error: As a ${member.creditTier} member, your maximum loan application limit is ${CoopStore.formatPeso(maxLimit)}.`
        };
      }

      const ref = "APP-LN-2026-" + Math.floor(100 + Math.random() * 900);
      const newApp = {
        ref: ref,
        memberId: member.id,
        applicantName: member.name,
        accountNumber: member.accountNumber,
        requestedAmount: amt,
        term: term,
        package: data.package || "Regular Productive",
        purpose: data.purpose || "General Purpose",
        savingsBalance: member.savingsBalance,
        currentLoanBalance: member.activeLoanBalance,
        standing: `${member.creditTier} (Exceeds ₱6k threshold)`,
        date: new Date().toLocaleDateString()
      };

      state.loanApplications.unshift(newApp);
      saveState(state);
      return { success: true, application: newApp };
    },

    // Grant loan (Admin)
    grantLoan: function (ref) {
      const state = loadState();
      const app = state.loanApplications.find(a => a.ref === ref);
      if (!app) return { success: false, message: "Loan application not found" };

      const member = state.members.find(m => m.id === app.memberId);
      if (!member) return { success: false, message: "Applicant member record not found" };

      const amt = Number(app.requestedAmount);
      const term = Number(app.term) || 12;
      let rate = 0.06;
      if (app.package && app.package.includes("Emergency")) rate = 0.03;
      else if (app.package && app.package.includes("Micro")) rate = 0.05;

      const totalRepay = amt + (amt * rate * (term / 12));
      const monthlyPayment = totalRepay / term;

      member.activeLoanBalance += amt;
      member.monthlyDue = monthlyPayment;
      member.activeLoanRef = "LN-2026-" + Math.floor(100 + Math.random() * 900);

      // Disburse into savings or record disbursal transaction
      const disbRef = "DISB-" + Math.floor(10000 + Math.random() * 90000);
      const now = new Date().toLocaleString();

      member.transactions.unshift({
        ref: disbRef,
        date: now,
        type: "Loan Disbursal",
        category: app.package || "Productive Loan Disbursal",
        channel: "Credit Committee Disbursal",
        amount: amt,
        fee: 0.00,
        balanceAfter: member.savingsBalance,
        status: "COMPLETED",
        remarks: `Disbursal for approved loan docket ${app.ref}. Monthly due: ${CoopStore.formatPeso(monthlyPayment)}`
      });

      state.loanApplications = state.loanApplications.filter(a => a.ref !== ref);
      saveState(state);
      return { success: true, member, application: app };
    },

    // Decline loan (Admin)
    rejectLoan: function (ref) {
      const state = loadState();
      const app = state.loanApplications.find(a => a.ref === ref);
      if (!app) return { success: false, message: "Loan application not found" };

      state.loanApplications = state.loanApplications.filter(a => a.ref !== ref);
      saveState(state);
      return { success: true, application: app };
    }
  };

  global.CoopStore = CoopStore;
})(typeof window !== "undefined" ? window : this);

