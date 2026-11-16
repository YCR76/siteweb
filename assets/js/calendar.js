/* Mini et grand calendriers (FullCalendar) alimentés par window.waterwindEvents */
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var events = (window.waterwindEvents || []).map(function (e) {
      return {
        title: e.title,
        start: e.start,
        end: e.end,
        allDay: e.allDay !== false,
        url: e.url
      };
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
        initialView: "dayGridMonth",
        locale: "fr",
        firstDay: 1,
        headerToolbar: { left: "prevYear prev today next nextYear", center: "title", right: "dayGridMonth,listYear" },
        height: "auto",
        events: events,
        eventClick: function (info) {
          info.jsEvent.preventDefault();
          if (info.event.url) window.location = info.event.url;
        },
        noEventsContent: "Aucun événement ce mois-ci"
      }).render();
    }
  });
})();
