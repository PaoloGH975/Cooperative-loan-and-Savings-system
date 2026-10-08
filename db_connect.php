<?php
// db_connect.php
// Database Connection Configuration for Cooperative Loan and Savings System
// Connects to MySQL / MariaDB via PDO (PHP Data Objects) with Prepared Statements

$host = '127.0.0.1';
$user = 'root';
$pass = ''; // Default XAMPP password is empty
$dbname = 'coop_loans_savings_db';

// Support default XAMPP port 3306 and customized XAMPP ports such as 5396 or 3307
$portsToTry = [3306, 5396, 3307, 3308];
$pdo = null;
$dbError = null;
$port = 3306;

foreach ($portsToTry as $currentPort) {
    try {
        $candidatePdo = new PDO("mysql:host=$host;port=$currentPort;charset=utf8mb4", $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_TIMEOUT => 2
        ]);
        $pdo = $candidatePdo;
        $port = $currentPort;
        break;
    } catch (PDOException $e) {
        $dbError = $e->getMessage();
    }
}

if ($pdo) {
    try {
        // Ensure database exists
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $pdo->exec("USE `$dbname`");

        // Auto-initialize tables if database is newly created or empty
        $tableCheck = $pdo->query("SHOW TABLES LIKE 'CoopMemberstbl'")->fetch();
        if (!$tableCheck) {
            $sqlFile = __DIR__ . '/database.sql';
            if (file_exists($sqlFile)) {
                $sqlContent = file_get_contents($sqlFile);
                $pdo->exec($sqlContent);
            }
        } else {
            // Auto-migrate schema updates if tables already exist
            try {
                $pdo->exec("ALTER TABLE AdminUserstbl ADD COLUMN email VARCHAR(100) NULL AFTER adminUsername");
                $pdo->exec("UPDATE AdminUserstbl SET email = 'admin@coopcore.ph' WHERE id = 'ADM-001'");
                $pdo->exec("UPDATE AdminUserstbl SET email = 'credit@coopcore.ph' WHERE id = 'ADM-002'");
            } catch (Exception $e) {
            }

            try {
                $pdo->exec("ALTER TABLE MembersFinanceDatatbl ADD COLUMN loanDueDate DATE NULL AFTER monthlyDue");
                $pdo->exec("UPDATE MembersFinanceDatatbl SET loanDueDate = '2026-10-15' WHERE memberId = 'MEM-001'");
                $pdo->exec("UPDATE MembersFinanceDatatbl SET loanDueDate = '2026-10-05' WHERE memberId = 'MEM-002'");
            } catch (Exception $e) {
            }
        }
    } catch (PDOException $e) {
        $dbError = $e->getMessage();
    }
}
