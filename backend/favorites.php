<?php
require __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$userId = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
 $stmt = $pdo->prepare('SELECT station FROM favorites WHERE user_id = ? ORDER BY created_at');
    $stmt->execute([$userId]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_COLUMN));
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$station = trim($data['station'] ?? '');

if ($station === '' || strlen($station) > 100) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid station']);
    exit;
}

if ($method === 'POST') {
    $stmt = $pdo->prepare(
        'INSERT INTO favorites (user_id, station) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE station = station'
    );
    $stmt->execute([$userId, $station]);
    http_response_code(201);
    echo json_encode(['message' => 'Favorite saved']);
    exit;
}

if ($method === 'DELETE') {
    $stmt = $pdo->prepare('DELETE FROM favorites WHERE user_id = ? AND station = ?');
    $stmt->execute([$userId, $station]);
    echo json_encode(['message' => 'Favorite removed']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);