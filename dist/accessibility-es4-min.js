"use strict";"undefined"!=typeof document&&"function"!=typeof Element.prototype.contains&&(Element.prototype.contains=function(a){return this.compareDocumentPosition(a)%16},document.contains=function(a){return document.body.contains(a)});var accessibility={tempFocusElement:null,tabbableSelector:"a[href]:not([tabindex=\"-1\"]):not([disabled]),\n     area[href]:not([tabindex=\"-1\"]):not([disabled]),\n     details:not([tabindex=\"-1\"]):not([disabled]),\n     iframe:not([tabindex=\"-1\"]):not([disabled]),\n     keygen:not([tabindex=\"-1\"]):not([disabled]),\n     [contentEditable=true]:not([tabindex=\"-1\"]):not([disabled]),\n     :enabled:not(fieldset):not([tabindex=\"-1\"]):not([disabled]),\n     object:not([tabindex=\"-1\"]):not([disabled]),\n     embed:not([tabindex=\"-1\"]):not([disabled]),\n     [tabindex]:not([tabindex=\"-1\"]):not([disabled])",htmlTagRegex:/(<([^>]+)>)/gi,hasSecondaryNavSkipTarget:!1,mainContentSelector:"",activeSubdocument:null,oldAriaHiddenVal:"data-old-aria-hidden",focusAndScrollToView:function d(a){a.focus();var b=a.getBoundingClientRect(),c=document.elementFromPoint(b.left,b.top);if(c&&c!==a){var e=c.getBoundingClientRect();window.scrollBy(0,e.top-e.bottom)}},applyFormFocus:function m(a){var b=this,c=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},d=c.firstValid,f=c.isAjaxForm,g=c.e,e=!1;if(f&&g.preventDefault(),a instanceof window.HTMLElement){for(var h,j=a.elements,k=function(a){var c=j[a];if("FIELDSET"!==c.nodeName&&(d||"true"===c.getAttribute("aria-invalid")))return e=!0,document.activeElement===c?(b.focusAndScrollToView(j[a+1]),setTimeout(function(){c&&b.focusAndScrollToView(c)},500)):b.focusAndScrollToView(c),"break"},l=0;l<j.length&&(h=k(l),"break"!==h);l+=1);e||window.requestAnimationFrame(function(){var c=a.querySelector(".form-error__error-text");c&&b.focusAndScrollToView(c)})}return e},refocusCurrentElement:function d(a){var b=document,c=b.activeElement;this.tempFocusElement&&c&&(this.tempFocusElement.focus(),setTimeout(function(){c&&(c.focus(),a&&a())},500))},doIfBlurred:function c(a,b){window.requestAnimationFrame(this.doIfBlurredHelper.bind(this,a.currentTarget,a.relatedTarget,b))},doIfBlurredHelper:function f(a,b,c){var d=b||document.activeElement,e=d.parentNode===document.body||d===document.body||null===d;e||a.contains(d)||c()},removeHTML:function b(a){return a.replace(this.htmlTagRegex,"")},toLowerCase:function c(a){var b="";return a&&(a.toString?b=this.removeHTML(a.toString().toLowerCase()):a.toLowerCase&&(b=this.removeHTML(a.toLowerCase()))),b},setMainContentAriaHidden:function e(a){for(var b,c=document.querySelectorAll(this.mainContentSelector),d=0;d<c.length;d++)b=c[d],a?b.setAttribute("aria-hidden",a):b.removeAttribute("aria-hidden")},keepFocusInsideActiveSubdoc:function e(a){var b=this.activeSubdocument.querySelectorAll(this.tabbableSelector),c=b[0],d=b[b.length-1];console.log(this.tabbableSelector,b),a===c?d.focus():c.focus()},doWhenActiveSubdocIsBlurred:function d(a,b){var c=this.activeSubdocument;c&&window.requestAnimationFrame(function(){var d=document,e=d.activeElement;null===e||c.contains(e)||b(a)})},testIfFocusIsOutside:function d(a){var b=a.target,c=this.activeSubdocument;c&&this.doWhenActiveSubdocIsBlurred(b,this.keepFocusInsideActiveSubdoc.bind(this))},correctFocusFromBrowserChrome:function g(a){var b=this.activeSubdocument,c=this.tabbableSelector,d=document,e=d.activeElement,f=a.relatedTarget;if(b&&null===f&&!b.contains(e)){var h=b.querySelectorAll(c);if(0<h.length){var i=h[0];i.focus()}}},setMobileFocusLoop:function h(a){var b=document,c=b.body,d=a;do{for(var e,f=d.parentNode.childNodes,g=0;g<f.length;g++)e=f[g],e!==d&&e.setAttribute&&(e.setAttribute(this.oldAriaHiddenVal,e.ariaHidden||"null"),e.setAttribute("aria-hidden","true"));d=d.parentNode}while(d!==c)},removeMobileFocusLoop:function e(){for(var a=document.querySelectorAll("[".concat(this.oldAriaHiddenVal,"]")),b=0;b<a.length;b++){var c=a[b],d=c.getAttribute(this.oldAriaHiddenVal);"null"===d?c.removeAttribute("aria-hidden"):c.setAttribute("aria-hidden",d),c.removeAttribute(this.oldAriaHiddenVal)}},setKeepFocusInside:function e(a,b){var c=document,d=c.body;b?(this.activeSubdocument=a,d.addEventListener("blur",this.testIfFocusIsOutside.bind(this),!0),d.addEventListener("focus",this.correctFocusFromBrowserChrome.bind(this),!0),this.setMobileFocusLoop(a)):(this.activeSubdocument=null,d.removeEventListener("blur",this.testIfFocusIsOutside.bind(this),!0),d.removeEventListener("focus",this.correctFocusFromBrowserChrome.bind(this),!0),this.removeMobileFocusLoop(a))}};
