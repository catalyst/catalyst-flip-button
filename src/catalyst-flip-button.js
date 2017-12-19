/**
 * A toggle button web component.
 */
(function() {

    /**
     * Create the custom element
     */
    function createElement() {

      /**
       * The name of the element tag.
       */
      const elementTagName = 'catalyst-flip-button';

      /**
       * Key codes.
       */
      const KEYCODE = {
        SPACE: 32,
        ENTER: 13
      };

      /**
       * The template of the component.
       */
      const template = document.createElement('template');
      template.innerHTML = `<style>[[inject:style]][[endinject]]</style>[[inject:template]][[endinject]]`;

      // If using ShadyCSS.
      if (window.ShadyCSS !== undefined) {
        // Rename classes as needed to ensure style scoping.
        ShadyCSS.prepareTemplate(template, elementTagName);
      }

      /**
       * Class for the <catalyst-flip-button> element.
       */
      class CatalystFlipButton extends HTMLElement {

        /**
         * The attributes on this element to observe.
         */
        static get observedAttributes() {
          return ['flipped', 'disabled', 'value', 'flipped-value'];
        }

        /**
         * Construct the element.
         */
        constructor() {
          super();

          // Create a shadow root and stamp out the template's content inside.
          this.attachShadow({mode: 'open'});
          this.shadowRoot.appendChild(template.content.cloneNode(true));
        }

        /**
         * Fires when the element is inserted into the DOM.
         */
        connectedCallback() {
          // If using ShadyCSS.
          if (window.ShadyCSS !== undefined) {
            // Style the element.
            ShadyCSS.styleElement(this);
          }

          // Upgrade the element's properties.
          this._upgradeProperty('flipped');
          this._upgradeProperty('disabled');
          this._upgradeProperty('value');
          this._upgradeProperty('flippedValue');

          // No value set but textContent is set.
          if (this.value === '' && this.textContent !== '') {
            this.value = this.textContent;
            this.textContent = null;
          } else {
            this._setUpDimensions();
          }

          // Set this element's role, tab index and aria attributes if they are not already set.
          if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'button');
          }
          if (!this.hasAttribute('tabindex')) {
            this.setAttribute('tabindex', 0);
          }
          if (!this.hasAttribute('aria-pressed')) {
            this.setAttribute('aria-pressed', this.flipped);
          }
          if (!this.hasAttribute('aria-disabled')) {
            this.setAttribute('aria-disabled', this.disabled);
          }

          // Add the element's event listeners.
          this.addEventListener('keydown', this._onKeyDown);
          this.addEventListener('click', this._onClick);
        }

        /**
         * Upgrade the property on this element with the given name.
         *
         * A user may set a property on an _instance_ of an element before its prototype has been connected to this class.
         * This method will check for any instance properties and run them through the proper class setters.
         *
         * See the [lazy properties](/web/fundamentals/architecture/building-components/best-practices#lazy-properties) section for more details.
         *
         * @param {string} prop
         *   The name of a property.
         */
        _upgradeProperty(prop) {
          // If the property exists.
          if (this.hasOwnProperty(prop)) {
            // Delete it and reset it.
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
          }
        }

        _setUpDimensions() {
          this.style.width = '';
          this.style.height = '';

          let style = getComputedStyle(this);
          let width = Number.parseInt(style.width, 10);
          let height = Number.parseInt(style.height, 10);

          let adjustWidth = width === 0;
          let adjustHeight = height === 0;

          if (adjustWidth || adjustHeight) {
            let card = this.shadowRoot.querySelector('#card');
            let frontFace = card.querySelector('.front');
            let backFace  = card.querySelector('.back');

            card.style.position = 'relative';

            frontFace.style.position = 'relative';
            let w1 = adjustWidth  ? frontFace.offsetWidth  : 0;
            let h1 = adjustHeight ? frontFace.offsetHeight : 0;
            frontFace.style.position = '';

            backFace.style.position = 'relative';
            let w2 = adjustWidth  ? backFace.offsetWidth  : 0;
            let h2 = adjustHeight ? backFace.offsetHeight : 0;
            backFace.style.position = '';

            card.style.position = '';

            if (adjustWidth) {
              this.style.width = (Math.max(w1, w2) + 2) + 'px';
            }
            if (adjustHeight) {
              this.style.height = (Math.max(h1, h2) + 2) + 'px';
            }
          }
        }

        /**
         * Fires when the element is removed from the DOM.
         */
        disconnectedCallback() {
          this.removeEventListener('keydown', this._onKeyDown);
          this.removeEventListener('click', this._onClick);
        }

        /**
         * Setter for `flipped`.
         *
         * @param {*} value
         *   If truthy, `flipped` will be set to true, otherwise `flipped` will be set to false.
         */
        set flipped(value) {
          const isFlipped = Boolean(value);
          if (isFlipped) {
            this.setAttribute('flipped', '');
          } else {
            this.removeAttribute('flipped');
          }
        }

        /**
         * Getter for `flipped`.
         */
        get flipped() {
          return this.hasAttribute('flipped');
        }

        /**
         * Setter for `disabled`.
         *
         * @param {*} value
         *   If truthy, `disabled` will be set to true, otherwise `disabled` will be set to false.
         */
        set disabled(value) {
          const isDisabled = Boolean(value);
          if (isDisabled) {
            this.setAttribute('disabled', '');
          }
          else {
            this.removeAttribute('disabled');
          }
        }

        /**
         * Getter for `disabled`.
         */
        get disabled() {
          return this.hasAttribute('disabled');
        }

        /**
         * Setter for `value`.
         *
         * @param {*} value
         *   The value to set.
         */
        set value(value) {
          this.setAttribute('value', new String(value));
        }

        /**
         * Getter for `value`.
         */
        get value() {
          if (!this.hasAttribute('value')) {
            return '';
          }

          return this.getAttribute('value');
        }

        /**
         * Setter for `flippedValue`.
         *
         * @param {*} value
         *   The value to set.
         */
        set flippedValue(value) {
          this.setAttribute('flipped-value', new String(value));
        }

        /**
         * Getter for `flippedValue`.
         */
        get flippedValue() {
          if (!this.hasAttribute('flipped-value')) {
            return '';
          }

          return this.getAttribute('flipped-value');
        }

        /**
         * Fired when any of the attributes in the `observedAttributes` array change.
         *
         * @param {string} name
         *   The name of the attribute that changed.
         * @param {*} oldValue
         *   The original value of the attribute that changed.
         * @param {*} newValue
         *   The new value of the attribute that changed.
         */
        attributeChangedCallback(name, oldValue, newValue) {
          const hasValue = newValue !== null;
          switch (name) {
            case 'flipped':
              // Set the aria value.
              this.setAttribute('aria-pressed', hasValue);
              break;

            case 'disabled':
              // Set the aria value.
              this.setAttribute('aria-disabled', hasValue);

              // Add/Remove the tabindex attribute based `hasValue`.
              if (hasValue) {
                // If the tab index is set.
                if (this.hasAttribute('tabindex')) {
                  this._tabindexBeforeDisabled = this.getAttribute('tabindex');
                  this.removeAttribute('tabindex');
                  this.blur();
                }
              } else {
                // If the tab index isn't already set and the previous value is known.
                if (!this.hasAttribute('tabindex') && this._tabindexBeforeDisabled !== undefined && this._tabindexBeforeDisabled !== null) {
                  this.setAttribute('tabindex', this._tabindexBeforeDisabled);
                }
              }
              break;

            case 'value':
              let frontFace = this.shadowRoot.querySelector('.front');
              frontFace.textContent = this.value;
              this._setUpDimensions();
              break;

            case 'flipped-value':
              let backFace = this.shadowRoot.querySelector('.back');
              backFace.textContent = this.flippedValue;
              this._setUpDimensions();
              break;
          }
        }

        /**
         * Called when a key is pressed on this element.
         *
         * @param {KeyboardEvent} event
         */
        _onKeyDown(event) {
          // Don’t handle modifier shortcuts typically used by assistive technology.
          if (event.altKey) {
            return;
          }

          // What key was pressed?
          switch (event.keyCode) {
            case KEYCODE.SPACE:
            case KEYCODE.ENTER:
              event.preventDefault();
              this._togglePressed();
              break;

            // Any other key press is ignored and passed back to the browser.
            default:
              return;
          }
        }

        /**
         * Called when this element is clicked.
         *
         * @param {MouseEvent} event
         */
        _onClick(event) {
          this._togglePressed();
        }

        /**
         * `_togglePressed()` calls the `pressed` setter and flips its state.
         * Because `_togglePressed()` is only caused by a user action, it will
         * also dispatch a change event.
         */
        _togglePressed() {
          // Don't do anything if disabled.
          if (this.disabled) {
            return;
          }

          // Change the value of flipped.
          this.flipped = !this.flipped;

          // This method is only caused by user action so dispatch a change event.
          this.dispatchEvent(new CustomEvent('change', {
            detail: {
              flipped: this.flipped,
            },
            bubbles: true,
          }));
        }
      }

      // Make the class globally accessible.
      window.CatalystFlipButton = CatalystFlipButton;

      // Define the element.
      window.customElements.define(elementTagName, CatalystFlipButton);
    }

    // If not using web component polyfills or if polyfills are ready, create the element.
    if (window.WebComponents === undefined || window.WebComponents.ready) {
      createElement();
    }
    // Otherwise wait until the polyfills is ready.
    else {
      window.addEventListener('WebComponentsReady', () => {
        createElement();
      });
    }
  })();
