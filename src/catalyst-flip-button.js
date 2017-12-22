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
       * @constant {HTMLTemplateElement}
       *   The template of the component.
       */
      const template = document.createElement('template');
      template.innerHTML = `<style>[[inject:style]][[endinject]]</style>[[inject:template]][[endinject]]`;

      // If using ShadyCSS.
      if (window.ShadyCSS !== undefined) {
        // Rename classes as needed to ensure style scoping.
        ShadyCSS.prepareTemplate(template, elementTagName);
      }

      /**
       * `<catalyst-flip-button>` is a button that can flip between different states.
       *
       * In many ways it is much like a `<select>` element.
       *
       *     <catalyst-flip-button>
       *       <div slot="options" value="a">Apples</div>
       *       <div slot="options" value="b">Banana</div>
       *       <div slot="options" value="c">Carrot</div>
       *       <div slot="options" value="d">Duck</div>
       *     </catalyst-flip-button>
       *
       * Any type of element can be used as an option for the `<catalyst-flip-button>`,
       * however it must have the attribute `slot="options"`.
       * The recommend approach is to use `<div slot="options">`.
       *
       * This element may include optional form control attributes for use in a form.
       *
       *     <catalyst-flip-button name="foo">
       *       <div slot="options" value="one">Option 1</div>
       *       <div slot="options" value="two">Option 2</div>
       *       <div slot="options" value="three">Option 3</div>
       *     </catalyst-flip-button>
       *
       * ### Events
       *
       * Name     | Cause
       * -------- |-------------
       * `change` | Fired when the component's selected index changes due to user interaction.
       *
       * ### Focus
       * To focus a catalyst-flip-button, you can call the native `focus()` method as long as the
       * element has a tab index. Similarly, `blur()` will blur the element.
       *
       * ### Styling
       *
       * There are no css custom properties or css mixins available for this element.
       *
       * Style the options element to create the effect you want. Option elements will have the attribute `role="option"`.
       * The `no-option-selected` class is applied to this element if no option is selected.
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
          return ['disabled', 'name', 'value', 'form'];
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
           * @property {HTMLSlotElement} _optionsSlot
           *   The slot that contains the options.
           */
          this._optionsSlot = this._cardElement.querySelector('slot[name="options"]');

          /**
           * @property {HTMLElement} _noOptionsElement
           *   The element that is displayed when there are no options present.
           */
          this._noOptionsElement = this._optionsSlot.querySelector('*');

          /**
           * The form element needs to be in the lightDom to work with form elements.
           *
           * @property {HTMLElement} _formElement
           *   The element that will be submitting as part of a form to represent this component.
           */
          this._formElement = document.createElement('input');
          this._formElement.type = 'hidden';
          this.appendChild(this._formElement);
        }

        /**
         * Fires when the element is inserted into the DOM.
         *
         * @protected
         */
        connectedCallback() {
          // If using ShadyCSS.
          if (window.ShadyCSS !== undefined) {
            // Style the element.
            ShadyCSS.styleElement(this);
          }

          // Upgrade the element's properties.
          this._upgradeProperty('disabled');
          this._upgradeProperty('form');
          this._upgradeProperty('name');
          this._upgradeProperty('selectedIndex');
          this._upgradeProperty('value');

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

          // Add the element's event listeners.
          this.addEventListener('keydown', this._onKeyDown);
          this.addEventListener('click', this._onLeftClick);
          this.addEventListener('contextmenu', this._onRightClick);

          /**
           * Watch for changes in the lightDom.
           *
           * @property {MutationObserver} _childObserver
           *   Watch for mutations in the lightDom.
           */
          this._childObserver = new MutationObserver(this._onChildrenMutation.bind(this));
          this._childObserver.observe(
            // If native ShadowDom, observe this element, else observe the card element.
            (window.ShadyCSS === undefined || ShadyCSS.nativeShadow === true) ? this : this._cardElement, {
            childList: true
          });

          // Give every option the role of option.
          let options = this.options;
          for (let i = 0; i < options.length; i++) {
            options[i].setAttribute('role', 'option');
          }

          // Set the size of the element.
          this._setUpDimensions();

          // Select the first option by default.
          this.selectedIndex = 0;
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
            let options = this._optionsSlot.assignedNodes();
            if (options.length > 0) {
              for (let i = 0; i < options.length; i++) {
                // Set the styling to relative so the size can be measured.
                options[i].style.position = 'relative';

                if (adjustWidth) {
                  // If new largest width, save it.
                  let w = options[i].offsetWidth;
                  if (w > maxOptionWidth) {
                    maxOptionWidth = w;
                  }
                }

                if (adjustHeight) {
                  // If new largest height, save it.
                  let h = options[i].offsetHeight;
                  if (h > maxOptionHeight) {
                    maxOptionHeight = h;
                  }
                }

                // Restore the original positioning.
                options[i].style.position = '';
              }
            } else {
              this._noOptionsElement.style.position = 'relative';
              maxOptionWidth = this._noOptionsElement.offsetWidth;
              maxOptionHeight = this._noOptionsElement.offsetHeight;
              this._noOptionsElement.style.position = '';
            }

            // Restore the card styles.
            this._cardElement.style.position = '';

            // For each dimension that needs to be adjusted, set it to the largest
            // dimension an options way (with a little extra room for safety).
            if (adjustWidth) {
              let newWidth = maxOptionWidth + 2;
              this.style.minWidth = newWidth + 'px';
              this.style.perspective = (2 * newWidth) + 'px';
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
          this._childObserver.disconnect();
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
          this._formElement.disabled = isDisabled;
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
         * Getter for `length`.
         *
         * @returns {number}
         */
        get length() {
          return this._optionsSlot.assignedNodes().length;
        }

        /**
         * Getter for `multiple`.
         *
         * @returns {boolean}
         */
        get multiple() {
          return false;
        }

        /**
         * Setter for `name`.
         *
         * @param {*} value
         *   The value to set.
         */
        set name(value) {
          let newName = new String(value);
          this.setAttribute('name', newName);
          this._formElement.name = newName;
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
         * Getter for `options`.
         *
         * @returns {Array<HTMLElement>}
         *   The options in this element.
         */
        get options() {
          return this._optionsSlot.assignedNodes();
        }

        /**
         * Setter for `selectedIndex`.
         *
         * @param {number} value
         */
        set selectedIndex(value) {
          let number = Number(value);
          let length = this.length;

          if (number >= 0 && number < length) {
            // Save the current value before changing it.
            let prevValue = this._selectedIndex;

            // Set the new value.
            this._selectedIndex = number;

            // Going back to first option?
            if (this._selectedIndex === 0 && prevValue === length - 1) {
              // Set the rotation to one flip before 0 deg without animating.
              this._cardElement.style.transition = 'none';
              this._cardElement.style.transform = 'rotateY(180deg)';

              this._update(true);
            }
            // Going back to last option?
            else if (this._selectedIndex === length - 1 && prevValue === 0) {
              // Set the rotation to one flip before 0 deg without animating.
              this._cardElement.style.transition = 'none';
              this._cardElement.style.transform = 'rotateY(' + (length * -180) + 'deg)';

              this._update(true);
            }
            else {
              this._update(false);
            }
          }
          else {
            this._selectedIndex = -1;

            // Set the rotation to one flip before 0 deg without animating.
            this._cardElement.style.transition = 'none';
            this._cardElement.style.transform = 'rotateY(180deg)';

            // Wait for rotation to be updated, then update the appearance.
            this._update(true);
          }
        }

        /**
         * Getter for `selectedIndex`.
         *
         * @returns {number}
         */
        get selectedIndex() {
          if (this.length === 0) {
            return -1;
          }
          if (this._selectedIndex >= this.length) {
            return this.length - 1;
          }
          return this._selectedIndex;
        }

        /**
         * Getter for `size`.
         *
         * @returns {number}
         */
        get size() {
          return 1;
        }

        /**
         * Getter for `type`.
         *
         * @returns {string}
         */
        get type() {
          return 'select-one';
        }

        /**
         * Setter for `value`.
         *
         * @param {*} value
         *   The value to set.
         */
        set value(value) {
          let selected = this.options[this.selectedIndex];
          if (selected) {
            selected.value = value;
            if (selected.value !== undefined) {
              this._formElement.value = selected.value;
            }
            this._formElement.value = selected.getAttribute('value');
          }
        }

        /**
         * Getter for `value`.
         *
         * @returns {string}
         */
        get value() {
          let selected = this.options[this.selectedIndex];
          if (selected) {
            if (selected.value !== undefined) {
              return selected.value;
            }
            return selected.getAttribute('value');
          }
          return '';
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

            case 'name':
              if (this.name !== newValue) {
                this.name = newValue;
              }
              break;

            case 'value':
              if (this.value !== newValue) {
                this.value = newValue;
              }
              break;

            case 'form':
              if (this.form.id !== newValue) {
                this.form = newValue;
              }
              break;
          }
        }

        /**
         * Add an option to the button.
         *
         * @param {HTMLElement} option
         *   The element to add.
         */
        add(option) {
          option.slot = 'options';
          this.appendChild(option);
        }

        /**
         * Removes an option from the button.
         *
         * @param {number} index
         *   The index of the element to remove.
         */
        remove(index) {
          this.removeChild(this.options[index]);
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
          this._flip();
          this.blur();
          event.preventDefault();
        }

        /**
         * Called when this element is right clicked.
         *
         * @param {MouseEvent} event
         */
        _onRightClick(event) {
          this._flip(false);
          this.blur();
          event.preventDefault();
        }

        /**
         * Called when a top level lightDom mutation happens.
         *
         * @param {Array<MutationRecord} mutations
         */
        _onChildrenMutation(mutations) {
          let recalculateSize;
          recalculateSize = false;

          // For each mutation.
          for (let i = 0; i < mutations.length; i++) {
            // Option added
            for (let j = 0; j < mutations[i].addedNodes.length; j++) {
              if (mutations[i].addedNodes[j].assignedSlot === this._optionsSlot) {
                recalculateSize = true;
                mutations[i].addedNodes[j].setAttribute('role', 'option');
              }
            }

            // For each removed node.
            for (let j = 0; j < mutations[i].removedNodes.length; j++) {
              // Active option removed?
              if (mutations[i].removedNodes[j].classList.contains('active')) {
                this.selectedIndex = (((this.selectedIndex) % this.length) + this.length) % this.length;
              }
            }

            // No options left?
            if (this.length === 0) {
              recalculateSize = true;
            }
          }

          if (recalculateSize) {
            this._setUpDimensions();
          }
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
          // Don't do anything if disabled.
          if (this.disabled) {
            return;
          }

          // Update the selected index.
          let newIndex = forwards ? (this.selectedIndex + 1) : (this.selectedIndex - 1);
          this.selectedIndex = (((newIndex) % this.length) + this.length) % this.length;

          /**
           * Fire a change event.
           *
           * @event change
           */
          this.dispatchEvent(new CustomEvent('change', {
            detail: {
              selectedIndex: this.selectedIndex,
              option: this.options[this.selectedIndex]
            },
            bubbles: true,
          }));
        }

        /**
         * Update the element
         *
         * @param {boolean} [delayTransition=false]
         *   If true, delay the transition by one frame.
         */
        _update(delayTransition = false) {
          delayTransition = delayTransition;    // Fix for bug in minifier.

          // Update the classes and hidden-ness of all the options.
          let options = this._optionsSlot.assignedNodes();
          for (let i = 0; i < options.length; i++) {
            // The newly active element.
            if (i === this.selectedIndex) {
              options[i].classList.add('active');
              options[i].classList.remove('last-active');
              options[i].removeAttribute('hidden');

              // Set `aria-activedescendant`.
              // If the active descendant doesn't have an id, generate one for it.
              if (options[i].id === '') {
                options[i].id = this._generateGuid();
              }
              this.setAttribute('aria-activedescendant', options[i].id);

              if (options[i].value !== undefined) {
                this._formElement.value = options[i].value;
              }
              this._formElement.value = options[i].getAttribute('value');
            }
            // The previous active element.
            else if (options[i].classList.contains('active')) {
              options[i].classList.remove('active');
              options[i].classList.add('last-active');
              options[i].removeAttribute('hidden');
            }
            // The all the other element.
            else {
              options[i].classList.remove('active');
              options[i].classList.remove('last-active');
              options[i].setAttribute('hidden', '');
            }
          }

          // Nothing visible?
          if (this.selectedIndex === -1) {
            this.classList.add('no-option-selected');
            this.removeAttribute('aria-activedescendant');
            this._formElement.value = '';
          } else {
            this.classList.remove('no-option-selected');
          }

          // Play the transition.
          if (delayTransition) {
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
          let rotation = this.selectedIndex * -180;
          this._cardElement.style.transform = 'rotateY(' + rotation + 'deg)';

          // Update the classes and hidden-ness of all the options.
          let options = this._optionsSlot.assignedNodes();
          for (let i = 0; i < options.length; i++) {
            // The newly active element.
            if (i === this.selectedIndex) {
              if (i % 2 === 0) {
                options[i].style.transform = '';
              } else {
                options[i].style.transform = 'rotateY(180deg)';
              }
            }
            // The last active element.
            else if (options[i].classList.contains('last-active')) {
              options[i].style.transform = 'rotateY(' + (rotation + 180) + 'deg)';
            }
            // The all the other element.
            else {
              options[i].style.transform = '';
            }
          }
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
