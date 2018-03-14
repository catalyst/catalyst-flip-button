/**
 * Basics suite.
 */
suite('Basics', () => {
  let element;
  let select;

  /**
   * Called before each following test is run.
   */
  setup(() => {
    element = fixture('basic');
    select = element.querySelector('select');
  });

  /**
   * Test the initial state of the element.
   */
  suite('Initial State', () => {
    /**
     * Test the attributes and properties of the element in it's initial state.
     */
    suite('Attributes & Properties', () => {
      /**
       * Test disabled.
       */
      test('disabled', () => {
        expect(element.hasAttribute('disabled')).to.be.false;
        expect(element).to.have.property('disabled', false);
      });
    });

    /**
     * Test the accessibility of the element in it's initial state.
     */
    suite('Accessibility', () => {
      /**
       * Test role.
       */
      test('role', () => {
        // role
        expect(element.hasAttribute('role')).to.be.true;
        expect(element.getAttribute('role')).to.equal('combobox');
      });

      /**
       * Test tabindex.
       */
      test('tabindex', () => {
        expect(element.hasAttribute('tabindex')).to.be.true;
        expect(Number.parseInt(element.getAttribute('tabindex'))).to.equal(0);
      });

      /**
       * Test aria-disabled.
       */
      test('aria-disabled', () => {
        expect(element.hasAttribute('aria-disabled')).to.be.true;
        expect(element.getAttribute('aria-disabled')).to.equal('false');
      });

      /**
       * Test aria-live.
       */
      test('aria-live', () => {
        expect(element.hasAttribute('aria-live')).to.be.true;
        expect(element.getAttribute('aria-live')).to.equal('polite');
      });
    });
  });

  /**
   * Test the attributes and properties of the element in it's initial state.
   */
  suite('Changing State', () => {
    /**
     * Mouse Interaction.
     */
    suite('Mouse Interaction', () => {
      /**
       * Left Click.
       */
      suite('Left Click', () => {
        /**
         * Test clicking the element.
         */
        test('Click Once', done => {
          let testRunning = true;

          // Change event needs to be fired.
          select.addEventListener('change', () => {
            if (testRunning) {
              testRunning = false;
              done();
            }
          });

          element.click();

          expect(select).to.have.property('selectedIndex', 1);

          // Timeout test.
          setTimeout(function() {
            if (testRunning) {
              assert(false, 'Change event was not fired within 10 ms.');
              testRunning = false;
              done();
            }
          }, 10);
        });

        /**
         * Test clicking the element twice.
         */
        test('Click Twice', () => {
          element.click();
          element.click();

          expect(select).to.have.property('selectedIndex', 2);
        });

        /**
         * Test clicking through all the elements.
         */
        test('Click Through', () => {
          element.click();
          element.click();
          element.click();
          element.click();

          expect(select).to.have.property('selectedIndex', 0);
        });

        /**
         * Test clicking the element when disabled.
         */
        test('Click When Disabled', () => {
          element.disabled = true;

          element.click();

          expect(select).to.have.property('selectedIndex', 0);
        });
      });

      /**
       * Right Click.
       * TODO: write tests.
       */
      suite('Right Click', () => {});
    });

    /**
     * KeyBoard Interaction.
     * TODO: write tests.
     */
    suite('KeyBoard Interaction', () => {});
  });
});
