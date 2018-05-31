// Import dependencies.
import { catalystLabelableMixin } from '../node_modules/@catalyst-elements/catalyst-labelable-mixin/catalyst-labelable-mixin';
import { catalystLazyPropertiesMixin } from '../node_modules/@catalyst-elements/catalyst-lazy-properties-mixin/catalyst-lazy-properties-mixin';

const SuperClass = catalystLabelableMixin(
  catalystLazyPropertiesMixin(HTMLElement)
);

const selectElement = Symbol('select element');
const selectObserver = Symbol('select observer');
const optionsObserver = Symbol('options observer');

/**
 * Key codes.
 *
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
 * True if the web browser is ie11.
 *
 * @type {boolean}
 */
const IS_IE11 = Boolean(navigator.userAgent.match(/Trident\/7\./));

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
 * `--catalyst-flip-button-card-face-appearance`      | The appearance of the card face.            | `button`
 * `--catalyst-flip-button-card-face-background`      | The background of the card face.            | `#dddddd`
 * `--catalyst-flip-button-card-face-border`          | The border applied to the card face.        |
 * `--catalyst-flip-button-card-face-border-radius`   | The border radius applied to the card face. |
 * `--catalyst-flip-button-card-face-focused-outline` | The outline of the card face when focused.  |
 *
 * @class
 * @customElement
 * @group Catalyst Elements
 * @element catalyst-flip-button
 * @extends HTMLElement
 * @mixes catalystLabelableMixin
 * @mixes catalystLazyPropertiesMixin
 * @demo demo/basic.html Basic
 * @demo demo/styled.html Styled
 * @demo demo/form.html Form
 */
class CatalystFlipButton extends SuperClass {
  /**
   * The element's tag name.
   *
   * @public
   * @readonly
   * @returns {string}
   */
  static get is() {
    return 'catalyst-flip-button';
  }

  /**
   * The attributes on this element to observe.
   *
   * @public
   * @readonly
   * @returns {Array.<string>}
   *   The attributes this element is observing for changes.
   */
  static get observedAttributes() {
    return ['disabled'];
  }

  /**
   * Get the default template used by this element.
   *
   * @public
   * @readonly
   * @returns {HTMLTemplateElement}
   */
  get template() {
    const template = document.createElement('template');
    template.innerHTML = `<style>[[inject:css]][[endinject]]</style>[[inject:markup]][[endinject]]`;

    // If using ShadyCSS.
    if (window.ShadyCSS != null) {
      // Rename classes as needed to ensure style scoping.
      window.ShadyCSS.prepareTemplate(template, CatalystFlipButton.is);
    }

    return template;
  }

  /**
   * States whether or not this element is disabled.
   *
   * @public
   * @default false
   * @returns {boolean}
   */
  get disabled() {
    return this.hasAttribute('disabled');
  }

  /**
   * Setter for `disabled`.
   *
   * @public
   * @param {boolean} value
   *   If truthy, `disabled` will be set to true, otherwise `disabled` will be set to false.
   */
  set disabled(value) {
    if (this.selectElement != null) {
      const isDisabled = Boolean(value);
      if (isDisabled) {
        this.setAttribute('disabled', '');
      } else {
        this.removeAttribute('disabled');
      }
    }
  }

  /**
   * States whether or not this element should automatically calculate its own perspective value.
   *
   * @public
   * @default false
   * @returns {boolean}
   */
  get noAutoPerspective() {
    return this.hasAttribute('no-auto-perspective');
  }

  /**
   * Setter for `noAutoPerspective`.
   *
   * @public
   * @param {boolean} value
   *   If truthy, `noAutoPerspective` will be set to true, otherwise `noAutoPerspective` will be set to false.
   */
  set noAutoPerspective(value) {
    const isNoAutoPerspective = Boolean(value);
    if (isNoAutoPerspective) {
      this.setAttribute('no-auto-perspective', '');
    } else {
      this.removeAttribute('no-auto-perspective');
    }
  }

  /**
   * The select element.
   *
   * @public
   * @readonly
   * @returns {HTMLSelectElement}
   */
  get selectElement() {
    return this[selectElement];
  }

  /**
   * Setter for `selectElement`.
   *
   * @protected
   * @param {HTMLSelectElement} value
   *   The element to set it to.
   */
  set selectElement(value) {
    this[selectElement] = value;
  }

  /**
   * Construct the element.
   *
   * @public
   */
  constructor() {
    super();

    // Create a shadow root and stamp out the template's content inside.
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(this.template.content.cloneNode(true));

    /**
     * The element that flips.
     *
     * @protected
     * @type {HTMLElement}
     */
    this.cardElement = this.shadowRoot.querySelector('#card');

    /**
     * The front face of the card.
     *
     * @protected
     * @type {HTMLElement}
     */
    this.cardFrontFace = this.cardElement.querySelector('#front');

    /**
     * The back face of the card.
     *
     * @protected
     * @type {HTMLElement}
     */
    this.cardBackFace = this.cardElement.querySelector('#back');

    /**
     * True if the card has been flipped, otherwise false.
     *
     * @protected
     * @type {boolean}
     */
    this.flipped = false;

    /**
     * The rotation of the card.
     *
     * @protected
     * @type {number}
     */
    this.rotation = 0;
  }

  /**
   * Fires when the element is inserted into the DOM.
   *
   * @protected
   */
  connectedCallback() {
    if (typeof super.connectedCallback === 'function') {
      super.connectedCallback();
    }

    // Set up the form element.
    this.setUpSelectElement();

    // Upgrade the element's properties.
    this.upgradeProperty('disabled');
    this.upgradeProperty('noAutoPerspective');

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
    this.addEventListener('keydown', this.onKeyDown);
    this.addEventListener('click', this.onClick);
    this.addEventListener('mouseup', this.onMouseUp);

    // Disable context menu on right click.
    this.setAttribute(
      'oncontextmenu',
      'if (event.button === 2) { event.preventDefault(); }'
    );

    this[selectObserver] = new MutationObserver(
      this.onLightDomMutation.bind(this)
    );
    this[selectObserver].observe(this, {
      childList: true
    });

    // Set the size of the element.
    setTimeout(() => {
      this.setUpDimensions();
    }, 0);

    // If using ShadyCSS.
    if (window.ShadyCSS != null) {
      // Style the element.
      window.ShadyCSS.styleElement(this);
    }
  }

  /**
   * Find the new form element and set it up.
   *
   * @private
   */
  setUpSelectElement() {
    const newSelectElement = this.querySelector('select');

    if (newSelectElement != null && newSelectElement !== this.selectElement) {
      // Clean up the old form element.
      if (this.selectElement != null) {
        this.selectElement.removeEventListener(
          'change',
          this.notifySelectedOptionChanged.bind(this)
        );
      }

      // Remove the old observer if there is one.
      if (this[optionsObserver] != null) {
        this[optionsObserver].disconnect();
        this[optionsObserver] = null;
      }

      // Set up the new form element.
      this.selectElement = newSelectElement;
      this.selectElement.addEventListener(
        'change',
        this.notifySelectedOptionChanged.bind(this)
      );
      this.selectElement.setAttribute('tabindex', -1);

      // Create an observer to watch for changes in the form element's options.
      this[optionsObserver] = new MutationObserver(
        this.onOptionsMutation.bind(this)
      );
      this[optionsObserver].observe(this.selectElement, {
        childList: true
      });

      // Set up the label(s).
      this.connectLabels();

      // Any labels for the `selectElement` are also for this element.
      if (this.selectElement.labels && this.selectElement.labels.length > 0) {
        const labels =
          this.getAttribute('aria-labelledby') ||
          ''
            .split(' ')
            .concat(this.selectElement.labels)
            .filter(
              (value, index, array) =>
                value != null && value !== '' && array.indexOf(value) === index
            )
            .join(' ');

        this.setAttribute('aria-labelledby', labels);
      }

      // Disable the select element if this element is disabled.
      this.selectElement.disabled = this.disabled;

      this.notifySelectedOptionChanged();
    }
  }

  /**
   * Set the dimensions of this element.
   *
   * This element cannot obtain it's dimensions automatically from it's children
   * as they are positioned absolutely. This method will manually calculate the
   * minimum size this component should be to contain its children.
   *
   * @private
   */
  setUpDimensions() {
    // Remove any previous settings.
    this.style.minWidth = '';
    this.style.minHeight = '';

    // Get the size of this element as is.
    const style = getComputedStyle(this);
    const width = Number.parseInt(style.width, 10);
    const height = Number.parseInt(style.height, 10);

    // If the element now has no size (i.e. a user has not manually set a size),
    // Mark it as needing to be sized.
    const adjustWidth = width === 0;
    const adjustHeight = height === 0;

    // If the element needs to be sized.
    if (adjustWidth || adjustHeight) {
      // The width and height of the largest children
      let maxOptionWidth = 0;
      let maxOptionHeight = 0;

      // Position the card relatively so sizes can be calculated.
      this.cardElement.style.position = 'relative';

      // Get the options.
      if (this.selectElement != null) {
        const options = this.selectElement.options;
        if (options.length > 0) {
          // Set the styling to relative so the size can be measured.
          this.cardFrontFace.style.position = 'relative';
          this.cardBackFace.style.position = 'relative';

          // Save the text content in the front face and then clear it.
          const frontFaceText = this.cardFrontFace.textContent;
          this.cardFrontFace.textContent = '';

          // Save the text content in the back face and then clear it.
          const backFaceText = this.cardBackFace.textContent;
          this.cardBackFace.textContent = '';

          for (let i = 0; i < options.length; i++) {
            this.cardFrontFace.textContent = options[i].textContent;
            this.cardBackFace.textContent = options[i].textContent;

            if (adjustWidth) {
              // If new largest width, save it.
              const fw = this.cardFrontFace.offsetWidth;
              if (fw > maxOptionWidth) {
                maxOptionWidth = fw;
              }
              const bw = this.cardBackFace.offsetWidth;
              if (bw > maxOptionWidth) {
                maxOptionWidth = bw;
              }
            }

            if (adjustHeight) {
              // If new largest height, save it.
              const fh = this.cardFrontFace.offsetHeight;
              if (fh > maxOptionHeight) {
                maxOptionHeight = fh;
              }
              const hw = this.cardBackFace.offsetHeight;
              if (hw > maxOptionWidth) {
                maxOptionWidth = hw;
              }
            }
          }

          // Restore the text content to the front and back faces.
          this.cardFrontFace.textContent = frontFaceText;
          this.cardBackFace.textContent = backFaceText;

          // Restore the original positioning.
          this.cardFrontFace.style.position = '';
          this.cardBackFace.style.position = '';
        }
      }

      // Restore the card styles.
      this.cardElement.style.position = '';

      // For each dimension that needs to be adjusted, set it to the largest
      // Dimension an options way (with a little extra room for safety).
      if (adjustWidth) {
        const newWidth = maxOptionWidth + 2;
        this.style.minWidth = `${newWidth}px`;
        if (!this.noAutoPerspective) {
          this.style.perspective = `${2 *
            (newWidth +
              Number.parseInt(style.paddingLeft, 10) +
              Number.parseInt(style.paddingRight, 10))}px`;
        }
      }
      if (adjustHeight) {
        const newHeight = maxOptionHeight + 2;
        this.style.minHeight = `${newHeight}px`;
      }
    }
  }

  /**
   * Fires when the element is removed from the DOM.
   *
   * @protected
   */
  disconnectedCallback() {
    if (typeof super.disconnectedCallback === 'function') {
      super.disconnectedCallback();
    }

    this.removeEventListener('keydown', this.onKeyDown);
    this.removeEventListener('click', this.onClick);
    this.removeEventListener('mouseUp', this.onMouseUp);

    if (this[selectObserver] != null) {
      this[selectObserver].disconnect();
      this[selectObserver] = null;
    }

    this.selectElement = null;

    if (this[optionsObserver] != null) {
      this[optionsObserver].disconnect();
      this[optionsObserver] = null;
    }
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
    if (typeof super.attributeChangedCallback === 'function') {
      super.attributeChangedCallback(name, oldValue, newValue);
    }

    const hasValue = newValue != null;

    switch (name) {
      case 'disabled':
        // Set the aria value.
        this.setAttribute('aria-disabled', hasValue);

        if (hasValue) {
          if (this.selectElement != null) {
            this.selectElement.setAttribute('disabled', '');
          }

          // If the tab index is set.
          if (this.hasAttribute('tabindex')) {
            this.tabindexBeforeDisabled = this.getAttribute('tabindex');
            this.removeAttribute('tabindex');
            this.blur();
          } else {
            this.tabindexBeforeDisabled = null;
          }
        } else {
          if (this.selectElement != null) {
            this.selectElement.removeAttribute('disabled');
          }

          // If the tab index isn't already set and the previous value is known.
          if (
            !this.hasAttribute('tabindex') &&
            this.tabindexBeforeDisabled != null
          ) {
            this.setAttribute('tabindex', this.tabindexBeforeDisabled);
          }
        }
        break;

      // Different attribute changed? Do nothing.
      default:
    }
  }

  /**
   * Called when a key is pressed on this element.
   *
   * @protected
   * @param {KeyboardEvent} event
   *   The keyboard event.
   */
  onKeyDown(event) {
    // Don’t handle modifier shortcuts typically used by assistive technology.
    if (event.altKey) {
      return;
    }

    // What key was pressed?
    switch (event.keyCode) {
      case KEYCODE.LEFT:
      case KEYCODE.UP:
        event.preventDefault();
        this.previous();
        break;

      case KEYCODE.SPACE:
      case KEYCODE.ENTER:
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
   * Called when this element is clicked.
   *
   * @protected
   * @param {MouseEvent} event
   *   The mouse event
   */
  onClick(event) {
    if (event.button === 0) {
      this.onLeftClick();
    }
  }

  /**
   * Called on the mouse up event.
   *
   * @protected
   * @param {MouseEvent} event
   *   The mouse event.
   */
  onMouseUp(event) {
    if (event.button === 2) {
      this.onRightClick();
    }
  }

  /**
   * Called when this element is left clicked.
   *
   * @protected
   */
  onLeftClick() {
    this.focus();
    this.next();
  }

  /**
   * Called when this element is right clicked.
   *
   * @protected
   */
  onRightClick() {
    this.focus();
    this.previous();
  }

  /**
   * Called when a label of this element is clicked.
   *
   * @protected
   */
  onLabelClick() {
    this.next();
  }

  /**
   * Notify this component that the select element has changed.
   *
   * Must be called after manually setting the selected index.
   *
   * @public
   */
  notifySelectedOptionChanged() {
    if (this.selectElement == null || this.selectElement.length === 0) {
      return;
    }

    const option = this.selectElement.options[this.selectElement.selectedIndex];

    if (this.flipped) {
      this.cardBackFace.textContent = option.textContent;
    } else {
      this.cardFrontFace.textContent = option.textContent;
    }

    // IE11 specific fixes.
    if (IS_IE11) {
      const backfaceVisibility = this.flipped ? 'visible' : 'hidden';
      this.cardFrontFace.style.backfaceVisibility = backfaceVisibility;
      this.cardBackFace.style.backfaceVisibility = backfaceVisibility;
    }

    this.update();
  }

  /**
   * Called when a top level lightDom mutation happens.
   *
   * @private
   * @param {Array<MutationRecord>} mutations - The mutations
   */
  onLightDomMutation(mutations) {
    let nodesAdded = false;
    let nodesRemoved = false;

    let recalculateSize;
    recalculateSize = false;

    // For each mutation.
    for (const mutation of mutations) {
      // Nodes Added?
      if (mutation.addedNodes.length > 0) {
        nodesAdded = true;
      }

      // Nodes Removed?
      if (mutation.removedNodes.length > 0) {
        nodesRemoved = true;
      }
    }

    // If lightDom elements changed?
    if (nodesAdded || nodesRemoved) {
      const originSelectElement = this.selectElement;
      this.setUpSelectElement();

      // New form element?
      if (this.selectElement !== originSelectElement) {
        recalculateSize = true;
      }
    }

    // Size of the element needs recalculate?
    if (recalculateSize) {
      this.setUpDimensions();
    }
  }

  /**
   * Called when a top level lightDom mutation happens.
   *
   * @private
   * @param {Array<MutationRecord>} mutations - The mutations
   */
  onOptionsMutation(mutations) {
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
      if (this.selectElement != null && this.selectElement.length === 0) {
        recalculateSize = true;
      }
    }

    // If lightDom elements changed?
    if (optionsAdded || optionsRemoved) {
      // TODO: options changed.
    }

    // Size of the element needs recalculate?
    if (recalculateSize) {
      this.setUpDimensions();
    }
  }

  /**
   * Flip the button forwards to the next option.
   *
   * @public
   */
  next() {
    this.flip(true);
  }

  /**
   * Flip the button back to the previous option.
   *
   * @public
   */
  previous() {
    this.flip(false);
  }

  /**
   * Flip the button.
   *
   * This method is only caused by a user action, so it will dispatch a change event.
   *
   * @protected
   * @fires change
   *
   * @param {boolean} [forwards=true]
   *   If true, flip forward. If false, flip back.
   */
  flip(forwards = true) {
    if (this.selectElement == null || this.disabled) {
      return;
    }

    // Update the selected index.
    const newIndex = this.selectElement.selectedIndex + (forwards ? 1 : -1);
    const length = this.selectElement.length;
    this.selectElement.selectedIndex = (newIndex % length + length) % length;

    // Update the card's rotation.
    this.rotation += -180 * (forwards ? 1 : -1);

    // Card has now been flipped/unflipped.
    this.flipped = !this.flipped;

    // The select element should now fire a change event.
    this.selectElement.dispatchEvent(new Event('change'));
  }

  /**
   * Update the element
   *
   * @protected
   */
  update() {
    if (this.selectElement != null) {
      // Update the value attribute.
      this.setAttribute('value', this.selectElement.value);
    }

    // Play the transition.
    this.cardElement.style.transform = `rotateY(${this.rotation}deg)`;
  }
}

/**
 * Register the element.
 */
(async () => {
  // Make sure the polyfills are ready (if they are being used).
  await new Promise(resolve => {
    if (window.WebComponents == null || window.WebComponents.ready) {
      resolve();
    } else {
      window.addEventListener('WebComponentsReady', () => resolve(), {
        once: true
      });
    }
  });

  window.customElements.define(CatalystFlipButton.is, CatalystFlipButton);
})();

// Export the element.
export { CatalystFlipButton };
