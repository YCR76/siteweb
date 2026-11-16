(function ($) {

/**
 * Toggle the visibility of a fieldset using smooth animations.
 */
Drupal.toggleFieldset = function (fieldset) {
  var $fieldset = $(fieldset);
  if ($fieldset.is('.collapsed')) {
    var $content = $('> .fieldset-wrapper', fieldset).hide();
    $fieldset
      .removeClass('collapsed')
      .trigger({ type: 'collapsed', value: false })
      .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Hide'));
    $content.slideDown({
      duration: 'fast',
      easing: 'linear',
      complete: function () {
        Drupal.collapseScrollIntoView(fieldset);
        fieldset.animating = false;
      },
      step: function () {
        // Scroll the fieldset into view.
        Drupal.collapseScrollIntoView(fieldset);
      }
    });
  }
  else {
    $fieldset.trigger({ type: 'collapsed', value: true });
    $('> .fieldset-wrapper', fieldset).slideUp('fast', function () {
      $fieldset
        .addClass('collapsed')
        .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Show'));
      fieldset.animating = false;
    });
  }
};

/**
 * Scroll a given fieldset into view as much as possible.
 */
Drupal.collapseScrollIntoView = function (node) {
  var h = document.documentElement.clientHeight || document.body.clientHeight || 0;
  var offset = document.documentElement.scrollTop || document.body.scrollTop || 0;
  var posY = $(node).offset().top;
  var fudge = 55;
  if (posY + node.offsetHeight + fudge > h + offset) {
    if (node.offsetHeight > h) {
      window.scrollTo(0, posY);
    }
    else {
      window.scrollTo(0, posY + node.offsetHeight - h + fudge);
    }
  }
};

Drupal.behaviors.collapse = {
  attach: function (context, settings) {
    $('fieldset.collapsible', context).once('collapse', function () {
      var $fieldset = $(this);
      // Expand fieldset if there are errors inside, or if it contains an
      // element that is targeted by the URI fragment identifier.
      var anchor = location.hash && location.hash != '#' ? ', ' + location.hash : '';
      if ($fieldset.find('.error' + anchor).length) {
        $fieldset.removeClass('collapsed');
      }

      var summary = $('<span class="summary"></span>');
      $fieldset.
        bind('summaryUpdated', function () {
          var text = $.trim($fieldset.drupalGetSummary());
          summary.html(text ? ' (' + text + ')' : '');
        })
        .trigger('summaryUpdated');

      // Turn the legend into a clickable link, but retain span.fieldset-legend
      // for CSS positioning.
      var $legend = $('> legend .fieldset-legend', this);

      $('<span class="fieldset-legend-prefix element-invisible"></span>')
        .append($fieldset.hasClass('collapsed') ? Drupal.t('Show') : Drupal.t('Hide'))
        .prependTo($legend)
        .after(' ');

      // .wrapInner() does not retain bound events.
      var $link = $('<a class="fieldset-title" href="#"></a>')
        .prepend($legend.contents())
        .appendTo($legend)
        .click(function () {
          var fieldset = $fieldset.get(0);
          // Don't animate multiple times.
          if (!fieldset.animating) {
            fieldset.animating = true;
            Drupal.toggleFieldset(fieldset);
          }
          return false;
        });

      $legend.append(summary);
    });
  }
};

})(jQuery);
;

/**
 *  @file
 *  Attach behaviors to formatter radio select when selecting a media's display
 *  formatter.
 */

(function ($) {
namespace('Drupal.media.formatForm');

Drupal.media.mediaFormatSelected = {};

Drupal.behaviors.mediaFormatForm = {
  attach: function (context, settings) {
    // Add "Submit" and "Cancel" buttons inside the IFRAME that trigger the
    // behavior of the hidden "OK" and "Cancel" buttons that are outside the
    // IFRAME. See Drupal.media.browser.validateButtons() for more details.
    $('<a class="button fake-ok">' + Drupal.t('Submit') + '</a>').appendTo($('#media-format-form')).bind('click', Drupal.media.formatForm.submit);
    $('<a class="button fake-cancel">' + Drupal.t('Cancel') + '</a>').appendTo($('#media-format-form')).bind('click', Drupal.media.formatForm.submit);
  }
};

Drupal.media.formatForm.getOptions = function () {
  // Get all the values
  var ret = {}; $.each($('#media-format-form fieldset#edit-options *').serializeArray(), function (i, field) { ret[field.name] = field.value; });
  return ret;
};

Drupal.media.formatForm.getFormattedMedia = function () {
  var formatType = $("select#edit-format option:selected").val();
  return { type: formatType, options: Drupal.media.formatForm.getOptions(), html: Drupal.settings.media.formatFormFormats[formatType] };
};

Drupal.media.formatForm.submit = function () {
  // @see Drupal.behaviors.mediaFormatForm.attach().
  var buttons = $(parent.window.document.body).find('#mediaStyleSelector').parent('.ui-dialog').find('.ui-dialog-buttonpane button');
  if ($(this).hasClass('fake-cancel')) {
    buttons[1].click();
  } else {
    buttons[0].click();
  }
}

})(jQuery);
;
