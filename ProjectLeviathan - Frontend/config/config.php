<?php
function getBaseUrl() {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'];
    $scriptName = $_SERVER['SCRIPT_NAME'];
    $basePath = dirname($scriptName);
    
    return $protocol . $host . ($basePath !== '/' ? $basePath : '');
}

$BASE_URL = getBaseUrl();

function getRankDetails($role) {
    $ranks = [
        'owner' => ['class' => 'rank-owner', 'name' => 'Propietario', 'icon' => 'shield'],
        'admin' => ['class' => 'rank-admin', 'name' => 'Administrador', 'icon' => 'verified_user'],
        'community-manager' => ['class' => 'rank-community-manager', 'name' => 'Community Manager', 'icon' => 'groups'],
        'moderator' => ['class' => 'rank-moderator', 'name' => 'Moderador', 'icon' => 'security'],
        'elite' => ['class' => 'rank-elite', 'name' => 'Elite', 'icon' => 'star'],
        'premium' => ['class' => 'rank-premium', 'name' => 'Premium', 'icon' => 'workspace_premium'],
        'vip' => ['class' => 'rank-vip', 'name' => 'VIP', 'icon' => 'military_tech'],
        'user' => ['class' => 'rank-user', 'name' => 'Usuario', 'icon' => 'person'],
    ];
    return $ranks[strtolower($role)] ?? $ranks['user'];
}
?>