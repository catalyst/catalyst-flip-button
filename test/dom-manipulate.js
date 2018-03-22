/* eslint-disable no-unused-expressions, max-nested-callbacks */

/**
 * Basics suite.
 */
suite('Dom Manipulate', () => {
  let element;
  let select;

  /**
   * Called before each following test is run.
   */
  setup(() => {
    element = fixture('basic-with-option-ids-and-values');
    select = element.querySelector('select');
  });

  /**
   * Adding.
   */
  suite('Adding', () => {
    // Test the `add()` method.
    test('select.add()', () => {
      const newOption = document.createElement('option');
      newOption.id = 'id5';
      newOption.value = 'e';
      newOption.textContent = 'Egg';

      select.add(newOption);

      expect(select.length).to.equal(5);
      expect(select.options.length).to.equal(5);
      expect(select.selectedIndex).to.equal(0);

      select.selectedIndex = 4;
      expect(select.selectedIndex).to.equal(4);
    });

    // Test the directly editing the light dom.
    test('Light Dom Manipulation', () => {
      const newOption = document.createElement('option');
      newOption.id = 'id5';
      newOption.slot = 'options';
      newOption.value = 'e';
      newOption.textContent = 'Egg';

      select.appendChild(newOption);

      expect(select.length).to.equal(5);
      expect(select.options.length).to.equal(5);
      expect(select.selectedIndex).to.equal(0);

      select.selectedIndex = 4;
      expect(select.selectedIndex).to.equal(4);
    });
  });

  /**
   * Removing.
   */
  suite('Removing', () => {
    suite('Remove Non-Active Element', () => {
      // Test the `remove()` method.
      test('select.remove()', done => {
        let testRunning = true;

        select.remove(1);

        setTimeout(() => {
          if (testRunning) {
            expect(select.length).to.equal(3);
            expect(select.options.length).to.equal(3);
            expect(select.selectedIndex).to.equal(0);

            select.selectedIndex = 1;

            expect(select.selectedIndex).to.equal(1);
            expect(select.options[select.selectedIndex].id).to.equal('id3');

            testRunning = false;
            done();
          }
        }, 10);
      });

      // Test the directly editing the light dom.
      test('Light Dom Manipulation', done => {
        let testRunning = true;

        const option = select.querySelector('#id2');

        select.removeChild(option);

        setTimeout(() => {
          if (testRunning) {
            expect(select.length).to.equal(3);
            expect(select.options.length).to.equal(3);
            expect(select.selectedIndex).to.equal(0);

            select.selectedIndex = 1;

            expect(select.selectedIndex).to.equal(1);
            expect(select.options[select.selectedIndex].id).to.equal('id3');

            testRunning = false;
            done();
          }
        }, 10);
      });
    });

    suite('Remove Active Element', () => {
      suite('Non-Last Element', () => {
        // Test the `remove()` method.
        test('select.remove()', done => {
          let testRunning = true;

          select.remove(0);

          setTimeout(() => {
            if (testRunning) {
              expect(select.length).to.equal(3);
              expect(select.options.length).to.equal(3);
              expect(select.selectedIndex).to.equal(0);
              expect(select.options[select.selectedIndex].id).to.equal('id2');

              testRunning = false;
              done();
            }
          }, 10);
        });

        // Test the directly editing the light dom.
        test('Light Dom Manipulation', done => {
          let testRunning = true;

          const option = select.querySelector('#id1');

          select.removeChild(option);

          setTimeout(() => {
            if (testRunning) {
              expect(select.length).to.equal(3);
              expect(select.options.length).to.equal(3);
              expect(select.selectedIndex).to.equal(0);
              expect(select.options[select.selectedIndex].id).to.equal('id2');

              testRunning = false;
              done();
            }
          }, 10);
        });
      });

      suite('Last Element', () => {
        // Test the `remove()` method.
        test('select.remove()', done => {
          let testRunning = true;

          select.selectedIndex = 3;
          select.remove(3);

          setTimeout(() => {
            if (testRunning) {
              expect(select.length).to.equal(3);
              expect(select.options.length).to.equal(3);
              expect(select.selectedIndex).to.equal(0);
              expect(select.options[select.selectedIndex].id).to.equal('id1');

              testRunning = false;
              done();
            }
          }, 10);
        });

        // Test the directly editing the light dom.
        test('Light Dom Manipulation', done => {
          let testRunning = true;

          const option = select.querySelector('#id4');

          select.selectedIndex = 3;
          select.removeChild(option);

          setTimeout(() => {
            if (testRunning) {
              expect(select.length).to.equal(3);
              expect(select.options.length).to.equal(3);
              expect(select.selectedIndex).to.equal(0);
              expect(select.options[select.selectedIndex].id).to.equal('id1');

              testRunning = false;
              done();
            }
          }, 10);
        });
      });
    });
  });
});
