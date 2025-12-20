<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once "db.php";

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $personId = $_GET['personId'] ?? null;
        $groupId = $_GET['groupId'] ?? null;

        if (!$personId || !$groupId) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Missing personId or groupId"]);
            exit;
        }

        $stmt = $pdo->prepare("SELECT id, post_details, comments, created_at FROM post_info WHERE person_id = ? AND group_id = ? ORDER BY created_at DESC");
        $stmt->execute([$personId, $groupId]);
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "posts" => $posts]);
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $personId = $input['personId'] ?? null;
        $groupId = $input['groupId'] ?? null;
        $postDetails = $input['postDetails'] ?? null;
        $comments = $input['comments'] ?? null;

        if (!$personId || !$groupId || !$postDetails) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Missing required fields"]);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO post_info (person_id, group_id, post_details, comments) VALUES (?, ?, ?, ?)");
        $stmt->execute([$personId, $groupId, $postDetails, $comments]);
        $postId = $pdo->lastInsertId();

        $stmt = $pdo->prepare("SELECT * FROM post_info WHERE id = ?");
        $stmt->execute([$postId]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "post" => $post]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
