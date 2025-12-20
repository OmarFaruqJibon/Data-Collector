<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once "db.php";

$personId = $_GET['personId'] ?? null;

if (!$personId) {
    echo json_encode(["success" => true, "groups" => []]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, group_name, note FROM group_info WHERE person_id = ? ORDER BY group_name");
    $stmt->execute([$personId]);
    $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "groups" => $groups]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
