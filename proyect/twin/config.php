<?php
// config.php - Configuración Universal
// =====================================

// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'twin_messenger');

// --- BLOQUE CORS UNIVERSAL ---
// Solo enviar headers si no se han enviado ya
if (!headers_sent()) {
    // Permitir cualquier origen (cambiar en producción)
    header("Access-Control-Allow-Origin: *"); 
    header("Access-Control-Allow-Credentials: false");
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
}

// Zona horaria
date_default_timezone_set('America/Mexico_City');

// Función para conectar a la base de datos
function getDBConnection() {
    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        
        if ($conn->connect_error) {
            throw new Exception('Error de conexión: ' . $conn->connect_error);
        }
        
        $conn->set_charset('utf8mb4');
        return $conn;
    } catch (Exception $e) {
        http_response_code(500);
        die(json_encode([
            'success' => false, 
            'message' => 'Error de conexión a la base de datos',
            'error' => $e->getMessage()
        ]));
    }
}

// Función para verificar sesión
function checkSession() {
    // Iniciar sesión si no está iniciada
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!isset($_SESSION['user_id'])) {
        jsonResponse(['success' => false, 'message' => 'No autorizado'], 401);
    }
    return $_SESSION['user_id'];
}

// Función para sanitizar entrada
function sanitize($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

// Función para generar respuesta JSON
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    
    // Solo enviar header si no se ha enviado ya
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
    }
    
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit; 
}
?>