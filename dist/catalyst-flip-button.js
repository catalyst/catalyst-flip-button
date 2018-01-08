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
        ENTER: 13,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40
      };

      /**
       * @constant {HTMLTemplateElement}
       *   The template of the component.
       */
      const template = document.createElement('template');
      template.innerHTML = `<style>:host{display:inline-block;contain:layout style;align-items:flex-start;cursor:default;margin:0;padding:1px 6px;box-sizing:content-box;font-family:inherit;font-size:83.33333%;font-weight:400;font-style:normal;font-variant:normal;font-stretch:normal;line-height:normal;text-rendering:auto;text-transform:none;text-indent:0;text-shadow:none;text-align:center;letter-spacing:normal;word-spacing:normal;vertical-align:bottom;-webkit-user-select:none;-moz-user-select:none;user-select:none;position:relative;color:#000000;perspective:100px}:host #card{position:absolute;top:0;right:0;bottom:0;left:0;transform-style:preserve-3d;transition:transform .4s ease}:host #card #front,:host #card #back{display:flex;align-items:center;justify-content:center;margin:0;position:absolute;top:0;right:0;bottom:0;left:0;backface-visibility:hidden;-webkit-appearance:var(--catalyst-flip-button-card-face-appearance, button);-moz-appearance:var(--catalyst-flip-button-card-face-appearance, button);appearance:var(--catalyst-flip-button-card-face-appearance, button);background:var(--catalyst-flip-button-card-face-background, #ddd);border:var(--catalyst-flip-button-card-face-border);border-radius:var(--catalyst-flip-button-card-face-border-radius)}:host #card #back{transform:rotateY(180deg)}:host(:focus){outline:none}:host(:focus) #card #front,:host(:focus) #card #back{outline:var(--catalyst-flip-button-card-face-focused-outline, #000 dotted 1px)}:host([hidden]),:host [hidden]{display:none}</style><div id="card"><div id="front"></div><div id="back"></div></div><div hidden><slot></slot></div>`;

      // If using ShadyCSS.
      if (window.ShadyCSS !== undefined) {
        // Rename classes as needed to ensure style scoping.
        ShadyCSS.prepareTemplate(template, elementTagName);
      }

      /**
       * `<catalyst-flip-button>` is a wrapper for a `<select>` element.
       * It displays as a button and flips between different options.
       *
       *     <catalyst-flip-button>
       *       <select>
       *         <option>Apples</option>
       *         <option>Banana</option>
       *         <option>Carrot</option>
       *         <option>Duck</option>
       *       </select>
       *     </catalyst-flip-button>
       *
       * ### Events
       *
       * Name     | Cause
       * -------- |-------------
       * `change` | Fired when the selected option changes due to user interaction.
       *
       * ### Focus
       * To focus a catalyst-flip-button, you can call the native `focus()` method as long as the
       * element has a tab index. Similarly, `blur()` will blur the element.
       *
       * ### Styling
       *
       * The following css custom properties are available for this element:
       *
       * Property | Description | Default Value
       * -------- |------------ | -------------
       * --catalyst-flip-button-card-face-appearance | The appearance of the card face. | `button`
       * --catalyst-flip-button-card-face-background | The background of the card face. | `#dddddd`
       * --catalyst-flip-button-card-face-border | The border applied to the card face. |
       * --catalyst-flip-button-card-face-border-radius | The border radius applied to the card face. |
       * --catalyst-flip-button-card-face-focused-outline | The outline of the card face when focused. |
       *
       * @class
       * @extends HTMLElement
       *
       * @group Catalyst Elements
       * @element catalyst-flip-button
       * @demo demo/demo.es5.html ES5 Component Demo
       * @demo demo/demo.es6.html ES6 Component Demo
       */
      class CatalystFlipButton extends HTMLElement {

        /**
         * The attributes on this element to observe.
         *
         * @returns {Array.<string>}
         *   The attributes this element is observing for changes.
         */
        static get observedAttributes() {
          return ['disabled'];
        }

        /**
         * Construct the element.
         */
        constructor() {
          super();

          // Create a shadow root and stamp out the template's content inside.
          this.attachShadow({mode: 'open'});
          this.shadowRoot.appendChild(template.content.cloneNode(true));

          /**
           * @property {HTMLElement} _cardElement
           *   The element that is flipped.
           */
          this._cardElement = this.shadowRoot.querySelector('#card');

          /**
           * @property {HTMLElement} _cardFrontFace
           *   The front face of the card.
           */
          this._cardFrontFace = this._cardElement.querySelector('#front');

          /**
           * @property {HTMLElement} _cardBackFace
           *   The back face of the card.
           */
          this._cardBackFace = this._cardElement.querySelector('#back');

          /**
           * @property {boolean} _flipped
           *   True if the card has been flipped, otherwise false.
           */
          this._flipped = false;

          /**
           * @property {number} _lastSelectedIndex
           *   The last selected index.
           */
          this._lastSelectedIndex = -1;
        }

        /**
         * Fires when the element is inserted into the DOM.
         *
         * @protected
         */
        connectedCallback() {
          // Set up the form element.
          this._setUpFormElement();

          // Upgrade the element's properties.
          this._upgradeProperty('disabled');
          this._upgradeProperty('noAutoPerspective');

          // Set this element's role, tab index and aria attributes if they are not already set.
          if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'combobox');
          }
          if (!this.hasAttribute('tabindex')) {
            this.setAttribute('tabindex', 0);
          }
          if (!this.hasAttribute('aria-disabled')) {
            this.setAttribute('aria-disabled', this.disabled);
          }
          if (!this.hasAttribute('aria-live')) {
            this.setAttribute('aria-live', 'polite');
          }

          // Add the element's event listeners.
          this.addEventListener('keydown', this._onKeyDown);
          this.addEventListener('click', this._onLeftClick);
          this.addEventListener('contextmenu', this._onRightClick);

          this._selectObserver = new MutationObserver(this._onLightDomMutation.bind(this));
          this._selectObserver.observe(this, {
            childList: true
          });

          // Set the size of the element.
          this._setUpDimensions();

          // If using ShadyCSS.
          if (window.ShadyCSS !== undefined) {
            // Style the element.
            ShadyCSS.styleElement(this);
          }
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
          // Else if an attribute exists for the property, set the property using that.
          else if (this.hasAttribute(prop)) {
            this[prop] = this.getAttribute(prop);
          }
        }

        /**
         * Find the new form element and set it up.
         */
        _setUpFormElement() {
          let newFormElement = this.querySelector('select');

          if (newFormElement !== null) {
            if (newFormElement !== this._formElement) {
              // Clean up the old form element.
              if (this._formElement !== null && this._formElement !== undefined) {
                this._formElement.removeEventListener('change', this._selectedOptionChanged.bind(this));
              }

              // Remove the old observer if there is one.
              if (this._optionsObserver !== undefined) {
                this._optionsObserver.disconnect();
                this._optionsObserver = undefined;
              }

              // Set up the new form element.
              this._formElement = newFormElement;
              this._formElement.addEventListener('change', this._selectedOptionChanged.bind(this));

              // Create an observer to watch for changes in the form element's options.
              this._optionsObserver = new MutationObserver(this._onOptionsMutation.bind(this));
              this._optionsObserver.observe(this._formElement, {
                childList: true
              });

              // Set up the label(s).
              if (this._formElement.labels.length > 0) {
                let labelledBy = [];
                for (let i = 0; i < this._formElement.labels.length; i++) {
                  let label = this._formElement.labels[i];
                  if (label.id === '') {
                    label.id = this._generateGuid();
                  }
                  labelledBy.push(label.id);
                }
                this.setAttribute('aria-labelledby', labelledBy.join(' '));
              } else {
                this.removeAttribute('aria-labelledby');
              }

              this._selectedOptionChanged();
            }
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

            // The width and height of the largest children
            let maxOptionWidth = 0;
            let maxOptionHeight = 0;

            // Position the card relatively so sizes can be calculated.
            this._cardElement.style.position = 'relative';

            // Get the options.
            let options = this._formElement.options;
            if (options.length > 0) {

              // Set the styling to relative so the size can be measured.
              this._cardFrontFace.style.position = 'relative';
              this._cardBackFace.style.position = 'relative';

              // Save the text content in the front face and then clear it.
              let frontFaceText = this._cardFrontFace.textContent;
              this._cardFrontFace.textContent = '';

              // Save the text content in the back face and then clear it.
              let backFaceText = this._cardBackFace.textContent;
              this._cardBackFace.textContent = '';

              for (let i = 0; i < options.length; i++) {
                this._cardFrontFace.textContent = options[i].textContent;
                this._cardBackFace.textContent = options[i].textContent;

                if (adjustWidth) {
                  // If new largest width, save it.
                  let fw =  this._cardFrontFace.offsetWidth;
                  if (fw > maxOptionWidth) {
                    maxOptionWidth = fw;
                  }
                  let bw =  this._cardBackFace.offsetWidth;
                  if (bw > maxOptionWidth) {
                    maxOptionWidth = bw;
                  }
                }

                if (adjustHeight) {
                  // If new largest height, save it.
                  let fh =  this._cardFrontFace.offsetHeight;
                  if (fh > maxOptionHeight) {
                    maxOptionHeight = fh;
                  }
                  let hw =  this._cardBackFace.offsetHeight;
                  if (hw > maxOptionWidth) {
                    maxOptionWidth = hw;
                  }
                }
              }

              // Restore the text content to the front and back faces.
              this._cardFrontFace.textContent = frontFaceText;
              this._cardBackFace.textContent = backFaceText;

              // Restore the original positioning.
              this._cardFrontFace.style.position = '';
              this._cardBackFace.style.position = '';
            }

            // Restore the card styles.
            this._cardElement.style.position = '';

            // For each dimension that needs to be adjusted, set it to the largest
            // dimension an options way (with a little extra room for safety).
            if (adjustWidth) {
              let newWidth = maxOptionWidth + 2;
              this.style.minWidth = newWidth + 'px';
              if (!this.noAutoPerspective) {
                this.style.perspective = (2 * (newWidth + Number.parseInt(style.paddingLeft, 10) + Number.parseInt(style.paddingRight, 10))) + 'px';
              }
            }
            if (adjustHeight) {
              let newHeight = maxOptionHeight + 2;
              this.style.minHeight = newHeight + 'px';
            }
          }
        }

        /**
         * Fires when the element is removed from the DOM.
         *
         * @protected
         */
        disconnectedCallback() {
          this.removeEventListener('keydown', this._onKeyDown);
          this.removeEventListener('click', this._onLeftClick);
          this.removeEventListener('contextmenu', this._onRightClick);

          if (this._selectObserver !== null) {
            this._selectObserver.disconnect();
            this._selectObserver = undefined;
          }

          this._formElement = undefined;

          if (this._optionsObserver !== null) {
            this._optionsObserver.disconnect();
            this._optionsObserver = undefined;
          }
        }

        /**
         * Setter for `disabled`.
         *
         * @param {*} value
         *   If truthy, `disabled` will be set to true, otherwise `disabled` will be set to false.
         */
        set disabled(value) {
          const isDisabled = Boolean(value);
          this._formElement.disabled = isDisabled;
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
         * Setter for `noAutoPerspective`.
         *
         * @param {*} value
         *   If truthy, `noAutoPerspective` will be set to true, otherwise `noAutoPerspective` will be set to false.
         */
        set noAutoPerspective(value) {
          const isNoAutoPerspective = Boolean(value);
          if (isNoAutoPerspective) {
            this.setAttribute('no-auto-perspective', '');
          }
          else {
            this.removeAttribute('no-auto-perspective');
          }
        }

        /**
         * Getter for `noAutoPerspective`
         *
         * @returns {boolean}
         */
        get noAutoPerspective() {
          return this.hasAttribute('no-auto-perspective');
        }

        /**
         * Fired when any of the attributes in the `observedAttributes` array change.
         *
         * @protected
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
              this._flip();
              break;

            case KEYCODE.LEFT:
            case KEYCODE.UP:
              event.preventDefault();
              this.previous();
              break;

            case KEYCODE.RIGHT:
            case KEYCODE.DOWN:
              event.preventDefault();
              this.next();
              break;

            // Any other key press is ignored and passed back to the browser.
            default:
              return;
          }
        }

        /**
         * Called when this element is left clicked.
         *
         * @param {MouseEvent} event
         */
        _onLeftClick(event) {
          event.preventDefault();
          this.next();
        }

        /**
         * Called when this element is right clicked.
         *
         * @param {MouseEvent} event
         */
        _onRightClick(event) {
          event.preventDefault();
          this.previous();
        }

        /**
         * Called when the selected option for the form element changes.
         * Needs to be called manually when setting the form element's selected index.
         */
        _selectedOptionChanged() {
          if (this._formElement === null || this._formElement.length === 0) {
            return;
          }

          let option = this._formElement.selectedOptions[0];

          if (this._flipped) {
            this._cardBackFace.textContent = option.textContent;
          } else {
            this._cardFrontFace.textContent = option.textContent;
          }

          this._update();
        }

        /**
         * Called when a top level lightDom mutation happens.
         *
         * @param {Array<MutationRecord} mutations
         */
        _onLightDomMutation(mutations) {
          let nodesAdded = false;
          let nodesRemoved = false;

          let recalculateSize;
          recalculateSize = false;

          // For each mutation.
          for (let i = 0; i < mutations.length; i++) {
            // Nodes Added?
            if (mutations[i].addedNodes.length > 0) {
              nodesAdded = true;
            }

            // Nodes Removed?
            if (mutations[i].removedNodes.length > 0) {
              nodesRemoved = true;
            }
          }

          // If lightDom elements changed?
          if (nodesAdded || nodesRemoved) {
            let fe = this._formElement;
            this._setUpFormElement();

            // New form element?
            if (this._formElement !== fe) {
              recalculateSize = true;
            }
          }

          // Size of the element needs recalculate?
          if (recalculateSize) {
            this._setUpDimensions();
          }
        }

        /**
         * Called when a top level lightDom mutation happens.
         *
         * @param {Array<MutationRecord} mutations
         */
        _onOptionsMutation(mutations) {
          let optionsAdded = false;
          let optionsRemoved = false;

          let recalculateSize;
          recalculateSize = false;

          // For each mutation.
          for (let i = 0; i < mutations.length; i++) {
            // Option added?
            for (let j = 0; j < mutations[i].addedNodes.length; j++) {
              if (mutations[i].addedNodes[j].tagName === 'OPTION') {
                optionsAdded = true;
                break;
              }
            }

             // Option removed?
             for (let j = 0; j < mutations[i].addedNodes.length; j++) {
              if (mutations[i].addedNodes[j].tagName === 'OPTION') {
                optionsRemoved = true;
                break;
              }
            }

            // No options left?
            if (this._formElement !== null && this._formElement.length === 0) {
              recalculateSize = true;
            }
          }

          // If lightDom elements changed?
          if (optionsAdded || optionsRemoved) {
            // TODO: options changed.
          }

          // Size of the element needs recalculate?
          if (recalculateSize) {
            this._setUpDimensions();
          }
        }

        /**
         * Flip the button forwards to the next option.
         */
        next() {
          this._flip(true);
        }

        /**
         * Flip the button back to the previous option.
         */
        previous() {
          this._flip(false);
        }

        /**
         * Flip the button.
         *
         * This method is only caused by a user action, so it will dispatch a change event.
         *
         * @fires change
         *
         * @param {boolean} [forwards=true]
         *   If true, flip forward. If false, flip back.
         */
        _flip(forwards = true) {
          if (this._formElement === null || this.disabled) {
            return;
          }

          // Update the selected index.
          let newIndex = this._formElement.selectedIndex + (forwards ? 1 : -1);
          let length = this._formElement.length;
          this._lastSelectedIndex = this._formElement.selectedIndex;
          this._formElement.selectedIndex = ((newIndex % length) + length) % length;

          /**
           * Fire a change event.
           *
           * @event change
           */
          this.dispatchEvent(new CustomEvent('change', {
            detail: {
              selectedIndex: this._formElement.selectedIndex,
              selectedOptions: this._formElement.selectedOptions
            },
            bubbles: true,
          }));

          // `change` event on the form element is not emitted when setting selectedIndex manually.
          this._selectedOptionChanged();
        }

        /**
         * Update the element
         */
        _update() {
          if (this._formElement === null) {
            return;
          }

          this.setAttribute('value', this._formElement.value);

          let flippingBackToStart = this._lastSelectedIndex + 1 === this._formElement.length && this._formElement.selectedIndex === 0;
          let flippingBackToEnd = this._lastSelectedIndex === 0 && this._formElement.selectedIndex + 1 === this._formElement.length;

          // Play the transition.
          if (flippingBackToStart || flippingBackToEnd) {
            this._cardElement.style.transition = 'none';
            let rotation = flippingBackToStart ? 180 : (this._formElement.selectedIndex + 1) * -180;
            this._cardElement.style.transform = 'rotateY(' + rotation + 'deg)';

            // Handle case of flipping around when there is an odd number of options.
            if (this._formElement.length % 2 === 1) {
              // Swap the front and back faces.
              let cff = this._cardFrontFace;
              this._cardFrontFace = this._cardBackFace;
              this._cardBackFace = cff;

              // Give the swapped faces their new ids.
              this._cardFrontFace.id = 'front';
              this._cardBackFace.id = 'back';

              // The flipped status has now switched.
              this._flipped = !this._flipped;
            }
            setTimeout(this._playTransition.bind(this), 0);
          } else {
            this._playTransition();
          }
        }

        /**
         * Play the element's flip transition.
         *
         * Will animate form the last-active element's rotation to the active element's rotation.
         */
        _playTransition() {
          // Restore the transition if it has been disabled.
          this._cardElement.style.transition = '';

          // Set the rotation of the card.
          let rotation = this._formElement.selectedIndex * -180;
          this._cardElement.style.transform = 'rotateY(' + rotation + 'deg)';

          // Card has now been flipped/unflipped.
          this._flipped = !this._flipped;
        }

        /**
         * Generate a guid (or at least something that seems like one)
         *
         * @see https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
         */
        _generateGuid() {
          let s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
          }
          return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
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
