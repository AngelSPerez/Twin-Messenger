<?php
// 🔥 CORS (necesario para que fetch("twin/api/...") funcione)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// 🔥 Preflight OPTIONS (obligatorio para CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 🔥 Sesión por iframe (para mantener compatibilidad con el sistema)
if (isset($_GET['PHPSESSID'])) {
    session_id($_GET['PHPSESSID']);
}

require_once '../config.php';

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
}

// Obtener entrada JSON
$data = json_decode(file_get_contents('php://input'), true);

$name = isset($data['name']) ? sanitize($data['name']) : '';
$email = isset($data['email']) ? sanitize($data['email']) : '';
$password = isset($data['password']) ? $data['password'] : '';

// Validaciones
if (empty($name) || empty($email) || empty($password)) {
    jsonResponse(['success' => false, 'message' => 'Todos los campos son requeridos'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['success' => false, 'message' => 'Correo electrónico inválido'], 400);
}

// Hashear contraseña
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insertar usuario
$conn = getDBConnection();
$stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $name, $email, $hashedPassword);

try {
    if ($stmt->execute()) {
        jsonResponse([
            'success' => true,
            'message' => 'Registro exitoso. Ahora puede iniciar sesión.'
        ], 201);
    } else {
        // Error por correo duplicado
        if ($conn->errno == 1062) {
            jsonResponse(['success' => false, 'message' => 'El correo ya está registrado'], 409);
        }

        jsonResponse(['success' => false, 'message' => 'Error al registrar el usuario'], 500);
    }
} catch (Exception $e) {
    jsonResponse(['success' => false, 'message' => 'Error de servidor: ' . $e->getMessage()], 500);
}

$stmt->close();
$conn->close();
?>
