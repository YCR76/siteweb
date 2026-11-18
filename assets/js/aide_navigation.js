(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    document.querySelectorAll('[data-aide-navigation]').forEach(function (racine) {
      var cta = racine.querySelector('.aide-navigation__cta');
      var panneau = racine.querySelector('.aide-navigation__panneau');
      var statut = racine.querySelector('[data-aide-navigation-statut]');
      var recommencer = racine.querySelector('.aide-navigation__recommencer');
      var etapes = Array.prototype.slice.call(racine.querySelectorAll('[data-etape]'));
      var depart = racine.getAttribute('data-depart') || (etapes[0] && etapes[0].getAttribute('data-etape'));
      if (!cta || !panneau || !etapes.length) return;

      function trouver(id) {
        return etapes.find(function (etape) {
          return etape.getAttribute('data-etape') === id;
        });
      }

      function libelle(etape) {
        var titre = etape && etape.querySelector('.aide-navigation__question');
        return titre ? titre.textContent.trim() : '';
      }

      function afficher(id) {
        etapes.forEach(function (etape) {
          etape.hidden = etape.getAttribute('data-etape') !== id;
        });
        var etape = trouver(id);
        if (statut) statut.textContent = libelle(etape);
        var titre = etape && etape.querySelector('.aide-navigation__question');
        if (titre) {
          titre.setAttribute('tabindex', '-1');
          titre.focus();
        }
        if (recommencer) recommencer.hidden = id === depart;
      }

      function ouvrir() {
        panneau.hidden = false;
        cta.setAttribute('aria-expanded', 'true');
        afficher(depart);
      }

      function fermer() {
        panneau.hidden = true;
        cta.setAttribute('aria-expanded', 'false');
        if (statut) statut.textContent = '';
      }

      panneau.hidden = true;
      cta.setAttribute('aria-expanded', 'false');
      if (recommencer) recommencer.hidden = true;

      cta.addEventListener('click', function () {
        if (panneau.hidden) ouvrir();
        else fermer();
      });

      racine.addEventListener('click', function (evenement) {
        var cible = evenement.target && evenement.target.closest ? evenement.target.closest('[data-suivant]') : null;
        if (cible && racine.contains(cible)) {
          var suivant = cible.getAttribute('data-suivant');
          if (trouver(suivant)) afficher(suivant);
          return;
        }
        if (recommencer && evenement.target === recommencer) {
          evenement.preventDefault();
          afficher(depart);
        }
      });

      document.addEventListener('keydown', function (evenement) {
        if (evenement.key === 'Escape' && !panneau.hidden) {
          fermer();
          cta.focus();
        }
      });
    });
  });
})();
