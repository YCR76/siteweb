---
title: Pré-inscription aux régates
aliases:
  - /pre-inscription-regate
---
<form name="pre-inscription" method="POST" action="/merci-pre-inscription.html" data-netlify="true" class="netlify-form">
  <input type="hidden" name="form-name" value="pre-inscription">
  <label for="f-nom">Nom</label>
  <input id="f-nom" type="text" name="nom" required>
  <label for="f-nom_equipier1">Nom</label>
  <input id="f-nom_equipier1" type="text" name="nom_equipier1">
  <label for="f-prenom_equipier1">Prénom</label>
  <input id="f-prenom_equipier1" type="text" name="prenom_equipier1">
  <label for="f-type">Type</label>
  <select id="f-type" name="type" required><option value="Habitable CICH">Habitable CICH</option><option value="Dériveur">Dériveur</option></select>
  <label for="f-prenom">Prénom</label>
  <input id="f-prenom" type="text" name="prenom" required>
  <label for="f-regate">Régate</label>
  <input id="f-regate" type="text" name="regate" required>
  <label for="f-email_equipier1">Email</label>
  <input id="f-email_equipier1" type="email" name="email_equipier1">
  <label for="f-email">Email</label>
  <input id="f-email" type="email" name="email" required>
  <label for="f-date_de_naissance_equipier1">Date de naissance</label>
  <input id="f-date_de_naissance_equipier1" type="date" name="date_de_naissance_equipier1">
  <label for="f-cich">CICH</label>
  <select id="f-cich" name="cich" required><option value="CICH 18-19 janvier (CVSAE)">CICH 18-19 janvier (CVSAE)</option><option value="CICH 19-20 octobre (Fécamp)">CICH 19-20 octobre (Fécamp)</option><option value="CICH 21-22 septembre (St Valery en Caux)">CICH 21-22 septembre (St Valery en Caux)</option></select>
  <label for="f-date_de_naissance">Date de naissance</label>
  <input id="f-date_de_naissance" type="date" name="date_de_naissance" required>
  <label for="f-licence_equipier1">Licence</label>
  <input id="f-licence_equipier1" type="text" name="licence_equipier1">
  <label for="f-role">Role</label>
  <select id="f-role" name="role" required><option value="Barreur">Barreur</option><option value="Grand Voile">Grand Voile</option><option value="Embraque">Embraque</option><option value="Num1">Num1</option><option value="Indifférent">Indifférent</option></select>
  <label for="f-licence">Licence</label>
  <input id="f-licence" type="text" name="licence" required>
  <label for="f-support">Support</label>
  <select id="f-support" name="support" required><option value="420">420</option><option value="Europe">Europe</option><option value="Laser">Laser</option><option value="L’équipe">L’équipe</option><option value="O'pen Bic">O'pen Bic</option></select>
  <label for="f-autre_support">Autre Support</label>
  <input id="f-autre_support" type="text" name="autre_support">
  <label for="f-n_de_voile">N° de voile</label>
  <input id="f-n_de_voile" type="text" name="n_de_voile">
  <label for="f-quand">Quand</label>
  <select id="f-quand" name="quand" required><option value="Samedi">Samedi</option><option value="Dimanche">Dimanche</option></select>
  <button type="submit" class="btn">Envoyer ma pré-inscription</button>
</form>
