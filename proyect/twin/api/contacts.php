<?php
// 🔥 Aceptar PHPSESSID por GET o POST antes de iniciar la sesión
if (isset($_GET['PHPSESSID'])) {
    session_id($_GET['PHPSESSID']);
} elseif (isset($_POST['PHPSESSID'])) {
    session_id($_POST['PHPSESSID']);
}

// Iniciar sesión
session_start();

// api/contacts.php - Obtener lista de contactos
// =============================================

// Manejo de preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json');
require_once '../config.php';

// Obtener ID del usuario mediante la sesión ya iniciada
$userId = checkSession();

$conn = getDBConnection();

// Obtener contactos agregados y sus mensajes no leídos
$stmt = $conn->prepare("
    SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.status, 
        u.last_activity,
        (
            SELECT COUNT(*) 
            FROM messages 
            WHERE sender_id = u.id 
            AND receiver_id = ? 
            AND is_read = FALSE
        ) AS unread_count
    FROM users u
    INNER JOIN contacts_list cl ON u.id = cl.contact_id
    WHERE cl.user_id = ?
    ORDER BY u.status DESC, u.name ASC
");

$stmt->bind_param("ii", $userId, $userId);
$stmt->execute();
$result = $stmt->get_result();

$contacts = [];
while ($row = $result->fetch_assoc()) {
    $contacts[] = [
        'id' => (int)$row['id'],
        'name' => $row['name'],
        'email' => $row['email'],
        'status' => $row['status'],
        'unread_count' => (int)$row['unread_count'],
        'last_activity' => $row['last_activity']
    ];
}

jsonResponse([
    'success' => true,
    'contacts' => $contacts,
    'session_id' => session_id()
]);

$stmt->close();
$conn->close();
?>