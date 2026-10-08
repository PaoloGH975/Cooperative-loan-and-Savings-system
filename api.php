<?php
// api.php
// REST API Bridge between Cooperative System UI and phpMyAdmin (MySQL)
// Uses Prepared Statements to prevent SQL Injection

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db_connect.php';

if (!$pdo) {
    echo json_encode([
        'success' => false,
        'message' => 'Cannot connect to MySQL database. Make sure MySQL is started in XAMPP.',
        'error' => $dbError ?? 'Unknown database error'
    ]);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

switch ($action) {
    // ----------------------------------------------------
    // TEST CONNECTION
    // ----------------------------------------------------
    case 'test_connection':
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        echo json_encode([
            'success' => true,
            'message' => 'Successfully connected to MySQL database in phpMyAdmin!',
            'database' => $dbname,
            'tables' => $tables
        ]);
        break;

    // ----------------------------------------------------
    // 1. MEMBERSHIP APPLICATION (Inserts row into membershipApplicationtbl)
    // ----------------------------------------------------
    case 'apply_membership':
        $id = $input['id'] ?? ('APP-MEM-' . rand(100, 999));
        $fullLegalName = trim($input['fullLegalName'] ?? ($input['name'] ?? ''));
        if (!$fullLegalName) {
            $parts = array_filter([$input['firstName'] ?? '', $input['middleName'] ?? '', $input['lastName'] ?? '']);
            $fullLegalName = trim(implode(' ', $parts));
        }
        if (!$fullLegalName) {
            $fullLegalName = 'New Member';
        }
        $email = trim($input['email'] ?? '');
        $contactNumber = trim($input['contactNumber'] ?? ($input['phone'] ?? ''));
        $address = trim($input['address'] ?? 'Calamba City, Laguna');
        $occupation = trim($input['occupation'] ?? 'Employee');
        $incomeRange = trim($input['incomeRange'] ?? ($input['income'] ?? '20000-29999'));
        $pmesCompleted = !empty($input['pmesCompleted']) ? 1 : 0;
        $initialShareCapital = floatval($input['initialShareCapital'] ?? 3000.00);
        $password = $input['password'] ?? 'password123';
        $dateApplied = $input['dateApplied'] ?? date('Y-m-d');

        $stmt = $pdo->prepare("
            INSERT INTO membershipApplicationtbl 
            (id, fullLegalName, email, contactNumber, address, occupation, incomeRange, pmesCompleted, initialShareCapital, applicationStatus, password, dateApplied)
            VALUES (:id, :fullName, :email, :contact, :address, :occupation, :income, :pmes, :capital, 'PENDING', :password, :dateApplied)
        ");
        $stmt->execute([
            ':id' => $id,
            ':fullName' => $fullLegalName,
            ':email' => $email,
            ':contact' => $contactNumber,
            ':address' => $address,
            ':occupation' => $occupation,
            ':income' => $incomeRange,
            ':pmes' => $pmesCompleted,
            ':capital' => $initialShareCapital,
            ':password' => $password,
            ':dateApplied' => $dateApplied
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Membership application successfully recorded into membershipApplicationtbl in phpMyAdmin!',
            'id' => $id
        ]);
        break;

    // ----------------------------------------------------
    // 1b. APPROVE MEMBERSHIP APPLICATION (Inserts into CoopMemberstbl & MembersFinanceDatatbl)
    // ----------------------------------------------------
    case 'approve_membership':
        $appId = $input['id'] ?? '';
        $memberId = $input['memberId'] ?? ('MEM-' . rand(100, 999));
        $accountNumber = $input['accountNumber'] ?? ('COOP-2024-' . rand(100000, 999900));
        $fullName = trim($input['fullName'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? 'password123';
        $contactNumber = trim($input['contactNumber'] ?? '');
        $initialCapital = floatval($input['initialShareCapital'] ?? 0.00);
        $date = $input['dateRegistered'] ?? date('Y-m-d');

        if ($appId) {
            $upd = $pdo->prepare("UPDATE membershipApplicationtbl SET applicationStatus = 'APPROVED' WHERE id = :id");
            $upd->execute([':id' => $appId]);
        }

        $stmtMem = $pdo->prepare("
            INSERT INTO CoopMemberstbl (id, accountNumber, fullName, registeredEmail, password, contactNumber, dateRegistered)
            VALUES (:id, :acc, :name, :email, :pwd, :contact, :date)
            ON DUPLICATE KEY UPDATE fullName = :name2, contactNumber = :contact2
        ");
        $stmtMem->execute([
            ':id' => $memberId,
            ':acc' => $accountNumber,
            ':name' => $fullName,
            ':email' => $email,
            ':pwd' => $password,
            ':contact' => $contactNumber,
            ':date' => $date,
            ':name2' => $fullName,
            ':contact2' => $contactNumber
        ]);

        $finId = 'FIN-' . substr($memberId, 4);
        $stmtFin = $pdo->prepare("
            INSERT INTO MembersFinanceDatatbl (id, memberId, withdrawableSavings, creditStanding, loanBalance, monthlyDue, loanDueDate, accountStatus, lastUpdated)
            VALUES (:finId, :memberId, :initialCapital, 'Tier C (Sub Standard)', 0.00, 0.00, NULL, 'ACTIVE', :date)
            ON DUPLICATE KEY UPDATE withdrawableSavings = :init2
        ");
        $stmtFin->execute([
            ':finId' => $finId,
            ':memberId' => $memberId,
            ':initialCapital' => $initialCapital,
            ':date' => $date,
            ':init2' => $initialCapital
        ]);

        if ($initialCapital > 0) {
            $depId = 'DEP-' . rand(1000, 9999);
            $ref = 'SAV-TX-' . rand(1000, 9999);
            $stmtDep = $pdo->prepare("
                INSERT INTO MembersDeposit (id, memberId, depositAmount, depositType, paymentChannel, referenceNumber, dateDeposited)
                VALUES (:id, :memberId, :amount, 'Initial Share Capital', 'Cooperative Workstation', :ref, :date)
            ");
            $stmtDep->execute([
                ':id' => $depId,
                ':memberId' => $memberId,
                ':amount' => $initialCapital,
                ':ref' => $ref,
                ':date' => $date . ' 09:00 AM'
            ]);
        }

        echo json_encode(['success' => true, 'message' => "Member $fullName ($memberId) recorded into CoopMemberstbl & MembersFinanceDatatbl!"]);
        break;

    // ----------------------------------------------------
    // 1c. REJECT MEMBERSHIP APPLICATION
    // ----------------------------------------------------
    case 'reject_membership':
        $appId = $input['id'] ?? '';
        $stmt = $pdo->prepare("UPDATE membershipApplicationtbl SET applicationStatus = 'REJECTED' WHERE id = :id");
        $stmt->execute([':id' => $appId]);
        echo json_encode(['success' => true, 'message' => "Application $appId rejected in membershipApplicationtbl!"]);
        break;

    // ----------------------------------------------------
    // 2. SUBMIT LOAN APPLICATION (Inserts row into LoanApplicationsTbl)
    // ----------------------------------------------------
    case 'apply_loan':
        $id = $input['id'] ?? ('APP-LN-2026-' . rand(100, 999));
        $memberId = $input['memberId'] ?? 'MEM-001';
        $package = $input['loanPackage'] ?? 'Regular Productive';
        $amount = floatval($input['requestedAmount'] ?? 0);
        $term = intval($input['loanTermMonths'] ?? 12);
        $purpose = trim($input['loanPurpose'] ?? 'General Purpose');
        $date = $input['dateApplied'] ?? date('Y-m-d');

        $stmt = $pdo->prepare("
            INSERT INTO LoanApplicationsTbl 
            (id, memberId, loanPackage, requestedAmount, loanTermMonths, loanPurpose, applicationStatus, dateApplied)
            VALUES (:id, :memberId, :package, :amount, :term, :purpose, 'PENDING', :dateApplied)
        ");

        $stmt->execute([
            ':id' => $id,
            ':memberId' => $memberId,
            ':package' => $package,
            ':amount' => $amount,
            ':term' => $term,
            ':purpose' => $purpose,
            ':dateApplied' => $date
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Loan application successfully recorded into LoanApplicationsTbl in phpMyAdmin!',
            'application' => [
                'id' => $id,
                'memberId' => $memberId,
                'package' => $package,
                'amount' => $amount,
                'term' => $term,
                'purpose' => $purpose,
                'status' => 'PENDING',
                'dateApplied' => $date
            ]
        ]);
        break;

    // ----------------------------------------------------
    // 3. SAVINGS DEPOSIT (Inserts row into MembersDeposit & updates MembersFinanceDatatbl)
    // ----------------------------------------------------
    case 'deposit':
        $id = $input['id'] ?? ('DEP-' . rand(1000, 9999));
        $memberId = $input['memberId'] ?? 'MEM-001';
        $amount = floatval($input['depositAmount'] ?? 0);
        $type = $input['depositType'] ?? 'Compulsory Monthly Savings';
        $channel = $input['paymentChannel'] ?? 'GCash Direct Pay';
        $ref = $input['referenceNumber'] ?? ('SAV-TX-' . rand(1000, 9999));
        $date = $input['dateDeposited'] ?? date('Y-m-d H:i:s');

        // Insert into MembersDeposit
        $stmt = $pdo->prepare("
            INSERT INTO MembersDeposit 
            (id, memberId, depositAmount, depositType, paymentChannel, referenceNumber, dateDeposited)
            VALUES (:id, :memberId, :amount, :type, :channel, :ref, :date)
        ");
        $stmt->execute([
            ':id' => $id,
            ':memberId' => $memberId,
            ':amount' => $amount,
            ':type' => $type,
            ':channel' => $channel,
            ':ref' => $ref,
            ':date' => $date
        ]);

        // Update withdrawableSavings in MembersFinanceDatatbl
        $upd = $pdo->prepare("
            UPDATE MembersFinanceDatatbl 
            SET withdrawableSavings = withdrawableSavings + :amount, lastUpdated = CURRENT_DATE
            WHERE memberId = :memberId
        ");
        $upd->execute([':amount' => $amount, ':memberId' => $memberId]);

        echo json_encode(['success' => true, 'message' => 'Deposit recorded in MembersDeposit & balance updated in phpMyAdmin!', 'ref' => $ref]);
        break;

    // ----------------------------------------------------
    // 4. BANK WITHDRAWAL TRANSFER (Inserts row into SavingsWithdrawalstbl)
    // ----------------------------------------------------
    case 'transfer':
        $id = $input['id'] ?? ('WDL-' . rand(1000, 9999));
        $memberId = $input['memberId'] ?? 'MEM-001';
        $amount = floatval($input['withdrawalAmount'] ?? 0);
        $bank = $input['destinationBank'] ?? 'BDO';
        $accNum = $input['targetAccountNumber'] ?? '';
        $accName = $input['accountHolderName'] ?? '';
        $fee = floatval($input['serviceFee'] ?? 15.00);
        $date = $input['transactionDate'] ?? date('Y-m-d H:i:s');
        $ref = $input['referenceNumber'] ?? ('TX-BNK-' . rand(10000, 99990));

        $stmt = $pdo->prepare("
            INSERT INTO SavingsWithdrawalstbl 
            (id, memberId, withdrawalAmount, destinationBank, targetAccountNumber, accountHolderName, serviceFee, transactionDate, referenceNumber)
            VALUES (:id, :memberId, :amount, :bank, :accNum, :accName, :fee, :date, :ref)
        ");
        $stmt->execute([
            ':id' => $id,
            ':memberId' => $memberId,
            ':amount' => $amount,
            ':bank' => $bank,
            ':accNum' => $accNum,
            ':accName' => $accName,
            ':fee' => $fee,
            ':date' => $date,
            ':ref' => $ref
        ]);

        // Deduct from savings
        $upd = $pdo->prepare("
            UPDATE MembersFinanceDatatbl 
            SET withdrawableSavings = withdrawableSavings - :amount, lastUpdated = CURRENT_DATE
            WHERE memberId = :memberId
        ");
        $upd->execute([':amount' => $amount, ':memberId' => $memberId]);

        echo json_encode(['success' => true, 'message' => 'Withdrawal recorded in SavingsWithdrawalstbl & balance updated in phpMyAdmin!', 'ref' => $ref]);
        break;

    // ----------------------------------------------------
    // 5. LOAN REPAYMENT (Inserts row into LoanRepaymentstbl & updates balance)
    // ----------------------------------------------------
    case 'repayment':
        $id = $input['id'] ?? ('REPAY-' . rand(1000, 9999));
        $memberId = $input['memberId'] ?? 'MEM-001';
        $loanAppId = $input['loanAppId'] ?? 'LN-ACTIVE';
        $amount = floatval($input['amountPaid'] ?? 0);
        $source = $input['paymentSource'] ?? 'Savings Account';
        $penalty = floatval($input['penaltyFee'] ?? 0);
        $remaining = floatval($input['remainingBalance'] ?? 0);
        $date = $input['paymentDate'] ?? date('Y-m-d');
        $receipt = $input['receiptNumber'] ?? ('RCT-' . rand(1000, 9999));
        $nextDueDate = $input['nextDueDate'] ?? null;

        $stmt = $pdo->prepare("
            INSERT INTO LoanRepaymentstbl 
            (id, memberId, loanAppId, amountPaid, paymentSource, penaltyFee, remainingBalance, paymentDate, receiptNumber)
            VALUES (:id, :memberId, :loanAppId, :amount, :source, :penalty, :remaining, :date, :receipt)
        ");
        $stmt->execute([
            ':id' => $id,
            ':memberId' => $memberId,
            ':loanAppId' => $loanAppId,
            ':amount' => $amount,
            ':source' => $source,
            ':penalty' => $penalty,
            ':remaining' => $remaining,
            ':date' => $date,
            ':receipt' => $receipt
        ]);

        // Update loan balance & due date
        if ($nextDueDate) {
            $upd = $pdo->prepare("
                UPDATE MembersFinanceDatatbl 
                SET loanBalance = :remaining, loanDueDate = :nextDueDate, lastUpdated = CURRENT_DATE
                WHERE memberId = :memberId
            ");
            $upd->execute([':remaining' => $remaining, ':nextDueDate' => $nextDueDate, ':memberId' => $memberId]);
        } else {
            $upd = $pdo->prepare("
                UPDATE MembersFinanceDatatbl 
                SET loanBalance = :remaining, lastUpdated = CURRENT_DATE
                WHERE memberId = :memberId
            ");
            $upd->execute([':remaining' => $remaining, ':memberId' => $memberId]);
        }

        echo json_encode(['success' => true, 'message' => 'Repayment recorded in LoanRepaymentstbl in phpMyAdmin!', 'receipt' => $receipt]);
        break;

    // ----------------------------------------------------
    // 6. UPDATE PROFILE (Updates CoopMemberstbl)
    // ----------------------------------------------------
    case 'update_profile':
        $memberId = $input['memberId'] ?? '';
        $phone = $input['phone'] ?? '';
        $email = $input['email'] ?? '';
        $name = $input['name'] ?? '';

        $stmt = $pdo->prepare("
            UPDATE CoopMemberstbl 
            SET contactNumber = :phone, registeredEmail = :email, fullName = COALESCE(NULLIF(:name, ''), fullName)
            WHERE id = :id
        ");
        $stmt->execute([':phone' => $phone, ':email' => $email, ':name' => $name, ':id' => $memberId]);
        echo json_encode(['success' => true, 'message' => "Profile updated for $memberId in CoopMemberstbl!"]);
        break;

    // ----------------------------------------------------
    // 7. UPDATE MEMBER ACCOUNT STATUS (Updates MembersFinanceDatatbl)
    // ----------------------------------------------------
    case 'update_status':
        $memberId = $input['memberId'] ?? '';
        $newStatus = $input['newStatus'] ?? 'ACTIVE';

        $stmt = $pdo->prepare("
            UPDATE MembersFinanceDatatbl 
            SET accountStatus = :newStatus, lastUpdated = CURRENT_DATE
            WHERE memberId = :memberId
        ");
        $stmt->execute([':newStatus' => $newStatus, ':memberId' => $memberId]);

        echo json_encode(['success' => true, 'message' => "Account status for $memberId updated to $newStatus in phpMyAdmin!"]);
        break;

    // ----------------------------------------------------
    // 8. UPDATE MEMBER CREDIT TIER (Updates MembersFinanceDatatbl)
    // ----------------------------------------------------
    case 'update_tier':
        $memberId = $input['memberId'] ?? '';
        $newTier = $input['newTier'] ?? 'Tier C (Sub Standard)';

        $stmt = $pdo->prepare("
            UPDATE MembersFinanceDatatbl 
            SET creditStanding = :newTier, lastUpdated = CURRENT_DATE
            WHERE memberId = :memberId
        ");
        $stmt->execute([':newTier' => $newTier, ':memberId' => $memberId]);

        echo json_encode(['success' => true, 'message' => "Credit tier for $memberId updated to $newTier in phpMyAdmin!"]);
        break;

    // ----------------------------------------------------
    // 9. GRANT / APPROVE LOAN
    // ----------------------------------------------------
    case 'grant_loan':
        $ref = $input['ref'] ?? '';
        $stmt = $pdo->prepare("UPDATE LoanApplicationsTbl SET applicationStatus = 'APPROVED' WHERE id = :ref");
        $stmt->execute([':ref' => $ref]);

        if (!empty($input['memberId']) && isset($input['loanBalance'])) {
            $updFin = $pdo->prepare("
                UPDATE MembersFinanceDatatbl 
                SET loanBalance = :loanBalance, monthlyDue = :monthlyDue, loanDueDate = :loanDueDate, lastUpdated = CURRENT_DATE
                WHERE memberId = :memberId
            ");
            $updFin->execute([
                ':loanBalance' => floatval($input['loanBalance']),
                ':monthlyDue' => floatval($input['monthlyDue'] ?? 0),
                ':loanDueDate' => $input['loanDueDate'] ?? date('Y-m-d', strtotime('+30 days')),
                ':memberId' => $input['memberId']
            ]);
        }

        echo json_encode(['success' => true, 'message' => "Loan $ref approved in LoanApplicationsTbl in phpMyAdmin!"]);
        break;

    // ----------------------------------------------------
    // 10. REJECT LOAN
    // ----------------------------------------------------
    case 'reject_loan':
        $ref = $input['ref'] ?? '';
        $stmt = $pdo->prepare("UPDATE LoanApplicationsTbl SET applicationStatus = 'REJECTED' WHERE id = :ref");
        $stmt->execute([':ref' => $ref]);
        echo json_encode(['success' => true, 'message' => "Loan $ref rejected in LoanApplicationsTbl in phpMyAdmin!"]);
        break;

    // ----------------------------------------------------
    // 11. GET ALL RECORDS (For inspection / audit in UI)
    // ----------------------------------------------------
    case 'get_all_data':
        $data = [
            'CoopMemberstbl' => $pdo->query("SELECT * FROM CoopMemberstbl")->fetchAll(),
            'membershipApplicationtbl' => $pdo->query("SELECT * FROM membershipApplicationtbl")->fetchAll(),
            'MembersFinanceDatatbl' => $pdo->query("SELECT * FROM MembersFinanceDatatbl")->fetchAll(),
            'MembersDeposit' => $pdo->query("SELECT * FROM MembersDeposit")->fetchAll(),
            'LoanApplicationsTbl' => $pdo->query("SELECT * FROM LoanApplicationsTbl")->fetchAll(),
            'LoanRepaymentstbl' => $pdo->query("SELECT * FROM LoanRepaymentstbl")->fetchAll(),
            'SavingsWithdrawalstbl' => $pdo->query("SELECT * FROM SavingsWithdrawalstbl")->fetchAll(),
            'AdminUserstbl' => $pdo->query("SELECT * FROM AdminUserstbl")->fetchAll()
        ];
        echo json_encode(['success' => true, 'data' => $data]);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action parameter']);
        break;
}
