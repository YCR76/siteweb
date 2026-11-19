<?php

if (PHP_SAPI !== 'cli') {
    exit('CLI uniquement.' . PHP_EOL);
}

$motdepasse = $argv[1] ?? null;
if (!$motdepasse) {
    $motdepasse = readline('Mot de passe admin : ');
}
if (!$motdepasse) {
    exit('Mot de passe vide.' . PHP_EOL);
}

echo password_hash($motdepasse, PASSWORD_DEFAULT), PHP_EOL;
