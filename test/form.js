/* eslint-disable */
// eslint is disbale until this file has been written to prevent linting issues.

/**
 * TODO: Form suite.
 */
suite('Form', () => {
  let form;
  let element;
  let select;

  /**
   * Called before each following test is run.
   */
  setup(() => {
    form = fixture('basic-form');
    element = form.querySelector('catalyst-flip-button');
    select = element.querySelector('select');
  });

  /**
   * TODO:
   * Test the initial state of the element.
   */
  suite('Initial State', () => {});

  /**
   * TODO:
   * Test the element when it's state changes.
   */
  suite('Changing State', () => {});

  /**
   * TODO:
   * Test the the element is submitted correctly.
   */
  suite('Submitting', () => {});
});
