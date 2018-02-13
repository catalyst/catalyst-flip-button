// Import the helpers.
import '../node_modules/@polymer/iron-demo-helpers/demo-snippet.js';

// Import the element.
import { CatalystFlipButton } from '../node_modules/@catalyst-elements/catalyst-flip-button/dist/catalyst-flip-button.module.js';

// Register the element.
if (window.WebComponents === undefined || window.WebComponents.ready) {
  CatalystFlipButton.register();
} else {
  window.addEventListener('WebComponentsReady', () => {
    CatalystFlipButton.register();
  });
}
