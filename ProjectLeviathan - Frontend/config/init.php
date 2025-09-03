<?php
session_start();
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    $login_path = str_replace('ProjectLeviathan - Frontend', 'ProjectLeviathan - Backend/', getBaseUrl());
    header('Location: ' . $login_path);
    exit;
}

require_once __DIR__ . '/../../ProjectLeviathan - Backend/config/db_config.php';

try {
    // --- INICIO DE LA MODIFICACIÓN ---
    // 1. Prepara una consulta para obtener tanto los datos del usuario como sus preferencias.
    $stmt = $pdo->prepare(
        "SELECT u.role, u.status, up.* FROM users u
         LEFT JOIN user_preferences up ON u.id = up.user_id
         WHERE u.id = :user_id"
    );
    $stmt->execute(['user_id' => $_SESSION['user_id']]);
    $user_data = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user_data) {
        if ($user_data['status'] !== 'active') {
            $_SESSION['status_reason'] = $user_data['status'];
            $inactive_account_path = str_replace('ProjectLeviathan - Frontend', 'ProjectLeviathan - Backend/inactive-account', getBaseUrl());
            
            $status_reason = $_SESSION['status_reason'];
            session_unset();
            session_destroy();
            session_start();
            $_SESSION['status_reason'] = $status_reason;

            header('Location: ' . $inactive_account_path);
            exit;
        }

        if (isset($user_data['role'])) {
            $_SESSION['role'] = $user_data['role'];
        }
        
        // 2. Guarda todas las preferencias del usuario en una sub-clave de la sesión.
        $_SESSION['user_preferences'] = $user_data;

    // --- FIN DE LA MODIFICACIÓN ---
    } else {
        session_unset();
        session_destroy();
        $login_path = str_replace('ProjectLeviathan - Frontend', 'ProjectLeviathan - Backend/', getBaseUrl());
        header('Location: ' . $login_path);
        exit;
    }
} catch (PDOException $e) {
    // Manejo de errores de base de datos
    error_log("Error al inicializar sesión: " . $e->getMessage());
    // Aquí podrías redirigir a una página de error genérica.
}

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

require_once 'router.php';
?>