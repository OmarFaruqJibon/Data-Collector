<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once "db.php";

$q = $_GET['q'] ?? '';

if (strlen($q) < 2) {
    echo json_encode(["success" => true, "persons" => []]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, profile_name, profile_id, phone_number, address, occupation, age FROM person_info WHERE profile_name LIKE ? ORDER BY profile_name LIMIT 10");
    $stmt->execute(["%$q%"]);
    $persons = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "persons" => $persons]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
