<?php
// db_connect.php
// Database Connection Configuration for Cooperative Loan and Savings System
// Connects to MySQL / MariaDB via PDO (PHP Data Objects) with Prepared Statements

$host = '127.0.0.1';
$user = 'root';
$pass = ''; // Default XAMPP password is empty
$dbname = 'coop_loans_savings_db';

// Support default XAMPP port 3306 and customized XAMPP ports such as 5396 or 3307
$portsToTry = [5396, 3306, 3307];
$pdo = null;
$dbError = null;
$port = 5396;

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
        }
    } catch (PDOException $e) {
        $dbError = $e->getMessage();
    }
}
