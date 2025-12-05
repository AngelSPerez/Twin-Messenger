<?php

// ===============================================
// 🔥 SESIÓN COMPATIBLE CON IFRAME (SIN COOKIES)
// ===============================================

// 1. Leer PHPSESSID desde GET o POST **ANTES** de session_start()
if (isset($_GET['PHPSESSID'])) {
    session_id($_GET['PHPSESSID']);
} elseif (isset($_POST['PHPSESSID'])) {
    session_id($_POST['PHPSESSID']);
}

// 2. Iniciar sesión normalmente
session_start();

// ===============================================
// api/add_contact.php - Agregar contacto
// ===============================================

// Manejo de preflight OPTIONS (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json');

require_once '../config.php';

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
}

// Obtener usuario autenticado
$userId = checkSession();

// 🔍 DEBUG: Ver qué usuario está haciendo la petición
error_log("👤 Usuario autenticado ID: " . $userId);

$conn = getDBConnection();

// Leer datos JSON
$data = json_decode(file_get_contents('php://input'), true);
$contactEmail = isset($data['email']) ? sanitize($data['email']) : '';

// 🔍 DEBUG: Ver qué email se está buscando
error_log("📧 Email buscado: " . $contactEmail);

if (empty($contactEmail)) {
    jsonResponse(['success' => false, 'message' => 'Debe proporcionar un correo electrónico'], 400);
}

// Buscar usuario por email
$contactStmt = $conn->prepare("SELECT id, name, email FROM users WHERE email = ?");
$contactStmt->bind_param("s", $contactEmail);
$contactStmt->execute();
$contactResult = $contactStmt->get_result();

if ($contactResult->num_rows === 0) {
    jsonResponse(['success' => false, 'message' => 'Usuario no encontrado con email: ' . $contactEmail], 404);
}

$contact = $contactResult->fetch_assoc();
$contactId = (int)$contact['id'];
$contactName = $contact['name'];
$contactEmailDB = $contact['email'];
$contactStmt->close();

// 🔍 DEBUG: Ver qué usuario se encontró
error_log("✅ Usuario encontrado - ID: " . $contactId . " | Email: " . $contactEmailDB);

// Evitar agregarte a ti mismo
if ($contactId === $userId) {
    error_log("❌ Intento de agregarse a sí mismo - UserID: $userId === ContactID: $contactId");
    jsonResponse(['success' => false, 'message' => 'No puedes agregarte a ti mismo (Tu ID: ' . $userId . ', ID buscado: ' . $contactId . ')'], 400);
}

// Verificar existencia previa
$checkStmt = $conn->prepare("
    SELECT COUNT(*) 
    FROM contacts_list 
    WHERE user_id = ? AND contact_id = ?
");
$checkStmt->bind_param("ii", $userId, $contactId);
$checkStmt->execute();
$count = $checkStmt->get_result()->fetch_row()[0];
$checkStmt->close();

if ($count > 0) {
    jsonResponse(['success' => false, 'message' => 'El usuario ya es tu contacto'], 409);
}

// Insertar relación doble
$insertStmt = $conn->prepare("
    INSERT INTO contacts_list (user_id, contact_id) 
    VALUES (?, ?), (?, ?)
");
$insertStmt->bind_param("iiii", $userId, $contactId, $contactId, $userId);

if ($insertStmt->execute()) {
    error_log("✅ Contacto agregado exitosamente: UserID $userId agregó a ContactID $contactId");
    jsonResponse([
        'success' => true,
        'message' => "¡$contactName agregado exitosamente!",
        'contact' => [
            'id' => $contactId, 
            'name' => $contactName,
            'email' => $contactEmailDB
        ],
        'session_id' => session_id(),
        'debug' => [
            'your_id' => $userId,
            'contact_id' => $contactId,
            'contact_email' => $contactEmailDB
        ]
    ]);
} else {
    error_log("❌ Error al guardar contacto: " . $conn->error);
    jsonResponse(['success' => false, 'message' => 'Error al guardar el contacto: ' . $conn->error], 500);
}

$insertStmt->close();
$conn->close();
?>