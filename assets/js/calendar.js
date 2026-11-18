/* Mini et grand calendriers (FullCalendar) alimentés par window.waterwindEvents */
(function () {
  /* Grade FFV -> [fond, texte] */
  var GRADE = {
    "5C": ["#87ceeb", "#123"],
    "5B": ["#90ee90", "#123"],
    "5A": ["#ffd400", "#123"],
    "4":  ["#b57edc", "#fff"],
    "3":  ["#0b3a5d", "#fff"],
    "2":  ["#1a1a1a", "#fff"]
  };

  /* Catégorie (hors régates) -> [fond, texte] */
  var CAT = {
    "Animation": ["#8e1c4f", "#fff"],
    "Stage": ["#7a8b7a", "#fff"]
  };

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var events = (window.waterwindEvents || []).map(function (e) {
      var ev = {
        title: e.title,
        start: e.start,
        end: e.end,
        allDay: e.allDay !== false,
        url: e.url
      };
      ev.extendedProps = {
        deplacementClub: !!e.deplacementClub,
        hebergementClub: !!e.hebergementClub
      };
      if (e.gr && GRADE[e.gr]) {
        ev.backgroundColor = GRADE[e.gr][0];
        ev.textColor = GRADE[e.gr][1];
        ev.borderColor = GRADE[e.gr][0];
      } else if (e.cat && CAT[e.cat]) {
        ev.backgroundColor = CAT[e.cat][0];
        ev.textColor = CAT[e.cat][1];
        ev.borderColor = CAT[e.cat][0];
      }
      return ev;
    });

    var aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    var evenementsFuturs = events.filter(function (ev) {
      var fin = ev.end ? new Date(ev.end) : new Date(ev.start);
      return fin >= aujourdhui;
    });

    var mini = document.getElementById("agenda-mini");
    var full = document.getElementById("agenda-complet");

    if (typeof FullCalendar === "undefined") return;

    if (mini) {
      new FullCalendar.Calendar(mini, {
        initialView: "dayGridMonth",
        height: "auto",
        locale: "fr",
        firstDay: 1,
        headerToolbar: { left: "title", right: "prev today next" },
        fixedWeekCount: false,
        events: events,
        showNonCurrentDates: false,
        footerToolbar: false,
        eventDisplay: "block"
      }).render();
    }

    if (full) {
      new FullCalendar.Calendar(full, {
        initialView: "listYear",
        locale: "fr",
        firstDay: 1,
        headerToolbar: { left: "prevYear prev today next nextYear", center: "title", right: "listYear,dayGridMonth" },
        height: "auto",
        events: evenementsFuturs,
        validRange: { start: aujourdhui },
        eventDidMount: function (info) {
          if (info.view.type.indexOf("list") !== 0) return;
          var props = info.event.extendedProps || {};
          var drapeaux = [];
          if (props.deplacementClub) drapeaux.push(["🚚", "Déplacement club"]);
          if (props.hebergementClub) drapeaux.push(["🏨", "Hébergement club"]);
          if (!drapeaux.length) return;
          var cellule = info.el.querySelector(".fc-list-event-title") || info.el.querySelector(".fc-event-title");
          if (!cellule || cellule.querySelector(".event-emoji")) return;
          var cible = cellule.querySelector("a") || cellule;
          var emoji = document.createElement("span");
          emoji.className = "event-emoji";
          emoji.textContent = drapeaux.map(function (d) { return d[0]; }).join(" ") + " ";
          emoji.title = drapeaux.map(function (d) { return d[1]; }).join(", ");
          cible.insertBefore(emoji, cible.firstChild);
        },
        eventClick: function (info) {
          info.jsEvent.preventDefault();
          if (info.event.url) window.location = info.event.url;
        },
        noEventsContent: "Aucun événement ce mois-ci"
      }).render();
    }
  });
})();
