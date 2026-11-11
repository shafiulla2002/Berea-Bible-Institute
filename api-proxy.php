<?php
/**
 * Same-Origin API Proxy for cPanel Deployment (biblelearninglms.covenantsynergy.in)
 * Routes whitelisted /api/auth/* and /api/students/* requests to the live Bible Management API,
 * eliminating browser CORS restrictions on cPanel subdomains.
 */

header('Content-Type: application/json; charset=utf-8');

$path = isset($_GET['path']) ? trim($_GET['path']) : '';

// Strictly allow only auth and student endpoints
if (!preg_match('#^/api/(auth|students)/[a-zA-Z0-9/_-]+$#', $path)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid API endpoint path']);
    exit;
}

$targetUrl = 'https://bible-learning-app-bm4j.vercel.app' . $path;
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET' && $method !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$headers = ['Content-Type: application/json', 'Accept: application/json'];

// Forward Authorization header (handle Apache/cPanel env variations)
$authHeader = '';
if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
} elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
} elseif (function_exists('apache_request_headers')) {
    $reqHeaders = apache_request_headers();
    if (isset($reqHeaders['Authorization'])) {
        $authHeader = $reqHeaders['Authorization'];
    } elseif (isset($reqHeaders['authorization'])) {
        $authHeader = $reqHeaders['authorization'];
    }
}

if ($authHeader !== '') {
    $headers[] = 'Authorization: ' . $authHeader;
}

$body = file_get_contents('php://input');

if (function_exists('curl_init')) {
    $ch = curl_init($targetUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    if ($method === 'POST' && $body !== false && $body !== '') {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    $response = curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($response === false) {
        http_response_code(502);
        echo json_encode(['error' => 'Upstream API unreachable', 'detail' => $curlErr]);
        exit;
    }

    http_response_code($statusCode ?: 200);
    echo $response;
} else {
    $opts = [
        'http' => [
            'method' => $method,
            'header' => implode("\r\n", $headers) . "\r\n",
            'content' => ($method === 'POST' ? $body : ''),
            'ignore_errors' => true,
            'timeout' => 15,
        ]
    ];
    $context = stream_context_create($opts);
    $response = @file_get_contents($targetUrl, false, $context);
    if ($response === false) {
        http_response_code(502);
        echo json_encode(['error' => 'Upstream API unreachable']);
        exit;
    }
    echo $response;
}

