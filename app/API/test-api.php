<?php
header("Access-Control-Allow-Origin: https://soil-indol.vercel.app");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

echo json_encode([
    "success" => true,
    "message" => "API is working!"
]);
