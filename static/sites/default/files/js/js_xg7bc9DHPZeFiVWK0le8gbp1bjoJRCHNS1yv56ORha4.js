!function(_,p){"use strict";p.behaviors.eu_cookie_compliance_popup={attach:function(e,o){_(p.settings.eu_cookie_compliance.containing_element,e).once("eu-cookie-compliance",function(){var e;p.eu_cookie_compliance.initializeCookieValues(),p.eu_cookie_compliance._euccCurrentStatus=u.getCurrentStatus(),p.eu_cookie_compliance._euccSelectedCategories=u.getAcceptedCategories(),p.settings.eu_cookie_compliance.popup_eu_only_js?p.eu_cookie_compliance.showBanner()&&(e=p.settings.basePath+p.settings.pathPrefix+"eu-cookie-compliance-check",_.getJSON(e,{},function(e){e.in_eu?p.eu_cookie_compliance.execute():p.eu_cookie_compliance.setStatus(p.eu_cookie_compliance.cookieValueAgreed)})):p.eu_cookie_compliance.execute()}).addClass("eu-cookie-compliance-status-"+p.eu_cookie_compliance.getCurrentStatus()),_("a.eu-cookie-compliance-toggle-withdraw-banner",e).click(function(e){return e.preventDefault(),p.eu_cookie_compliance.toggleWithdrawBanner(),!1})}},p.eu_cookie_compliance=p.eu_cookie_compliance||function(){(p.eu_cookie_compliance.queue=p.eu_cookie_compliance.queue||[]).push(arguments)},p.eu_cookie_compliance.a=+new Date;var u=p.eu_cookie_compliance,i=(p.eu_cookie_compliance.initializeCookieValues=function(){p.eu_cookie_compliance.euCookieComplianceBlockCookies=null,p.eu_cookie_compliance.cookieValueDisagreed=void 0===p.settings.eu_cookie_compliance.cookie_value_disagreed||""===p.settings.eu_cookie_compliance.cookie_value_disagreed?"0":p.settings.eu_cookie_compliance.cookie_value_disagreed,p.eu_cookie_compliance.cookieValueAgreedShowThankYou=void 0===p.settings.eu_cookie_compliance.cookie_value_agreed_show_thank_you||""===p.settings.eu_cookie_compliance.cookie_value_agreed_show_thank_you?"1":p.settings.eu_cookie_compliance.cookie_value_agreed_show_thank_you,p.eu_cookie_compliance.cookieValueAgreed=void 0===p.settings.eu_cookie_compliance.cookie_value_agreed||""===p.settings.eu_cookie_compliance.cookie_value_agreed?"2":p.settings.eu_cookie_compliance.cookie_value_agreed,p.eu_cookie_compliance._euccSelectedCategories=[],p.eu_cookie_compliance._euccCurrentStatus=null},u.updateSelectedCategories=function(e){p.eu_cookie_compliance._euccSelectedCategories=e},u.updateCurrentStatus=function(e){p.eu_cookie_compliance._euccCurrentStatus=e},p.eu_cookie_compliance.execute=function(){try{var e,o;p.settings.eu_cookie_compliance.popup_enabled&&p.eu_cookie_compliance.cookiesEnabled()&&(void 0===p.eu_cookie_compliance.getVersion()&&p.eu_cookie_compliance.setVersion(),p.eu_cookie_compliance.updateCheck(),e=p.eu_cookie_compliance.getVersion()!==p.settings.eu_cookie_compliance.cookie_policy_version,o=null!==p.eu_cookie_compliance._euccCurrentStatus&&("opt_in"===p.settings.eu_cookie_compliance.method||"categories"===p.settings.eu_cookie_compliance.method)&&!e,(0===p.eu_cookie_compliance._euccCurrentStatus&&"default"===p.settings.eu_cookie_compliance.method||null===p.eu_cookie_compliance._euccCurrentStatus||p.settings.eu_cookie_compliance.withdraw_enabled&&p.settings.eu_cookie_compliance.withdraw_button_on_info_popup||e)&&(p.settings.eu_cookie_compliance.withdraw_enabled||!p.settings.eu_cookie_compliance.disagree_do_not_show_popup||null===p.eu_cookie_compliance._euccCurrentStatus||e)&&(window.matchMedia("(max-width: "+p.settings.eu_cookie_compliance.mobile_breakpoint+"px)").matches&&p.settings.eu_cookie_compliance.use_mobile_message?p.eu_cookie_compliance.createPopup(p.settings.eu_cookie_compliance.mobile_popup_html_info,o):p.eu_cookie_compliance.createPopup(p.settings.eu_cookie_compliance.popup_html_info,o),p.eu_cookie_compliance.initPopup(),p.eu_cookie_compliance.resizeListener()),1===p.eu_cookie_compliance._euccCurrentStatus&&p.settings.eu_cookie_compliance.popup_agreed_enabled?(p.eu_cookie_compliance.createPopup(p.settings.eu_cookie_compliance.popup_html_agreed),p.eu_cookie_compliance.attachHideEvents()):2===p.eu_cookie_compliance._euccCurrentStatus&&p.settings.eu_cookie_compliance.withdraw_enabled&&(p.settings.eu_cookie_compliance.withdraw_button_on_info_popup||(p.eu_cookie_compliance.createWithdrawBanner(p.settings.eu_cookie_compliance.withdraw_markup),p.eu_cookie_compliance.resizeListener()),p.eu_cookie_compliance.attachWithdrawEvents()))}catch(e){}},p.eu_cookie_compliance.initPopup=function(){p.eu_cookie_compliance.attachAgreeEvents(),"categories"===p.settings.eu_cookie_compliance.method&&(p.eu_cookie_compliance.setPreferenceCheckboxes(p.eu_cookie_compliance._euccSelectedCategories),p.eu_cookie_compliance.attachSavePreferencesEvents()),p.settings.eu_cookie_compliance.withdraw_enabled&&p.settings.eu_cookie_compliance.withdraw_button_on_info_popup&&(p.eu_cookie_compliance.attachWithdrawEvents(),1!==p.eu_cookie_compliance._euccCurrentStatus&&2!==p.eu_cookie_compliance._euccCurrentStatus||(_(".eu-cookie-withdraw-button").removeClass("eu-cookie-compliance-hidden"),_(".eu-cookie-compliance-reject-button").addClass("eu-cookie-compliance-hidden")))},p.eu_cookie_compliance.positionTab=function(){var e;p.settings.eu_cookie_compliance.popup_position&&(e=_(".eu-cookie-withdraw-tab").outerHeight(),_("#sliding-popup").length&&(e+=_("#sliding-popup").outerHeight()),_(".eu-cookie-withdraw-wrapper").length?_(".eu-cookie-withdraw-tab").css("margin-top","0"):_(".eu-cookie-withdraw-tab").css("margin-top",e+"px"))},p.eu_cookie_compliance.createWithdrawBanner=function(e){var o=_("<div></div>").html(e),e=_(".eu-cookie-withdraw-banner",o),i=(o.attr("id","sliding-popup"),o.addClass("eu-cookie-withdraw-wrapper"),o.trigger("eu_cookie_compliance_popup_close"),_("body").removeClass("eu-cookie-compliance-popup-open"),p.settings.eu_cookie_compliance.popup_use_bare_css||e.height(p.settings.eu_cookie_compliance.popup_height).width(p.settings.eu_cookie_compliance.popup_width),o.hide(),0);p.settings.eu_cookie_compliance.popup_position?(o.prependTo(p.settings.eu_cookie_compliance.containing_element),i=parseInt(o.outerHeight()),o.show().addClass("sliding-popup-top").addClass("clearfix").css({top:p.eu_cookie_compliance.getBannerTopHiddenPosition(i)}),setTimeout(function(){o.animate({top:p.eu_cookie_compliance.getBannerTopHiddenPosition(i)},p.settings.eu_cookie_compliance.popup_delay,null),p.settings.eu_cookie_compliance.fixed_top_position||_("body").animate({"margin-top":-i+"px"})}.bind(o,i),0)):(p.settings.eu_cookie_compliance.better_support_for_screen_readers?o.prependTo(p.settings.eu_cookie_compliance.containing_element):o.appendTo(p.settings.eu_cookie_compliance.containing_element),i=o.outerHeight(),o.show().addClass("sliding-popup-bottom").css({bottom:-1*i}),setTimeout(function(){o.animate({bottom:-1*i},p.settings.eu_cookie_compliance.popup_delay,null,function(){var e=o.outerHeight();o.animate({bottom:-1*e},p.settings.eu_cookie_compliance.popup_delay,null)})}.bind(o,i),0))},p.eu_cookie_compliance.getBannerTopPosition=function(e){let o;return p.settings.eu_cookie_compliance.fixed_top_position?(o=0,_("#toolbar").length&&(o+=parseInt(_("#toolbar").css("height"))),o+"px"):0},p.eu_cookie_compliance.getBannerTopHiddenPosition=function(e){let o=0;return p.settings.eu_cookie_compliance.fixed_top_position?o=-e:_("#toolbar").length&&(o=-parseInt(_("#toolbar").css("height"))),o+"px"},p.eu_cookie_compliance.getBannerBottomHiddenPosition=function(){return-_("#sliding-popup").outerHeight()+"px"},p.eu_cookie_compliance.toggleWithdrawBanner=function(){var e,o,i,c=_("#sliding-popup"),n=parseInt(c.outerHeight()),t=c.find(".eu-cookie-compliance-banner, .eu-cookie-withdraw-banner").is(":visible");t&&(e=parseInt(c.css("top")),o=parseInt(_(p.settings.eu_cookie_compliance.containing_element).css("padding-top")),i=parseInt(_(p.settings.eu_cookie_compliance.containing_element).css("margin-top")),t=p.settings.eu_cookie_compliance.popup_position?p.settings.eu_cookie_compliance.fixed_top_position?!(e===-n):!(e===-(o+i+n)):0===parseInt(c.css("bottom"))),p.settings.eu_cookie_compliance.popup_position?t?(p.settings.eu_cookie_compliance.fixed_top_position||_("body").animate({"margin-top":-n+"px"},p.settings.eu_cookie_compliance.popup_delay),c.animate({top:p.eu_cookie_compliance.getBannerTopHiddenPosition(n)},p.settings.eu_cookie_compliance.popup_delay).trigger("eu_cookie_compliance_popup_close"),_("body").removeClass("eu-cookie-compliance-popup-open")):(p.settings.eu_cookie_compliance.fixed_top_position||_("body").animate({"margin-top":"0px"},p.settings.eu_cookie_compliance.popup_delay),c.find(".eu-cookie-compliance-banner").show(),c.animate({top:p.eu_cookie_compliance.getBannerTopPosition(n)},p.settings.eu_cookie_compliance.popup_delay).trigger("eu_cookie_compliance_popup_open"),_("body").addClass("eu-cookie-compliance-popup-open")):t?(c.animate({bottom:-1*n},p.settings.eu_cookie_compliance.popup_delay).trigger("eu_cookie_compliance_popup_close"),_("body").removeClass("eu-cookie-compliance-popup-open")):(c.find(".eu-cookie-compliance-banner").show(),c.animate({bottom:0},p.settings.eu_cookie_compliance.popup_delay).trigger("eu_cookie_compliance_popup_open"),_("body").addClass("eu-cookie-compliance-popup-open"))},p.eu_cookie_compliance.resizeListener=function(){var e,o,i,c=_("#sliding-popup"),n=(e=function(){var e=c.outerHeight();p.settings.eu_cookie_compliance.popup_position?(parseFloat(c.css("top"))<0&&(_("body").hasClass("eu-cookie-compliance-popup-open")?(p.settings.eu_cookie_compliance.fixed_top_position||_("body").css({"margin-top":"0px"}),c.css("top",p.eu_cookie_compliance.getBannerTopPosition(e))):(p.settings.eu_cookie_compliance.fixed_top_position||_("body").css({"margin-top":-e+"px"}),c.css("top",p.eu_cookie_compliance.getBannerTopHiddenPosition(e)))),p.eu_cookie_compliance.positionTab()):0!==parseFloat(c.css("bottom"))&&c.css("bottom",-1*e),p.eu_cookie_compliance.positionTab()},o=50,function(){clearTimeout(i),i=setTimeout(function(){clearTimeout(i),e()},o)});setTimeout(function(){n()}),window.addEventListener("resize",n)},p.eu_cookie_compliance.createPopup=function(e,o){var i=_("<div></div>").html(e),e=(i.attr("id","sliding-popup"),p.settings.eu_cookie_compliance.popup_use_bare_css||i.height(p.settings.eu_cookie_compliance.popup_height).width(p.settings.eu_cookie_compliance.popup_width),i.hide(),0);p.settings.eu_cookie_compliance.popup_position?(i.prependTo(p.settings.eu_cookie_compliance.containing_element),e=i.outerHeight(),i.addClass("sliding-popup-top clearfix").css({top:p.eu_cookie_compliance.getBannerTopHiddenPosition(e)}),!0!==o?(_("body").addClass("eu-cookie-compliance-popup-open"),i.show(),i.animate({top:p.eu_cookie_compliance.getBannerTopPosition(e)},p.settings.eu_cookie_compliance.popup_delay,null,function(){i.trigger("eu_cookie_compliance_popup_open"),p.eu_cookie_compliance.positionTab()})):(p.settings.eu_cookie_compliance.fixed_top_position||_("body").css({"margin-top":-e+"px"}),setTimeout(function(){i.show(),p.eu_cookie_compliance.positionTab()},0))):(p.settings.eu_cookie_compliance.better_support_for_screen_readers?i.prependTo(p.settings.eu_cookie_compliance.containing_element):i.appendTo(p.settings.eu_cookie_compliance.containing_element),e=i.outerHeight(),i.show().attr({class:"sliding-popup-bottom"}).css({bottom:-1*e}),!0!==o&&(_("body").addClass("eu-cookie-compliance-popup-open"),i.animate({bottom:0},p.settings.eu_cookie_compliance.popup_delay,null,function(){i.trigger("eu_cookie_compliance_popup_open")})))},p.eu_cookie_compliance.attachAgreeEvents=function(){var e,o,i=p.settings.eu_cookie_compliance.popup_clicking_confirmation,c=p.settings.eu_cookie_compliance.popup_scrolling_confirmation;"categories"===p.settings.eu_cookie_compliance.method&&p.settings.eu_cookie_compliance.enable_save_preferences_button?_(".agree-button").click(p.eu_cookie_compliance.acceptAllAction):_(".agree-button").click(p.eu_cookie_compliance.acceptAction),_(".decline-button").click(p.eu_cookie_compliance.declineAction),_(".eu-cookie-compliance-close-button").click(p.eu_cookie_compliance.closeAction),_(".eu-cookie-compliance-reject-button").click(p.eu_cookie_compliance.rejectAllAction),i&&_("a, input[type=submit], button[type=submit]").not(".popup-content *").bind("click.euCookieCompliance",p.eu_cookie_compliance.acceptAction),c&&(e=!1,o=function(){e?(p.eu_cookie_compliance.acceptAction(),_(window).off("scroll",o)):e=!0},_(window).bind("scroll",o)),_(".find-more-button").not(".find-more-button-processed").addClass("find-more-button-processed").click(p.eu_cookie_compliance.moreInfoAction)},p.eu_cookie_compliance.closeAction=function(){switch(p.settings.eu_cookie_compliance.close_button_action){case"close_banner":p.eu_cookie_compliance.toggleWithdrawBanner();break;case"save_preferences":p.eu_cookie_compliance.savePreferencesAction();break;case"reject_all_cookies":p.eu_cookie_compliance.rejectAllAction();break;case"accept_all_cookies":p.eu_cookie_compliance.acceptAllAction()}},p.eu_cookie_compliance.attachSavePreferencesEvents=function(){_(".eu-cookie-compliance-save-preferences-button").click(p.eu_cookie_compliance.savePreferencesAction)},p.eu_cookie_compliance.attachHideEvents=function(){var e=p.settings.eu_cookie_compliance.popup_hide_agreed,o=p.settings.eu_cookie_compliance.popup_clicking_confirmation;_(".hide-popup-button").click(function(){p.eu_cookie_compliance.changeStatus(p.eu_cookie_compliance.cookieValueAgreed)}),o&&_("a, input[type=submit], button[type=submit]").unbind("click.euCookieCompliance"),e&&_("a, input[type=submit], button[type=submit]").bind("click.euCookieComplianceHideAgreed",function(){p.eu_cookie_compliance.changeStatus(p.eu_cookie_compliance.cookieValueAgreed)}),_(".find-more-button").not(".find-more-button-processed").addClass("find-more-button-processed").click(p.eu_cookie_compliance.moreInfoAction)},p.eu_cookie_compliance.attachWithdrawEvents=function(){_(".eu-cookie-withdraw-button").click(p.eu_cookie_compliance.withdrawAction),_(".eu-cookie-withdraw-tab").click(p.eu_cookie_compliance.toggleWithdrawBanner)},p.eu_cookie_compliance.acceptAction=function(){var e=p.settings.eu_cookie_compliance.popup_agreed_enabled,o=p.eu_cookie_compliance.cookieValueAgreedShowThankYou;e||(p.eu_cookie_compliance.setStatus(p.eu_cookie_compliance.cookieValueAgreedShowThankYou),o=p.eu_cookie_compliance.cookieValueAgreed),i||"function"!=typeof euCookieComplianceLoadScripts||euCookieComplianceLoadScripts(),void 0!==p.eu_cookie_compliance.euCookieComplianceBlockCookies&&clearInterval(p.eu_cookie_compliance.euCookieComplianceBlockCookies),"categories"===p.settings.eu_cookie_compliance.method&&(e=_("#eu-cookie-compliance-categories input:checkbox:checked").map(function(){return _(this).val()}).get(),p.eu_cookie_compliance.setAcceptedCategories(e),p.eu_cookie_compliance.loadCategoryScripts(e),e.length||(o=p.eu_cookie_compliance.cookieValueDisagreed)),p.eu_cookie_compliance.changeStatus(o),p.settings.eu_cookie_compliance.withdraw_enabled&&p.settings.eu_cookie_compliance.withdraw_button_on_info_popup&&(p.eu_cookie_compliance.attachWithdrawEvents(),1!==p.eu_cookie_compliance._euccCurrentStatus&&2!==p.eu_cookie_compliance._euccCurrentStatus||(_(".eu-cookie-withdraw-button").removeClass("eu-cookie-compliance-hidden"),_(".eu-cookie-compliance-reject-button").addClass("eu-cookie-compliance-hidden")))},p.eu_cookie_compliance.acceptAllAction=function(){var e=p.settings.eu_cookie_compliance.cookie_categories;p.eu_cookie_compliance.setPreferenceCheckboxes(e),p.eu_cookie_compliance.acceptAction()},p.eu_cookie_compliance.rejectAllAction=function(){p.eu_cookie_compliance.setPreferenceCheckboxes([]),p.eu_cookie_compliance.acceptAction()},p.eu_cookie_compliance.savePreferencesAction=function(){var e=_("#eu-cookie-compliance-categories input:checkbox:checked").map(function(){return _(this).val()}).get(),o=p.settings.eu_cookie_compliance.popup_agreed_enabled,i=p.eu_cookie_compliance.cookieValueAgreedShowThankYou;o||(p.eu_cookie_compliance.setStatus(p.eu_cookie_compliance.cookieValueAgreedShowThankYou),i=p.eu_cookie_compliance.cookieValueAgreed),p.eu_cookie_compliance.setAcceptedCategories(e),p.eu_cookie_compliance.loadCategoryScripts(e),e.length||(i=p.eu_cookie_compliance.cookieValueDisagreed),p.eu_cookie_compliance.changeStatus(i)},p.eu_cookie_compliance.loadCategoryScripts=function(e){for(var o in e)!0!==c[e[o]]&&"function"==typeof euCookieComplianceLoadScripts&&(euCookieComplianceLoadScripts(e[o]),c[e[o]]=!0)},p.eu_cookie_compliance.declineAction=function(){p.eu_cookie_compliance.setStatus(p.eu_cookie_compliance.cookieValueDisagreed);var e,o=_("#sliding-popup");o.hasClass("sliding-popup-top")?(e=o.outerHeight(),p.settings.eu_cookie_compliance.fixed_top_position||_("body").animate({"margin-top":-e+"px"},p.settings.eu_cookie_compliance.popup_delay),p.settings.eu_cookie_compliance.settings_tab_enabled?(o.animate({top:p.eu_cookie_compliance.getBannerTopHiddenPosition(e)},p.settings.eu_cookie_compliance.popup_delay,null).trigger("eu_cookie_compliance_popup_close"),_(".eu-cookie-withdraw-tab").click(p.eu_cookie_compliance.toggleWithdrawBanner)):(o.animate({top:p.eu_cookie_compliance.getBannerTopHiddenPosition(e)},p.settings.eu_cookie_compliance.popup_delay,null,function(){o.hide()}).trigger("eu_cookie_compliance_popup_close"),_("body").removeClass("eu-cookie-compliance-popup-open"))):p.settings.eu_cookie_compliance.settings_tab_enabled?(o.animate({bottom:-1*o.outerHeight()},p.settings.eu_cookie_compliance.popup_delay,null).trigger("eu_cookie_compliance_popup_close"),_(".eu-cookie-withdraw-tab").click(p.eu_cookie_compliance.toggleWithdrawBanner)):(o.animate({bottom:-1*o.outerHeight()},p.settings.eu_cookie_compliance.popup_delay,null,function(){o.hide()}).trigger("eu_cookie_compliance_popup_close"),_("body").removeClass("eu-cookie-compliance-popup-open"))},p.eu_cookie_compliance.withdrawAction=function(){p.eu_cookie_compliance.setStatus(0),p.eu_cookie_compliance.setAcceptedCategories([]),location.reload()},p.eu_cookie_compliance.moreInfoAction=function(){p.settings.eu_cookie_compliance.disagree_do_not_show_popup?(p.eu_cookie_compliance.setStatus(p.eu_cookie_compliance.cookieValueDisagreed),p.settings.eu_cookie_compliance.withdraw_enabled&&p.settings.eu_cookie_compliance.withdraw_button_on_info_popup?_("#sliding-popup .eu-cookie-compliance-banner").trigger("eu_cookie_compliance_popup_close").hide():_("#sliding-popup").trigger("eu_cookie_compliance_popup_close").remove(),_("body").removeClass("eu-cookie-compliance-popup-open")):p.settings.eu_cookie_compliance.popup_link_new_window?window.open(p.settings.eu_cookie_compliance.popup_link):window.location.href=p.settings.eu_cookie_compliance.popup_link},p.eu_cookie_compliance.getCurrentStatus=function(){var e,o=new n,o=(u.handleEvent("preStatusLoad",o),"undefined"==typeof eu_cookie_compliance_cookie_name||""===eu_cookie_compliance_cookie_name?"cookie-agreed":eu_cookie_compliance_cookie_name);_.cookie(o)===p.eu_cookie_compliance.cookieValueDisagreed?e="0":_.cookie(o)===p.eu_cookie_compliance.cookieValueAgreedShowThankYou?e="1":_.cookie(o)===p.eu_cookie_compliance.cookieValueAgreed&&(e="2");p.eu_cookie_compliance._euccCurrentStatus=parseInt(e),isNaN(p.eu_cookie_compliance._euccCurrentStatus)&&(p.eu_cookie_compliance._euccCurrentStatus=null);o=new t;return u.handleEvent("postStatusLoad",o),p.eu_cookie_compliance._euccCurrentStatus},p.eu_cookie_compliance.setPreferenceCheckboxes=function(e){for(var o in null===p.eu_cookie_compliance.getCurrentStatus()&&0!==p.eu_cookie_compliance.getCurrentStatus()||_("#eu-cookie-compliance-categories input:checkbox").not(":disabled").attr("checked",!1),e){o=e[o].toString().replace(/[ _\/\[\]]/g,"-").toLowerCase(),o=document.getElementById("cookie-category-"+o);null!==o&&(o.checked=!0)}},p.eu_cookie_compliance.getAcceptedCategories=function(){var e,o=new m,o=(u.handleEvent("prePreferencesLoad",o),"undefined"==typeof eu_cookie_compliance_cookie_name||""===eu_cookie_compliance_cookie_name?"cookie-agreed-categories":p.settings.eu_cookie_compliance.cookie_name+"-categories"),o=_.cookie(o);for(e in p.eu_cookie_compliance._euccSelectedCategories=null!=o?JSON.parse(o):[],p.settings.eu_cookie_compliance.cookie_categories_details){var i=p.settings.eu_cookie_compliance.cookie_categories_details[e];"required"===i.checkbox_default_state&&-1===_.inArray(i.machine_name,p.eu_cookie_compliance._euccSelectedCategories)&&p.eu_cookie_compliance._euccSelectedCategories.push(i.machine_name)}o=new d;return u.handleEvent("postPreferencesLoad",o),p.eu_cookie_compliance._euccSelectedCategories},p.eu_cookie_compliance.changeStatus=function(o){var i=p.settings.eu_cookie_compliance.reload_page,c=p.eu_cookie_compliance._euccCurrentStatus;if(p.eu_cookie_compliance._euccCurrentStatus!==parseInt(o)){if(p.settings.eu_cookie_compliance.popup_position){let e=_("#sliding-popup").outerHeight();p.settings.eu_cookie_compliance.fixed_top_position||_("body").animate({"margin-top":-e+"px"},p.settings.eu_cookie_compliance.popup_delay),_(".sliding-popup-top").animate({top:p.eu_cookie_compliance.getBannerTopHiddenPosition(e)},p.settings.eu_cookie_compliance.popup_delay,function(){_("body").removeClass("eu-cookie-compliance-popup-open"),o!==p.eu_cookie_compliance.cookieValueAgreedShowThankYou||null!==c||i?c===p.eu_cookie_compliance.cookieValueAgreedShowThankYou&&(p.settings.eu_cookie_compliance.withdraw_enabled&&p.settings.eu_cookie_compliance.withdraw_button_on_info_popup?(_("#sliding-popup").hide(),window.matchMedia("(max-width: "+p.settings.eu_cookie_compliance.mobile_breakpoint+"px)").matches&&p.settings.eu_cookie_compliance.use_mobile_message?_(".sliding-popup-top").not(".eu-cookie-withdraw-wrapper").html(p.settings.eu_cookie_compliance.mobile_popup_html_info):_(".sliding-popup-top").not(".eu-cookie-withdraw-wrapper").html(p.settings.eu_cookie_compliance.popup_html_info),e=_("#sliding-popup").outerHeight(),p.settings.eu_cookie_compliance.fixed_top_position||_("body").animate({"margin-top":-e+"px"},p.settings.eu_cookie_compliance.popup_delay),_(".sliding-popup-top").css("top",p.eu_cookie_compliance.getBannerTopHiddenPosition(e)),_(".sliding-popup-top").not(".eu-cookie-withdraw-wrapper").trigger("eu_cookie_compliance_popup_close"),_("body").removeClass("eu-cookie-compliance-popup-open"),p.eu_cookie_compliance.initPopup(),p.eu_cookie_compliance.resizeListener(),_("#sliding-popup").show()):(_(".sliding-popup-top").not(".eu-cookie-withdraw-wrapper").trigger("eu_cookie_compliance_popup_close").remove(),_("body").css({"margin-top":"0px"})),_("body").removeClass("eu-cookie-compliance-popup-open")):(p.settings.eu_cookie_compliance.fixed_top_position||_("body").animate({"margin-top":"0px"},p.settings.eu_cookie_compliance.popup_delay),_(".sliding-popup-top").not(".eu-cookie-withdraw-wrapper").html(p.settings.eu_cookie_compliance.popup_html_agreed).animate({top:p.eu_cookie_compliance.getBannerTopPosition(e)},p.settings.eu_cookie_compliance.popup_delay),p.eu_cookie_compliance.attachHideEvents()),p.settings.eu_cookie_compliance.withdraw_enabled&&!p.settings.eu_cookie_compliance.withdraw_button_on_info_popup&&p.eu_cookie_compliance.showWithdrawBanner(o)})}else _(".sliding-popup-bottom").animate({bottom:-1*_("#sliding-popup").outerHeight()},p.settings.eu_cookie_compliance.popup_delay,function(){o!==p.eu_cookie_compliance.cookieValueAgreedShowThankYou||null!==c||i?c===p.eu_cookie_compliance.cookieValueAgreedShowThankYou&&(_("#sliding-popup").css("display","none"),p.settings.eu_cookie_compliance.withdraw_enabled&&p.settings.eu_cookie_compliance.withdraw_button_on_info_popup?(window.matchMedia("(max-width: "+p.settings.eu_cookie_compliance.mobile_breakpoint+"px)").matches&&p.settings.eu_cookie_compliance.use_mobile_message?_(".sliding-popup-bottom").not(".eu-cookie-withdraw-wrapper").html(p.settings.eu_cookie_compliance.mobile_popup_html_info):_(".sliding-popup-bottom").not(".eu-cookie-withdraw-wrapper").html(p.settings.eu_cookie_compliance.popup_html_info),_(".sliding-popup-bottom").css("bottom",p.eu_cookie_compliance.getBannerBottomHiddenPosition()),_(".sliding-popup-bottom").not(".eu-cookie-withdraw-wrapper").trigger("eu_cookie_compliance_popup_close"),_("body").removeClass("eu-cookie-compliance-popup-open"),p.eu_cookie_compliance.initPopup(),p.eu_cookie_compliance.resizeListener(),_("#sliding-popup").css("display","block")):(_(".sliding-popup-bottom").not(".eu-cookie-withdraw-wrapper").trigger("eu_cookie_compliance_popup_close").remove(),_("body").removeClass("eu-cookie-compliance-popup-open"))):(_(".sliding-popup-bottom").not(".eu-cookie-withdraw-wrapper").html(p.settings.eu_cookie_compliance.popup_html_agreed).animate({bottom:0},p.settings.eu_cookie_compliance.popup_delay),p.eu_cookie_compliance.attachHideEvents()),p.settings.eu_cookie_compliance.withdraw_enabled&&!p.settings.eu_cookie_compliance.withdraw_button_on_info_popup&&p.eu_cookie_compliance.showWithdrawBanner(o)});i&&location.reload(),p.eu_cookie_compliance.setStatus(o)}},p.eu_cookie_compliance.showWithdrawBanner=function(e){e===p.eu_cookie_compliance.cookieValueAgreed&&p.settings.eu_cookie_compliance.withdraw_enabled&&(p.settings.eu_cookie_compliance.withdraw_button_on_info_popup||(p.eu_cookie_compliance.createWithdrawBanner(p.settings.eu_cookie_compliance.withdraw_markup),p.eu_cookie_compliance.resizeListener()),p.eu_cookie_compliance.attachWithdrawEvents(),p.settings.eu_cookie_compliance.popup_position&&p.eu_cookie_compliance.positionTab())},p.eu_cookie_compliance.setStatus=function(e){var o=new a,o=(u.handleEvent("preStatusSave",o),new Date),i=p.settings.eu_cookie_compliance.domain||"",c=p.settings.eu_cookie_compliance.domain_all_sites?"/":p.settings.basePath,n="undefined"==typeof eu_cookie_compliance_cookie_name||""===eu_cookie_compliance_cookie_name?"cookie-agreed":eu_cookie_compliance_cookie_name;1<c.length&&(t=c.length-1,c.lastIndexOf("/")===t&&(c=c.substring(0,t)));parseInt(p.settings.eu_cookie_compliance.cookie_session)?_.cookie(n,e,{path:c,domain:i}):(t=parseInt(p.settings.eu_cookie_compliance.cookie_lifetime),o.setDate(o.getDate()+t),_.cookie(n,e,{expires:o,path:c,domain:i})),p.eu_cookie_compliance._euccCurrentStatus=e,_(document).trigger("eu_cookie_compliance.changeStatus",[e]),p.eu_cookie_compliance.setVersion(),p.settings.eu_cookie_compliance.store_consent&&(e===p.eu_cookie_compliance.cookieValueAgreedShowThankYou&&p.settings.eu_cookie_compliance.popup_agreed_enabled||e===p.eu_cookie_compliance.cookieValueAgreed&&!p.settings.eu_cookie_compliance.popup_agreed_enabled)&&(t=p.settings.basePath+p.settings.pathPrefix+"eu-cookie-compliance/store_consent/banner",_.post(t,{},function(e){}));var t,n=new l;u.handleEvent("postStatusSave",n),e===p.eu_cookie_compliance.cookieValueDisagreed&&"opt_out"===p.settings.eu_cookie_compliance.method&&(p.eu_cookie_compliance.euCookieComplianceBlockCookies=setInterval(p.eu_cookie_compliance.BlockCookies,5e3))},p.eu_cookie_compliance.setAcceptedCategories=function(e){var o=new h,o=(u.handleEvent("prePreferencesSave",o),new Date),i=p.settings.eu_cookie_compliance.domain||"",c=p.settings.eu_cookie_compliance.domain_all_sites?"/":p.settings.basePath,n="undefined"==typeof eu_cookie_compliance_cookie_name||""===eu_cookie_compliance_cookie_name?"cookie-agreed-categories":p.settings.eu_cookie_compliance.cookie_name+"-categories",t=(1<c.length&&(t=c.length-1,c.lastIndexOf("/")===t&&(c=c.substring(0,t))),JSON.stringify(e)),a=(parseInt(p.settings.eu_cookie_compliance.cookie_session)?_.cookie(n,t,{path:c,domain:i}):(a=parseInt(p.settings.eu_cookie_compliance.cookie_lifetime),o.setDate(o.getDate()+a),_.cookie(n,t,{expires:o,path:c,domain:i})),p.eu_cookie_compliance._euccSelectedCategories=e,_(document).trigger("eu_cookie_compliance.changePreferences",[e]),new w);u.handleEvent("postPreferencesSave",a)},p.eu_cookie_compliance.hasAgreed=function(e){var o=1===p.eu_cookie_compliance._euccCurrentStatus||2===p.eu_cookie_compliance._euccCurrentStatus;return o=void 0!==e&&o?p.eu_cookie_compliance.hasAgreedWithCategory(e):o},p.eu_cookie_compliance.hasAgreedWithCategory=function(e){return-1!==_.inArray(e,p.eu_cookie_compliance._euccSelectedCategories)},p.eu_cookie_compliance.showBanner=function(){var e=!1;return 0===p.eu_cookie_compliance._euccCurrentStatus&&"default"===p.settings.eu_cookie_compliance.method||null===p.eu_cookie_compliance._euccCurrentStatus?p.settings.eu_cookie_compliance.disagree_do_not_show_popup&&null!==p.eu_cookie_compliance._euccCurrentStatus||(e=!0):(1===p.eu_cookie_compliance._euccCurrentStatus&&p.settings.eu_cookie_compliance.popup_agreed_enabled||2===p.eu_cookie_compliance._euccCurrentStatus&&p.settings.eu_cookie_compliance.withdraw_enabled)&&(e=!0),e},p.eu_cookie_compliance.cookiesEnabled=function(){var e=navigator.cookieEnabled;return void 0!==navigator.cookieEnabled||e||(document.cookie="testCookie",e=-1!==document.cookie.indexOf("testCookie")),e},p.eu_cookie_compliance.cookieMatches=function(e,o){if(e===o)return!0;if(o.indexOf("*")<0)return!1;try{return new RegExp("^"+o.replace(/\./g,"\\.").replace(/\*/g,".+")+"$","g").test(e)}catch(e){return!1}},p.eu_cookie_compliance.isAllowed=function(e){if(0===e.indexOf("SESS")||0===e.indexOf("SSESS"))return!0;var o,i=p.settings.eu_cookie_compliance.allowed_cookies.split(/\r\n|\n|\r/g);for(o in i.push(void 0===p.settings.eu_cookie_compliance.cookie_name||""===p.settings.eu_cookie_compliance.cookie_name?"cookie-agreed":p.settings.eu_cookie_compliance.cookie_name),i.push(void 0===p.settings.eu_cookie_compliance.cookie_name||""===p.settings.eu_cookie_compliance.cookie_name?"cookie-agreed-categories":p.settings.eu_cookie_compliance.cookie_name+"-categories"),i.push(void 0===p.settings.eu_cookie_compliance.cookie_name||""===p.settings.eu_cookie_compliance.cookie_name?"cookie-agreed-version":p.settings.eu_cookie_compliance.cookie_name+"-version"),i)if("string"==typeof i[o]){if(p.eu_cookie_compliance.cookieMatches(e,i[o]))return!0;if("categories"===p.settings.eu_cookie_compliance.method){var c=i[o].indexOf(":");if(-1!==c){var n=i[o].substr(0,c),c=i[o].substr(c+1);if(p.eu_cookie_compliance.cookieMatches(e,c)&&p.eu_cookie_compliance.hasAgreedWithCategory(n))return!0}}}return!1},p.eu_cookie_compliance.updateCheck=function(){var e="cookie-agreed-"+p.settings.eu_cookie_compliance.popup_language,o=p.settings.eu_cookie_compliance.domain||"",i=p.settings.eu_cookie_compliance.domain_all_sites?"/":p.settings.basePath,c=_.cookie(e),n=new Date,t="undefined"==typeof eu_cookie_compliance_cookie_name||""===eu_cookie_compliance_cookie_name?"cookie-agreed":eu_cookie_compliance_cookie_name;null!=c&&"null"!==c&&(n.setDate(n.getDate()+parseInt(p.settings.eu_cookie_compliance.cookie_lifetime)),_.cookie(t,c,{expires:n,path:i,domain:o}),void 0!==_.removeCookie?_.removeCookie(e):_.cookie(e,null,{path:i,domain:o}))},p.eu_cookie_compliance.getVersion=function(){var e=void 0===p.settings.eu_cookie_compliance.cookie_name||""===p.settings.eu_cookie_compliance.cookie_name?"cookie-agreed-version":p.settings.eu_cookie_compliance.cookie_name+"-version";return _.cookie(e)},!(p.eu_cookie_compliance.setVersion=function(){var e,o=new Date,i=p.settings.eu_cookie_compliance.domain||"",c=p.settings.eu_cookie_compliance.domain_all_sites?"/":p.settings.basePath,n=void 0===p.settings.eu_cookie_compliance.cookie_name||""===p.settings.eu_cookie_compliance.cookie_name?"cookie-agreed-version":p.settings.eu_cookie_compliance.cookie_name+"-version",t=(1<c.length&&(t=c.length-1,c.lastIndexOf("/")===t&&(c=c.substring(0,t))),p.settings.eu_cookie_compliance.cookie_policy_version);parseInt(p.settings.eu_cookie_compliance.cookie_session)?_.cookie(n,t,{path:c,domain:i}):(e=parseInt(p.settings.eu_cookie_compliance.cookie_lifetime),o.setDate(o.getDate()+e),_.cookie(n,t,{expires:o,path:c,domain:i}))})),c={},n=(_(function(){(p.eu_cookie_compliance.hasAgreed()||null===p.eu_cookie_compliance._euccCurrentStatus&&"opt_in"!==p.settings.eu_cookie_compliance.method&&"categories"!==p.settings.eu_cookie_compliance.method)&&("function"==typeof euCookieComplianceLoadScripts&&euCookieComplianceLoadScripts(),i=!0,"categories"===p.settings.eu_cookie_compliance.method&&p.eu_cookie_compliance.loadCategoryScripts(p.eu_cookie_compliance._euccSelectedCategories))}),p.behaviors.eu_cookie_compliance_popup_block_cookies={initialized:!1,attach:function(e,o){var i;!p.behaviors.eu_cookie_compliance_popup_block_cookies.initialized&&o.eu_cookie_compliance&&(p.behaviors.eu_cookie_compliance_popup_block_cookies.initialized=!0,!o.eu_cookie_compliance.automatic_cookies_removal||("opt_in"!==o.eu_cookie_compliance.method||null!==p.eu_cookie_compliance._euccCurrentStatus&&p.eu_cookie_compliance.hasAgreed())&&("opt_out"!==o.eu_cookie_compliance.method||p.eu_cookie_compliance.hasAgreed()||null===p.eu_cookie_compliance._euccCurrentStatus)&&"categories"!==p.settings.eu_cookie_compliance.method||(o=o.eu_cookie_compliance.allowed_cookies.split(/\r\n|\n|\r/g),i="undefined"==typeof eu_cookie_compliance_cookie_name||""===eu_cookie_compliance_cookie_name?"cookie-agreed":eu_cookie_compliance_cookie_name,o.push(i),p.eu_cookie_compliance.euCookieComplianceBlockCookies=setInterval(p.eu_cookie_compliance.BlockCookies,5e3)))}},p.eu_cookie_compliance.BlockCookies=function(){for(var e in _.cookie()){var o,i=window.location.hostname,c=!1;if(!p.eu_cookie_compliance.isAllowed(e)){for(;!c&&""!==i;)c=(c=_.removeCookie(e,{domain:"."+i,path:"/"}))||_.removeCookie(e,{domain:i,path:"/"}),i=-1===(o=i.indexOf("."))?"":i.substring(o+1);c||(document.cookie=e+"=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;")}}},u.handleEvent=function(e,o){for(var i=function(e){var o=[];if(void 0!==p.eu_cookie_compliance&&void 0!==p.eu_cookie_compliance.queue&&p.eu_cookie_compliance.queue.length)for(var i,c,n=0;n<p.eu_cookie_compliance.queue.length;n++)p.eu_cookie_compliance.queue[n].length&&(i=(c=p.eu_cookie_compliance.queue[n])[0],c=c[1],"string"==typeof i&&"function"==typeof c&&i===e&&o.push(c));return o}(e),c=0;c<i.length;c++)void 0!==i[c]&&(o.subscribe(i[c]),o.fire({currentStatus:p.eu_cookie_compliance._euccCurrentStatus,currentCategories:p.eu_cookie_compliance._euccSelectedCategories}),o.unsubscribe(i[c]))},(b=e.prototype).subscribe=function(e){this.handlers.push(e)},b.unsubscribe=function(o){this.handlers=this.handlers.filter(function(e){if(e!==o)return e})},b.fire=function(o,e){var i=e||window;this.handlers.forEach(function(e){e.call(i,o)})},e);function e(){this.handlers=[]}(b=o.prototype).subscribe=function(e){this.handlers.push(e)},b.unsubscribe=function(o){this.handlers=this.handlers.filter(function(e){if(e!==o)return e})},b.fire=function(o,e){var i=e||window;this.handlers.forEach(function(e){e.call(i,o)})};var t=o;function o(){this.handlers=[]}(b=s.prototype).subscribe=function(e){this.handlers.push(e)},b.unsubscribe=function(o){this.handlers=this.handlers.filter(function(e){if(e!==o)return e})},b.fire=function(o,e){var i=e||window;this.handlers.forEach(function(e){e.call(i,o)})};var a=s;function s(){this.handlers=[]}(b=r.prototype).subscribe=function(e){this.handlers.push(e)},b.unsubscribe=function(o){this.handlers=this.handlers.filter(function(e){if(e!==o)return e})},b.fire=function(o,e){var i=e||window;this.handlers.forEach(function(e){e.call(i,o)})};var l=r;function r(){this.handlers=[]}(b=k.prototype).subscribe=function(e){this.handlers.push(e)},b.unsubscribe=function(o){this.handlers=this.handlers.filter(function(e){if(e!==o)return e})},b.fire=function(o,e){var i=e||window;this.handlers.forEach(function(e){e.call(i,o)})};var m=k;function k(){this.handlers=[]}(b=g.prototype).subscribe=function(e){this.handlers.push(e)},b.unsubscribe=function(o){this.handlers=this.handlers.filter(function(e){if(e!==o)return e})},b.fire=function(o,e){var i=e||window;this.handlers.forEach(function(e){e.call(i,o)})};var d=g;function g(){this.handlers=[]}(b=f.prototype).subscribe=function(e){this.handlers.push(e)},b.unsubscribe=function(o){this.handlers=this.handlers.filter(function(e){if(e!==o)return e})},b.fire=function(o,e){var i=e||window;this.handlers.forEach(function(e){e.call(i,o)})};var h=f;function f(){this.handlers=[]}(b=v.prototype).subscribe=function(e){this.handlers.push(e)},b.unsubscribe=function(o){this.handlers=this.handlers.filter(function(e){if(e!==o)return e})},b.fire=function(o,e){var i=e||window;this.handlers.forEach(function(e){e.call(i,o)})};var b,w=v;function v(){this.handlers=[]}}(jQuery,Drupal);;
(function($) {

// Check if this file has already been loaded.
if (typeof Drupal.wysiwygAttach !== 'undefined') {
  return;
}

// Keeps track of editor status during AJAX operations, active format and more.
// Always use getFieldInfo() to get a valid reference to the correct data.
var _fieldInfoStorage = {};
// Keeps track of information relevant to each format, such as editor settings.
// Always use getFormatInfo() to get a reference to a format's data.
var _formatInfoStorage = {};

// Keeps track of global and per format plugin configurations.
// Always use getPluginInfo() tog get a valid reference to the correct data.
var _pluginInfoStorage = {'global': {'drupal': {}, 'native': {}}};

// Keeps track of private instance information.
var _internalInstances = {};

// Keeps track of initialized editor libraries.
var _initializedLibraries = {};

// Keeps a map between format selectboxes and fields.
var _selectToField = {};

/**
 * Returns field specific editor data.
 *
 * @throws Error
 *   Exception thrown if data for an unknown field is requested.
 *   Summary fields are expected to use the same data as the main field.
 *
 * If a field id contains the delimiter '--', anything after that is dropped and
 * the remainder is assumed to be the id of an original field replaced by an
 * AJAX operation, due to how Drupal generates unique ids.
 * @see drupal_html_id()
 *
 * Do not modify the returned object unless you really know what you're doing.
 * No external code should need access to this, and it may likely change in the
 * future.
 *
 * @param fieldId
 *   The id of the field to get data for.
 *
 * @returns
 *   A reference to an object with the following properties:
 *   - activeFormat: A string with the active format id.
 *   - enabled: A boolean, true if the editor is attached.
 *   - formats: An object with one sub-object for each available format, holding
 *     format specific state data for this field.
 *   - summary: An optional string with the id of a corresponding summary field.
 *   - trigger: A string with the id of the format selector for the field.
 *   - getFormatInfo: Shortcut method to getFormatInfo(fieldInfo.activeFormat).
 */
function getFieldInfo(fieldId) {
  if (_fieldInfoStorage[fieldId]) {
    return _fieldInfoStorage[fieldId];
  }
  var baseFieldId = (fieldId.indexOf('--') === -1 ? fieldId : fieldId.substr(0, fieldId.indexOf('--')));
  if (_fieldInfoStorage[baseFieldId]) {
    return _fieldInfoStorage[baseFieldId];
  }
  throw new Error('Wysiwyg module has no information about field "' + fieldId + '"');
}

/**
 * Returns format specific editor data.
 *
 * Do not modify the returned object unless you really know what you're doing.
 * No external code should need access to this, and it may likely change in the
 * future.
 *
 * @param formatId
 *   The id of a format to get data for.
 *
 * @returns
 *   A reference to an object with the following properties:
 *   - editor: A string with the id of the editor attached to the format.
 *     'none' if no editor profile is associated with the format.
 *   - enabled: True if the editor is active.
 *   - toggle: True if the editor can be toggled on/off by the user.
 *   - editorSettings: A structure holding editor settings for this format.
 *   - getPluginInfo: Shortcut method to get plugin config for the this format.
 */
function getFormatInfo(formatId) {
  if (_formatInfoStorage[formatId]) {
    return _formatInfoStorage[formatId];
  }
  return {
    editor: 'none',
    getPluginInfo: function () {
      return getPluginInfo(formatId);
    }
  };
}

/**
 * Returns plugin configuration for a specific format, or the global values.
 *
 * @param formatId
 *   The id of a format to get data for, or 'global' to get data common to all
 *   formats and editors. Use 'global:editorname' to limit it to one editor.
 *
 * @return
 *   The returned object will have the sub-objects 'drupal' and 'native', each
 *   with properties matching names of plugins.
 *   Global data for Drupal (cross-editor) plugins will have the following keys:
 *   - title: A human readable name for the button.
 *   - internalName: The unique name of a native plugin wrapper, used in editor
 *     profiles and when registering the plugin with the editor API to avoid
 *     possible id conflicts with native plugins.
 *   - css: A stylesheet needed by the plugin.
 *   - icon path: The path where button icons are stored.
 *   - path: The path to the plugin's main folder.
 *   - buttons: An object with button data, keyed by name with the properties:
 *     - description: A human readable string describing the button's function.
 *     - title: A human readable string with the name of the button.
 *     - icon: An object with one or more of the following properties:
 *       - src: An absolute (begins with '/') or relative path to the icon.
 *       - path: An absolute path to a folder containing the button.
 *
 *   When formatId matched a format with an assigned editor, values for plugins
 *   match the return value of the editor integration's [proxy] plugin settings
 *   callbacks.
 *
 *   @see Drupal.wysiwyg.utilities.getPluginInfo()
 *   @see Drupal.wyswiyg.utilities.extractButtonSettings()
 */
function getPluginInfo(formatId) {
  var match, editor;
  if ((match = formatId.match(/^global:(\w+)$/))) {
    formatId = 'global';
    editor = match[1];
  }
  if (!_pluginInfoStorage[formatId]) {
    return {};
  }
  if (formatId === 'global' && typeof editor !== 'undefined') {
    return { 'drupal': _pluginInfoStorage.global.drupal, 'native': (_pluginInfoStorage.global['native'][editor]) };
  }
  return _pluginInfoStorage[formatId];
}

/**
 * Attach editors to input formats and target elements (f.e. textareas).
 *
 * This behavior searches for input format selectors and formatting guidelines
 * that have been preprocessed by Wysiwyg API. All CSS classes of those elements
 * with the prefix 'wysiwyg-' are parsed into input format parameters, defining
 * the input format, configured editor, target element id, and variable other
 * properties, which are passed to the attach/detach hooks of the corresponding
 * editor.
 *
 * Furthermore, an "enable/disable rich-text" toggle link is added after the
 * target element to allow users to alter its contents in plain text.
 *
 * This is executed once, while editor attach/detach hooks can be invoked
 * multiple times.
 *
 * @param context
 *   A DOM element, supplied by Drupal.attachBehaviors().
 */
Drupal.behaviors.attachWysiwyg = {
  attach: function (context, settings) {
    // This breaks in Konqueror. Prevent it from running.
    if (/KDE/.test(navigator.vendor)) {
      return;
    }
    var wysiwygs = $('.wysiwyg:input', context);
    if (!wysiwygs.length) {
      // No new fields, nothing to update.
      return;
    }
    updateInternalState(settings.wysiwyg, context);
    wysiwygs.once('wysiwyg', function () {
      // Skip processing if the element is unknown or does not exist in this
      // document. Can happen after a form was removed but Drupal.ajax keeps a
      // lingering reference to the form and calls Drupal.attachBehaviors().
      var $this = $('#' + this.id, document);
      if (!$this.length) {
        return;
      }
      // Directly attach this editor, if the input format is enabled or there is
      // only one input format at all.
      Drupal.wysiwygAttach(context, this.id);
    })
    .closest('form').submit(function (event) {
      // Detach any editor when the containing form is submitted.
      // Do not detach if the event was cancelled.
      if (event.isDefaultPrevented()) {
        return;
      }
      var form = this;
      $('.wysiwyg:input', this).each(function () {
        Drupal.wysiwygDetach(form, this.id, 'serialize');
      });
    });
  },

  detach: function (context, settings, trigger) {
    var wysiwygs;
    // The 'serialize' trigger indicates that we should simply update the
    // underlying element with the new text, without destroying the editor.
    if (trigger == 'serialize') {
      // Removing the wysiwyg-processed class guarantees that the editor will
      // be reattached. Only do this if we're planning to destroy the editor.
      wysiwygs = $('.wysiwyg-processed:input', context);
    }
    else {
      wysiwygs = $('.wysiwyg:input', context).removeOnce('wysiwyg');
    }
    wysiwygs.each(function () {
      Drupal.wysiwygDetach(context, this.id, trigger);
      if (trigger === 'unload') {
        // Delete the instance in case the field is removed. This is safe since
        // detaching with the unload trigger is reverts to the 'none' "editor".
        delete _internalInstances[this.id];
        delete Drupal.wysiwyg.instances[this.id];
      }
    });
  }
};

/**
 * Attach an editor to a target element.
 *
 * Detaches any existing instance for the field before attaching a new instance
 * based on the current state of the field. Editor settings and state
 * information is fetched based on the element id and get cloned first, so they
 * cannot be overridden. After attaching the editor, the toggle link is shown
 * again, except in case we are attaching no editor.
 *
 * Also attaches editors to the summary field, if available.
 *
 * @param context
 *   A DOM element, supplied by Drupal.attachBehaviors().
 * @param fieldId
 *   The id of an element to attach an editor to.
 */
Drupal.wysiwygAttach = function(context, fieldId) {
  var fieldInfo = getFieldInfo(fieldId),
    doSummary = (fieldInfo.summary && (!fieldInfo.formats[fieldInfo.activeFormat] || !fieldInfo.formats[fieldInfo.activeFormat].skip_summary));
  // Detach any previous editor instance if enabled, else remove the grippie.
  detachFromField(fieldId, context, 'unload');
  var wasSummary = !!_internalInstances[fieldInfo.summary];
  if (doSummary || wasSummary) {
    detachFromField(fieldId, context, 'unload', {summary: true});
  }
  // Store this field id, so (external) plugins can use it.
  // @todo Wrong point in time. Probably can only supported by editors which
  //   support an onFocus() or similar event.
  Drupal.wysiwyg.activeId = fieldId;
  // Attach or update toggle link, if enabled.
  Drupal.wysiwygAttachToggleLink(context, fieldId);
  // Attach to main field.
  attachToField(fieldId, context);
  // Attach to summary field.
  if (doSummary || wasSummary) {
    // If the summary wrapper is visible, attach immediately.
    if ($('#' + fieldInfo.summary).parents('.text-summary-wrapper').is(':visible')) {
      attachToField(fieldId, context, {summary: true, forceDisabled: !doSummary});
    }
    else {
      // Attach an instance of the 'none' editor to have consistency while the
      // summary is hidden, then switch to a real editor instance when shown.
      attachToField(fieldId, context, {summary: true, forceDisabled: true});
      // Unbind any existing click handler to avoid double toggling.
      $('#' + fieldId).parents('.text-format-wrapper').find('.link-edit-summary').closest('.field-edit-link').unbind('click.wysiwyg').bind('click.wysiwyg', function () {
        detachFromField(fieldId, context, 'unload', {summary: true});
        attachToField(fieldId, context, {summary: true, forceDisabled: !doSummary});
        $(this).unbind('click.wysiwyg');
      });
    }
  }
};

/**
 * The public API exposed for an editor-enabled field.
 *
 * Properties should be treated as read-only state and changing them will not
 * have any effect on how the instance behaves.
 *
 * Note: The attach() and detach() methods are not part of the public API and
 * should not be called directly to avoid synchronization issues.
 * Use Drupal.wysiwygAttach() and Drupal.wysiwygDetach() to activate or
 * deactivate editor instances. Externally switching the active editor is not
 * supported other than changing the format using the select element.
 */
function WysiwygInstance(internalInstance) {
  // The id of the field the instance manipulates.
  this.field = internalInstance.field;
  // The internal name of the attached editor.
  this.editor = internalInstance.editor;
  // If the editor is currently enabled or not.
  this['status'] = internalInstance['status'];
  // The id of the text format the editor is attached to.
  this.format = internalInstance.format;
  // If the field is resizable without an editor attached.
  this.resizable = internalInstance.resizable;

  // Methods below here redirect to the 'none' editor which handles plain text
  // fields when the editor is disabled.

   /**
    * Insert content at the cursor position.
    *
    * @param content
    *   An HTML markup string.
    */
  this.insert = function (content) {
    return internalInstance['status'] ? internalInstance.insert(content) : Drupal.wysiwyg.editor.instance.none.insert.call(internalInstance, content);
  }

  /**
   * Get all content from the editor.
   *
   * @return
   *   An HTML markup string.
   */
  this.getContent = function () {
    return internalInstance['status'] ? internalInstance.getContent() : Drupal.wysiwyg.editor.instance.none.getContent.call(internalInstance);
  }

  /**
   * Replace all content in the editor.
   *
   * @param content
   *   An HTML markup string.
   */
  this.setContent = function (content) {
    return internalInstance['status'] ? internalInstance.setContent(content) : Drupal.wysiwyg.editor.instance.none.setContent.call(internalInstance, content);
  }

  /**
   * Check if the editor is in fullscreen mode.
   *
   * @return bool
   *  True if the editor is considered to be in fullscreen mode.
   */
  this.isFullscreen = function (content) {
    return internalInstance['status'] && $.isFunction(internalInstance.isFullscreen) ? internalInstance.isFullscreen() : false;
  }

  // @todo The methods below only work for TinyMCE, deprecate?

  /**
   * Open a native editor dialog.
   *
   * Use of this method i not recommended due to limited editor support.
   *
   * @param dialog
   *   An object with dialog settings. Keys used:
   *   - url: The url of the dialog template.
   *   - width: Width in pixels.
   *   - height: Height in pixels.
   */
  this.openDialog = function (dialog, params) {
    if ($.isFunction(internalInstance.openDialog)) {
      return internalInstance.openDialog(dialog, params)
    }
  }

  /**
   * Close an opened dialog.
   *
   * @param dialog
   *   Same options as for opening a dialog.
   */
  this.closeDialog = function (dialog) {
    if ($.isFunction(internalInstance.closeDialog)) {
      return internalInstance.closeDialog(dialog)
    }
  }
}

/**
 * The private base for editor instances.
 *
 * An instance of this object is used as the context for all calls into the
 * editor instances (including attach() and detach() when only one instance is
 * asked to detach).
 *
 * Anything added to Drupal.wysiwyg.editor.instance[editorName] is cloned into
 * an instance of this function.
 *
 * Editor state parameters are cloned into the instance after that.
 */
function WysiwygInternalInstance(params) {
  $.extend(true, this, Drupal.wysiwyg.editor.instance[params.editor]);
  $.extend(true, this, params);
  this.$field = $('#' + this.field);
  this.pluginInfo = {
    'global': getPluginInfo('global:' + params.editor),
    'instances': getPluginInfo(params.format)
  };
  // Keep track of the public face to keep it synced.
  this.publicInstance = new WysiwygInstance(this);
  // Internal list of active element watchers.
  var watchers = [];

  /**
   * Watch an element and notify Wysiwyg when it changes.
   *
   * @param $element
   *   A jQuery object with the element to watch.
   * @param watchContext
   *   An optional only argument for the condition callback on change events.
   * @param watchCondition
   *   An optional callback returning TRUE if to notify Wysiwyg, else FALSE.
   *
   * @see ElementWatcher
   */
  this.startWatching = function ($element, watchContext, watchCondition) {
    var watcher = new ElementWatcher();
    var instance = this;
    watcher.addCallback(function () {
      instance.contentsChanged();
    });
    watcher.start($element, watchContext, watchCondition);
    watchers.push(watcher);
  };

  /**
   * Stop watching all element for changes.
   */
  this.stopWatching = function () {
    while (watchers.length) {
      var watcher = watchers.pop();
      watcher.stop();
    }
  };
}

/**
 * Notify Wysiwyg that the editor contents for this instance have changed.
 */
WysiwygInternalInstance.prototype.contentsChanged = function () {
  // Only need to flip changed status once.
  if (this.$field.attr('data-wysiwyg-value-is-changed') === 'false') {
    this.$field.attr('data-wysiwyg-value-is-changed', 'true');
  }
  this.$field.trigger('drupal-wysiwyg-changed', this.publicInstance);
};

/**
 * Updates internal settings and state caches with new information.
 *
 * Attaches selection change handler to format selector to track state changes.
 *
 * @param settings
 *   A structure like Drupal.settigns.wysiwyg.
 * @param context
 *   The context given from Drupal.attachBehaviors().
 */
function updateInternalState(settings, context) {
  var pluginData = settings.plugins;
  for (var plugin in pluginData.drupal) {
    if (!(plugin in _pluginInfoStorage.global.drupal)) {
      _pluginInfoStorage.global.drupal[plugin] = pluginData.drupal[plugin];
    }
  }
  // To make sure we don't rely on Drupal.settings, uncomment these for testing.
  //pluginData.drupal = {};
  for (var editorId in pluginData['native']) {
    for (var plugin in pluginData['native'][editorId]) {
      _pluginInfoStorage.global['native'][editorId] = (_pluginInfoStorage.global['native'][editorId] || {});
      if (!(plugin in _pluginInfoStorage.global['native'][editorId])) {
        _pluginInfoStorage.global['native'][editorId][plugin] = pluginData['native'][editorId][plugin];
      }
    }
  }
  //pluginData['native'] = {};
  for (var fmatId in pluginData) {
    if (fmatId.substr(0, 6) !== 'format') {
      continue;
    }
    _pluginInfoStorage[fmatId] = (_pluginInfoStorage[fmatId] || {'drupal': {}, 'native': {}});
    for (var plugin in pluginData[fmatId].drupal) {
      if (!(plugin in _pluginInfoStorage[fmatId].drupal)) {
        _pluginInfoStorage[fmatId].drupal[plugin] = pluginData[fmatId].drupal[plugin];
      }
    }
    for (var plugin in pluginData[fmatId]['native']) {
      if (!(plugin in _pluginInfoStorage[fmatId]['native'])) {
        _pluginInfoStorage[fmatId]['native'][plugin] = pluginData[fmatId]['native'][plugin];
      }
    }
    delete pluginData[fmatId];
  }
  // Build the cache of format/profile settings.
  for (var editor in settings.configs) {
    if (!settings.configs.hasOwnProperty(editor)) {
      continue;
    }
    for (var format in settings.configs[editor]) {
      if (_formatInfoStorage[format] || !settings.configs[editor].hasOwnProperty(format)) {
        continue;
      }
      _formatInfoStorage[format] = {
        editor: editor,
        toggle: true, // Overridden by triggers.
        editorSettings: processObjectTypes(settings.configs[editor][format])
      };
    }
    // Initialize editor libraries if not already done.
    if (!_initializedLibraries[editor] && typeof Drupal.wysiwyg.editor.init[editor] === 'function') {
      // Clone, so original settings are not overwritten.
      Drupal.wysiwyg.editor.init[editor](jQuery.extend(true, {}, settings.configs[editor]), getPluginInfo('global:' + editor));
      _initializedLibraries[editor] = true;
    }
    // Update libraries, in case new plugins etc have not been initialized yet.
    else if (typeof Drupal.wysiwyg.editor.update[editor] === 'function') {
      Drupal.wysiwyg.editor.update[editor](jQuery.extend(true, {}, settings.configs[editor]), getPluginInfo('global:' + editor));
    }
  }
  //settings.configs = {};
  for (var triggerId in settings.triggers) {
    var trigger = settings.triggers[triggerId];
    var fieldId = trigger.field;
    var baseFieldId = (fieldId.indexOf('--') === -1 ? fieldId : fieldId.substr(0, fieldId.indexOf('--')));
    var fieldInfo = null;
    if ($('#' + triggerId, context).length === 0) {
      // Skip fields which may have been removed or are not in this context.
      continue;
    }
    if (!(fieldInfo = _fieldInfoStorage[baseFieldId])) {
      fieldInfo = _fieldInfoStorage[baseFieldId] = {
        formats: {},
        select: trigger.select,
        resizable: trigger.resizable,
        summary: trigger.summary,
        getFormatInfo: function () {
          if (this.select) {
            this.activeFormat = 'format' + $('#' + this.select + ':input').val();
          }
          return getFormatInfo(this.activeFormat);
        }
        // 'activeFormat' and 'enabled' added below.
      };
    }
    for (var format in trigger) {
      if (format.indexOf('format') != 0 || fieldInfo.formats[format]) {
        continue;
      }
      fieldInfo.formats[format] = {
        'enabled': trigger[format].status
      };
      if (!_formatInfoStorage[format]) {
        _formatInfoStorage[format] = {
          editor: trigger[format].editor,
          editorSettings: {},
          getPluginInfo: function () {
            return getPluginInfo(formatId);
          }
        };
      }
      // Always update these since they are stored as state.
      _formatInfoStorage[format].toggle = trigger[format].toggle;
      if (trigger[format].skip_summary) {
        fieldInfo.formats[format].skip_summary = true;
      }
    }
    var $selectbox = null;
    // Always update these since Drupal generates new ids on AJAX calls.
    fieldInfo.summary = trigger.summary;
    if (trigger.select) {
      _selectToField[trigger.select.replace(/--\d+$/,'')] = trigger.field;
      fieldInfo.select = trigger.select;
      // Specifically target input elements in case selectbox wrappers have
      // hidden the real element and cloned its attributes.
      $selectbox = $('#' + trigger.select + ':input', context).filter('select');
      // Attach onChange handlers to input format selector elements.
      $selectbox.unbind('change.wysiwyg').bind('change.wysiwyg', formatChanged);
    }
    // Always update the active format to ensure the righ profile is used if a
    // field was removed and gets re-added and the instance was left behind.
    fieldInfo.activeFormat = 'format' + ($selectbox ? $selectbox.val() : trigger.activeFormat);
    fieldInfo.enabled = fieldInfo.formats[fieldInfo.activeFormat] && fieldInfo.formats[fieldInfo.activeFormat].enabled;
  }
  //settings.triggers = {};
}

/**
 * Helper to prepare and attach an editor for a single field.
 *
 * Creates the 'instance' object under Drupal.wysiwyg.instances[fieldId].
 *
 * @param mainFieldId
 *  The id of the field's main element, for fetching field info.
 * @param context
 *   A DOM element, supplied by Drupal.attachBehaviors().
 * @param params
 *   An optional object for overriding state information for the editor with the
 *   following properties:
 *   - 'summary': Set to true to indicate to attach to the summary instead of
 *     the main element. Defaults to false.
 *   - 'forceDisabled': Set to true to override the current state of the field
 *     and assume it is disabled. Useful for hidden summary instances.
 *
 * @see Drupal.wysiwygAttach()
 */
function attachToField(mainFieldId, context, params) {
  params = params || {};
  var fieldInfo = getFieldInfo(mainFieldId);
  var fieldId = (params.summary ? fieldInfo.summary : mainFieldId);
  var formatInfo = fieldInfo.getFormatInfo();
  // If the editor isn't active, attach default behaviors instead.
  var enabled = (fieldInfo.enabled && !params.forceDisabled);
  var editor = (enabled ? formatInfo.editor : 'none');
  // Settings are deep merged (cloned) to prevent editor implementations from
  // permanently modifying them while attaching.
  var clonedSettings = (enabled ? jQuery.extend(true, {}, formatInfo.editorSettings) : {});
  // (Re-)initialize field instance.
  var stateParams = {
    field: fieldId,
    editor: formatInfo.editor,
    'status': enabled,
    format: fieldInfo.activeFormat,
    resizable: fieldInfo.resizable
  };
  var internalInstance = new WysiwygInternalInstance(stateParams);
  _internalInstances[fieldId] = internalInstance;
  Drupal.wysiwyg.instances[fieldId] = internalInstance.publicInstance;
  var $field = $('#' + fieldId);
  var skipFiltering = false;
  // Switch to using any pre-filtered content if it exists.
  if ($field.attr('data-wysiwyg-value-filtered')) {
    $field.val($field.attr('data-wysiwyg-value-filtered'));
    skipFiltering = true;
    // Pre-filtered content is only valid once.
    $field.removeAttr('data-wysiwyg-value-filtered');
  }
  else if (enabled) {
    // Store the unaltered content so it can be restored if no changes
    // intentionally made by the user were detected, such as those caused by
    // WYSIWYG editors when initially parsing and loading content.
    $field.attr('data-wysiwyg-value-original', $field.val()).attr('data-wysiwyg-value-is-changed', 'false');
  }
  // Run filters if not told to skip them and there is something to be cleared.
  var run_filter = enabled && !skipFiltering && $field.val().length > 0;
  // Attach editor, if enabled by default or last state was enabled.
  if (run_filter) {
    // Remove the Wysiwyg-only 'format' prefix.
    var previousFormat = fieldInfo.previousFormat && fieldInfo.previousFormat !== fieldInfo.activeFormat ? fieldInfo.previousFormat.substr(6) : '';
    $.ajax({
      type: 'POST',
      url: Drupal.settings.wysiwyg.xss_url,
      async: true,
      data: {
        text: $field.val(),
        input_format: fieldInfo.activeFormat.substr(6),
        original_input_format: previousFormat,
        token: Drupal.settings.wysiwyg.ajaxToken
      },
      dataType: 'json',
      success: function (text) {
        if (text !== false) {
          $field.val(text);
        }
        if ($.isFunction(Drupal.wysiwyg.editor.attach[editor])) {
          Drupal.wysiwyg.editor.attach[editor].call(internalInstance, context, stateParams, clonedSettings);
        }
      }
    });
  }
  // No need to run the filters now, attach immediately.
  else if ($.isFunction(Drupal.wysiwyg.editor.attach[editor])) {
    Drupal.wysiwyg.editor.attach[editor].call(internalInstance, context, stateParams, clonedSettings);
  }
}

/**
 * Detach all editors from a target element.
 *
 * Ensures Drupal's original textfield resize functionality is restored if
 * enabled and the triggering reason is 'unload'.
 *
 * Also detaches editors from the summary field, if available.
 *
 * @param context
 *   A DOM element, supplied by Drupal.detachBehaviors().
 * @param fieldId
 *   The id of an element to attach an editor to.
 * @param trigger
 *   A string describing what is causing the editor to be detached.
 *   - 'serialize': The editor normally just syncs its contents to the original
 *     textarea for value serialization before an AJAX request.
 *   - 'unload': The editor is to be removed completely and the original
 *     textarea restored.
 *
 * @see Drupal.detachBehaviors()
 */
Drupal.wysiwygDetach = function (context, fieldId, trigger) {
  var fieldInfo = getFieldInfo(fieldId),
      trigger = trigger || 'unload';
  // Detach from main field.
  detachFromField(fieldId, context, trigger);
  if (trigger == 'unload') {
    // Attach the resize behavior by forcing status to false. Other values are
    // intentionally kept the same to show which editor is normally attached.
    attachToField(fieldId, context, {forceDisabled: true});
    Drupal.wysiwygAttachToggleLink(context, fieldId);
  }
  // Detach from summary field.
  if (fieldInfo.summary && _internalInstances[fieldInfo.summary]) {
    // The "Edit summary" click handler could re-enable the editor by mistake.
    $('#' + fieldId).parents('.text-format-wrapper').find('.link-edit-summary').unbind('click.wysiwyg');
    detachFromField(fieldId, context, trigger, {summary: true});
    if (trigger == 'unload') {
      attachToField(fieldId, context, {summary: true});
    }
  }
};

/**
 * Helper to detach and clean up after an editor for a single field.
 *
 * Removes the 'instance' object under Drupal.wysiwyg.instances[fieldId].
 *
 * @param mainFieldId
 *  The id of the field's main element, for fetching field info.
 * @param context
 *   A DOM element, supplied by Drupal.detachBehaviors().
 * @param trigger
 *   A string describing what is causing the editor to be detached.
 *   - 'serialize': The editor normally just syncs its contents to the original
 *     textarea for value serialization before an AJAX request.
 *   - 'unload': The editor is to be removed completely and the original
 *     textarea restored.
 * @param params
 *   An optional object for overriding state information for the editor with the
 *   following properties:
 *   - 'summary': Set to true to indicate to detach from the summary instead of
 *     the main element. Defaults to false.
 *
 * @see Drupal.wysiwygDetach()
 */
function detachFromField(mainFieldId, context, trigger, params) {
  params = params || {};
  var fieldInfo = getFieldInfo(mainFieldId);
  var fieldId = (params.summary ? fieldInfo.summary : mainFieldId);
  var $field = $('#' + fieldId);
  var enabled = false;
  var editor = 'none';
  if (_internalInstances[fieldId]) {
    enabled = _internalInstances[fieldId]['status'];
    editor = (enabled ? _internalInstances[fieldId].editor : 'none');
  }
  var stateParams = {
    field: fieldId,
    'status': enabled,
    editor: fieldInfo.editor,
    format: fieldInfo.activeFormat,
    resizable: fieldInfo.resizable
  };
  if (jQuery.isFunction(Drupal.wysiwyg.editor.detach[editor])) {
    Drupal.wysiwyg.editor.detach[editor].call(_internalInstances[fieldId], context, stateParams, trigger);
  }
  // Restore the original value if the user didn't make any changes yet.
  if (enabled && $field.attr('data-wysiwyg-value-is-changed') === 'false') {
    $field.val($field.attr('data-wysiwyg-value-original'));
  }
  if (trigger == 'unload' && _internalInstances[fieldId]) {
    _internalInstances[fieldId].stopWatching();
    delete Drupal.wysiwyg.instances[fieldId];
    delete _internalInstances[fieldId];
  }
}

/**
 * Append or update an editor toggle link to a target element.
 *
 * @param context
 *   A DOM element, supplied by Drupal.attachBehaviors().
 * @param fieldId
 *   The id of an element to attach an editor to.
 */
Drupal.wysiwygAttachToggleLink = function(context, fieldId) {
  var fieldInfo = getFieldInfo(fieldId),
      editor = fieldInfo.getFormatInfo().editor;
  if (!fieldInfo.getFormatInfo().toggle) {
    // Otherwise, ensure that toggle link is hidden.
    $('#wysiwyg-toggle-' + fieldId).hide();
    return;
  }
  if (!$('#wysiwyg-toggle-' + fieldId, context).length) {
    var text = document.createTextNode(fieldInfo.enabled ? Drupal.settings.wysiwyg.disable : Drupal.settings.wysiwyg.enable),
      a = document.createElement('a'),
      div = document.createElement('div');
    $(a).attr({ id: 'wysiwyg-toggle-' + fieldId, href: 'javascript:void(0);' }).append(text);
    $(div).addClass('wysiwyg-toggle-wrapper').append(a);
    if ($('#' + fieldInfo.select).closest('.fieldset-wrapper').prepend(div).length == 0) {
      // Fall back to inserting the link right after the field.
      $('#' + fieldId).after(div);
    };
  }
  $('#wysiwyg-toggle-' + fieldId, context)
    .html(fieldInfo.enabled ? Drupal.settings.wysiwyg.disable : Drupal.settings.wysiwyg.enable).show()
    .unbind('click.wysiwyg')
    .bind('click.wysiwyg', { 'fieldId': fieldId, 'context': context }, Drupal.wysiwyg.toggleWysiwyg);

  // Hide toggle link in case no editor is attached.
  if (editor == 'none') {
    $('#wysiwyg-toggle-' + fieldId).hide();
  }
};

/**
 * Callback for the Enable/Disable rich editor link.
 */
Drupal.wysiwyg.toggleWysiwyg = function (event) {
  var context = event.data.context,
      fieldId = event.data.fieldId,
      fieldInfo = getFieldInfo(fieldId);
  delete fieldInfo.previousFormat;
  // Toggling the enabled state indirectly toggles use of the 'none' editor.
  if (fieldInfo.enabled) {
    fieldInfo.enabled = false;
    Drupal.wysiwygDetach(context, fieldId, 'unload');
  }
  else {
    fieldInfo.enabled = true;
    Drupal.wysiwygAttach(context, fieldId);
  }
  fieldInfo.formats[fieldInfo.activeFormat].enabled = fieldInfo.enabled;
}


/**
 * Event handler for when the selected format is changed.
 */
function formatChanged(event) {
  var fieldId = _selectToField[this.id.replace(/--\d+$/, '')];
  var $field = $('#' + fieldId);
  var $select = $(this);
  var context = $select.closest('form');
  var newFormat = 'format' + $select.val();
  // Field state is fetched by reference.
  var currentField = getFieldInfo(fieldId);
  // Prevent double-attaching if change event is triggered manually.
  if (newFormat === currentField.activeFormat) {
    return;
  }
  // Save the state of the current format.
  if (currentField.formats[currentField.activeFormat]) {
    currentField.formats[currentField.activeFormat].enabled = currentField.enabled;
  }
  // When changing to a text format that has an editor associated with it, then
  // first ask for confirmation, because switching text formats might cause
  // certain markup to be stripped away.
  if ($field.val().length > 0 && currentField.formats[newFormat] && currentField.formats[newFormat].editor !== 'none') {
    var message = Drupal.t('Are you sure you want to change the text format?\n\nChanging the text format to @text_format and enabling the associated editor will permanently remove content that is not allowed in both text formats.\n\nCancel and save your changes before switching the text format to avoid losing data.', {
      '@text_format': $select.find('option:selected').text()
    });
    if (!window.confirm(message)) {
      // Restore the active format. We cannot simply call event.preventDefault()
      // because jQuery's change event is only triggered after the change has
      // already been accepted.
      // The substr() removes the Wysiwyg-only 'format' prefix.
      $select.val(currentField.activeFormat.substr(6));
      // Trick core into showing the correct text format description.
      $select.trigger('change');
      return;
    }
  }
  // Switch format/profile.
  currentField.previousFormat = currentField.activeFormat;
  currentField.activeFormat = newFormat;
  // Load the state from the new format.
  if (currentField.formats[currentField.activeFormat]) {
    currentField.enabled = currentField.formats[currentField.activeFormat].enabled;
  }
  else {
    currentField.enabled = false;
  }
  // Attaching again will use the changed field state.
  Drupal.wysiwygAttach(context, fieldId);
}

/**
 * Convert JSON type placeholders into the actual types.
 *
 * Recognizes function references (callbacks) and Regular Expressions.
 *
 * To create a callback, pass in an object with the following properties:
 * - 'drupalWysiwygType': Must be set to 'callback'.
 * - 'name': A string with the name of the callback, use
 *   'object.subobject.method' syntax for methods in nested objects.
 * - 'context': An optional string with the name of an object for overriding
 *   'this' inside the function. Use 'object.subobject' syntax for nested
 *   objects. Defaults to the window object.
 *
 * To create a RegExp, pass in an object with the following properties:
 * - 'drupalWysiwygType: Must be set to 'regexp'.
 * - 'regexp': The Regular Expression as a string, without / wrappers.
 * - 'modifiers': An optional string with modifiers to set on the RegExp object.
 *
 * @param json
 *  The json argument with all recognized type placeholders replaced by the real
 *  types.
 *
 * @return The JSON object with placeholder types replaced.
 */
function processObjectTypes(json) {
  var out = null;
  if (typeof json != 'object') {
    return json;
  }
  out = new json.constructor();
  if (json.drupalWysiwygType) {
    switch (json.drupalWysiwygType) {
      case 'callback':
        out = callbackWrapper(json.name, json.context);
        break;
      case 'regexp':
        out = new RegExp(json.regexp, json.modifiers ? json.modifiers : undefined);
        break;
      default:
        out.drupalWysiwygType = json.drupalWysiwygType;
    }
  }
  else {
    for (var i in json) {
      if (json.hasOwnProperty(i) && json[i] && typeof json[i] == 'object') {
        out[i] = processObjectTypes(json[i]);
      }
      else {
        out[i] = json[i];
      }
    }
  }
  return out;
}

/**
 * Convert function names into function references.
 *
 * @param name
 *  The name of a function to use as callback. Use the 'object.subobject.method'
 *  syntax for methods in nested objects.
 * @param context
 *  An optional string with the name of an object for overriding 'this' inside
 *  the function. Use 'object.subobject' syntax for nested objects. Defaults to
 *  the window object.
 *
 * @return
 *  A function which will call the named function or method in the proper
 *  context, passing through arguments and return values.
 */
function callbackWrapper(name, context) {
  var namespaces = name.split('.'), func = namespaces.pop(), obj = window;
  for (var i = 0; obj && i < namespaces.length; i++) {
    obj = obj[namespaces[i]];
  }
  if (!obj) {
    throw "Wysiwyg: Unable to locate callback " + namespaces.join('.') + "." + func + "()";
  }
  if (!context) {
    context = obj;
  }
  else if (typeof context == 'string'){
    namespaces = context.split('.');
    context = window;
    for (i = 0; context && i < namespaces.length; i++) {
      context = context[namespaces[i]];
    }
    if (!context) {
      throw "Wysiwyg: Unable to locate context object " + namespaces.join('.');
    }
  }
  if (typeof obj[func] != 'function') {
    throw "Wysiwyg: " + func + " is not a callback function";
  }
  return function () {
    return obj[func].apply(context, arguments);
  }
}

var oldBeforeSerialize = (Drupal.ajax ? Drupal.ajax.prototype.beforeSerialize : false);
if (oldBeforeSerialize) {
  /**
   * Filter the ajax_html_ids list sent in AJAX requests.
   *
   * This overrides part of the form serializer to not include ids we know will
   * not collide because editors are removed before those ids are reused.
   *
   * This avoids hitting like max_input_vars, which defaults to 1000,
   * even with just a few active editor instances.
   */
  Drupal.ajax.prototype.beforeSerialize = function (element, options) {
    var ret = oldBeforeSerialize.call(this, element, options);
    var excludeSelectors = [];
    $.each(Drupal.wysiwyg.excludeIdSelectors, function () {
      if ($.isArray(this)) {
        excludeSelectors = excludeSelectors.concat(this);
      }
    });
    if (excludeSelectors.length > 0) {
      var ajaxHtmlIdsArray = options.data['ajax_html_ids[]'];
      if (!ajaxHtmlIdsArray || ajaxHtmlIdsArray.length === 0) {
        return ret;
      }
      options.data['ajax_html_ids[]'] = [];
      $('[id]:not(' + excludeSelectors.join(',') + ')').each(function () {
        if ($.inArray(this.id, ajaxHtmlIdsArray) !== -1) {
          options.data['ajax_html_ids[]'].push(this.id);
        }
      });
    }
    return ret;
  };
}

// Respond to CTools detach behaviors event.
$(document).unbind('CToolsDetachBehaviors.wysiwyg').bind('CToolsDetachBehaviors.wysiwyg', function(event, context) {
  $('.wysiwyg:input', context).removeOnce('wysiwyg').each(function () {
    Drupal.wysiwygDetach(context, this.id, 'unload');
    // The 'none' instances are destroyed with the dialog.
    delete Drupal.wysiwyg.instances[this.id];
    delete _internalInstances[this.id];
    var baseFieldId = (this.id.indexOf('--') === -1 ? this.id : this.id.substr(0, this.id.indexOf('--')));
    delete _fieldInfoStorage[baseFieldId];
  });
});


/**
 * Helper to detect changes in elements.
 */
function ElementWatcher() {
  var timer;
  var el;
  var callbacks = [];
  var originalContent;
  var condition;
  var context;

  /**
   * Invoke all registered callbacks.
   */
  function changed() {
    for (var i = 0; i < callbacks.length; i++) {
      callbacks[i][0].apply(callbacks[i][1]);
    }
  }

  /**
   * Start tracking changes in an element.
   *
   * Tracks markup changes by listening to input events or polling elements.
   *
   * @param element
   *   A jQuery-wrapped element to track changes for.
   * @param watchContext
   *   An optional object to pass as argument to the watchCondition callback.
   * @param watchCondition
   *   A callback which can return TRUE or FALSE to dynamically allow or block
   *   the added change callbacks. Useful when running multiple watchers in
   *   parallel and only one should react depending on some condition.
   */
  this.start = function (element, watchContext, watchCondition) {
    el = element;
    context = watchContext;
    condition = watchCondition;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    if (el.is(':input')) {
      originalContent = el.val();
      el.bind('input.wysiwyg-watch selectionchange.wysiwyg-watch propertychange.wysiwyg-watch change.wysiwyg-watch', function (ev) {
        if (!condition || condition(context)) {
          var currentContent = el.val();
          if (currentContent !== originalContent) {
            if (originalContent != undefined) {
              changed();
            }
            originalContent = currentContent;
          }
        }
      });
    }
    else if (!timer) {
      originalContent = el.html();
      timer = setInterval(function () {
        if (!condition || condition(context)) {
          var currentContent = el.html();
          if (currentContent !== originalContent) {
            changed();
            originalContent = currentContent;
          }
        }
      }, 100);
    }
  };

  /**
   * Stop tracking changes.
   *
   * Unbinds any event handlers and stops polling.
   */
  this.stop = function () {
    if (el.is(':input')) {
      el.unbind('input.wysiwyg-watch selectionchange.wysiwyg-watch propertychange.wysiwyg-watch change.wysiwyg-watch');
    }
    else if (timer) {
      clearInterval(timer);
      timer = null;
    }
    el = null;
    context = null;
    condition = null;
  };

  /**
   * Add a function to be called when "something" has changed.
   *
   * @param callback
   *   The function to call.
   */
  this.addCallback = function (callback, context) {
    if (!context) {
      context = window;
    }
    callbacks.push([callback, context]);
  };
}

Drupal.wysiwyg.utilities = {

  /**
   * Perform any actions needed to make editors work in fullscreen mode.
   *
   * @see Drupal.wysiwyg.utilities.onFullscreenExit()
   */
  onFullscreenEnter: function () {
    $('#toolbar, #admin-menu', Drupal.overlayChild ? window.parent.document : document).hide();
  },

  /**
   * Undo any actions performed when going to fullscreen mode.
   *
   * @see Drupal.wysiwyg.utilities.onFullscreenEnter()
   */
  onFullscreenExit: function () {
    $('#toolbar, #admin-menu', Drupal.overlayChild ? window.parent.document : document).show();
  }

}

})(jQuery);
;
