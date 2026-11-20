<?php

require_once __DIR__ . '/github.php';

function ycr_comptes_chemin(): string
{
    $config = ycr_admin_config();
    if (!empty($config['accounts_file'])) {
        return $config['accounts_file'];
    }
    $chemin = getenv('YCR_ADMIN_ACCOUNTS');
    if (!$chemin) {
        $chemin = dirname(ycr_admin_config_path()) . '/ycr76-admins.json';
    }
    return $chemin;
}

function ycr_comptes_lire(): array
{
    $chemin = ycr_comptes_chemin();
    if (!is_file($chemin)) {
        return ['comptes' => []];
    }
    $donnees = json_decode((string) file_get_contents($chemin), true);
    if (!is_array($donnees) || !isset($donnees['comptes']) || !is_array($donnees['comptes'])) {
        throw new RuntimeException('Fichier des comptes illisible.');
    }
    return $donnees;
}

function ycr_comptes_ecrire(array $donnees)
{
    $chemin = ycr_comptes_chemin();
    $tmp = $chemin . '.tmp';
    $json = json_encode($donnees, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false || file_put_contents($tmp, $json, LOCK_EX) === false || !rename($tmp, $chemin)) {
        throw new RuntimeException('Écriture du fichier des comptes impossible.');
    }
}

function ycr_superadmin(): array
{
    $config = ycr_admin_config();
    return [
        'email' => strtolower(trim((string) ($config['superadmin_email'] ?? $config['admin_email'] ?? ''))),
        'hash' => (string) ($config['superadmin_password_hash'] ?? $config['admin_password_hash'] ?? ''),
    ];
}

function ycr_email_valide(string $email): bool
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function ycr_email_utilise(string $email): bool
{
    $email = strtolower(trim($email));
    if (hash_equals(ycr_superadmin()['email'], $email)) {
        return true;
    }
    foreach (ycr_comptes_lire()['comptes'] as $compte) {
        if (isset($compte['email']) && hash_equals(strtolower($compte['email']), $email)) {
            return true;
        }
    }
    return false;
}

function ycr_verifier_identifiants(string $email, string $motDePasse)
{
    $email = strtolower(trim($email));
    $super = ycr_superadmin();
    if (hash_equals($super['email'], $email) && $super['hash'] !== '' && password_verify($motDePasse, $super['hash'])) {
        return ['email' => $email, 'role' => 'superadmin'];
    }
    foreach (ycr_comptes_lire()['comptes'] as $compte) {
        if (
            isset($compte['email'], $compte['password_hash'])
            && hash_equals(strtolower($compte['email']), $email)
            && $compte['password_hash'] !== ''
            && password_verify($motDePasse, $compte['password_hash'])
        ) {
            return ['email' => $email, 'role' => 'admin'];
        }
    }
    return null;
}

function ycr_creer_invitation(string $email): array
{
    $email = strtolower(trim($email));
    if (!ycr_email_valide($email)) {
        throw new RuntimeException('Adresse e-mail invalide.');
    }
    if (ycr_email_utilise($email)) {
        throw new RuntimeException('Ce compte existe déjà.');
    }

    $donnees = ycr_comptes_lire();
    $jeton = bin2hex(random_bytes(32));
    $donnees['comptes'][] = [
        'email' => $email,
        'password_hash' => '',
        'token_hash' => hash('sha256', $jeton),
        'token_expire' => time() + 7 * 86400,
        'created_at' => date('c'),
        'initialized_at' => null,
    ];
    ycr_comptes_ecrire($donnees);
    return ['email' => $email, 'token' => $jeton];
}

function ycr_renvoyer_invitation(string $email): array
{
    $email = strtolower(trim($email));
    $donnees = ycr_comptes_lire();
    $trouve = false;
    foreach ($donnees['comptes'] as &$compte) {
        if (isset($compte['email']) && hash_equals(strtolower($compte['email']), $email)) {
            $jeton = bin2hex(random_bytes(32));
            $compte['token_hash'] = hash('sha256', $jeton);
            $compte['token_expire'] = time() + 7 * 86400;
            $trouve = true;
        }
    }
    unset($compte);
    if (!$trouve) {
        throw new RuntimeException('Compte introuvable.');
    }
    ycr_comptes_ecrire($donnees);
    return ['email' => $email, 'token' => $jeton];
}

function ycr_invitation_valide(string $jeton): bool
{
    if ($jeton === '') {
        return false;
    }
    $empreinte = hash('sha256', $jeton);
    foreach (ycr_comptes_lire()['comptes'] as $compte) {
        if (
            isset($compte['token_hash'], $compte['token_expire'])
            && hash_equals($compte['token_hash'], $empreinte)
            && (int) $compte['token_expire'] >= time()
            && empty($compte['password_hash'])
        ) {
            return true;
        }
    }
    return false;
}

function ycr_initialiser_mot_de_passe(string $jeton, string $motDePasse): bool
{
    if (strlen($motDePasse) < 8) {
        throw new RuntimeException('Le mot de passe doit contenir au moins 8 caractères.');
    }
    $empreinte = hash('sha256', $jeton);
    $donnees = ycr_comptes_lire();
    $trouve = false;
    foreach ($donnees['comptes'] as &$compte) {
        if (
            isset($compte['token_hash'], $compte['token_expire'])
            && hash_equals($compte['token_hash'], $empreinte)
            && (int) $compte['token_expire'] >= time()
            && empty($compte['password_hash'])
        ) {
            $compte['password_hash'] = password_hash($motDePasse, PASSWORD_DEFAULT);
            $compte['token_hash'] = '';
            $compte['token_expire'] = 0;
            $compte['initialized_at'] = date('c');
            $trouve = true;
        }
    }
    unset($compte);
    if (!$trouve) {
        return false;
    }
    ycr_comptes_ecrire($donnees);
    return true;
}

function ycr_supprimer_compte(string $email): bool
{
    $email = strtolower(trim($email));
    $donnees = ycr_comptes_lire();
    $comptes = [];
    $trouve = false;
    foreach ($donnees['comptes'] as $compte) {
        if (isset($compte['email']) && hash_equals(strtolower($compte['email']), $email)) {
            $trouve = true;
            continue;
        }
        $comptes[] = $compte;
    }
    if (!$trouve) {
        return false;
    }
    $donnees['comptes'] = $comptes;
    ycr_comptes_ecrire($donnees);
    return true;
}

function ycr_lien_invitation(string $jeton): string
{
    $config = ycr_admin_config();
    if (!empty($config['site_url'])) {
        $base = rtrim($config['site_url'], '/');
    } else {
        $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
        $host = $_SERVER['HTTP_HOST'] ?? 'dev.ycr76.fr';
        $base = ($https ? 'https' : 'http') . '://' . $host;
    }
    return $base . '/admin/?action=setup&token=' . rawurlencode($jeton);
}

function ycr_envoyer_invitation(string $email, string $jeton): bool
{
    $config = ycr_admin_config();
    $lien = ycr_lien_invitation($jeton);
    $sujet = 'Administration YCR76 - initialisation de votre mot de passe';
    $message = "Bonjour,\n\n"
        . "Un compte administrateur du site YCR76 a été créé pour vous.\n\n"
        . "Pour choisir votre mot de passe, ouvrez ce lien (valable 7 jours) :\n"
        . $lien . "\n\n"
        . "Si vous n'attendiez pas ce message, ignorez-le.\n\n"
        . "Yacht Club Rouen 76\n";
    $entetes = [
        'From: ' . ($config['contact_email'] ?? 'contact@ycr76.fr'),
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Length: ' . strlen($message),
    ];
    return function_exists('mail') && @mail($email, $sujet, $message, implode("\r\n", $entetes));
}
