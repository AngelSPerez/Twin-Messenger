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

// 🔥 Sesión por iframe (PHPSESSID desde la URL)
if (isset($_GET['PHPSESSID'])) {
    session_id($_GET['PHPSESSID']);
} elseif (isset($_POST['PHPSESSID'])) {
    session_id($_POST['PHPSESSID']);
}

session_start();

require_once '../config.php';

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
}

$userId = checkSession(); // Valida la sesión
$conn = getDBConnection();

// Obtener JSON
$data = json_decode(file_get_contents('php://input'), true);
$receiverId = isset($data['receiver_id']) ? (int)$data['receiver_id'] : 0;

if ($receiverId <= 0) {
    jsonResponse(['success' => false, 'message' => 'ID de receptor inválido'], 400);
}

// Verificar receptor
$checkStmt = $conn->prepare("SELECT id, name FROM users WHERE id = ?");
$checkStmt->bind_param("i", $receiverId);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows === 0) {
    jsonResponse(['success' => false, 'message' => 'Usuario no encontrado'], 404);
}

$receiver = $checkResult->fetch_assoc();
$checkStmt->close();

// Crear mensaje tipo buzz
$buzzMessage = "🔔 BUZZ!";

$stmt = $conn->prepare("
    INSERT INTO messages (sender_id, receiver_id, message, is_buzz, created_at)
    VALUES (?, ?, ?, TRUE, NOW())
");
$stmt->bind_param("iis", $userId, $receiverId, $buzzMessage);

if ($stmt->execute()) {

    // Obtener nombre del remitente
    $senderStmt = $conn->prepare("SELECT name FROM users WHERE id = ?");
    $senderStmt->bind_param("i", $userId);
    $senderStmt->execute();
    $sender = $senderStmt->get_result()->fetch_assoc();
    $senderStmt->close();

    jsonResponse([
        'success' => true,
        'message' => 'Buzz enviado',
        'data' => [
            'id' => $stmt->insert_id,
            'sender_id' => $userId,
            'sender_name' => $sender['name'],
            'receiver_id' => $receiverId,
            'receiver_name' => $receiver['name'],
            'is_buzz' => true,
            'message' => $buzzMessage,
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);

} else {
    jsonResponse(['success' => false, 'message' => 'Error al enviar buzz'], 500);
}

$stmt->close();
$conn->close();
?>