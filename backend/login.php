<?php
require __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$password = ($data['password'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email or password']);
    exit;
}

$stmt = $pdo->prepare("SELECT id, password_hash FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid email or password']);
    exit;
}

session_regenerate_id(true);
$_SESSION['user_id'] = $user['id'];
echo json_encode(['message' => 'Login successful']);