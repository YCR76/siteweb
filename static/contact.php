<?php

require_once __DIR__ . '/admin/github.php';

$config = ycr_admin_config();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /merci-contact.html');
    exit;
}

if (!empty($_POST['bot-champ'])) {
    header('Location: /merci-contact.html');
    exit;
}

$champs = [
    'Civilité' => 'civilite',
    'Nom' => 'nom',
    'Prénom' => 'prenom',
    'E-mail' => 'email',
    'Téléphone' => 'telephone',
    'Établissement' => 'etablissement',
    'Adresse' => 'adresse',
    'Code postal' => 'code_postal',
    'Ville' => 'ville',
    'Pays' => 'pays',
    'Sujet' => 'sujet',
    'Objet' => 'objet',
    'Message' => 'message',
    'Consentement RGPD' => 'consentement',
];

$email = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');
if ($email === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo 'Formulaire invalide.';
    exit;
}

$corps = "Nouveau message depuis le site ycr76.fr\n\n";
foreach ($champs as $libelle => $cle) {
    $valeur = trim((string) ($_POST[$cle] ?? ''));
    if ($valeur !== '') {
        $corps .= $libelle . ' : ' . $valeur . "\n";
    }
}

$destinataire = $config['contact_email'] ?? 'contact@ycr76.fr';
$sujet = 'Contact site YCRouen 76 - ' . trim((string) ($_POST['objet'] ?? $_POST['sujet'] ?? 'Message'));
$entetes = [
    'From: ' . $destinataire,
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Length: ' . strlen($corps),
    'X-Mailer: PHP/' . PHP_VERSION,
];

$envoye = function_exists('mail') && @mail($destinataire, $sujet, $corps, implode("\r\n", $entetes));
if (!$envoye) {
    $journal = dirname(__DIR__) . '/../ycr76-contact.log';
    @file_put_contents($journal, date('c') . "\n" . $corps . "\n---\n", FILE_APPEND | LOCK_EX);
}

header('Location: /merci-contact.html');
exit;
