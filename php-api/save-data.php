<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once "db.php";

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $person = $input['person'] ?? null;
    $group = $input['group'] ?? null;
    $post = $input['post'] ?? null;

    if (!$person['profileId'] || !$group['groupName'] || !$post['postDetails']) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Invalid payload"]);
        exit;
    }

    $pdo->beginTransaction();

    // ---------- PERSON ----------
    $stmt = $pdo->prepare("SELECT id FROM person_info WHERE profile_id = ?");
    $stmt->execute([$person['profileId']]);
    $existingPerson = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existingPerson) {
        $personId = $existingPerson['id'];
    } else {
        $stmt = $pdo->prepare("INSERT INTO person_info (profile_name, profile_id, phone_number, address, occupation, age) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $person['profileName'],
            $person['profileId'],
            $person['phoneNumber'] ?? null,
            $person['address'] ?? null,
            $person['occupation'] ?? null,
            $person['age'] ? (int)$person['age'] : null
        ]);
        $personId = $pdo->lastInsertId();
    }

    // ---------- GROUP ----------
    if (!empty($group['id'])) {
        $stmt = $pdo->prepare("SELECT id FROM group_info WHERE id = ? AND person_id = ?");
        $stmt->execute([$group['id'], $personId]);
        $existingGroup = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$existingGroup) throw new Exception("Invalid group selection");
        $groupId = $existingGroup['id'];
    } else {
        $stmt = $pdo->prepare("INSERT INTO group_info (group_name, note, person_id) VALUES (?, ?, ?)");
        $stmt->execute([$group['groupName'], $group['note'] ?? null, $personId]);
        $groupId = $pdo->lastInsertId();
    }

    $pdo->commit();
    echo json_encode(["success" => true]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
