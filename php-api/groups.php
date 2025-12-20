<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once "db.php"; // Your PDO connection

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT id, group_name, person_id FROM group_info ORDER BY group_name");
        $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "groups" => $groups]);
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $personId = $input['personId'] ?? null;
        $groupName = $input['groupName'] ?? null;
        $note = $input['note'] ?? null;

        if (!$personId || !$groupName) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "personId and groupName are required"]);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO group_info (group_name, note, person_id) VALUES (?, ?, ?)");
        $stmt->execute([$groupName, $note, $personId]);
        $id = $pdo->lastInsertId();

        echo json_encode([
            "success" => true,
            "group" => ["id" => $id, "group_name" => $groupName, "person_id" => $personId]
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
