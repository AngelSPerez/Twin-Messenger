<?php
// 🔥 CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// 🔥 Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 🔥 Soporte para sesión enviada por URL (iframe)
if (isset($_GET['PHPSESSID'])) {
    session_id($_GET['PHPSESSID']);
}

session_start();
require_once '../config.php';

if (!isset($_SESSION['user_id'])) {
    jsonResponse(['success' => false, 'message' => 'No hay sesión activa'], 400);
}

$conn = getDBConnection();
$userId = $_SESSION['user_id'];

// Cambiar estado a offline
$stmt = $conn->prepare("UPDATE users SET status = 'offline' WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$stmt->close();

session_destroy();
$conn->close();

jsonResponse(['success' => true, 'message' => 'Logout exitoso']);
?>
