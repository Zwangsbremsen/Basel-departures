<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

if(!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

echo json_encode(['user_id' => $_SESSION['user_id']]);