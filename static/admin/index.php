<?php

require_once __DIR__ . '/github.php';
require_once __DIR__ . '/accounts.php';

$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'httponly' => true,
    'samesite' => 'Lax',
    'secure' => $secure,
]);
session_start();

if (empty($_SESSION['csrf'])) {
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
}

function h(string $texte): string
{
    return htmlspecialchars($texte, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function csrf_ok(): bool
{
    return isset($_POST['csrf']) && hash_equals($_SESSION['csrf'], $_POST['csrf']);
}

function redirection(string $url): void
{
    header('Location: ' . $url);
    exit;
}

function est_connecte(): bool
{
    return isset($_SESSION['admin']);
}

function est_superadmin(): bool
{
    return est_connecte() && ($_SESSION['role'] ?? '') === 'superadmin';
}

function slugify(string $texte): string
{
    $texte = strtr($texte, [
        'À' => 'a', 'Â' => 'a', 'Ä' => 'a', 'Ç' => 'c', 'É' => 'e', 'È' => 'e',
        'Ê' => 'e', 'Ë' => 'e', 'Î' => 'i', 'Ï' => 'i', 'Ô' => 'o', 'Ö' => 'o',
        'Ù' => 'u', 'Û' => 'u', 'Ü' => 'u', 'Ÿ' => 'y', 'Œ' => 'oe',
        'à' => 'a', 'â' => 'a', 'ä' => 'a', 'ç' => 'c', 'é' => 'e', 'è' => 'e',
        'ê' => 'e', 'ë' => 'e', 'î' => 'i', 'ï' => 'i', 'ô' => 'o', 'ö' => 'o',
        'ù' => 'u', 'û' => 'u', 'ü' => 'u', 'ÿ' => 'y', 'œ' => 'oe',
    ]);
    $texte = strtolower($texte);
    $texte = preg_replace('/[^a-z0-9]+/', '-', $texte);
    return trim((string) $texte, '-');
}

function pages_fixes(): array
{
    return [
        'Page d’accueil' => 'content/_index.md',
        'Rubrique Actualité' => 'content/actualites/_index.md',
        'Rubrique Agenda' => 'content/evenement/_index.md',
        'Contactez-nous' => 'content/contactez-nous.md',
        'L’activité dériveur' => 'content/le-club/lactivite-deriveur.md',
        'Organigramme' => 'content/le-club/organigramme.md',
        'Tarifs' => 'content/le-club/tarifs.md',
        'Don au club' => 'content/le-club/don-club.md',
        'Licence FFVoile' => 'content/le-club/licence-ffvoile-adhesion-ligne.md',
        'Résultats des régates' => 'content/competition/resultats.md',
        'Programme des régates' => 'content/competition/programme.md',
        'Activité multi-sports' => 'content/activites/activite-multi-sports.md',
        'Politique de confidentialité' => 'content/politique-confidentialite.md',
    ];
}

function dossiers(): array
{
    return [
        'Actualités' => 'content/actualites',
        'Agenda' => 'content/evenement',
        'Le club' => 'content/le-club',
        'Stages' => 'content/stages',
        'Base de plein air' => 'content/activites',
        'Voile loisir' => 'content/voile-loisir',
        'Compétition' => 'content/competition',
        'Partenaires' => 'content/nos-partenaires',
        'Galerie' => 'content/galerie',
    ];
}

function chemin_autorise(string $chemin): bool
{
    if (str_contains($chemin, '..') || !str_ends_with($chemin, '.md')) {
        return false;
    }
    if (in_array($chemin, pages_fixes(), true)) {
        return true;
    }
    foreach (dossiers() as $dossier) {
        if (str_starts_with($chemin, $dossier . '/')) {
            return true;
        }
    }
    return false;
}

function decouper_markdown(string $contenu): array
{
    $contenu = str_replace("\r\n", "\n", $contenu);
    if (preg_match('/^---\s*\n(.*?)\n---\s*\n?(.*)$/s', $contenu, $parts)) {
        return [$parts[1], $parts[2]];
    }
    return ['', $contenu];
}

function yaml_quote(string $valeur): string
{
    $valeur = str_replace(["\\", '"', "\r", "\n"], ['\\\\', '\\"', ' ', ' '], $valeur);
    return '"' . $valeur . '"';
}

function yaml_lire(string $yaml, string $cle): string
{
    foreach (explode("\n", $yaml) as $ligne) {
        if (preg_match('/^' . preg_quote($cle, '/') . '\s*:\s*(.*)$/', $ligne, $parts)) {
            return trim((string) $parts[1], "\"' \t");
        }
    }
    return '';
}

function yaml_ecrire(string $yaml, string $cle, string $valeur): string
{
    $lignes = explode("\n", $yaml);
    $trouve = false;
    foreach ($lignes as &$ligne) {
        if (preg_match('/^' . preg_quote($cle, '/') . '\s*:/', $ligne)) {
            $ligne = $cle . ': ' . yaml_quote($valeur);
            $trouve = true;
        }
    }
    unset($ligne);
    if (!$trouve) {
        array_unshift($lignes, $cle . ': ' . yaml_quote($valeur));
    }
    return implode("\n", $lignes);
}

function assembler_markdown(string $yaml, string $corps): string
{
    return "---\n" . trim($yaml, "\n") . "\n---\n" . ltrim($corps, "\n");
}

$config = ycr_admin_config();
$action = $_GET['action'] ?? 'liste';
$erreur = '';
$notice = '';
$lienInvitation = '';
$jetonSetup = $_POST['token'] ?? $_GET['token'] ?? '';

if (isset($_GET['ok'])) {
    $notice = 'Modification enregistrée. Le déploiement OVH suit automatiquement.';
}
if (isset($_GET['setup']) && $_GET['setup'] === 'ok') {
    $notice = 'Mot de passe initialisé. Vous pouvez maintenant vous connecter.';
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST' && isset($_POST['do'])) {
    if (!csrf_ok()) {
        $erreur = 'Jeton de sécurité invalide.';
    } elseif ($_POST['do'] === 'login') {
        $identite = ycr_verifier_identifiants($_POST['email'] ?? '', $_POST['password'] ?? '');
        if ($identite) {
            session_regenerate_id(true);
            $_SESSION['admin'] = $identite['email'];
            $_SESSION['role'] = $identite['role'];
            redirection('/admin/');
        }
        $erreur = 'Identifiants incorrects.';
    } elseif ($_POST['do'] === 'setup') {
        try {
            if (!ycr_invitation_valide((string) $_POST['token'])) {
                $erreur = 'Lien d’initialisation invalide ou expiré.';
            } elseif (ycr_initialiser_mot_de_passe((string) $_POST['token'], (string) $_POST['password'])) {
                redirection('/admin/?setup=ok');
            } else {
                $erreur = 'Lien d’initialisation invalide ou expiré.';
            }
        } catch (Throwable $e) {
            $erreur = $e->getMessage();
        }
    } elseif (!est_connecte()) {
        $erreur = 'Session expirée.';
    } elseif ($_POST['do'] === 'logout') {
        session_destroy();
        redirection('/admin/');
    } elseif ($_POST['do'] === 'invite') {
        if (!est_superadmin()) {
            $erreur = 'Action réservée au superadministrateur.';
        } else {
            try {
                $invitation = ycr_creer_invitation((string) $_POST['email']);
                $envoye = ycr_envoyer_invitation($invitation['email'], $invitation['token']);
                $lienInvitation = ycr_lien_invitation($invitation['token']);
                $notice = $envoye
                    ? 'Compte créé et e-mail envoyé.'
                    : 'Compte créé, mais l’e-mail n’a pas pu être envoyé. Transmettez le lien ci-dessous.';
            } catch (Throwable $e) {
                $erreur = $e->getMessage();
            }
        }
    } elseif ($_POST['do'] === 'resend') {
        if (!est_superadmin()) {
            $erreur = 'Action réservée au superadministrateur.';
        } else {
            try {
                $invitation = ycr_renvoyer_invitation((string) $_POST['email']);
                $envoye = ycr_envoyer_invitation($invitation['email'], $invitation['token']);
                $lienInvitation = ycr_lien_invitation($invitation['token']);
                $notice = $envoye
                    ? 'Nouveau lien envoyé.'
                    : 'Nouveau lien généré, mais l’e-mail n’a pas pu être envoyé. Transmettez le lien ci-dessous.';
            } catch (Throwable $e) {
                $erreur = $e->getMessage();
            }
        }
    } elseif ($_POST['do'] === 'delete') {
        if (!est_superadmin()) {
            $erreur = 'Action réservée au superadministrateur.';
        } elseif (!ycr_supprimer_compte((string) $_POST['email'])) {
            $erreur = 'Compte introuvable.';
        } else {
            $notice = 'Compte supprimé.';
        }
    } elseif ($_POST['do'] === 'save') {
        $chemin = $_POST['file'] ?? '';
        if (!chemin_autorise($chemin)) {
            $erreur = 'Fichier non autorisé.';
        } else {
            try {
                $fichier = ycr_gh_file($chemin);
                [$yamlActuel, $corpsActuel] = decouper_markdown($fichier['content'] ?? '');
                $yaml = yaml_ecrire(yaml_ecrire($yamlActuel, 'title', trim($_POST['title'] ?? '')), 'summary', trim($_POST['summary'] ?? ''));
                $corps = str_replace("\r\n", "\n", $_POST['body'] ?? '');
                ycr_gh_save($chemin, assembler_markdown($yaml, $corps), $fichier['sha'] ?? '', 'Admin OVH : ' . $chemin);
                redirection('/admin/?action=edit&file=' . rawurlencode($chemin) . '&ok=1');
            } catch (Throwable $e) {
                $erreur = $e->getMessage();
            }
        }
    } elseif ($_POST['do'] === 'create') {
        $dossier = $_POST['dir'] ?? '';
        $slug = slugify($_POST['slug'] ?? '');
        if (!in_array($dossier, dossiers(), true) || $slug === '') {
            $erreur = 'Dossier ou nom de page invalide.';
        } else {
            $chemin = $dossier . '/' . $slug . '.md';
            try {
                $existant = ycr_gh_file($chemin);
                if ($existant) {
                    $erreur = 'Ce nom de page existe déjà.';
                } else {
                    $yaml = yaml_ecrire(yaml_ecrire('', 'title', trim($_POST['title'] ?? '')), 'summary', trim($_POST['summary'] ?? ''));
                    $corps = str_replace("\r\n", "\n", $_POST['body'] ?? '');
                    ycr_gh_save($chemin, assembler_markdown($yaml, $corps), '', 'Admin OVH : création de ' . $chemin);
                    redirection('/admin/?action=edit&file=' . rawurlencode($chemin) . '&ok=1');
                }
            } catch (Throwable $e) {
                $erreur = $e->getMessage();
            }
        }
    }
}

?>
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Administration YCR76</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
<main>
  <h1>Administration YCR76</h1>

  <?php if ($erreur !== ''): ?>
    <p class="message erreur"><?= h($erreur) ?></p>
  <?php endif; ?>
  <?php if ($notice !== ''): ?>
    <p class="message ok"><?= h($notice) ?></p>
  <?php endif; ?>
  <?php if ($lienInvitation !== ''): ?>
    <p class="message ok">Lien à transmettre : <a href="<?= h($lienInvitation) ?>"><?= h($lienInvitation) ?></a></p>
  <?php endif; ?>

  <?php if (!est_connecte() && $action === 'setup'): ?>
    <?php if (!ycr_invitation_valide((string) $jetonSetup)): ?>
      <p class="message erreur">Ce lien d’initialisation est invalide ou expiré.</p>
      <p><a href="/admin/">← Retour à la connexion</a></p>
    <?php else: ?>
      <h2>Initialisation du mot de passe</h2>
      <form method="post" class="bloc">
        <input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>">
        <input type="hidden" name="do" value="setup">
        <input type="hidden" name="token" value="<?= h($jetonSetup) ?>">
        <label>Nouveau mot de passe (8 caractères minimum)
          <input type="password" name="password" required minlength="8" autocomplete="new-password">
        </label>
        <button type="submit">Définir le mot de passe</button>
      </form>
    <?php endif; ?>
  <?php elseif (!est_connecte()): ?>
    <form method="post" class="bloc">
      <input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>">
      <input type="hidden" name="do" value="login">
      <label>Adresse e-mail
        <input type="email" name="email" required autocomplete="username">
      </label>
      <label>Mot de passe
        <input type="password" name="password" required autocomplete="current-password">
      </label>
      <button type="submit">Se connecter</button>
    </form>
  <?php else: ?>
    <p class="barre">
      <a href="/">← Retour au site</a>
      <?php if (est_superadmin()): ?><a href="/admin/?action=comptes">Comptes admins</a><?php endif; ?>
      <form method="post" class="inline">
        <input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>">
        <input type="hidden" name="do" value="logout">
        <button type="submit" class="lien">Se déconnecter</button>
      </form>
    </p>

    <?php if ($action === 'comptes' && !est_superadmin()): ?>
      <p class="message erreur">Action réservée au superadministrateur.</p>
    <?php elseif ($action === 'comptes'): ?>
      <h2>Comptes administrateurs</h2>
      <section class="bloc">
        <h3>Superadministrateur</h3>
        <p><?= h(ycr_superadmin()['email']) ?></p>
      </section>

      <section class="bloc">
        <h3>Autres comptes</h3>
        <?php $comptes = ycr_comptes_lire()['comptes']; ?>
        <?php if (!$comptes): ?>
          <p class="vide">Aucun autre compte.</p>
        <?php else: ?>
          <ul class="fichiers">
            <?php foreach ($comptes as $compte): ?>
              <li>
                <?= h($compte['email']) ?>
                <small><?= empty($compte['password_hash']) ? 'en attente d’initialisation' : 'actif' ?></small>
                <form method="post" class="inline">
                  <input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>">
                  <input type="hidden" name="do" value="resend">
                  <input type="hidden" name="email" value="<?= h($compte['email']) ?>">
                  <button type="submit" class="petit">Renvoyer le lien</button>
                </form>
                <form method="post" class="inline">
                  <input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>">
                  <input type="hidden" name="do" value="delete">
                  <input type="hidden" name="email" value="<?= h($compte['email']) ?>">
                  <button type="submit" class="petit danger" onclick="return confirm('Supprimer ce compte ?')">Supprimer</button>
                </form>
              </li>
            <?php endforeach; ?>
          </ul>
        <?php endif; ?>
      </section>

      <section class="bloc">
        <h3>Créer un compte</h3>
        <form method="post">
          <input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>">
          <input type="hidden" name="do" value="invite">
          <label>Adresse e-mail
            <input type="email" name="email" required>
          </label>
          <button type="submit">Créer et envoyer le lien</button>
        </form>
        <p class="vide">Le lien d’initialisation est valable 7 jours. Si l’e-mail ne part pas, le lien s’affiche ici pour transmission manuelle.</p>
      </section>

    <?php elseif ($action === 'edit'): ?>
      <?php
      $chemin = $_GET['file'] ?? '';
      try {
          if (!chemin_autorise($chemin)) {
              throw new RuntimeException('Fichier non autorisé.');
          }
          $fichier = ycr_gh_file($chemin);
          if (!$fichier) {
              throw new RuntimeException('Fichier introuvable sur GitHub.');
          }
          [$yaml, $corps] = decouper_markdown($fichier['content']);
          $titre = yaml_lire($yaml, 'title');
          $resume = yaml_lire($yaml, 'summary');
      } catch (Throwable $e) {
          echo '<p class="message erreur">' . h($e->getMessage()) . '</p>';
          echo '<p><a href="/admin/">← Retour à la liste</a></p>';
          $chemin = '';
      }
      ?>
      <?php if ($chemin !== ''): ?>
        <p><a href="/admin/">← Retour à la liste</a></p>
        <h2>Modifier <?= h($chemin) ?></h2>
        <form method="post" class="bloc">
          <input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>">
          <input type="hidden" name="do" value="save">
          <input type="hidden" name="file" value="<?= h($chemin) ?>">
          <input type="hidden" name="sha" value="<?= h($fichier['sha']) ?>">
          <label>Titre
            <input type="text" name="title" value="<?= h($titre) ?>" required>
          </label>
          <label>Résumé
            <input type="text" name="summary" value="<?= h($resume) ?>">
          </label>
          <label>Contenu (Markdown)
            <textarea name="body" rows="24"><?= h($corps) ?></textarea>
          </label>
          <button type="submit">Enregistrer</button>
        </form>
      <?php endif; ?>

    <?php elseif ($action === 'new'): ?>
      <?php
      $dossier = $_GET['dir'] ?? '';
      if (!in_array($dossier, dossiers(), true)) {
          echo '<p class="message erreur">Dossier non autorisé.</p>';
          $dossier = '';
      }
      ?>
      <?php if ($dossier !== ''): ?>
        <p><a href="/admin/">← Retour à la liste</a></p>
        <h2>Nouvelle page dans <?= h($dossier) ?></h2>
        <form method="post" class="bloc">
          <input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>">
          <input type="hidden" name="do" value="create">
          <input type="hidden" name="dir" value="<?= h($dossier) ?>">
          <label>Nom de fichier (sans .md)
            <input type="text" name="slug" required placeholder="exemple-de-page">
          </label>
          <label>Titre
            <input type="text" name="title" required>
          </label>
          <label>Résumé
            <input type="text" name="summary">
          </label>
          <label>Contenu (Markdown)
            <textarea name="body" rows="18"></textarea>
          </label>
          <button type="submit">Créer la page</button>
        </form>
      <?php endif; ?>

    <?php else: ?>
      <h2>Pages principales</h2>
      <ul class="fichiers">
        <?php foreach (pages_fixes() as $label => $chemin): ?>
          <li><a href="/admin/?action=edit&file=<?= rawurlencode($chemin) ?>"><?= h($label) ?></a> <small><?= h($chemin) ?></small></li>
        <?php endforeach; ?>
      </ul>

      <h2>Rubriques</h2>
      <?php foreach (dossiers() as $label => $dossier): ?>
        <section class="bloc">
          <h3><?= h($label) ?> <a class="petit" href="/admin/?action=new&dir=<?= rawurlencode($dossier) ?>">+ nouvelle page</a></h3>
          <?php
          try {
              $fichiers = ycr_gh_list($dossier);
              if (!$fichiers) {
                  echo '<p class="vide">Aucune page.</p>';
              } else {
                  echo '<ul class="fichiers">';
                  foreach ($fichiers as $chemin) {
                      echo '<li><a href="/admin/?action=edit&file=' . rawurlencode($chemin) . '">' . h(basename($chemin, '.md')) . '</a></li>';
                  }
                  echo '</ul>';
              }
          } catch (Throwable $e) {
              echo '<p class="message erreur">' . h($e->getMessage()) . '</p>';
          }
          ?>
        </section>
      <?php endforeach; ?>
    <?php endif; ?>
  <?php endif; ?>
</main>
</body>
</html>
