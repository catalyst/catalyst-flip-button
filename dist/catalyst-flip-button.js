/**
 * A toggle button web component with a flip animation.
 */
(function() {

    /**
     * Create the custom element
     */
    function createElement() {

      /**
       * @constant {string}
       *   The name of the element tag.
       */
      const elementTagName = 'catalyst-flip-button';

      /**
       * Key codes.
       *
       * @readonly
       * @enum {number}
       */
      const KEYCODE = {
        SPACE: 32,
        ENTER: 13
      };

      /**
       * @constant {string}
       *   The template of the component.
       */
      const template = document.createElement('template');
      template.innerHTML = `<style>:host{display:inline-block;align-items:flex-start;cursor:default;margin:0;padding:2px 7px;font:400 13.3333px Arial;text-rendering:auto;text-transform:none;text-indent:0;text-shadow:none;text-align:center;letter-spacing:normal;word-spacing:normal;vertical-align:bottom;-webkit-user-select:none;-moz-user-select:none;user-select:none;position:relative;width:auto;height:auto;color:#000000;transform-style:preserve-3d;transition:transform .2s ease;perspective:800px}:host figure{display:flex;align-items:center;justify-content:center;margin:0;position:absolute;top:0;right:0;bottom:0;left:0;backface-visibility:hidden;border-radius:var(--catalyst-flip-button-border-radius);-webkit-appearance:var(--catalyst-flip-button-appearance, button);-moz-appearance:var(--catalyst-flip-button-appearance, button);appearance:var(--catalyst-flip-button-appearance, button);@apply --catalyst-flip-button}:host figure#front{background:var(--catalyst-flip-button-front-background, #ddd);@apply --catalyst-flip-button-default}:host figure#back{background:var(--catalyst-flip-button-back-background, #ddd);transform:rotateY(180deg);@apply --catalyst-flip-button-flipped}:host([flipped]){transform:rotateY(180deg)}:host(:focus){outline:none}:host(:focus) #front{outline:#000000 dotted 1px;outline:-webkit-focus-ring-color auto 5px}:host(:focus) #back{outline:none}:host([flipped]:focus) #front{outline:none}:host([flipped]:focus) #back{outline:#000000 dotted 1px;outline:-webkit-focus-ring-color auto 5px}:host([hidden]){display:none}
</style><figure id="front">1</figure><figure id="back">2</figure>`;

      // If using ShadyCSS.
      if (window.ShadyCSS !== undefined) {
        // Rename classes as needed to ensure style scoping.
        ShadyCSS.prepareTemplate(template, elementTagName);
      }

      /**
       * `<catalyst-flip-button>` is a toggle button with a flip animation.
       *
       *     <catalyst-flip-button default-label="Default Label" flipped-label="Flipped Label"></catalyst-flip-button>
       *
       * It may include optional form control setting.
       *
       *     <catalyst-flip-button name="form-element-name" value="value" default-label="Default Label" flipped-label="Flipped Label"></catalyst-flip-button>
       *
       * ### Events
       *
       * Name     | Cause
       * -------- |-------------
       * `change` | Fired when the component's `flipped` value changes due to user interaction.
       *
       * ### Focus
       * To focus a catalyst-flip-button, you can call the native `focus()` method as long as the
       * element has a tab index. Similarly, `blur()` will blur the element.
       *
       * ### Styling
       *
       * The following custom properties and mixins are available for styling:
       *
       * _Note: Mixins currently do not work with the ES5 version of this component and should probably be avoided.
       * They can be used for testing out styling changes without needing to make any changes to this component's code._
       *
       * Custom property | Description | Default
       * ----------------|-------------|----------
       * `--catalyst-flip-button-appearance` | Custom Property applied to both the front and back faces' appearance | button
       * `--catalyst-flip-button-border-radius` | Custom Property applied to both the front and back faces' border-radius | unset
       * `--catalyst-flip-button-front-background` | Custom Property applied to the front face's background | #dddddd
       * `--catalyst-flip-button-back-background` | Custom Property applied to the back face's background | #dddddd
       * `--catalyst-flip-button` | Mixin applied to both the front and back face of the element | {}
       * `--catalyst-flip-button-default` | Mixin applied to the front face of the element | {}
       * `--catalyst-flip-button-flipped` | Mixin applied to the back face of the element | {}
       *
       * @class
       * @extends HTMLElement
       *
       * @property {HTMLElement} _frontFaceElement
       *   The element that represents the front face of this component.
       * @property {HTMLElement} _backFaceElement
       *   The element that represents the back face of this component.
       * @property {HTMLElement} _formElement
       *   The element that will be submitting as part of a form to represent this component.
       *
       * @group Catalyst Elements
       * @element catalyst-flip-button
       * @demo demo/demo.es5.html
       *   ES5 Component Demo
       * @demo demo/demo.es6.html
       *   ES6 Component Demo
       */
      class CatalystFlipButton extends HTMLElement {

        /**
         * The attributes on this element to observe.
         *
         * @returns {Array.<string>}
         *   The attributes this element is observing for changes.
         */
        static get observedAttributes() {
          return ['flipped', 'disabled', 'default-label', 'flipped-label', 'name', 'value', 'form'];
        }

        /**
         * Construct the element.
         */
        constructor() {
          super();

          // Create a shadow root and stamp out the template's content inside.
          this.attachShadow({mode: 'open'});
          this.shadowRoot.appendChild(template.content.cloneNode(true));

          // Create shadowDom references to the elements.
          this._frontFaceElement = this.shadowRoot.querySelector('#front');
          this._backFaceElement  = this.shadowRoot.querySelector('#back');

          // Input element needs to be in the lightDom to work with form elements.
          this._formElement = document.createElement('input');
          this._formElement.type =  'checkbox';
          this.appendChild(this._formElement);
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
          this._upgradeProperty('defaultLabel');
          this._upgradeProperty('flippedLabel');
          this._upgradeProperty('value');

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

          // Set the size of the element.
          this._setUpDimensions();

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

        /**
         * Set the dimensions of this element.
         *
         * This element cannot obtain it's dimensions automatically from it's children
         * as they are positioned absolutely. This method will manually calculate the
         * minimum size this component should be to contain its children.
         */
        _setUpDimensions() {
          // Remove any previous settings.
          this.style.minWidth = '';
          this.style.minHeight = '';

          // Get the size of this element as is.
          let style = getComputedStyle(this);
          let width = Number.parseInt(style.width, 10);
          let height = Number.parseInt(style.height, 10);

          // If the element now has no size (i.e. a user has not manually set a size),
          // mark it as needing to be sized.
          let adjustWidth = width === 0;
          let adjustHeight = height === 0;

          // If the element needs to be sized.
          if (adjustWidth || adjustHeight) {

            // Get the size of the front face when position relatively.
            this._frontFaceElement.style.position = 'relative';
            let w1 = this._frontFaceElement.offsetWidth;
            let h1 = this._frontFaceElement.offsetHeight;
            this._frontFaceElement.style.position = '';

            // Get the size of the back face when position relatively.
            this._frontFaceElement.style.position = 'relative';
            let w2 = this._frontFaceElement.offsetWidth;
            let h2 = this._frontFaceElement.offsetHeight;
            this._frontFaceElement.style.position = '';

            // For each dimension that needs to be adjusted, set it to the largest
            // of the two faces' dimensions, with a little extra room for safety.
            if (adjustWidth) {
              this.style.minWidth = (Math.max(w1, w2) + 2) + 'px';
            }
            if (adjustHeight) {
              this.style.minHeight = (Math.max(h1, h2) + 2) + 'px';
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
         *
         * @returns {boolean}
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
         *
         * @returns {boolean}
         */
        get disabled() {
          return this.hasAttribute('disabled');
        }

        /**
         * Setter for `defaultLabel`.
         *
         * @param {*} value
         *   The value to set.
         */
        set defaultLabel(value) {
          this.setAttribute('default-label', new String(value));
        }

        /**
         * Getter for `defaultLabel`.
         *
         * @returns {string}
         */
        get defaultLabel() {
          if (this.hasAttribute('default-label')) {
            return this.getAttribute('default-label');
          } else {
            return '';
          }
        }

        /**
         * Setter for `flippedLabel`.
         *
         * @param {*} value
         *   The value to set.
         */
        set flippedLabel(value) {
          this.setAttribute('flipped-label', new String(value));
        }

        /**
         * Getter for `flippedLabel`.
         *
         * @returns {string}
         */
        get flippedLabel() {
          if (this.hasAttribute('flipped-label')) {
            return this.getAttribute('flipped-label');
          } else {
            return '';
          }
        }

        /**
         * Setter for `name`.
         *
         * @param {*} value
         *   The value to set.
         */
        set name(value) {
          this.setAttribute('name', new String(value));
        }

        /**
         * Getter for `name`.
         *
         * @returns {string}
         */
        get name() {
          if (this.hasAttribute('name')) {
            return this.getAttribute('name');
          } else {
            return '';
          }
        }

        /**
         * Setter for `form`.
         *
         * @param {*} value
         *   The value to set.
         */
        set form(value) {
          this._formElement.form = value
          if (this._formElement.hasAttribute('form')) {
            this.setAttribute('form', this._formElement.getAttribute('form'));
          }
        }

        /**
         * Getter for `form`.
         *
         * @returns {HTMLFormElement}
         */
        get form() {
          return this._formElement.form;
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
         *
         * @returns {string}
         */
        get value() {
          if (this.hasAttribute('value')) {
            return this.getAttribute('value');
          } else {
            return 'on';
          }
        }

        /**
         * Setter for `textContent`.
         *
         * @param {*} value
         *   The value to set.
         */
        set textContent(value) {
          if (this.flipped) {
            this._backFaceElement.textContent = value;
          }
          else {
            this._frontFaceElement.textContent = value;
          }
        }

        /**
         * Getter for `textContent`.
         *
         * @returns {string}
         */
        get textContent() {
          if (this.flipped) {
            return this._backFaceElement.textContent;
          }
          else {
            return this._frontFaceElement.textContent;
          }
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
              // Set the aria values.
              this.setAttribute('aria-pressed', hasValue);
              if (hasValue) {
                this.setAttribute('aria-label', this.flippedLabel);
                this._formElement.checked = true;
              } else {
                this.setAttribute('aria-label', this.defaultLabel);
                this._formElement.checked = false;
              }
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

            case 'default-label':
              // Update the front face's text.
              this._frontFaceElement.textContent = newValue;
              // If the front face is currently displayed, update the aria label.
              if (!this.flipped) {
                this.setAttribute('aria-label', newValue);
              }
              this._setUpDimensions();
              break;

            case 'flipped-label':
              // Update the back face's text.
              this._backFaceElement.textContent = newValue;
              // If the back face is currently displayed, update the aria label.
              if (this.flipped) {
                this.setAttribute('aria-label', newValue);
              }
              this._setUpDimensions();
              break;

            case 'name':
              // Update the form element's name.
              this._formElement.name = newValue;
              break;

            case 'value':
              // Update the form element's value.
              this._formElement.value = newValue;
              break;

            case 'form':
              // Update the form element's form.
              this._formElement.for = newValue;
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
         */
        _onClick() {
          this._togglePressed();
          this.blur();
        }

        /**
         * `_togglePressed()` calls the `flipped` setter and flips its state.
         * Because `_togglePressed()` is only caused by a user action, it will
         * also dispatch a change event.
         *
         * @fires change
         */
        _togglePressed() {
          // Don't do anything if disabled.
          if (this.disabled) {
            return;
          }

          // Change the value of flipped.
          this.flipped = !this.flipped;

          /**
           * This method is only caused by user action so dispatch a change event.
           *
           * @event change
           */
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
