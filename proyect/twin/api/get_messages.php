<?php
// 🔥 INICIO: Configuración de sesión compatible con iframe
// Aceptar PHPSESSID desde GET o POST ANTES de session_start()
if (isset($_GET['PHPSESSID'])) {
    session_id($_GET['PHPSESSID']);
} elseif (isset($_POST['PHPSESSID'])) {
    session_id($_POST['PHPSESSID']);
}

session_start();
// 🔥 FIN

// api/get_messages.php - Obtener chat
// ===================================

// Manejo de preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json');
require_once '../config.php';

// Obtener usuario mediante la sesión activa
$userId = checkSession();

$conn = getDBConnection();

$contactId = isset($_GET['contact_id']) ? (int)$_GET['contact_id'] : 0;
$lastId = isset($_GET['last_id']) ? (int)$_GET['last_id'] : 0;

if ($contactId <= 0) {
    jsonResponse(['success' => false, 'message' => 'ID de contacto inválido'], 400);
}

// Query de mensajes (CORREGIDO: se eliminó el doble INNER)
$query = "
    SELECT 
        m.id, m.sender_id, m.receiver_id, m.message, m.is_read, m.is_buzz, m.created_at,
        sender.name AS sender_name, receiver.name AS receiver_name
    FROM messages m
    INNER JOIN users sender ON m.sender_id = sender.id
    INNER JOIN users receiver ON m.receiver_id = receiver.id
    WHERE 
        ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?))
        " . ($lastId > 0 ? "AND m.id > ?" : "") . "
    ORDER BY m.created_at ASC
    LIMIT 100
";

$stmt = $conn->prepare($query);

if ($lastId > 0) {
    $stmt->bind_param("iiiii", $userId, $contactId, $contactId, $userId, $lastId);
} else {
    $stmt->bind_param("iiii", $userId, $contactId, $contactId, $userId);
}

$stmt->execute();
$result = $stmt->get_result();

$messages = [];
while ($row = $result->fetch_assoc()) {
    $messages[] = [
        'id' => (int)$row['id'],
        'sender_id' => (int)$row['sender_id'],
        'sender_name' => $row['sender_name'],
        'receiver_id' => (int)$row['receiver_id'],
        'receiver_name' => $row['receiver_name'],
        'message' => $row['message'],
        'is_read' => (bool)$row['is_read'],
        'is_buzz' => (bool)$row['is_buzz'],
        'created_at' => $row['created_at'],
        'is_mine' => ((int)$row['sender_id'] === $userId)
    ];
}

// Marcar como leídos solo los mensajes recibidos
if (!empty($messages) && $contactId > 0) {
    $updateStmt = $conn->prepare("
        UPDATE messages 
        SET is_read = TRUE 
        WHERE receiver_id = ? AND sender_id = ? AND is_read = FALSE
    ");
    $updateStmt->bind_param("ii", $userId, $contactId);
    $updateStmt->execute();
    $updateStmt->close();
}

$stmt->close();
$conn->close();

jsonResponse([
    'success'   => true,
    'messages'  => $messages,
    'count'     => count($messages),
    'session_id' => session_id()
]);
?>