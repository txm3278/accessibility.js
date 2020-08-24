"use strict";"undefined"!=typeof document&&"function"!=typeof Element.prototype.contains&&(Element.prototype.contains=function(a){return this.compareDocumentPosition(a)%16},document.contains=function(a){return document.body.contains(a)});var a11yGroup=function(a,b){var c,d,f=this,g=!1;this.mod=function(a,b){return(a%b+b)%b},this.init=function(a,b){var e=b||{},g=e.allowTabbing,h=e.doKeyChecking,i=e.ariaCheckedCallback,j=e.setState,k=e.radioFocusCallback,l=e.focusCallback,m=e.doSelectFirstOnInit,n=e.setMouseEvents,o=e.visuallyHiddenClass;f.allowTabbing=!!g,f.doKeyChecking=!!h,f.setState=!1!==j,f.role=a.getAttribute("role"),f.visuallyHiddenClass=o||"sr-only";var p=/(group|list)$/;(c=a.dataset.keyboardOnlyInstructions,d=c?document.getElementById(c):null,null!==f.role&&p.test(f.role))&&(f.groupType=f.role.replace(p,""),f.ariaCheckedCallback=i,f.focusCallback=l||k,f.checkedAttribute="tab"===f.groupType?"aria-selected":"aria-checked",a.addEventListener("keydown",f.onKeyUp.bind(f),!0),a.addEventListener("click",f.onClick.bind(f),!0),m&&f.select(null,a.querySelector("[role=\"".concat(f.groupType,"\"]"))),d&&(a.addEventListener("mousedown",f.mousedownEvent),a.addEventListener("focusout",f.focusoutEvent)),a.addEventListener("focusin",f.focusinEvent))},this.mousedownEvent=function(){g=!0},this.focusinEvent=function(a){var b=a.currentTarget.querySelectorAll("[role=\"".concat(f.groupType,"\"]"));if(d&&!g&&d.classList.remove(f.visuallyHiddenClass),!g&&!f.allowTabbing)for(var c,e=0;e<b.length;e++)if(c=b[e],"true"===c.getAttribute(f.checkedAttribute)){c.focus();break}g=!1},this.focusoutEvent=function(){d.classList.add(f.visuallyHiddenClass)},this.select=function(a,b,c){for(var d,e,g,h=f.ariaCheckedCallback,j=f.setState,k=f.checkedAttribute,l=f.allowTabbing,m=Array.from(b.closest("[role=".concat(f.role,"]")).querySelectorAll("[role=\"".concat(f.groupType,"\"]"))),n=0;n<m.length;n++){var o=m[n],p="false";"true"===o.getAttribute(k)&&(d=o),o===b&&(j&&(p="true"),e=o,g=n),j&&(o.setAttribute(k,p),o===b&&document.activeElement!==document.body&&o.focus()),l||("true"===p?o.removeAttribute("tabIndex"):o.setAttribute("tabIndex","-1"))}l&&!c&&(console.log("refocusing"),accessibility.refocusCurrentElement()),h&&h(a,e,g,d,m)},this.onClick=function(a){var b=a.target,c=a.currentTarget;f.select(a,b),b.focus()},this.onFocus=function(a){var b=a.target,c=a.currentTarget;if(c){var d=f.focusCallback,e=Array.from(c.querySelectorAll("[role=\"".concat(f.groupType,"\"]"))),g=e.indexOf(b);d&&d(a,b,g,c)}},this.onKeyUp=function(a){var b=a.key,c=a.target,d=a.currentTarget,e=a.shiftKey,g=f.ariaCheckedCallback,h=f.allowTabbing,i=f.doKeyChecking;if(c.getAttribute("role")===f.groupType){var j,k=Array.from(d.querySelectorAll("[role=\"".concat(f.groupType,"\"]"))),l=k.indexOf(c);if(0<=l){switch(b){case"ArrowUp":case"ArrowLeft":j=k[f.mod(l-1,k.length)],f.select(a,j,!0);break;case"ArrowDown":case"ArrowRight":j=k[f.mod(l+1,k.length)],f.select(a,j,!0);break;case" ":case"Enter":i&&(f.select(a,c),a.preventDefault());break;default:}j&&(a.preventDefault(),requestAnimationFrame(function(){j.focus(),"Tab"===b&&requestAnimationFrame(function(){f.onFocus(a)})}))}}},this.init(a,b)},accessibility={tempFocusElement:null,tempFocusElementText:" select ",tabbableSelector:"a[href]:not([tabindex=\"-1\"]):not([disabled]),\n     area[href]:not([tabindex=\"-1\"]):not([disabled]),\n     details:not([tabindex=\"-1\"]):not([disabled]),\n     iframe:not([tabindex=\"-1\"]):not([disabled]),\n     keygen:not([tabindex=\"-1\"]):not([disabled]),\n     [contentEditable=true]:not([tabindex=\"-1\"]):not([disabled]),\n     :enabled:not(fieldset):not([tabindex=\"-1\"]):not([disabled]),\n     object:not([tabindex=\"-1\"]):not([disabled]),\n     embed:not([tabindex=\"-1\"]):not([disabled]),\n     [tabindex]:not([tabindex=\"-1\"]):not([disabled])",htmlTagRegex:/(<([^>]+)>)/gi,hasSecondaryNavSkipTarget:!1,mainContentSelector:"",activeSubdocument:null,oldAriaHiddenVal:"data-old-aria-hidden",groups:[],focusAndScrollToView:function focusAndScrollToView(a){a.focus();var b=a.getBoundingClientRect(),c=document.elementFromPoint(b.left,b.top);if(c&&c!==a){var d=c.getBoundingClientRect();window.scrollBy(0,d.top-d.bottom)}},applyFormFocus:function applyFormFocus(a){var b=this,c=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},d=c.firstValid,f=c.isAjaxForm,g=c.e,e=!1;if(f&&g.preventDefault(),a instanceof window.HTMLElement){for(var h,j=a.elements,k=function(a){var c=j[a];if("FIELDSET"!==c.nodeName&&(d||"true"===c.getAttribute("aria-invalid")))return e=!0,document.activeElement===c?(b.focusAndScrollToView(j[a+1]),setTimeout(function(){c&&b.focusAndScrollToView(c)},500)):b.focusAndScrollToView(c),"break"},l=0;l<j.length&&(h=k(l),"break"!==h);l+=1);e||window.requestAnimationFrame(function(){var c=a.querySelector(".form-error__error-text");c&&b.focusAndScrollToView(c)})}return e},refocusCurrentElement:function refocusCurrentElement(a){var b=this,c=document,d=c.activeElement,e=!1,f=null;if(d&&"function"==typeof Element.prototype.closest&&(f=d.closest("[role=\"dialog\"], dialog"),f&&(e=!0)),(!this.tempFocusElement||e)&&document){var h=document.createElement("div");h.setAttribute("tabindex","-1"),h.className="sr-only",h.style.cssText="position:fixed;top:0;left:0;",h.setAttribute("aria-label",this.tempFocusElementText),h.innerHTML=this.tempFocusElementText,e&&f?f.appendChild(h):document.body.appendChild(h),this.tempFocusElement=h}if(this.tempFocusElement&&d){var g=this.tempFocusElement;g.role=d.role?d.role:"button",g.focus(),setTimeout(function(){d&&(d.focus(),b.tempFocusElement.role=null,e&&(b.tempFocusElement=null),a&&a())},500)}},doIfBlurred:function doIfBlurred(a,b){window.requestAnimationFrame(this.doIfBlurredHelper.bind(this,a.currentTarget,a.relatedTarget,b))},doIfBlurredHelper:function doIfBlurredHelper(a,b,c){var d=b||document.activeElement,e=d.parentNode===document.body||d===document.body||null===d;e||a.contains(d)||c()},removeHTML:function removeHTML(a){return a.replace(this.htmlTagRegex,"")},toLowerCase:function toLowerCase(a){var b="";return a&&(a.toString?b=this.removeHTML(a.toString().toLowerCase()):a.toLowerCase&&(b=this.removeHTML(a.toLowerCase()))),b},setMainContentAriaHidden:function setMainContentAriaHidden(a){for(var b,c=document.querySelectorAll(this.mainContentSelector),d=0;d<c.length;d++)b=c[d],a?b.setAttribute("aria-hidden",a):b.removeAttribute("aria-hidden")},keepFocusInsideActiveSubdoc:function keepFocusInsideActiveSubdoc(a){if(this.activeSubdocument){var b=this.activeSubdocument.querySelectorAll(this.tabbableSelector),c=b[0],d=b[b.length-1];a===c?d.focus():c.focus()}},doWhenActiveSubdocIsBlurred:function doWhenActiveSubdocIsBlurred(a,b){var c=this.activeSubdocument;c&&window.requestAnimationFrame(function(){var d=document,e=d.activeElement;null===e||c.contains(e)||b(a)})},testIfFocusIsOutside:function testIfFocusIsOutside(a){var b=a.target,c=this.activeSubdocument;c&&this.doWhenActiveSubdocIsBlurred(b,this.keepFocusInsideActiveSubdoc.bind(this))},correctFocusFromBrowserChrome:function correctFocusFromBrowserChrome(a){var b=this.activeSubdocument,c=this.tabbableSelector,d=document,e=d.activeElement,f=a.relatedTarget;if(b&&null===f&&!b.contains(e)){var g=b.querySelectorAll(c);if(0<g.length){var h=g[0];h.focus()}}},setMobileFocusLoop:function setMobileFocusLoop(a){var b=document,c=b.body,d=a,e=document.querySelector("[".concat(this.oldAriaHiddenVal,"]"));if(null!==e)return void console.warn("Attempted to run setMobileFocusLoop() twice in a row.  removeMobileFocusLoop() must be executed before it run again. Bailing.");do{for(var f,g=d.parentNode.childNodes,h=0;h<g.length;h++)f=g[h],f!==d&&f.setAttribute&&(f.setAttribute(this.oldAriaHiddenVal,f.ariaHidden||"null"),f.setAttribute("aria-hidden","true"));d=d.parentNode}while(d!==c)},removeMobileFocusLoop:function removeMobileFocusLoop(){for(var a=document.querySelectorAll("[".concat(this.oldAriaHiddenVal,"]")),b=0;b<a.length;b++){var c=a[b],d=c.getAttribute(this.oldAriaHiddenVal);"null"===d?c.removeAttribute("aria-hidden"):c.setAttribute("aria-hidden",d),c.removeAttribute(this.oldAriaHiddenVal)}},setKeepFocusInside:function setKeepFocusInside(a,b){var c=document,d=c.body;b?(this.activeSubdocument=a,d.addEventListener("blur",this.testIfFocusIsOutside.bind(this),!0),d.addEventListener("focus",this.correctFocusFromBrowserChrome.bind(this),!0),this.setMobileFocusLoop(a)):(this.activeSubdocument=null,d.removeEventListener("blur",this.testIfFocusIsOutside.bind(this),!0),d.removeEventListener("focus",this.correctFocusFromBrowserChrome.bind(this),!0),this.removeMobileFocusLoop(a))},initGroup:function initGroup(a,b){this.groups.push(new a11yGroup(a,b))},setArrowKeyRadioGroupEvents:function setArrowKeyRadioGroupEvents(a,b){this.initGroup(a,b)}};
