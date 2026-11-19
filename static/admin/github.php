<?php

function ycr_admin_config_path(): string
{
    $chemin = getenv('YCR_ADMIN_CONFIG');
    if (!$chemin) {
        $chemin = dirname(__DIR__, 2) . '/config-ycr76.php';
    }
    if (!is_file($chemin)) {
        throw new RuntimeException('Fichier de configuration introuvable : ' . $chemin);
    }
    return $chemin;
}

function ycr_admin_config(): array
{
    static $config = null;
    if ($config === null) {
        $config = require ycr_admin_config_path();
        if (!is_array($config)) {
            throw new RuntimeException('Configuration invalide.');
        }
    }
    return $config;
}

function ycr_gh_url(string $path, string $method): string
{
    $config = ycr_admin_config();
    $owner = rawurlencode($config['github_owner']);
    $repo = rawurlencode($config['github_repo']);
    $segments = array_map('rawurlencode', explode('/', trim($path, '/')));
    $url = 'https://api.github.com/repos/' . $owner . '/' . $repo . '/contents/' . implode('/', $segments);
    if ($method === 'GET') {
        $url .= '?ref=' . rawurlencode($config['github_branch'] ?? 'main');
    }
    return $url;
}

function ycr_gh_request(string $method, string $path, ?array $payload = null): array
{
    $config = ycr_admin_config();
    if (!function_exists('curl_init')) {
        throw new RuntimeException('L’extension PHP cURL est requise sur l’hébergement OVH.');
    }

    $entetes = [
        'Accept: application/vnd.github+json',
        'Authorization: Bearer ' . $config['github_token'],
        'User-Agent: ycr76-admin-php',
        'X-GitHub-Api-Version: 2022-11-28',
    ];

    $ch = curl_init(ycr_gh_url($path, $method));
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $entetes,
        CURLOPT_TIMEOUT => 30,
    ]);

    if ($payload !== null) {
        $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
        $entetes[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_HTTPHEADER, $entetes);
    }

    $reponse = curl_exec($ch);
    $statut = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $erreur = curl_error($ch);
    curl_close($ch);

    if ($reponse === false) {
        throw new RuntimeException('GitHub API : ' . $erreur);
    }

    $donnees = json_decode($reponse, true);
    if ($statut < 200 || $statut >= 300) {
        if ($statut === 404 && $method === 'GET') {
            return [];
        }
        $message = is_array($donnees) && isset($donnees['message']) ? $donnees['message'] : $reponse;
        throw new RuntimeException('GitHub API ' . $statut . ' : ' . $message);
    }

    return is_array($donnees) ? $donnees : [];
}

function ycr_gh_file(string $path): array
{
    $donnees = ycr_gh_request('GET', $path);
    if (!isset($donnees['content'])) {
        return [];
    }
    $contenu = base64_decode(str_replace(["\r", "\n"], '', $donnees['content']), true);
    if ($contenu === false) {
        throw new RuntimeException('Contenu GitHub illisible.');
    }
    return [
        'content' => $contenu,
        'sha' => $donnees['sha'] ?? '',
    ];
}

function ycr_gh_save(string $path, string $content, string $sha, string $message): array
{
    $payload = [
        'message' => $message,
        'content' => base64_encode($content),
        'branch' => ycr_admin_config()['github_branch'] ?? 'main',
    ];
    if ($sha !== '') {
        $payload['sha'] = $sha;
    }
    return ycr_gh_request('PUT', $path, $payload);
}

function ycr_gh_list(string $path): array
{
    $donnees = ycr_gh_request('GET', $path);
    $fichiers = [];
    foreach ($donnees as $entree) {
        if (isset($entree['name'], $entree['path'], $entree['type']) && $entree['type'] === 'file' && str_ends_with($entree['name'], '.md')) {
            $fichiers[] = $entree['path'];
        }
    }
    sort($fichiers, SORT_STRING);
    return $fichiers;
}
