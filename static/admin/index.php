<?php

require_once __DIR__ . '/github.php';

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

if (isset($_GET['ok'])) {
    $notice = 'Modification enregistrée. Le déploiement OVH suit automatiquement.';
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST' && isset($_POST['do'])) {
    if (!csrf_ok()) {
        $erreur = 'Jeton de sécurité invalide.';
    } elseif ($_POST['do'] === 'login') {
        $email = strtolower(trim($_POST['email'] ?? ''));
        $motDePasse = $_POST['password'] ?? '';
        $attendu = strtolower(trim($config['admin_email']));
        if (hash_equals($attendu, $email) && password_verify($motDePasse, $config['admin_password_hash'])) {
            session_regenerate_id(true);
            $_SESSION['admin'] = $email;
            redirection('/admin/');
        }
        $erreur = 'Identifiants incorrects.';
    } elseif (!isset($_SESSION['admin'])) {
        $erreur = 'Session expirée.';
    } elseif ($_POST['do'] === 'logout') {
        session_destroy();
        redirection('/admin/');
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

  <?php if (!isset($_SESSION['admin'])): ?>
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
      <form method="post" class="inline">
        <input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>">
        <input type="hidden" name="do" value="logout">
        <button type="submit" class="lien">Se déconnecter</button>
      </form>
    </p>

    <?php if ($action === 'edit'): ?>
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
