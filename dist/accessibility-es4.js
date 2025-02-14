"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/*
 * accessibility.js - a library with common accessibility related routines.
 * by Zoltan Hawryluk (zoltan.dulac@gmail.com)
 * MIT License.
 * 
 * This file must be transpiled for browser like IE11 using babel
 * Install instructions: https://babeljs.io/docs/en/babel-cli
 * You will also need npx: https://www.npmjs.com/package/npx
 * and the env preset: https://stackoverflow.com/questions/34747693/how-do-i-get-babel-6-to-compile-to-es5-javascript
 */
var accessibility; // add contains polyfill here (for IE11).  The typeof 
// document/window check is to ensure this 
// script doesn't break server side rendering
// frameworks like Nashorn.

if (typeof document !== 'undefined' && typeof window !== 'undefined' && typeof Element.prototype.contains !== 'function') {
  Element.prototype.contains = function contains(el) {
    return this.compareDocumentPosition(el) % 16;
  };

  document.contains = function docContains(el) {
    return document.body.contains(el);
  };
}
/**
 * Makes the arrow keys work on ARIA group elements, such as ARIA radio buttons, ARIA tabs and ARIA listbox options.
 *
 * @param {HTMLElement} el - the radiogroup in question.
 * @param {object} options - an optional set of options:
 *
 * - doSelectFirstOnInit: if set to true, select the first element
 *   in the group when initialized.
 * - visuallyHiddenClass: if set, this library will use this
 *   string as its 'visually hidden' class instead of the sr-only
 *   on used in frameworks like bootstrap
 * - allowTabbing: if set to true, allows tabbing of the individual
 *   radio buttons with the tab key.  This is useful when the radio
 *   buttons don't look like radio buttons.
 * - doKeyChecking: if set to true, then this allows the space and
 *   the enter key to allow checking of the radio button.
 * - setState: if set to false, then the library doesn't set the
 *   state.  It is assumed that `ariaCheckedCallback` will do the
 *   setting of state of the checkbox instead (this is useful in
 *   frameworks like React). Default is true.
 * - preventClickDefault: prevents the default on the click event.
 * - ariaCheckedCallback: a callback to run when an element is checked.
 *   The following parameters will be passed to it:
 *     - e (the event that initiated the callback)
 *     - currentlyCheckedEl (the element that just got checked)
 *     - currentlyCheckedIndex (the index of currentlyCheckedEl within the group)
 *     - previouslyCheckedEl (the previously checked element)
 *     - groupEls - all the elements within the group
 *  - focusCallback: a callback to run when a radio button is focused.
 *    (this was previously called radioFocusCallback)
 *    The following parameters will be passed to it:
 *      - el (the element that was checked),
 *      - group (the radiogroup that el is contained in)
 */


var a11yGroup = function a11yGroup(el, options) {
  var _this = this;

  var mousedown = false;
  var keydown = false;
  var keyboardOnlyInstructionsId;
  var keyboardOnlyInstructionsEl;
  /**
   * Takes the *positive* modulo of n % m.  Javascript will
   * return negative ones if n < 0.
   * @param {int} n - the modulus  
   * @param {int} m - the divisor
   * @returns {int} The positive modulo of n mod m.
   */

  this.mod = function (n, m) {
    return (n % m + m) % m;
  };
  /**
   * Initialization of this object.  See a11yGroup Object documentation for more infomation.
   * 
   */


  this.init = function (el, options) {
    var _ref = options || {},
        preventClickDefault = _ref.preventClickDefault,
        allowTabbing = _ref.allowTabbing,
        doKeyChecking = _ref.doKeyChecking,
        ariaCheckedCallback = _ref.ariaCheckedCallback,
        setState = _ref.setState,
        radioFocusCallback = _ref.radioFocusCallback,
        focusCallback = _ref.focusCallback,
        doSelectFirstOnInit = _ref.doSelectFirstOnInit,
        visuallyHiddenClass = _ref.visuallyHiddenClass,
        activatedEventName = _ref.activatedEventName,
        deactivatedEventName = _ref.deactivatedEventName;

    _this.allowTabbing = !!allowTabbing;
    _this.doKeyChecking = !!doKeyChecking;
    _this.preventClickDefault = !!preventClickDefault;
    _this.setState = setState === false ? false : true;
    _this.role = el.getAttribute('role');
    _this.visuallyHiddenClass = visuallyHiddenClass || 'sr-only';
    _this.activatedEventName = activatedEventName;
    _this.deactivatedEventName = deactivatedEventName;
    var groupRe = /(group$|list$|^listbox$)/;
    keyboardOnlyInstructionsId = el.dataset.keyboardOnlyInstructions;
    keyboardOnlyInstructionsEl = keyboardOnlyInstructionsId ? document.getElementById(keyboardOnlyInstructionsId) : null;

    if (_this.role === null || !groupRe.test(_this.role)) {
      return;
    } else if (_this.role === "listbox") {
      _this.groupType = 'option';
    } else {
      _this.groupType = _this.role.replace(groupRe, '');
    }

    _this.ariaCheckedCallback = ariaCheckedCallback;
    _this.focusCallback = focusCallback || radioFocusCallback;
    _this.checkedAttribute = _this.groupType === 'tab' || _this.groupType === 'option' ? 'aria-selected' : 'aria-checked';
    el.addEventListener('keydown', _this.onKeyUp.bind(_this), true);
    el.addEventListener('click', _this.onClick.bind(_this), true);

    if (doSelectFirstOnInit) {
      _this.select(null, el.querySelector("[role=\"".concat(_this.groupType, "\"]")));
    }

    if (keyboardOnlyInstructionsEl) {
      el.addEventListener('mousedown', _this.mousedownEvent);
      el.addEventListener('focusout', _this.focusoutEvent);
    }

    document.addEventListener('keydown', _this.keydownEvent);
    el.addEventListener('focusin', _this.focusinEvent);
    /* if (focusCallback) {
      el.addEventListener('focus', this.onFocus.bind(this), true);
    } */
  };
  /**
   * Fired when mousedown event happens. Used internally only.
   */


  this.mousedownEvent = function () {
    mousedown = true;
  };

  this.keydownEvent = function (e) {
    keydown = true;
  };
  /**
   * Fired when a group is focused into. Used internally only.
   * 
   * @param {EventHandler} e - the focus event 
   */


  this.focusinEvent = function (e) {
    var groupEls = e.currentTarget.querySelectorAll("[role=\"".concat(_this.groupType, "\"]"));

    if (keyboardOnlyInstructionsEl) {
      if (!mousedown && keydown) {
        // show instructions if they exist
        keyboardOnlyInstructionsEl.classList.remove(_this.visuallyHiddenClass);
      }
    }

    if (!mousedown && keydown && !_this.allowTabbing && _this.groupType !== 'option') {
      for (var i = 0; i < groupEls.length; i++) {
        var _el = groupEls[i];

        if (_el.getAttribute(_this.checkedAttribute) === 'true') {
          _el.focus();

          break;
        }
      }
    }

    mousedown = false;
    keydown = false;
  };
  /**
   * Fired when a group is focused out. Used internally only.
   */


  this.focusoutEvent = function () {
    if (!mousedown && keydown) {
      keyboardOnlyInstructionsEl.classList.add(_this.visuallyHiddenClass);
    }
  };
  /**
   *
   * Activates a control in a group, while unchecking the others.
   *
   * @param {HTMLElement} memberEl - a control that needs to be activated
   * @param {Array} radioGroupEls - an array of controls that is in the same group as memberEl
   */


  this.select = function (e, memberEl, doNotRefocus) {
    var ariaCheckedCallback = _this.ariaCheckedCallback,
        setState = _this.setState,
        checkedAttribute = _this.checkedAttribute,
        allowTabbing = _this.allowTabbing;

    var _group = memberEl.closest("[role=".concat(_this.role, "]"));

    var groupEls = Array.from(_group.querySelectorAll("[role=\"".concat(_this.groupType, "\"]")));
    var previouslyCheckedEl;
    var currentlyCheckedEl;
    var currentlyCheckedIndex;

    for (var i = 0; i < groupEls.length; i++) {
      var currentEl = groupEls[i];
      var checkedState = 'false';

      if (currentEl.getAttribute(checkedAttribute) === 'true') {
        previouslyCheckedEl = currentEl;
      }

      if (currentEl === memberEl) {
        if (setState) {
          checkedState = 'true';
        }

        currentlyCheckedEl = currentEl;
        currentlyCheckedIndex = i;
      }

      if (setState) {
        currentEl.setAttribute(checkedAttribute, checkedState);
        currentEl.dispatchEvent(new CustomEvent(checkedState === 'true' ? _this.activatedEventName : _this.deactivatedEventName, {
          'bubbles': true,
          detail: {
            group: function group() {
              return _group;
            }
          }
        }));

        if (currentEl === memberEl) {
          if (document.activeElement !== document.body) {
            currentEl.focus();
          }
        }
      }

      if (!allowTabbing) {
        if (checkedState === 'true') {
          currentEl.setAttribute('tabIndex', '0');
        } else {
          currentEl.setAttribute('tabIndex', '-1');
        }
      }
    }

    if (allowTabbing && !doNotRefocus) {
      accessibility.refocusCurrentElement();
    }

    if (ariaCheckedCallback) {
      ariaCheckedCallback(e, currentlyCheckedEl, currentlyCheckedIndex, previouslyCheckedEl, groupEls);
    }
  };
  /**
   * Fired when group is clicked. Only used internally.
   * 
   * @param {EventHandler} e - click event. 
   */


  this.onClick = function (e) {
    var target = e.target;

    if (_this.preventClickDefault) {
      e.preventDefault();
    }

    if (target.getAttribute('role') === _this.groupType) {
      _this.select(e, target);

      target.focus();
    }
  };
  /**
   * Fired when group is focused.  Only used internally.
   * @param {EventHandler} e 
   */


  this.onFocus = function (e) {
    var target = e.target,
        currentTarget = e.currentTarget;

    if (!currentTarget) {
      return;
    }

    var focusCallback = _this.focusCallback;
    var radioEls = Array.from(currentTarget.querySelectorAll("[role=\"".concat(_this.groupType, "\"]")));
    var targetIndex = radioEls.indexOf(target);

    if (focusCallback) {
      focusCallback(e, target, targetIndex, currentTarget);
    }
  };
  /**
   * Implements keyboard events for grouped element (like ARIA radio buttons and tab controls).
   *
   * @param {EventHandler} e - the keyboard event.
   */


  this.onKeyUp = function (e) {
    var key = e.key,
        target = e.target,
        currentTarget = e.currentTarget;
    var targetRole = target.getAttribute('role');
    var doKeyChecking = _this.doKeyChecking;

    if (targetRole === _this.groupType) {
      var radioEls = Array.from(currentTarget.querySelectorAll("[role=\"".concat(_this.groupType, "\"]")));
      var targetIndex = radioEls.indexOf(target);
      var isOption = targetRole === 'option';
      var elToFocus;

      if (targetIndex >= 0) {
        switch (key) {
          case 'ArrowUp':
          case 'ArrowLeft':
            elToFocus = radioEls[_this.mod(targetIndex - 1, radioEls.length)];

            if (!isOption) {
              _this.select(e, elToFocus, true);
            }

            break;

          case 'ArrowDown':
          case 'ArrowRight':
            elToFocus = radioEls[_this.mod(targetIndex + 1, radioEls.length)];

            if (!isOption) {
              _this.select(e, elToFocus, true);
            }

            break;

          case ' ':
          case 'Enter':
            if (doKeyChecking) {
              _this.select(e, target);

              e.preventDefault();
            }

            break;

          default:
        }

        if (elToFocus) {
          e.preventDefault();
          requestAnimationFrame(function () {
            elToFocus.focus();

            if (key === 'Tab') {
              // The pause override is here if this requestAnimationFrame()
              // function is the one that is provided by pause-anim-control.js.
              requestAnimationFrame(function () {
                _this.onFocus(e);
              }, {
                useRealRAF: true
              });
            }
          });
        }
      }
    }
  };

  this.init(el, options);
};
/**
 * This library is not specific to any framework.  It contains utility functions
 * that can be used in any project to make it more accessible and assistive
 * technology/screenreader friendly.
 */


accessibility = {
  tempFocusElement: null,
  tempFocusElementText: ' select ',
  // This selector has been added to over the years.  Some of these 
  // items added from
  // https://github.com/zellwk/javascript/blob/master/src/browser/accessibility/focusable/focusable.js
  tabbableSelector: "a[href]:not([tabindex=\"-1\"]):not([disabled]):not([hidden]),\n     area[href]:not([tabindex=\"-1\"]):not([disabled]):not([hidden]),\n     details:not([tabindex=\"-1\"]):not([disabled]):not([hidden]),\n     iframe:not([tabindex=\"-1\"]):not([disabled]):not([hidden]),\n     keygen:not([tabindex=\"-1\"]):not([disabled]):not([hidden]),\n     [contentEditable=true]:not([tabindex=\"-1\"]):not([disabled]):not([hidden]),\n     :enabled:not(fieldset):not([tabindex=\"-1\"]):not([disabled]):not([hidden]),\n     object:not([tabindex=\"-1\"]):not([disabled]):not([hidden]),\n     embed:not([tabindex=\"-1\"]):not([disabled]):not([hidden]),\n     [tabindex]:not([tabindex=\"-1\"]):not([disabled]):not([hidden]),\n     video[controls]:not([tabindex=\"-1\"]):not([disabled]):not([hidden]),\n     audio[controls]:not([tabindex=\"-1\"]):not([disabled]):not([hidden])",
  htmlTagRegex: /(<([^>]+)>)/gi,
  hasSecondaryNavSkipTarget: false,
  // This should set in your project (and outside the script) to be a selector that covers all your main content.
  mainContentSelector: '',
  activeSubdocument: null,
  oldAriaHiddenVal: 'data-old-aria-hidden',
  groups: [],

  /**
   * Focuses on an element, and scrolls the window if there is an element on
   * top of the focused element so the user can see what is being focused.
   *
   * @param {object} element - The element being focused
   */
  focusAndScrollToView: function focusAndScrollToView(element) {
    element.focus();
    var elementRect = element.getBoundingClientRect();
    var elementOnTop = document.elementFromPoint(elementRect.left, elementRect.top);

    if (elementOnTop && elementOnTop !== element) {
      var topElRect = elementOnTop.getBoundingClientRect();
      window.scrollBy(0, topElRect.top - topElRect.bottom);
    }
  },

  /**
   * Focuses the first invalid field in a form, so that a screen reader can
   * say the error (assuming the aria-labelledby attribute points to an
   * error message).
   *
   * @param {HTMLElement} formElement - the DOM node of the form element
   * @param {object} options - an optional set of options:
   *   - firstValid: if set to true, this will force the form to focus on the
   *     first formField, whether it is invalid or not
   *   - isAjaxForm: will ensure form does not submit.
   *   - e: the event object of a form event (usually a submit event,
   *     so we can cancel it when isAjaxForm is true).
   * @returns {boolean} - true if there is an error being focused on, false
   *   otherwise
   */
  applyFormFocus: function applyFormFocus(formElement) {
    var _this2 = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var firstValid = options.firstValid,
        isAjaxForm = options.isAjaxForm,
        e = options.e;
    var isFormInvalid = false;

    if (isAjaxForm) {
      e.preventDefault();
    }

    if (formElement instanceof window.HTMLElement) {
      var formFields = formElement.elements;

      var _loop = function _loop(i) {
        var formField = formFields[i]; // If the form is invalid, we must focus the first invalid one (or
        // the first valid one if option.firstValue === true). Since fieldsets
        // are part of the elements array, we must exclude those.

        if (formField.nodeName !== 'FIELDSET' && (firstValid || formField.getAttribute('aria-invalid') === 'true')) {
          isFormInvalid = true;

          if (document.activeElement === formField) {
            _this2.focusAndScrollToView(formFields[i + 1]); // If we do not pause for half a second, Voiceover will not read out
            // where it is focused.  There doesn't seem to be any other
            // workaround for this.


            setTimeout(function () {
              if (formField) {
                _this2.focusAndScrollToView(formField);
              }
            }, 500);
          } else {
            _this2.focusAndScrollToView(formField);
          }

          return "break";
        }
      };

      for (var i = 0; i < formFields.length; i += 1) {
        var _ret = _loop(i);

        if (_ret === "break") break;
      }

      if (!isFormInvalid) {
        // Ensure what is being painted right now is complete to ensure we can
        // grab the first error.
        requestAnimationFrame(function () {
          var globalError = formElement.querySelector('.form-error__error-text');

          if (globalError) {
            _this2.focusAndScrollToView(globalError);
          }
        });
      }
    }

    return isFormInvalid;
  },

  /**
   * Refocuses the current element.  This should not be needed in most modern browsers
   * anymore ... use only if you need to support older browsers.  Test before using.
   * 
   * @param {Function} callback - a function to call immediately after the element is refocused. 
   */
  refocusCurrentElement: function refocusCurrentElement(callback) {
    var _this3 = this;

    var _document = document,
        activeElement = _document.activeElement;
    var isElementInModal = false;
    var modalParentElm = null;

    if (activeElement && typeof Element.prototype.closest === 'function') {
      modalParentElm = activeElement.closest('[role="dialog"], dialog');

      if (modalParentElm) {
        isElementInModal = true;
      }
    }

    if ((!this.tempFocusElement || isElementInModal) && document) {
      var elm = document.createElement('div');
      elm.setAttribute('tabindex', '-1');
      elm.className = 'sr-only';
      elm.style.cssText = 'position:fixed;top:0;left:0;'; // This ensures the screen reader doesn't read the content of this element.
      // Leaving it blank makes a screen reader read "blank".

      elm.setAttribute('aria-label', this.tempFocusElementText);
      elm.innerHTML = this.tempFocusElementText;

      if (isElementInModal && modalParentElm) {
        modalParentElm.appendChild(elm);
      } else {
        document.body.appendChild(elm);
      }

      this.tempFocusElement = elm;
    }

    if (this.tempFocusElement && activeElement) {
      var tempFocusElement = this.tempFocusElement;

      if (!activeElement.role) {
        tempFocusElement.role = 'button';
      } else {
        tempFocusElement.role = activeElement.role;
      }

      tempFocusElement.focus(); // If we do not pause for half a second, Voiceover will not read out
      // where it is focused.  There doesn't seem to be any other
      // workaround for this.

      setTimeout(function () {
        if (activeElement) {
          activeElement.focus();
          _this3.tempFocusElement.role = null; // Delete tempFocusElement since it will disappear when modal closes

          if (isElementInModal) {
            _this3.tempFocusElement = null;
          }

          if (callback) {
            callback();
          }
        }
      }, 500);
    }
  },

  /**
   * 
   * @param {EventHandler} e - blur event
   * @param {Function} func - function to be called when this currentTarget is blurred out of
   */
  doIfBlurred: function doIfBlurred(e, func) {
    // The `requestAnimationFrame` is needed since the browser doesn't know
    // what the focus is being switched *to* until after a repaint.
    requestAnimationFrame(this.doIfBlurredHelper.bind(this, e.currentTarget, e.relatedTarget, func));
  },

  /**
   * Helper function for doIfBlurred().  This function should never be called by itself.
   * 
   * @param {HTMLElement} currentTarget - the target to be blurred 
   * @param {HTMLElement} relatedTarget - should be set to be the currently focused element in some browsers (older IE)
   * @param {Function} func - function to be called if the currentTarget is blurred out of
   */
  doIfBlurredHelper: function doIfBlurredHelper(currentTarget, relatedTarget, func) {
    var focusedElement = relatedTarget || document.activeElement;
    var isFocusLost = focusedElement.parentNode === document.body || focusedElement === document.body || focusedElement === null;
    /*
     * If a user clicks anywhere within the target that isn't a button, it
     * shouldn't execute `func()` .  This happens also should happen when focus is
     * lost (which is what the `isFocusLost` variable keeps track of).
     *
     * If we blurred out of the target, then we execute the function.
     */

    if (!isFocusLost && !currentTarget.contains(focusedElement)) {
      func();
    }
  },

  /**
   *
   * Strips HTML tags from a string.
   *
   * @param {String} html - a string of HTML code
   */
  removeHTML: function removeHTML(html) {
    return html.replace(this.htmlTagRegex, '');
  },

  /**
   * Converts a string or JSX to lower case with HTML removed,
   * so that it can be read by a screen reader via aria-labels.
   *
   * @param {String} s - a string or JSX that should be converted to lower case.
   */
  toLowerCase: function toLowerCase(s) {
    var r = '';

    if (s) {
      if (s.toString) {
        r = this.removeHTML(s.toString().toLowerCase());
      } else if (s.toLowerCase) {
        r = this.removeHTML(s.toLowerCase());
      }
    }

    return r;
  },

  /**
   * Creates a visually hidden HTML element that will only be accessible
   * to keyboard users.  
   * 
   * @returns The new HTML trap element.
   */
  createKeyboardTrap: function createKeyboardTrap() {
    var trap = document.createElement("div");
    trap.classList.add("enable-tabtrap");
    trap.classList.add("sr-only");
    trap.setAttribute("tabindex", "0");
    return trap;
  },

  /**
   * Removes a keyboard focus loop on the passed element
   * that was set by the `setKeyboardFocusLoop()` method.
   * 
   * @param {HTMLElement} element - The HTML trap element to remove. 
   */
  removeKeyboardFocusLoop: function removeKeyboardFocusLoop(element) {
    var _this4 = this;

    document.querySelectorAll('.enable-tabtrap').forEach(function (el) {
      if (el.classList.contains('enable-tabtrap__first')) {
        el.removeEventListener("focus", _this4.focusLastElement);
      } else {
        el.removeEventListener("focus", _this4.focusFirstElement);
      }

      el.parentElement.removeChild(el);
    });
  },

  /**
   * Sets a keyboard focus loop on the passed element.
   *  
   * @param {HTMLElement} el - The HTML element that a focus loop will be applied to.
   */
  setKeyboardFocusLoop: function setKeyboardFocusLoop(el) {
    var firstTrap = this.createKeyboardTrap();
    var lastTrap = this.createKeyboardTrap();
    this.applyKeyboardTraps(el, firstTrap, lastTrap);
  },

  /**
   * Determines what element has a focus loop applied, and applies focus to the
   * first tabbable HTML element in it.
   * 
   * @param {Event} e - the focus event fired from the `applyKeyboardTraps()` method.
   */
  focusFirstElement: function focusFirstElement(e) {
    var activeSubdocument = this.activeSubdocument,
        tabbableSelector = this.tabbableSelector;
    var tabbableEls = this.getAlTabbableEls(activeSubdocument);
    tabbableEls[1].focus();
  },

  /**
   * Determines what element has a focus loop applied, and applies focus to the
   * last tabbable HTML element in it.
   * 
   * @param {Event} e - the focus event fired from the `applyKeyboardTraps()` method.
   */
  focusLastElement: function focusLastElement(e) {
    var activeSubdocument = this.activeSubdocument,
        tabbableSelector = this.tabbableSelector;
    var tabbableEls = this.getAlTabbableEls(activeSubdocument);
    tabbableEls[tabbableEls.length - 2].focus();
  },

  /**
   * Grabs all the tabbable children inside an element.
   * Based on code by Zell Liew:
   * https://github.com/zellwk/javascript/blob/master/src/browser/accessibility/focusable/focusable.js
   * 
   * Code modified to have support for our tabbableSelector object and to ensure invisible elements are
   * not counted.
   * 
   * @param {HTMLElement} el - the root element 
   * @returns {Array} - all the HTML elements that can gain keyboard focus
   */
  getAlTabbableEls: function getAlTabbableEls(el) {
    return _toConsumableArray(el.querySelectorAll(this.tabbableSelector)).filter(function (el) {
      return el.offsetWidth !== 0 && el.offsetHeight !== 0 && el.style.display !== 'none';
    });
  },

  /**
   * Used by setKeyboardFocusLoop().  Inserts the two visually hidden focus trap 
   * elements to the passed element: one as its first tabbable element, the other
   * as the last.
   * 
   * @param {HTMLElement} element - the element where a focus loop should be applied.
   * @param {HTMLElement} firstTrap - the first visually hidden focus trap 
   * element
   * @param {HTMLElement} lastTrap - the last visually hidden focus trap 
   * element
   */
  applyKeyboardTraps: function applyKeyboardTraps(element, firstTrap, lastTrap) {
    firstTrap.classList.add('enable-tabtrap__first');
    firstTrap.addEventListener("focus", this.focusLastElement.bind(this));
    lastTrap.classList.add('enable-tabtrap__last');
    lastTrap.addEventListener("focus", this.focusFirstElement.bind(this));
    element.insertBefore(firstTrap, element.firstChild);
    element.appendChild(lastTrap);
  },

  /**
   * This ensures that a mobile devices "accessibilityFocus"
   * (which is independant from a browser focus) cannot
   * go outside an element, by ensuring
   * the least amount of nodes outside the modal are
   * marked with aria-hidden="true".
   *
   * @param {HTMLElement} el - the element that will have the loop.
   */
  setMobileFocusLoop: function setMobileFocusLoop(el) {
    var _document2 = document,
        body = _document2.body;
    var currentEl = el; // If there are any nodes with oldAriaHiddenVal set, we should
    // bail, since it has already been done.

    var hiddenEl = document.querySelector("[".concat(this.oldAriaHiddenVal, "]")); // the code should never reach here

    if (hiddenEl !== null) {
      // eslint-disable-next-line no-console
      console.warn('Attempted to run setMobileFocusLoop() twice in a row.  removeMobileFocusLoop() must be executed before it run again. Bailing.');
      return;
    }

    do {
      // for every sibling of currentElement, we mark with
      // aria-hidden="true".
      var siblings = currentEl.parentNode.childNodes;

      for (var i = 0; i < siblings.length; i++) {
        var sibling = siblings[i];

        if (sibling !== currentEl && sibling.setAttribute) {
          sibling.setAttribute(this.oldAriaHiddenVal, sibling.ariaHidden || 'null');
          sibling.setAttribute('aria-hidden', 'true');
          sibling.classList.add('enable-aria-hidden');
        }
      } // we then set the currentEl to be the parent node
      // and repeat (unless the currentNode is the body tag).


      currentEl = currentEl.parentNode;
    } while (currentEl !== body);

    requestAnimationFrame(this.fixChromeAriaHiddenBug);
  },

  /**
   * This fixes an issue with Chrome/Talkback in while aria-hidden is not
   * respected when it is applied via JS.  Based on code from here:
   * https://stackblitz.com/edit/aria-hidden-test?file=app.component.ts
   */
  fixChromeAriaHiddenBug: function fixChromeAriaHiddenBug() {
    var elsToReset = document.querySelectorAll('.enable-aria-hidden');

    for (var i = 0; i < elsToReset.length; i++) {
      elsToReset[i].classList.remove('enable-aria-hidden');
    }
  },

  /**
   * Reset all the nodes that have been marked as aria-hidden="true"
   * in the setMobileFocusLoop() method back to their original
   * aria-hidden values.
   */
  removeMobileFocusLoop: function removeMobileFocusLoop() {
    var elsToReset = document.querySelectorAll("[".concat(this.oldAriaHiddenVal, "]"));

    for (var i = 0; i < elsToReset.length; i++) {
      var el = elsToReset[i];
      var ariaHiddenVal = el.getAttribute(this.oldAriaHiddenVal);

      if (ariaHiddenVal === 'null') {
        el.removeAttribute('aria-hidden');
      } else {
        el.setAttribute('aria-hidden', ariaHiddenVal);
      }

      el.removeAttribute(this.oldAriaHiddenVal);
    }
  },

  /**
   *
   * Produces and removes a focus loop inside an element
   *
   * @param {HTMLElement} el - the element in question
   * @param {boolean} doKeepFocusInside - true if we need to create a loop, false otherwise.
   */
  setKeepFocusInside: function setKeepFocusInside(el, doKeepFocusInside) {
    var _document3 = document,
        body = _document3.body;

    if (doKeepFocusInside) {
      if (this.activeSubdocument) {
        accessibility.setKeepFocusInside(this.activeSubdocument, false);
      }

      this.activeSubdocument = el;
      this.setKeyboardFocusLoop(el);
      this.setMobileFocusLoop(el);
    } else {
      this.activeSubdocument = null;
      this.removeKeyboardFocusLoop(el);
      this.removeMobileFocusLoop(el);
    }
  },

  /**
   * Since some browsers (not just IE) differ in how key events set the `key` property,
   * this method normalizes this to the official property value. Source for these
   * alternate values are from
   * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
   * 
   * @param {String} key 
   * @returns {String} the official property value that is supposed to be set for that key.
   */
  normalizedKey: function normalizedKey(key) {
    switch (key) {
      case "Space":
      case "SpaceBar":
        return " ";

      case "OS":
        return "Meta";

      case "Scroll":
        return "ScrollLock";

      case "Left":
      case "Right":
      case "Up":
      case "Down":
        return "Arrow" + key;

      case "Del":
        return "Delete";

      case "Crsel":
        return "CrSel";

      case "Essel":
        return "EsSel";

      case "Esc":
        return "Escape";

      case "Apps":
        return "ContextMenu";

      case "AltGraph":
        return "ModeChange";

      case "MediaNextTrack":
        return "MediaTrackNext";

      case "MediaPreviousTrack":
        return "MediaTrackPrevious";

      case "FastFwd":
        return "MediaFastForward";

      case "VolumeUp":
      case "VolumeDown":
      case "VolumeMute":
        return "Audio" + key;

      case "Decimal":
        return ".";

      case "Add":
        return "+";

      case "Subtract":
        return "-";

      case "Multiply":
        return "*";

      case "Divide":
        return "/";

      default:
        return key;
    }
  },

  /**
   * Given an element, find out what element "controls" this element.
   * @param {HTMLElement} $el - the element in question
   * @returns {HTMLElement} - the element that $el controls
   */
  getAriaControllerEl: function getAriaControllerEl($el) {
    var $controller = document.querySelector('[aria-controls="' + $el.id + '"]');

    if (!$controller) {
      throw "Error: There is no element that has aria-controls set to " + $el.id;
    }

    return $controller;
  },

  /**
   * Given an element, find out what it controls via aria-controls
   * 
   * @param {HTMLElement} $el - the element in question 
   * @returns {HTMLElement} - the element that controls $el
   */
  getAriaControlsEl: function getAriaControlsEl($el) {
    var $ariaControlsEl = document.getElementById($el.getAttribute('aria-controls'));

    if (!$ariaControlsEl) {
      throw "Error: aria-controls on button must be set to id of flyout menu.";
    }

    return $ariaControlsEl;
  },

  /*!
   * Determine if an element is in the viewport
   * (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com
   * @param  {Node}    elem The element
   * @return {Boolean}      Returns true if element is in the viewport
   */
  isInViewport: function isInViewport(elem) {
    var distance = elem.getBoundingClientRect();
    return distance.top >= 0 && distance.left >= 0 && distance.bottom <= (window.innerHeight || document.documentElement.clientHeight) && distance.right <= (window.innerWidth || document.documentElement.clientWidth);
  },

  /**
   * Resets the page zoom on a webpage when virtual keyboard appears when an input
   * field is focused on iOS.  Doesn't affect Android, since it doesn't have this
   * default behavior.
   * 
   * Code based on Jason Miller's Codepen:
   * https://codepen.io/developit/pen/YBgjoo
   */
  resetZoom: function resetZoom() {
    var $origMetaViewport = document.querySelector('meta[name="viewport"]');
    var origContentValue = $origMetaViewport.getAttribute('content');

    if (origContentValue.indexOf('user-scalable=no') > -1) {
      console.warn('user-scalable=no is set in the <meta name="viewport">.  You must fix this in order for the page to be accessible');
    } // Let's temporarily turn off the ability to turn off zooming.


    var meta = document.createElement('meta');
    meta.setAttribute('name', 'viewport');
    meta.setAttribute('content', 'width=device-width, initial-scale=1, user-scalable=no');
    var zoom = document.documentElement.style.zoom;
    document.documentElement.style.zoom = 0.99;
    document.head.appendChild(meta);
    window.requestAnimationFrame(function () {
      // reset zoom level back to what it was.
      document.documentElement.style.zoom = zoom; // Let's turn zooming back on.

      document.head.removeChild(meta); // if the virtual keyboard is opened, we need to check to see if the
      // focused element is under it. If so, nudge it so it is visible onscreen.

      if (window.visualViewport !== 0) {
        var _window = window,
            pageYOffset = _window.pageYOffset,
            innerHeight = _window.innerHeight;
        var bottomY = pageYOffset + innerHeight;
        var midY = pageYOffset + innerHeight / 2;
        var _document4 = document,
            activeElement = _document4.activeElement;
        var activeElementY = pageYOffset + activeElement.getBoundingClientRect().top;

        if (midY <= activeElementY && activeElementY <= bottomY) {
          setTimeout(function () {
            window.scrollTo(0, activeElementY - innerHeight / 4);
          }, 100);
        }
      }
    });
  },

  /**
   * Calling this method will give accessibility debugging information
   * into your app.  For now, this consists of stack trace information
   * for calls to the HTMLELement focus() method in the console.
   */
  setDebugMode: function setDebugMode() {
    HTMLElement.prototype.oldFocus = HTMLElement.prototype.focus;

    HTMLElement.prototype.focus = function () {
      this.oldFocus();
    };
  },

  /**
   * Initialize a group element to ensure the objects inside are navigatible via arrow keys.
   * 
   * @param {HTMLElement} el - the group element
   * @param {Object} options - see a11yGroup.init for possible properties.
   */
  initGroup: function initGroup(el, options) {
    this.groups.push(new a11yGroup(el, options));
  },

  /**
   * Does the same as initGroup.  This is included for legacy support.
   * 
   * @param {HTMLElement} el - the group element
   * @param {Object} options - see a11yGroup.init for possible properties.
   */
  setArrowKeyRadioGroupEvents: function setArrowKeyRadioGroupEvents(el, options) {
    console.warn('Note: this method is deprecated.  Please use .initGroup instead.');
    this.initGroup(el, options);
  }
};
