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
 * @customElement
 * @group Catalyst Elements
 * @element catalyst-flip-button
 * @demo demo/basic.html Basic
 * @demo demo/styled.html Styled
 * @demo demo/form.html Form
 */
class CatalystFlipButton extends HTMLElement {

  /**
   * The element's tag name.
   *
   * @returns {string}
   */
  static get is() {
    return 'catalyst-flip-button';
  }

  /**
   * Return's true if this element has been registered, otherwise false.
   *
   * @returns {boolean}
   */
  static get _isRegistered() {
    return window.customElements !== undefined && window.customElements.get(CatalystFlipButton.is) !== undefined;
  }

  /**
   * Get the default template used by this element.
   */
  static get template() {
    let template = document.createElement('template');
    template.innerHTML = `<style>:host{position:relative;display:inline-block;-webkit-box-align:start;-ms-flex-align:start;align-items:flex-start;padding:1px 6px;margin:0;font-family:inherit;font-size:83.33333%;font-style:normal;font-weight:400;line-height:normal;letter-spacing:normal;word-spacing:normal;color:#000;color:ButtonText;text-align:center;text-indent:0;text-rendering:auto;text-shadow:none;text-transform:none;vertical-align:bottom;cursor:default;-webkit-box-sizing:content-box;box-sizing:content-box;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-perspective:100px;perspective:100px;contain:layout style}:host #card{position:absolute;top:0;right:0;bottom:0;left:0;-webkit-transition:-webkit-transform .4s ease;transition:-webkit-transform .4s ease;transition:transform .4s ease;transition:transform .4s ease,-webkit-transform .4s ease;-webkit-transform-style:preserve-3d;transform-style:preserve-3d}:host #card #back,:host #card #front{position:absolute;top:0;right:0;bottom:0;left:0;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;margin:0;background:#ddd;background:ButtonFace;background:var(--catalyst-flip-button-card-face-background,ButtonFace);border:2px outset ButtonFace;border:var(--catalyst-flip-button-card-face-border,2px outset ButtonFace);border-radius:var(--catalyst-flip-button-card-face-border-radius,0);-webkit-backface-visibility:hidden;backface-visibility:hidden;-webkit-appearance:var(--catalyst-flip-button-card-face-appearance,button);-moz-appearance:var(--catalyst-flip-button-card-face-appearance,button)}:host #card #back{-webkit-transform:rotateY(180deg);transform:rotateY(180deg)}:host(:focus){outline:none}:host(:focus) #card #back,:host(:focus) #card #front{outline:var(--catalyst-flip-button-card-face-focused-outline,#000 dotted 1px)}:host([hidden]),:host [hidden]{display:none}</style><div id="card"><div id="front"></div><div id="back"></div></div><div hidden><slot></slot></div>`;  // eslint-disable-line quotes

    // If using ShadyCSS.
    if (window.ShadyCSS !== undefined) {
      // Rename classes as needed to ensure style scoping.
      window.ShadyCSS.prepareTemplate(template, CatalystFlipButton.is);
    }

    return template;
  }

  /**
   * Key codes.
   *
   * @enum {number}
   */
  static get _KEYCODE() {
    if (this.__keycode === undefined) {
      this.__keycode = {
        SPACE: 32,
        ENTER: 13,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40
      }
    }

    return this.__keycode;
  }

  /**
   * True if the web browser is ie11.
   */
  static get isIE11() {
    return !!navigator.userAgent.match(/Trident\/7\./);
  }

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
   * Register this class as an element.
   */
  static _register() {
    const doRegister = () => {
      window.customElements.define(CatalystFlipButton.is, CatalystFlipButton);
    };

    // If not using web component polyfills or if polyfills are ready, register the element.
    if (window.WebComponents === undefined || window.WebComponents.ready) {
      doRegister();
    }
    // Otherwise wait until the polyfills are ready, then register the element.
    else {
      window.addEventListener('WebComponentsReady', () => {
        doRegister();
      });
    }
  }

  /**
   * Construct the element.
   *
   * @param {HTMLTemplate} [template]
   *   The template to use.
   */
  constructor(template = CatalystFlipButton.template) {
    super();

    // Create a shadow root and stamp out the template's content inside.
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    /**
     * The element that flips.
     *
     * @type {HTMLElement}
     */
    this._cardElement = this.shadowRoot.querySelector('#card');

    /**
     * The front face of the card.
     *
     * @type {HTMLElement}
     */
    this._cardFrontFace = this._cardElement.querySelector('#front');

    /**
     * The back face of the card.
     *
     * @type {HTMLElement}
     */
    this._cardBackFace = this._cardElement.querySelector('#back');

    /**
     * True if the card has been flipped, otherwise false.
     *
     * @type {boolean}
     */
    this._flipped = false;

    /**
     * The rotation of the card.
     *
     * @type {number}
     */
    this._rotation = 0;
  }

  /**
   * Fires when the element is inserted into the DOM.
   *
   * @protected
   */
  connectedCallback() {
    // Set up the form element.
    this._setUpSelectElement();

    // Upgrade the element's properties.
    this._upgradeProperty('disabled');
    this._upgradeProperty('noAutoPerspective');

    // Set the aria attributes.
    this.setAttribute('aria-disabled', this.disabled);
    if (!this.hasAttribute('aria-live')) {
      this.setAttribute('aria-live', 'polite');
    }

    // Set this element's role and tab index if they are not already set.
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'combobox');
    }
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', 0);
    }

    // Add the element's event listeners.
    this.addEventListener('keydown', this._onKeyDown);
    this.addEventListener('click', this._onClick);
    this.addEventListener('mouseup', this._onMouseUp);

    // Disable context menu on right click.
    this.setAttribute('oncontextmenu', 'if (event.button === 2) { event.preventDefault(); }');

    this._selectObserver = new MutationObserver(this._onLightDomMutation.bind(this));
    this._selectObserver.observe(this, {
      childList: true
    });

    // Set the size of the element.
    setTimeout(() => {
      this._setUpDimensions();
    }, 0);

    // If using ShadyCSS.
    if (window.ShadyCSS !== undefined) {
      // Style the element.
      window.ShadyCSS.styleElement(this);
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
  _setUpSelectElement() {
    let newSelectElement = this.querySelector('select');

    if (newSelectElement !== null) {
      if (newSelectElement !== this._selectElement) {
        // Clean up the old form element.
        if (this._selectElement !== null && this._selectElement !== undefined) {
          this._selectElement.removeEventListener('change', this.notifySelectedOptionChanged.bind(this));
        }

        // Remove the old observer if there is one.
        if (this._optionsObserver !== undefined) {
          this._optionsObserver.disconnect();
          this._optionsObserver = undefined;
        }

        // Set up the new form element.
        this._selectElement = newSelectElement;
        this._selectElement.addEventListener('change', this.notifySelectedOptionChanged.bind(this));

        // Create an observer to watch for changes in the form element's options.
        this._optionsObserver = new MutationObserver(this._onOptionsMutation.bind(this));
        this._optionsObserver.observe(this._selectElement, {
          childList: true
        });

        // Set up the label(s).
        if (this._selectElement.labels && this._selectElement.labels.length > 0) {
          let labelledBy = [];
          for (let i = 0; i < this._selectElement.labels.length; i++) {
            let label = this._selectElement.labels[i];
            if (label.id === '') {
              label.id = this._generateGuid();
            }
            labelledBy.push(label.id);
          }
          this.setAttribute('aria-labelledby', labelledBy.join(' '));
        } else {
          this.removeAttribute('aria-labelledby');
        }

        // Disable the select element if this element is disabled.
        this._selectElement.disabled = this.disabled;

        this.notifySelectedOptionChanged();
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
      let options = this._selectElement.options;
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
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('mouseUp', this._onMouseUp);

    if (this._selectObserver !== null) {
      this._selectObserver.disconnect();
      this._selectObserver = undefined;
    }

    this._selectElement = undefined;

    if (this._optionsObserver !== null) {
      this._optionsObserver.disconnect();
      this._optionsObserver = undefined;
    }
  }

  /**
   * Setter for `disabled`.
   *
   * @param {boolean} value
   *   If truthy, `disabled` will be set to true, otherwise `disabled` will be set to false.
   */
  set disabled(value) {
    if (this._selectElement !== undefined) {
      const isDisabled = Boolean(value);
      if (isDisabled) {
        this.setAttribute('disabled', '');
      }
      else {
        this.removeAttribute('disabled');
      }
    }
  }

  /**
   * States whether or not this element is disabled.
   *
   * @default false
   * @returns {boolean}
   */
  get disabled() {
    return this.hasAttribute('disabled');
  }

  /**
   * Setter for `noAutoPerspective`.
   *
   * @param {boolean} value
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
   * States whether or not this element should automatically calculate its own perspective value.
   *
   * @default false
   * @returns {boolean}
   */
  get noAutoPerspective() {
    return this.hasAttribute('no-auto-perspective');
  }

  /**
   * The select element.
   *
   * @returns {HTMLSelectElement}
   */
  get selectElement() {
    return this._selectElement;
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
    let hasValue = newValue !== null;

    switch (name) {
      case 'disabled':
        // Set the aria value.
        this.setAttribute('aria-disabled', hasValue);

        if (hasValue) {
          this.selectElement.setAttribute('disabled', '');

          // If the tab index is set.
          if (this.hasAttribute('tabindex')) {
            this._tabindexBeforeDisabled = this.getAttribute('tabindex');
            this.removeAttribute('tabindex');
            this.blur();
          }
        } else {
          this.selectElement.removeAttribute('disabled');

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
      case CatalystFlipButton._KEYCODE.SPACE:
      case CatalystFlipButton._KEYCODE.ENTER:
        event.preventDefault();
        this._flip();
        break;

      case CatalystFlipButton._KEYCODE.LEFT:
      case CatalystFlipButton._KEYCODE.UP:
        event.preventDefault();
        this.previous();
        break;

      case CatalystFlipButton._KEYCODE.RIGHT:
      case CatalystFlipButton._KEYCODE.DOWN:
        event.preventDefault();
        this.next();
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
    if (event.button === 0) {
      this._onLeftClick();
    }
  }

  /**
   * Called on the mouse up event.
   *
   * @param {MouseEvent} event
   */
  _onMouseUp(event) {
    if (event.button === 2) {
      this._onRightClick();
    }
  }

  /**
   * Called when this element is left clicked.
   */
  _onLeftClick() {
    this.focus();
    this.next();
  }

  /**
   * Called when this element is right clicked.
   */
  _onRightClick() {
    this.focus();
    this.previous();
  }

  /**
   * Notify this component that the select element has changed.
   *
   * Must be called after manually setting the selected index.
   */
  notifySelectedOptionChanged() {
    if (this._selectElement === null || this._selectElement.length === 0) {
      return;
    }

    let option = this._selectElement.options[this._selectElement.selectedIndex];

    if (this._flipped) {
      this._cardBackFace.textContent = option.textContent;
    } else {
      this._cardFrontFace.textContent = option.textContent;
    }

    // IE11 specific fixes.
    if (CatalystFlipButton.isIE11) {
      let backfaceVisibility = this._flipped ? 'visible' : 'hidden';
      this._cardFrontFace.style.backfaceVisibility = backfaceVisibility;
      this._cardBackFace.style.backfaceVisibility = backfaceVisibility;
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
      let fe = this._selectElement;
      this._setUpSelectElement();

      // New form element?
      if (this._selectElement !== fe) {
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
      if (this._selectElement !== null && this._selectElement.length === 0) {
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
    if (this._selectElement === null || this.disabled) {
      return;
    }

    // Update the selected index.
    let newIndex = this._selectElement.selectedIndex + (forwards ? 1 : -1);
    let length = this._selectElement.length;
    this._selectElement.selectedIndex = ((newIndex % length) + length) % length;

    // Update the card's rotation.
    this._rotation += 180 * (forwards ? -1 : 1);

    // Card has now been flipped/unflipped.
    this._flipped = !this._flipped;

    /**
     * Fired when the selected option changes due to user interaction.
     *
     * @event change
     */
    this.dispatchEvent(new CustomEvent('change', {
      detail: {
        selectedIndex: this._selectElement.selectedIndex,
        selectedOption: this._selectElement.options[this._selectElement.selectedIndex]
      },
      bubbles: true,
    }));

    // `change` event on the form element is not emitted when setting selectedIndex manually.
    this.notifySelectedOptionChanged();
  }

  /**
   * Update the element
   */
  _update() {
    if (this._selectElement === null) {
      return;
    }

    // Update the value attribute.
    this.setAttribute('value', this._selectElement.value);

    // Play the transition.
    this._cardElement.style.transform = 'rotateY(' + this._rotation + 'deg)';
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

// Register the element if it is not already registered.
if (!CatalystFlipButton._isRegistered) {
  CatalystFlipButton._register();
}

// Export the element.
export { CatalystFlipButton };
