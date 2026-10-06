// database.js
// Cooperative Loan and Savings System - Database Tables & Navigation Module
// IM1 Project: Minimum 7 relational tables

(function (global) {
  // Database Storage Key for Local Persistence
  const DB_KEY = "coop_im1_database";

  // Default seed dataset formatted according to IM1 table structures
  const defaultDatabase = {
    // TABLE 1: Master user accounts for verified members
    CoopMemberstbl: [
      {
        id: "MEM-001",
        accountNumber: "COOP-2024-884102",
        fullName: "Elena Rostova",
        registeredEmail: "elena.rostova@coopmail.org",
        password: "password123",
        contactNumber: "+63 (917) 349-2041",
        dateRegistered: "2026-08-01"
      },
      {
        id: "MEM-002",
        accountNumber: "COOP-2024-551980",
        fullName: "Marcus Vance",
        registeredEmail: "marcus.vance@coopmail.org",
        password: "password123",
        contactNumber: "+63 (915) 782-9901",
        dateRegistered: "2026-08-15"
      },
      {
        id: "MEM-003",
        accountNumber: "COOP-2024-119832",
        fullName: "Amina Diallo",
        registeredEmail: "amina.diallo@coopmail.org",
        password: "password123",
        contactNumber: "+63 (920) 412-8871",
        dateRegistered: "2026-09-01"
      }
    ],

    // TABLE 2: Pre-membership registration & PMES seminar applicants
    membershipApplicationtbl: [
      {
        id: "APP-MEM-001",
        fullLegalName: "Carlos Mendez",
        email: "carlos.mendez@coopmail.org",
        contactNumber: "+63 (918) 223-9041",
        address: "Poblacion 1, Calamba City, Laguna",
        occupation: "Logistics Driver",
        incomeRange: "10000-19999",
        pmesCompleted: true,
        initialShareCapital: 3000.00,
        applicationStatus: "PENDING",
        password: "password123",
        dateApplied: "2026-10-04"
      },
      {
        id: "APP-MEM-002",
        fullLegalName: "Teresa Gomez",
        email: "teresa.gomez@coopmail.org",
        contactNumber: "+63 (922) 881-4412",
        address: "Cabuyao City, Laguna",
        occupation: "Entrepreneur",
        incomeRange: "30000-39999",
        pmesCompleted: false,
        initialShareCapital: 3000.00,
        applicationStatus: "PENDING",
        password: "password123",
        dateApplied: "2026-10-05"
      }
    ],

    // TABLE 3: Member financial balances, credit ratings, and account status
    MembersFinanceDatatbl: [
      {
        id: "FIN-001",
        memberId: "MEM-001",
        withdrawableSavings: 8500.00,
        creditStanding: "Tier A (Prime)",
        loanBalance: 6183.34,
        monthlyDue: 883.33,
        accountStatus: "ACTIVE",
        lastUpdated: "2026-10-06"
      },
      {
        id: "FIN-002",
        memberId: "MEM-002",
        withdrawableSavings: 1200.00,
        creditStanding: "Tier C (Sub Standard)",
        loanBalance: 4100.00,
        monthlyDue: 683.33,
        accountStatus: "ACTIVE",
        lastUpdated: "2026-10-06"
      },
      {
        id: "FIN-003",
        memberId: "MEM-003",
        withdrawableSavings: 15000.00,
        creditStanding: "Tier A (Prime)",
        loanBalance: 0.00,
        monthlyDue: 0.00,
        accountStatus: "ACTIVE",
        lastUpdated: "2026-10-06"
      }
    ],

    // TABLE 4: Member savings deposits & share capital funding records
    MembersDeposit: [
      {
        id: "DEP-1001",
        memberId: "MEM-001",
        depositAmount: 5000.00,
        depositType: "Initial Share Capital",
        paymentChannel: "Cash Over-The-Counter",
        referenceNumber: "SAV-TX-1001",
        dateDeposited: "2026-08-01 09:00 AM"
      },
      {
        id: "DEP-1002",
        memberId: "MEM-002",
        depositAmount: 1200.00,
        depositType: "Share Capital Contribution",
        paymentChannel: "GCash Direct Pay",
        referenceNumber: "SAV-TX-1002",
        dateDeposited: "2026-08-15 11:20 AM"
      },
      {
        id: "DEP-1003",
        memberId: "MEM-003",
        depositAmount: 15000.00,
        depositType: "Fixed High-Yield Savings",
        paymentChannel: "Maya Online Pay",
        referenceNumber: "SAV-TX-1003",
        dateDeposited: "2026-09-01 02:00 PM"
      },
      {
        id: "DEP-1004",
        memberId: "MEM-001",
        depositAmount: 3500.00,
        depositType: "Compulsory Monthly Savings",
        paymentChannel: "GCash Direct Pay",
        referenceNumber: "SAV-TX-1004",
        dateDeposited: "2026-10-01 10:30 AM"
      }
    ],

    // TABLE 5: Member loan applications submitted for credit committee evaluation
    LoanApplicationsTbl: [
      {
        id: "LNAPP-2026-101",
        memberId: "MEM-001",
        loanPackage: "Regular Productive",
        requestedAmount: 10000.00,
        loanTermMonths: 12,
        loanPurpose: "Micro-enterprise capital expansion",
        applicationStatus: "APPROVED",
        dateApplied: "2026-08-10"
      },
      {
        id: "LNAPP-2026-102",
        memberId: "MEM-003",
        loanPackage: "Regular Productive",
        requestedAmount: 25000.00,
        loanTermMonths: 24,
        loanPurpose: "Procurement of commercial agricultural milling machinery",
        applicationStatus: "PENDING",
        dateApplied: "2026-10-02"
      }
    ],

    // TABLE 6: Loan amortizations and repayment settlements
    LoanRepaymentstbl: [
      {
        id: "REPAY-8841",
        memberId: "MEM-001",
        loanAppId: "LNAPP-2026-101",
        amountPaid: 883.33,
        paymentSource: "BDO Unibank 1092-4819-22",
        penaltyFee: 0.00,
        remainingBalance: 6183.34,
        paymentDate: "2026-09-10",
        receiptNumber: "RCT-8841"
      },
      {
        id: "REPAY-8842",
        memberId: "MEM-002",
        loanAppId: "LNAPP-2024-055",
        amountPaid: 683.33,
        paymentSource: "BPI 8412-0091-44",
        penaltyFee: 50.00,
        remainingBalance: 4100.00,
        paymentDate: "2026-09-15",
        receiptNumber: "RCT-8842"
      }
    ],

    // TABLE 7: Savings withdrawals and outbound bank transfers
    SavingsWithdrawalstbl: [
      {
        id: "WDL-5001",
        memberId: "MEM-001",
        withdrawalAmount: 1500.00,
        destinationBank: "BDO",
        targetAccountNumber: "1092-4819-22",
        accountHolderName: "Elena Rostova",
        serviceFee: 15.00,
        transactionDate: "2026-09-20 03:15 PM",
        referenceNumber: "TX-BNK-99120"
      }
    ],

    // TABLE 8 (Bonus Admin): System administrators & loan officers
    AdminUserstbl: [
      {
        id: "ADM-001",
        adminUsername: "admin",
        adminPassword: "adminpassword",
        fullName: "Chief Loan Officer",
        role: "SYSTEM_ADMINISTRATOR",
        dateCreated: "2026-01-01"
      }
    ]
  };

  // Internal loader & saver
  function loadDatabase() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Could not load from localStorage, using defaults", e);
    }
    saveDatabase(defaultDatabase);
    return JSON.parse(JSON.stringify(defaultDatabase));
  }

  function saveDatabase(data) {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(data));
      // Dispatch custom event for real-time listener updates
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("coop-db-changed", { detail: data }));
      }
    } catch (e) {
      console.error("Failed to save database:", e);
    }
  }

  // Database Navigation and Operations Object
  const Database = {
    // Table references for quick access
    get CoopMemberstbl() { return this.getTable("CoopMemberstbl"); },
    get membershipApplicationtbl() { return this.getTable("membershipApplicationtbl"); },
    get MembersFinanceDatatbl() { return this.getTable("MembersFinanceDatatbl"); },
    get MembersDeposit() { return this.getTable("MembersDeposit"); },
    get LoanApplicationsTbl() { return this.getTable("LoanApplicationsTbl"); },
    get LoanRepaymentstbl() { return this.getTable("LoanRepaymentstbl"); },
    get SavingsWithdrawalstbl() { return this.getTable("SavingsWithdrawalstbl"); },
    get AdminUserstbl() { return this.getTable("AdminUserstbl"); },

    // Return all table names
    listTables: function () {
      return [
        "CoopMemberstbl",
        "membershipApplicationtbl",
        "MembersFinanceDatatbl",
        "MembersDeposit",
        "LoanApplicationsTbl",
        "LoanRepaymentstbl",
        "SavingsWithdrawalstbl",
        "AdminUserstbl"
      ];
    },

    // Get all records in a specific table
    getTable: function (tableName) {
      const db = loadDatabase();
      return db[tableName] || [];
    },

    // Find row by primary key 'id'
    findById: function (tableName, id) {
      const rows = this.getTable(tableName);
      return rows.find(r => r.id === id) || null;
    },

    // Insert new record into a table
    insert: function (tableName, newRow) {
      const db = loadDatabase();
      if (!db[tableName]) db[tableName] = [];
      db[tableName].push(newRow);
      saveDatabase(db);
      return newRow;
    },

    // Update existing record by id
    update: function (tableName, id, updates) {
      const db = loadDatabase();
      if (!db[tableName]) return null;
      const index = db[tableName].findIndex(r => r.id === id);
      if (index === -1) return null;
      db[tableName][index] = { ...db[tableName][index], ...updates };
      saveDatabase(db);
      return db[tableName][index];
    },

    // Delete a record by id
    delete: function (tableName, id) {
      const db = loadDatabase();
      if (!db[tableName]) return false;
      const initialLen = db[tableName].length;
      db[tableName] = db[tableName].filter(r => r.id !== id);
      if (db[tableName].length !== initialLen) {
        saveDatabase(db);
        return true;
      }
      return false;
    },

    // Reset database to initial sample records
    reset: function () {
      saveDatabase(defaultDatabase);
      return true;
    },

    // Get a summary overview of table counts (great for teacher defense demo)
    getSummary: function () {
      const db = loadDatabase();
      const summary = {};
      this.listTables().forEach(tbl => {
        summary[tbl] = (db[tbl] || []).length;
      });
      return summary;
    }
  };

  // Expose to window global scope
  global.Database = Database;
  global.CoopDB = Database; // alias for convenient navigation
})(typeof window !== "undefined" ? window : this);

