const postcss = require('postcss');
const plugin = require('./');
const mocha = require('mocha');
const chai = require('chai');

const {
  describe,
  it
} = mocha;

const { expect } = chai;

function run(input, output, opts) {
  return postcss([plugin(opts)]).process(input, { from: undefined }).then(result => {
    expect(result.css).to.equal(output);
  })
  .catch(err => {});
}

describe('omit imports', () => {
  it('removes the import statement as expected',() => {
    run(ex, exOut);
  })
});

describe('leaves other imports in place', () => {
  it('removes the import statement as expected',() => {
    run(ex2, ex2Out);
  })
});


const ex = `
/**
 * Shared form styles
 */

@import "../variables.css";
@import "some/other/file.css";

.inputGroup {
  position: relative;
}

/**
 * Default input, textarea and select styling
 */
.formControl {
  margin-bottom: var(--control-margin-bottom);
  border: 1px solid var(--color-border-form);
  color: var(--color-text);
  background-color: var(--color-fill-form-element);

  &::-ms-clear {
    display: none;
  }
}
`;

const exOut = `
/**
 * Shared form styles
 */

@import "some/other/file.css";

.inputGroup {
  position: relative;
}

/**
 * Default input, textarea and select styling
 */
.formControl {
  margin-bottom: var(--control-margin-bottom);
  border: 1px solid var(--color-border-form);
  color: var(--color-text);
  background-color: var(--color-fill-form-element);

  &::-ms-clear {
    display: none;
  }
}
`;


const ex2 = `
@import '../variables.css';
@import "some/other/file.css";

/**
* Default styling
*/

.button {
  composes: interactionStyles from "../sharedStyles/interactionStyles.css";
  padding: 0 var(--gutter-static);
  -webkit-appearance: none;
  cursor: pointer;
  border: transparent;

  &:visited {
    color: inherit;
  }

  &::before {
    border-radius: 999px;
  }
}
`;
const ex2Out =`
@import "some/other/file.css";

/**
* Default styling
*/

.button {
  composes: interactionStyles from "../sharedStyles/interactionStyles.css";
  padding: 0 var(--gutter-static);
  -webkit-appearance: none;
  cursor: pointer;
  border: transparent;

  &:visited {
    color: inherit;
  }

  &::before {
    border-radius: 999px;
  }
}
`;