-- ========================================================
-- Cooperative Loan and Savings Management System
-- IM1 Mini System Database Script (MySQL / MariaDB / phpMyAdmin)
-- Total Tables: 8 Tables (Exceeds minimum requirement of 7)
-- ========================================================

CREATE DATABASE IF NOT EXISTS coop_loans_savings_db;
USE coop_loans_savings_db;

-- --------------------------------------------------------
-- TABLE 1: CoopMemberstbl
-- Master table para sa mga aprubadong miyembro ng cooperative
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS CoopMemberstbl (
    id VARCHAR(20) PRIMARY KEY,
    accountNumber VARCHAR(30) NOT NULL UNIQUE,
    fullName VARCHAR(100) NOT NULL,
    registeredEmail VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    contactNumber VARCHAR(20) NOT NULL,
    dateRegistered DATE NOT NULL
);

-- --------------------------------------------------------
-- TABLE 2: membershipApplicationtbl
-- Para sa mga nag-sign up na aplikante na naghihintay ng PMES seminar at admin approval
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS membershipApplicationtbl (
    id VARCHAR(20) PRIMARY KEY,
    fullLegalName VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    contactNumber VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    occupation VARCHAR(50) NOT NULL,
    incomeRange VARCHAR(30) NOT NULL,
    pmesCompleted BOOLEAN DEFAULT FALSE,
    initialShareCapital DECIMAL(12, 2) DEFAULT 3000.00,
    applicationStatus VARCHAR(20) DEFAULT 'PENDING',
    password VARCHAR(255) NOT NULL,
    dateApplied DATE NOT NULL
);

-- --------------------------------------------------------
-- TABLE 3: MembersFinanceDatatbl
-- Nagtatabi ng financial balances, loan balance, credit standing, at account status
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS MembersFinanceDatatbl (
    id VARCHAR(20) PRIMARY KEY,
    memberId VARCHAR(20) NOT NULL UNIQUE,
    withdrawableSavings DECIMAL(12, 2) DEFAULT 0.00,
    creditStanding VARCHAR(50) DEFAULT 'Tier C (Sub Standard)',
    loanBalance DECIMAL(12, 2) DEFAULT 0.00,
    monthlyDue DECIMAL(12, 2) DEFAULT 0.00,
    loanDueDate DATE NULL,
    accountStatus ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
    lastUpdated DATE NOT NULL,
    FOREIGN KEY (memberId) REFERENCES CoopMemberstbl(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- TABLE 4: MembersDeposit
-- Record ng lahat ng deposits at share capital additions
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS MembersDeposit (
    id VARCHAR(20) PRIMARY KEY,
    memberId VARCHAR(20) NOT NULL,
    depositAmount DECIMAL(12, 2) NOT NULL,
    depositType VARCHAR(50) NOT NULL,
    paymentChannel VARCHAR(50) NOT NULL,
    referenceNumber VARCHAR(50) NOT NULL UNIQUE,
    dateDeposited VARCHAR(50) NOT NULL,
    FOREIGN KEY (memberId) REFERENCES CoopMemberstbl(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- TABLE 5: LoanApplicationsTbl
-- Mga isinumiteng loan request para sa assessment ng Credit Committee
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS LoanApplicationsTbl (
    id VARCHAR(20) PRIMARY KEY,
    memberId VARCHAR(20) NOT NULL,
    loanPackage VARCHAR(50) NOT NULL,
    requestedAmount DECIMAL(12, 2) NOT NULL,
    loanTermMonths INT NOT NULL,
    loanPurpose TEXT NOT NULL,
    applicationStatus VARCHAR(20) DEFAULT 'PENDING',
    dateApplied DATE NOT NULL,
    FOREIGN KEY (memberId) REFERENCES CoopMemberstbl(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- TABLE 6: LoanRepaymentstbl
-- Record ng mga bayad / installment remittances para sa loans
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS LoanRepaymentstbl (
    id VARCHAR(20) PRIMARY KEY,
    memberId VARCHAR(20) NOT NULL,
    loanAppId VARCHAR(20) NOT NULL,
    amountPaid DECIMAL(12, 2) NOT NULL,
    paymentSource VARCHAR(100) NOT NULL,
    penaltyFee DECIMAL(12, 2) DEFAULT 0.00,
    remainingBalance DECIMAL(12, 2) NOT NULL,
    paymentDate DATE NOT NULL,
    receiptNumber VARCHAR(50) NOT NULL UNIQUE,
    FOREIGN KEY (memberId) REFERENCES CoopMemberstbl(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- TABLE 7: SavingsWithdrawalstbl
-- Record ng mga bank transfers at cash-outs mula sa withdrawable savings
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS SavingsWithdrawalstbl (
    id VARCHAR(20) PRIMARY KEY,
    memberId VARCHAR(20) NOT NULL,
    withdrawalAmount DECIMAL(12, 2) NOT NULL,
    destinationBank VARCHAR(50) NOT NULL,
    targetAccountNumber VARCHAR(50) NOT NULL,
    accountHolderName VARCHAR(100) NOT NULL,
    serviceFee DECIMAL(12, 2) DEFAULT 15.00,
    transactionDate VARCHAR(50) NOT NULL,
    referenceNumber VARCHAR(50) NOT NULL UNIQUE,
    FOREIGN KEY (memberId) REFERENCES CoopMemberstbl(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- --------------------------------------------------------
-- TABLE 8: AdminUserstbl
-- Accounts ng mga system administrator at credit evaluation officers
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS AdminUserstbl (
    id VARCHAR(20) PRIMARY KEY,
    adminUsername VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    adminPassword VARCHAR(255) NOT NULL,
    fullName VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'SYSTEM_ADMINISTRATOR',
    dateCreated DATE NOT NULL
);

-- ========================================================
-- SAMPLE DATA (INITIAL RECORDS FOR SYSTEM TESTING & DEMO)
-- ========================================================

-- Seed Table 1: CoopMemberstbl
INSERT INTO CoopMemberstbl (id, accountNumber, fullName, registeredEmail, password, contactNumber, dateRegistered) VALUES
('MEM-001', 'COOP-2024-884102', 'Elena Rostova', 'elena.rostova@coopmail.org', 'password123', '+63 (917) 349-2041', '2026-08-01'),
('MEM-002', 'COOP-2024-551980', 'Marcus Vance', 'marcus.vance@coopmail.org', 'password123', '+63 (915) 782-9901', '2026-08-15'),
('MEM-003', 'COOP-2024-119832', 'Amina Diallo', 'amina.diallo@coopmail.org', 'password123', '+63 (920) 412-8871', '2026-09-01');

-- Seed Table 2: membershipApplicationtbl
INSERT INTO membershipApplicationtbl (id, fullLegalName, email, contactNumber, address, occupation, incomeRange, pmesCompleted, initialShareCapital, applicationStatus, password, dateApplied) VALUES
('APP-MEM-001', 'Carlos Mendez', 'carlos.mendez@coopmail.org', '+63 (918) 223-9041', 'Poblacion 1, Calamba City, Laguna', 'Logistics Driver', '10000-19999', TRUE, 3000.00, 'PENDING', 'password123', '2026-10-04'),
('APP-MEM-002', 'Teresa Gomez', 'teresa.gomez@coopmail.org', '+63 (922) 881-4412', 'Cabuyao City, Laguna', 'Entrepreneur', '30000-39999', FALSE, 3000.00, 'PENDING', 'password123', '2026-10-05');

-- Seed Table 3: MembersFinanceDatatbl
INSERT INTO MembersFinanceDatatbl (id, memberId, withdrawableSavings, creditStanding, loanBalance, monthlyDue, loanDueDate, accountStatus, lastUpdated) VALUES
('FIN-001', 'MEM-001', 8500.00, 'Tier C (Sub Standard)', 6183.34, 883.33, '2026-10-15', 'ACTIVE', '2026-10-06'),
('FIN-002', 'MEM-002', 1200.00, 'Tier C (Sub Standard)', 4100.00, 683.33, '2026-10-05', 'ACTIVE', '2026-10-06'),
('FIN-003', 'MEM-003', 15000.00, 'Tier C (Sub Standard)', 0.00, 0.00, NULL, 'ACTIVE', '2026-10-06');

-- Seed Table 4: MembersDeposit
INSERT INTO MembersDeposit (id, memberId, depositAmount, depositType, paymentChannel, referenceNumber, dateDeposited) VALUES
('DEP-1001', 'MEM-001', 5000.00, 'Initial Share Capital', 'Cash Over-The-Counter', 'SAV-TX-1001', '2026-08-01 09:00 AM'),
('DEP-1002', 'MEM-002', 1200.00, 'Share Capital Contribution', 'GCash Direct Pay', 'SAV-TX-1002', '2026-08-15 11:20 AM'),
('DEP-1003', 'MEM-003', 15000.00, 'Fixed High-Yield Savings', 'Maya Online Pay', 'SAV-TX-1003', '2026-09-01 02:00 PM'),
('DEP-1004', 'MEM-001', 3500.00, 'Compulsory Monthly Savings', 'GCash Direct Pay', 'SAV-TX-1004', '2026-10-01 10:30 AM');

-- Seed Table 5: LoanApplicationsTbl
INSERT INTO LoanApplicationsTbl (id, memberId, loanPackage, requestedAmount, loanTermMonths, loanPurpose, applicationStatus, dateApplied) VALUES
('LNAPP-2026-101', 'MEM-001', 'Regular Productive', 10000.00, 12, 'Micro-enterprise capital expansion', 'APPROVED', '2026-08-10'),
('LNAPP-2026-102', 'MEM-003', 'Regular Productive', 25000.00, 24, 'Procurement of commercial agricultural milling machinery', 'PENDING', '2026-10-02');

-- Seed Table 6: LoanRepaymentstbl
INSERT INTO LoanRepaymentstbl (id, memberId, loanAppId, amountPaid, paymentSource, penaltyFee, remainingBalance, paymentDate, receiptNumber) VALUES
('REPAY-8841', 'MEM-001', 'LNAPP-2026-101', 883.33, 'BDO Unibank 1092-4819-22', 0.00, 6183.34, '2026-09-10', 'RCT-8841'),
('REPAY-8842', 'MEM-002', 'LNAPP-2024-055', 683.33, 'BPI 8412-0091-44', 50.00, 4100.00, '2026-09-15', 'RCT-8842');

-- Seed Table 7: SavingsWithdrawalstbl
INSERT INTO SavingsWithdrawalstbl (id, memberId, withdrawalAmount, destinationBank, targetAccountNumber, accountHolderName, serviceFee, transactionDate, referenceNumber) VALUES
('WDL-5001', 'MEM-001', 1500.00, 'BDO', '1092-4819-22', 'Elena Rostova', 15.00, '2026-09-20 03:15 PM', 'TX-BNK-99120');

-- Seed Table 8: AdminUserstbl
INSERT INTO AdminUserstbl (id, adminUsername, email, adminPassword, fullName, role, dateCreated) VALUES
('ADM-001', 'admin', 'admin@coopcore.ph', 'adminpassword', 'Maria Santos (Operations)', 'SYSTEM_ADMINISTRATOR', '2026-01-01'),
('ADM-002', 'credit', 'credit@coopcore.ph', 'creditpassword', 'Eduardo Ramos (Credit Committee)', 'CREDIT_COMMITTEE_OFFICER', '2026-01-01');


