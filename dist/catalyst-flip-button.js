(function() {

  window.CatalystElements = window.CatalystElements || {};

  function createElement() {

    const elementTagName = 'catalyst-flip-button';

    const KEYCODE = {
      SPACE: 32,
      ENTER: 13,
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40
    };

    const template = document.createElement('template');
    template.innerHTML = `<style>:host{position:relative;display:inline-block;-webkit-box-align:start;-ms-flex-align:start;align-items:flex-start;padding:1px 6px;margin:0;font-family:inherit;font-size:83.33333%;font-style:normal;font-weight:400;line-height:normal;letter-spacing:normal;word-spacing:normal;color:#000;text-align:center;text-indent:0;text-rendering:auto;text-shadow:none;text-transform:none;vertical-align:bottom;cursor:default;-webkit-box-sizing:content-box;box-sizing:content-box;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-perspective:100px;perspective:100px;contain:layout style}:host #card{position:absolute;top:0;right:0;bottom:0;left:0;-webkit-transition:-webkit-transform .4s ease;transition:-webkit-transform .4s ease;transition:transform .4s ease;transition:transform .4s ease,-webkit-transform .4s ease;-webkit-transform-style:preserve-3d;transform-style:preserve-3d}:host #card #back,:host #card #front{position:absolute;top:0;right:0;bottom:0;left:0;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;margin:0;background:var(--catalyst-flip-button-card-face-background,#ddd);border:var(--catalyst-flip-button-card-face-border);border-radius:var(--catalyst-flip-button-card-face-border-radius);-webkit-backface-visibility:hidden;backface-visibility:hidden;-webkit-appearance:var(--catalyst-flip-button-card-face-appearance,button);-moz-appearance:var(--catalyst-flip-button-card-face-appearance,button)}:host #card #back{-webkit-transform:rotateY(180deg);transform:rotateY(180deg)}:host(:focus){outline:none}:host(:focus) #card #back,:host(:focus) #card #front{outline:var(--catalyst-flip-button-card-face-focused-outline,#000 dotted 1px)}:host([hidden]),:host [hidden]{display:none}</style><div id="card"><div id="front"></div><div id="back"></div></div><div hidden><slot></slot></div>`;

    if (window.ShadyCSS !== undefined) {
      window.ShadyCSS.prepareTemplate(template, elementTagName);
    }

    class CatalystFlipButton extends HTMLElement {

      static get observedAttributes() {
        return ['disabled'];
      }

      constructor() {
        super();

        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this._cardElement = this.shadowRoot.querySelector('#card');

        this._cardFrontFace = this._cardElement.querySelector('#front');

        this._cardBackFace = this._cardElement.querySelector('#back');

        this._flipped = false;

        this._lastSelectedIndex = -1;

        this._rotation = 0;
      }

      connectedCallback() {
        this._setUpSelectElement();

        this._upgradeProperty('disabled');
        this._upgradeProperty('noAutoPerspective');

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

        this.addEventListener('keydown', this._onKeyDown);
        this.addEventListener('click', this._onClick);
        this.addEventListener('contextmenu', this._onContextMenu);

        this._selectObserver = new MutationObserver(this._onLightDomMutation.bind(this));
        this._selectObserver.observe(this, {
          childList: true
        });

        this._setUpDimensions();

        if (window.ShadyCSS !== undefined) {
          window.ShadyCSS.styleElement(this);
        }
      }

      _upgradeProperty(prop) {
        if (this.hasOwnProperty(prop)) {
          let value = this[prop];
          delete this[prop];
          this[prop] = value;
        }
        else if (this.hasAttribute(prop)) {
          this[prop] = this.getAttribute(prop);
        }
      }

      _setUpSelectElement() {
        let newSelectElement = this.querySelector('select');

        if (newSelectElement !== null) {
          if (newSelectElement !== this._selectElement) {
            if (this._selectElement !== null && this._selectElement !== undefined) {
              this._selectElement.removeEventListener('change', this.notifySelectedOptionChanged.bind(this));
            }

            if (this._optionsObserver !== undefined) {
              this._optionsObserver.disconnect();
              this._optionsObserver = undefined;
            }

            this._selectElement = newSelectElement;
            this._selectElement.addEventListener('change', this.notifySelectedOptionChanged.bind(this));

            this._optionsObserver = new MutationObserver(this._onOptionsMutation.bind(this));
            this._optionsObserver.observe(this._selectElement, {
              childList: true
            });

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

            this.notifySelectedOptionChanged();
          }
        }
      }

      _setUpDimensions() {
        this.style.minWidth = '';
        this.style.minHeight = '';

        let style = getComputedStyle(this);
        let width = Number.parseInt(style.width, 10);
        let height = Number.parseInt(style.height, 10);

        let adjustWidth = width === 0;
        let adjustHeight = height === 0;

        if (adjustWidth || adjustHeight) {

          let maxOptionWidth = 0;
          let maxOptionHeight = 0;

          this._cardElement.style.position = 'relative';

          let options = this._selectElement.options;
          if (options.length > 0) {

            this._cardFrontFace.style.position = 'relative';
            this._cardBackFace.style.position = 'relative';

            let frontFaceText = this._cardFrontFace.textContent;
            this._cardFrontFace.textContent = '';

            let backFaceText = this._cardBackFace.textContent;
            this._cardBackFace.textContent = '';

            for (let i = 0; i < options.length; i++) {
              this._cardFrontFace.textContent = options[i].textContent;
              this._cardBackFace.textContent = options[i].textContent;

              if (adjustWidth) {
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

            this._cardFrontFace.textContent = frontFaceText;
            this._cardBackFace.textContent = backFaceText;

            this._cardFrontFace.style.position = '';
            this._cardBackFace.style.position = '';
          }

          this._cardElement.style.position = '';

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

      disconnectedCallback() {
        this.removeEventListener('keydown', this._onKeyDown);
        this.removeEventListener('click', this._onClick);
        this.removeEventListener('contextmenu', this._onContextMenu);

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

      set disabled(value) {
        const isDisabled = Boolean(value);
        this._selectElement.disabled = isDisabled;
        if (isDisabled) {
          this.setAttribute('disabled', '');
        }
        else {
          this.removeAttribute('disabled');
        }
      }

      get disabled() {
        return this.hasAttribute('disabled');
      }

      set noAutoPerspective(value) {
        const isNoAutoPerspective = Boolean(value);
        if (isNoAutoPerspective) {
          this.setAttribute('no-auto-perspective', '');
        }
        else {
          this.removeAttribute('no-auto-perspective');
        }
      }

      get noAutoPerspective() {
        return this.hasAttribute('no-auto-perspective');
      }

      get selectElement() {
        return this._selectElement;
      }

      attributeChangedCallback(name, oldValue, newValue) {
        const hasValue = newValue !== null;

        switch (name) {
          case 'disabled':
            this.setAttribute('aria-disabled', hasValue);

            if (hasValue) {
              if (this.hasAttribute('tabindex')) {
                this._tabindexBeforeDisabled = this.getAttribute('tabindex');
                this.removeAttribute('tabindex');
                this.blur();
              }
            } else {
              if (!this.hasAttribute('tabindex') && this._tabindexBeforeDisabled !== undefined && this._tabindexBeforeDisabled !== null) {
                this.setAttribute('tabindex', this._tabindexBeforeDisabled);
              }
            }
            break;
        }
      }

      _onKeyDown(event) {
        if (event.altKey) {
          return;
        }

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

          default:
            return;
        }
      }

      _onClick(event) {
        if (event.button === 0) {
          this._onLeftClick(event);
        }
      }

      _onContextMenu(event) {
        if (event.button === 2) {
          this._onRightClick(event);
        }
      }

      _onLeftClick(event) {
        event.preventDefault();
        this.next();
      }

      _onRightClick(event) {
        event.preventDefault();
        this.previous();
      }

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

        this._update();
      }

      _onLightDomMutation(mutations) {
        let nodesAdded = false;
        let nodesRemoved = false;

        let recalculateSize;
        recalculateSize = false;

        for (let i = 0; i < mutations.length; i++) {
          if (mutations[i].addedNodes.length > 0) {
            nodesAdded = true;
          }

          if (mutations[i].removedNodes.length > 0) {
            nodesRemoved = true;
          }
        }

        if (nodesAdded || nodesRemoved) {
          let fe = this._selectElement;
          this._setUpSelectElement();

          if (this._selectElement !== fe) {
            recalculateSize = true;
          }
        }

        if (recalculateSize) {
          this._setUpDimensions();
        }
      }

      _onOptionsMutation(mutations) {
        let optionsAdded = false;
        let optionsRemoved = false;

        let recalculateSize;
        recalculateSize = false;

        for (let i = 0; i < mutations.length; i++) {
          for (let j = 0; j < mutations[i].addedNodes.length; j++) {
            if (mutations[i].addedNodes[j].tagName === 'OPTION') {
              optionsAdded = true;
              break;
            }
          }

            for (let j = 0; j < mutations[i].addedNodes.length; j++) {
            if (mutations[i].addedNodes[j].tagName === 'OPTION') {
              optionsRemoved = true;
              break;
            }
          }

          if (this._selectElement !== null && this._selectElement.length === 0) {
            recalculateSize = true;
          }
        }

        if (optionsAdded || optionsRemoved) {
        }

        if (recalculateSize) {
          this._setUpDimensions();
        }
      }

      next() {
        this._flip(true);
      }

      previous() {
        this._flip(false);
      }

      _flip(forwards = true) {
        if (this._selectElement === null || this.disabled) {
          return;
        }

        let newIndex = this._selectElement.selectedIndex + (forwards ? 1 : -1);
        let length = this._selectElement.length;
        this._lastSelectedIndex = this._selectElement.selectedIndex;
        this._selectElement.selectedIndex = ((newIndex % length) + length) % length;

        this._rotation += 180 * (forwards ? -1 : 1);

        this._flipped = !this._flipped;

        this.dispatchEvent(new CustomEvent('change', {
          detail: {
            selectedIndex: this._selectElement.selectedIndex,
            selectedOptions: this._selectElement.selectedOptions
          },
          bubbles: true,
        }));

        this.notifySelectedOptionChanged();
      }

      _update() {
        if (this._selectElement === null) {
          return;
        }

        this.setAttribute('value', this._selectElement.value);

        this._cardElement.style.transform = 'rotateY(' + this._rotation + 'deg)';
      }

      _generateGuid() {
        let s4 = () => {
          return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
      }
    }

    window.CatalystElements.CatalystFlipButton = CatalystFlipButton;

    window.customElements.define(elementTagName, CatalystFlipButton);
  }

  if (window.CatalystElements.CatalystFlipButton === undefined) {
    if (window.WebComponents === undefined || window.WebComponents.ready) {
      createElement();
    }
    else {
      window.addEventListener('WebComponentsReady', () => {
        createElement();
      });
    }
  } else {
    console.warn('CatalystFlipButton has already been defined, cannot redefine.');
  }
})();
