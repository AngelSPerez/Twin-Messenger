<?php
ob_start();

// CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: *");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    http_response_code(200);
    exit;
}

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

session_start();

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email'], $data['password'])) {
    echo json_encode(["success" => false, "message" => "Faltan datos"]);
    exit;
}

$conn = getDBConnection();

$email = $data['email'];
$password = $data['password'];

// ✔️ AHORA SELECT completo
$stmt = $conn->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
    exit;
}

// ✔️ Ahora coincide el orden
$stmt->bind_result($userId, $name, $emailDB, $hash);
$stmt->fetch();

if (!password_verify($password, $hash)) {
    echo json_encode(["success" => false, "message" => "Contraseña incorrecta"]);
    exit;
}

$_SESSION['user_id'] = $userId;

echo json_encode([
    "success" => true,
    "message" => "Login exitoso",
    "session_id" => session_id(),
    "user" => [
        "id" => $userId,
        "name" => $name,
        "email" => $emailDB
    ]
]);
?>
