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


// add contains polyfill here (for IE11).  The typeof document check is to ensure this 
// script doesn't break server side rendering frameworks like Nashorn.
if (typeof document !== 'undefined' && typeof Element.prototype.contains !== 'function') {
  Element.prototype.contains = function contains (el) {
      return this.compareDocumentPosition(el) % 16;
  }

  document.contains = function docContains(el){
      return document.body.contains(el);
  }
}

/* global window document */
const a11yGroup = function (el, options) {
  let mousedown = false;
  let keyboardOnlyInstructionsId;
  let keyboardOnlyInstructionsEl

  /**
   * Takes the *positive* modulo of n % m.  Javascript will
   * return negative ones if n < 0.
   */
  this.mod = function (n, m) {
    return ((n % m) + m) % m;
  };

  /**
   * Makes the arrow keys work on a radiogroup's radio buttons.
   *
   * @param {HTMLElement} el - the radiogroup in question.
   * @param {object} options - an optional set of options:
   *
   * - doSelectFirstOnInit: if set to true, select the first element
   *   in the group when initialized.
   * - setMouseEvents: if set to true, this library will handle the
   *   mouse events.
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
  this.init = (el, options) => {
    const { allowTabbing, doKeyChecking, ariaCheckedCallback, setState, radioFocusCallback, focusCallback, doSelectFirstOnInit, setMouseEvents, visuallyHiddenClass } = (options || {});
    this.allowTabbing = !!allowTabbing;
    this.doKeyChecking = !!doKeyChecking;
    this.setState = (setState === false) ? false : true;
    this.role = el.getAttribute('role');
    this.visuallyHiddenClass = visuallyHiddenClass || 'sr-only';
    const groupRe = /(group|list)$/;
    keyboardOnlyInstructionsId = el.dataset.keyboardOnlyInstructions;
    keyboardOnlyInstructionsEl = keyboardOnlyInstructionsId ? document.getElementById(keyboardOnlyInstructionsId) : null;

    if (this.role === null || !groupRe.test(this.role)) {
      return;
    } else {
      this.groupType = this.role.replace(groupRe, '');
    }
    this.ariaCheckedCallback = ariaCheckedCallback;
    this.focusCallback = focusCallback || radioFocusCallback;
    this.checkedAttribute = (this.groupType === 'tab') ? 'aria-selected' : 'aria-checked';

    el.addEventListener('keydown', this.onKeyUp.bind(this), true);
    el.addEventListener('click', this.onClick.bind(this), true);

    if (doSelectFirstOnInit) {
      this.select(null, el.querySelector(`[role="${this.groupType}"]`));
    }

    if (keyboardOnlyInstructionsEl) {
      el.addEventListener('mousedown', this.mousedownEvent);
      el.addEventListener('focusout', this.focusoutEvent);
    }

    el.addEventListener('focusin', this.focusinEvent);

    /* if (focusCallback) {
      el.addEventListener('focus', this.onFocus.bind(this), true);
    } */
  };

  this.mousedownEvent = () => {
    mousedown = true;
  }

  this.focusinEvent = (e) => {
    const groupEls = e.currentTarget.querySelectorAll(`[role="${this.groupType}"]`);
    if (keyboardOnlyInstructionsEl) {
      if (!mousedown) {
        // show instructions if they exist
        keyboardOnlyInstructionsEl.classList.remove(this.visuallyHiddenClass);
      }
    }

    if (!mousedown && !this.allowTabbing) {
      for (let i = 0; i < groupEls.length; i++) {
        const el = groupEls[i];
        if (el.getAttribute(this.checkedAttribute) === 'true') {
          el.focus();
          break;
        }
      }
    }
    mousedown = false;
  }

  this.focusoutEvent = () => {
    keyboardOnlyInstructionsEl.classList.add(this.visuallyHiddenClass);
  }

  /**
   *
   * Checks an ARIA radio button, while unchecking the others in its radiogroup.
   *
   * @param {HTMLElement} radioEl - a radio button that needs to be checked
   * @param {Array} radioGroupEls - an array of radio buttons that is in the same group as radioEl
   */
  this.select = (e, memberEl, doNotRefocus) => {
    const { ariaCheckedCallback, setState, checkedAttribute, allowTabbing } = this;
    const groupEls = Array.from(memberEl.closest(`[role=${this.role}]`).querySelectorAll(`[role="${this.groupType}"]`));
    let previouslyCheckedEl;
    let currentlyCheckedEl;
    let currentlyCheckedIndex;

    for (let i = 0; i < groupEls.length; i++) {
      const currentEl = groupEls[i];
      let checkedState = 'false';
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
        if (currentEl === memberEl) {
          if (document.activeElement !== document.body) {
            currentEl.focus();
          }
        }
      }

      if (!allowTabbing) {
        if (checkedState === 'true') {
          currentEl.removeAttribute('tabIndex');
        } else {
          currentEl.setAttribute('tabIndex', '-1');
        }
      }
    }

    if (allowTabbing && !doNotRefocus) {
      console.log('refocusing', )
      accessibility.refocusCurrentElement();
    }

    if (ariaCheckedCallback) {
      ariaCheckedCallback(e, currentlyCheckedEl, currentlyCheckedIndex, previouslyCheckedEl, groupEls);
    }
  };

  this.onClick = (e) => {
    const { target, currentTarget } = e;

    if (target.getAttribute('role') === this.groupType) {
      this.select(e, target);
      target.focus();
    }
  }

  this.onFocus = (e) => {
    const { target, currentTarget } = e;

    if (!currentTarget) {
      return
    }

    const { focusCallback } = this;
    const radioEls = Array.from(currentTarget.querySelectorAll(`[role="${this.groupType}"]`));
    const targetIndex = radioEls.indexOf(target);

    if (focusCallback) {
      focusCallback(e, target, targetIndex, currentTarget);
    }
  };

  /**
   * Implements keyboard events for ARIA radio buttons.
   *
   * @param {Event} e - the keyboard event.
   */
  this.onKeyUp = (e) => {
    const { key, target, currentTarget, shiftKey } = e;
    let { ariaCheckedCallback, allowTabbing, doKeyChecking } = this;

    if (target.getAttribute('role') === this.groupType) {
      const radioEls = Array.from(currentTarget.querySelectorAll(`[role="${this.groupType}"]`));
      const targetIndex = radioEls.indexOf(target);
      let elToFocus;

      if (targetIndex >= 0) {
        switch (key) {
          case 'ArrowUp':
          case 'ArrowLeft':
            elToFocus = radioEls[this.mod(targetIndex - 1, radioEls.length)];

            this.select(e, elToFocus, true);
            break;
          case 'ArrowDown':
          case 'ArrowRight':
            elToFocus = radioEls[this.mod(targetIndex + 1, radioEls.length)];
            this.select(e, elToFocus, true);
            break;
          case ' ':
          case 'Enter':
            if (doKeyChecking) {
              this.select(e, target);
              e.preventDefault();
            }
            break;
          default:
        }

        if (elToFocus) {
          e.preventDefault();
          requestAnimationFrame(() => {
            elToFocus.focus();

            if (key === 'Tab') {
              requestAnimationFrame(() => {
                this.onFocus(e);
              });
            }
          });
        }
      }
    }
  }

  this.init(el, options);
};

// This library is not specific to any framework.  It contains utility functions
// that can be used in any project to make it more accessible and assistive
// technology/screenreader friendly.
const accessibility = {

  tempFocusElement: null,
  tempFocusElementText: ' select ',
  tabbableSelector: 
    `a[href]:not([tabindex="-1"]):not([disabled]),
     area[href]:not([tabindex="-1"]):not([disabled]),
     details:not([tabindex="-1"]):not([disabled]),
     iframe:not([tabindex="-1"]):not([disabled]),
     keygen:not([tabindex="-1"]):not([disabled]),
     [contentEditable=true]:not([tabindex="-1"]):not([disabled]),
     :enabled:not(fieldset):not([tabindex="-1"]):not([disabled]),
     object:not([tabindex="-1"]):not([disabled]),
     embed:not([tabindex="-1"]):not([disabled]),
     [tabindex]:not([tabindex="-1"]):not([disabled])`,
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
  focusAndScrollToView(element) {
    element.focus();

    const elementRect = element.getBoundingClientRect();
    const elementOnTop = document.elementFromPoint(elementRect.left, elementRect.top);

    if (elementOnTop && elementOnTop !== element) {
      const topElRect = elementOnTop.getBoundingClientRect();
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
  applyFormFocus(formElement, options = {}) {
    const { firstValid, isAjaxForm, e } = options;
    let isFormInvalid = false;

    if (isAjaxForm) {
      e.preventDefault();
    }

    if (formElement instanceof window.HTMLElement) {
      const formFields = formElement.elements;
      for (let i = 0; i < formFields.length; i += 1) {
        const formField = formFields[i];

        // If the form is invalid, we must focus the first invalid one (or
        // the first valid one if option.firstValue === true). Since fieldsets
        // are part of the elements array, we must exclude those.
        if (formField.nodeName !== 'FIELDSET' && (firstValid || formField.getAttribute('aria-invalid') === 'true')) {
          isFormInvalid = true;
          if (document.activeElement === formField) {
            this.focusAndScrollToView(formFields[i + 1]);

            // If we do not pause for half a second, Voiceover will not read out
            // where it is focused.  There doesn't seem to be any other
            // workaround for this.
            setTimeout(() => {
              if (formField) {
                this.focusAndScrollToView(formField);
              }
            }, 500);
          } else {
            this.focusAndScrollToView(formField);
          }
          break;
        }
      }

      if (!isFormInvalid) {
        // Ensure what is being painted right now is complete to ensure we can
        // grab the first error.
        window.requestAnimationFrame(() => {
          const globalError = formElement.querySelector('.form-error__error-text');
          if (globalError) {
            this.focusAndScrollToView(globalError);
          }
        });
      }
    }
    return isFormInvalid;
  },

  refocusCurrentElement(callback) {
    const { activeElement } = document;

    let isElementInModal = false;
    let modalParentElm = null;

    if (activeElement && (typeof Element.prototype.closest === 'function')) {
      modalParentElm = activeElement.closest('[role="dialog"], dialog');
      if (modalParentElm) {
        isElementInModal = true;
      }
    }

    if ((!this.tempFocusElement || isElementInModal) && document) {
      const elm = document.createElement('div');
      elm.setAttribute('tabindex', '-1');
      elm.className = 'sr-only';
      elm.style.cssText = 'position:fixed;top:0;left:0;';
      // This ensures the screen reader doesn't read the content of this element.
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
      const { tempFocusElement } = this;
      if (!activeElement.role) {
        tempFocusElement.role = 'button';
      } else {
        tempFocusElement.role = activeElement.role;
      }
      tempFocusElement.focus();

      // If we do not pause for half a second, Voiceover will not read out
      // where it is focused.  There doesn't seem to be any other
      // workaround for this.
      setTimeout(() => {
        if (activeElement) {
          activeElement.focus();
          this.tempFocusElement.role = null;

          // Delete tempFocusElement since it will disappear when modal closes
          if (isElementInModal) {
            this.tempFocusElement = null;
          }

          if (callback) {
            callback();
          }
        }
      }, 500);
    }
  },

  doIfBlurred(e, func) {
    // The `requestAnimationFrame` is needed since the browser doesn't know
    // what the focus is being switched *to* until after a repaint.
    window.requestAnimationFrame(
      this.doIfBlurredHelper.bind(this, e.currentTarget, e.relatedTarget, func)
    );
  },

  doIfBlurredHelper(currentTarget, relatedTarget, func) {
    const focusedElement = relatedTarget || document.activeElement;
    const isFocusLost = (
      focusedElement.parentNode === document.body ||
      focusedElement === document.body ||
      focusedElement === null
    );

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
  removeHTML(html) {
    return html.replace(this.htmlTagRegex, '');
  },

  /**
   * Converts a string or JSX to lower case with HTML removed,
   * so that it can be read by a screen reader via aria-labels.
   *
   * @param {String} s - a string or JSX that should be converted to lower case.
   */
  toLowerCase(s) {
    let r = '';

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
   * Hides the main content from assistive technologies (like screen readers).
   * This is useful when you want to make sure the main content is not
   * accessible to AT on certain devices, like the iOS Voiceover screen reader
   * when a flyout is open, to ensure the user doesn't accidentally access
   * the main content when the "blur" outside of the main menu.
   *
   * @param {Boolean} s - the visibility of the main content.
   *
   */
  setMainContentAriaHidden(value) {
    const els = document.querySelectorAll(this.mainContentSelector);
    for (let i = 0; i < els.length; i++) {
      const el = els[i];

      // setting the aria-hidden attribute to 'false' would make the element
      // accessible to Voiceover, it just wouldn't be able to read it.
      // This is why we set it to `null`.
      if (value) {
        el.setAttribute('aria-hidden', value);
      } else {
        el.removeAttribute('aria-hidden');
      }
    }
  },

  /**
   * Detects while element has been blurred inside the active subdocument (e.g. a modal).
   * If it is the first, then we focus the last element.
   * If it is the last, then we focus the first.
   *
   * Note that this only works in non-mobile devices, since mobile
   * devices don't track focus and blur events.
   *
   * @param {HTMLElement} blurredEl
   */
  keepFocusInsideActiveSubdoc(blurredEl) {
    if (!this.activeSubdocument) {
      return;
    }

    const allowableFocusableEls = this.activeSubdocument.querySelectorAll(this.tabbableSelector);
    const firstFocusableElement = allowableFocusableEls[0];
    const lastFocusableElement = allowableFocusableEls[allowableFocusableEls.length - 1];
    if (blurredEl === firstFocusableElement) {
      lastFocusableElement.focus();
    } else {
      firstFocusableElement.focus();
    }
  },

  /**
   * Detects when focus is being blurred out ofthe activeSubdocument of a
   * page (e.g. an open modal).  If it is, it executes a callback, func.
   *
   * @param {HTMLElement} blurredEl
   * @param {function} func
   */
  doWhenActiveSubdocIsBlurred(blurredEl, func) {
    const { activeSubdocument } = this;

    if (activeSubdocument) {
      window.requestAnimationFrame(() => {
        const { activeElement } = document;
        if (activeElement !== null   && !activeSubdocument.contains(activeElement)) {
          func(blurredEl);
        }
      });
    }
  },

  /**
   * A blur event handler to that will create a focus loop
   * inside the activeSubdocument (e.g. a modal).
   *
   * @param {EventHandler} e - the blur event handler
   */
  testIfFocusIsOutside(e) {
    const blurredEl = e.target;
    const { activeSubdocument } = this;

    if (activeSubdocument) {
      this.doWhenActiveSubdocIsBlurred(blurredEl, this.keepFocusInsideActiveSubdoc.bind(this));
    }
  },

  /**
   * A focus event that will be activated when, say, a modal
   * is open.  When a modal (a.k.a. activeSubdocument) is open,
   * and focus goes outside of that element, we put focus to the
   * first element.
   *
   * @param {EventHandler} e - a focus event handler.
   */
  correctFocusFromBrowserChrome(e) {
    const { activeSubdocument, tabbableSelector } = this;
    const { activeElement } = document;
    const { relatedTarget } = e;

    if (activeSubdocument && relatedTarget === null && !activeSubdocument.contains(activeElement)) {
      const allowableFocusableEls = activeSubdocument.querySelectorAll(tabbableSelector);
      if (allowableFocusableEls.length > 0) {
        const firstFocusableElement = allowableFocusableEls[0];
        firstFocusableElement.focus();
      }
    }
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
  setMobileFocusLoop(el) {
    const { body } = document;
    let currentEl = el;

    // If there are any nodes with oldAriaHiddenVal set, we should
    // bail, since it has already been done.
    const hiddenEl = document.querySelector(`[${this.oldAriaHiddenVal}]`);

    if (hiddenEl !== null) {
      // eslint-disable-next-line no-console
      console.warn('Attempted to run setMobileFocusLoop() twice in a row.  removeMobileFocusLoop() must be executed before it run again. Bailing.');
      return;
    }

    do {
      // for every sibling of currentElement, we mark with
      // aria-hidden="true".
      const siblings = currentEl.parentNode.childNodes;
      for (let i = 0; i < siblings.length; i++) {
        const sibling = siblings[i];
        if (sibling !== currentEl && sibling.setAttribute) {
          sibling.setAttribute(this.oldAriaHiddenVal, sibling.ariaHidden || 'null');
          sibling.setAttribute('aria-hidden', 'true');
        }
      }

      // we then set the currentEl to be the parent node
      // and repeat (unless the currentNode is the body tag).
      currentEl = currentEl.parentNode;
    } while (currentEl !== body);
  },

  /**
   * reset all the nodes that have been marked as aria-hidden="true"
   * in the setMobileFocusLoop() method back to their original
   * aria-hidden values.
   */
  removeMobileFocusLoop() {
    const elsToReset = document.querySelectorAll(`[${this.oldAriaHiddenVal}]`);

    for (let i = 0; i < elsToReset.length; i++) {
      const el = elsToReset[i];
      const ariaHiddenVal = el.getAttribute(this.oldAriaHiddenVal);
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
   * @param {boolean} keepFocusInside - true if we need to create a loop, false otherwise.
   */
  setKeepFocusInside(el, keepFocusInside) {
    const { body } = document;

    if (keepFocusInside) {
      this.activeSubdocument = el;
      body.addEventListener('blur', this.testIfFocusIsOutside.bind(this), true);
      body.addEventListener('focus', this.correctFocusFromBrowserChrome.bind(this), true);
      this.setMobileFocusLoop(el);
    } else {
      this.activeSubdocument = null;
      body.removeEventListener('blur', this.testIfFocusIsOutside.bind(this), true);
      body.removeEventListener('focus', this.correctFocusFromBrowserChrome.bind(this), true);
      this.removeMobileFocusLoop(el);
    }
  },

  initGroup: function (el, options) {
    this.groups.push(new a11yGroup(el, options));
  },

  // This is for legacy support.
  setArrowKeyRadioGroupEvents: function(el, options) {
    this.initGroup(el, options);
  }
};

