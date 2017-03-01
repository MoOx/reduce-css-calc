'use strict';

var _ava = require('ava');

var _ava2 = _interopRequireDefault(_ava);

var _ = require('..');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function testFixture(t, fixture) {
  var expected = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var precision = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 5;

  if (expected === null) expected = fixture;

  var out = (0, _2.default)(fixture, precision);
  t.deepEqual(out, expected);
}

function testThrows(t, fixture, expected) {
  var precision = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 5;

  t.throws(function () {
    return (0, _2.default)(fixture, precision);
  }, expected);
}

(0, _ava2.default)('should reduce simple calc (1)', testFixture, 'calc(1px + 1px)', '2px');

(0, _ava2.default)('should reduce simple calc (2)', testFixture, 'calc(3em - 1em)', '2em');

(0, _ava2.default)('should reduce simple calc (3)', testFixture, 'calc(1rem * 1.5)', '1.5rem');

(0, _ava2.default)('should reduce simple calc (4)', testFixture, 'calc(2ex / 2)', '1ex');

(0, _ava2.default)('should ignore value surrounding calc function (1)', testFixture, 'a calc(1px + 1px)', 'a 2px');

(0, _ava2.default)('should ignore value surrounding calc function (2)', testFixture, 'calc(1px + 1px) a', '2px a');

(0, _ava2.default)('should ignore value surrounding calc function (3)', testFixture, 'a calc(1px + 1px) b', 'a 2px b');

(0, _ava2.default)('should ignore value surrounding calc function (4)', testFixture, 'a calc(1px + 1px) b calc(1em + 2em) c', 'a 2px b 3em c');

(0, _ava2.default)('should reduce calc with newline characters', testFixture, 'calc(\n1rem \n* 2 \n* 1.5)', '3rem');

(0, _ava2.default)('should preserve calc with incompatible units', testFixture, 'calc(100% + 1px)', 'calc(100% + 1px)');

(0, _ava2.default)('should parse fractions without leading zero', testFixture, 'calc(2rem - .14285em)', 'calc(2rem - 0.14285em)');

(0, _ava2.default)('should handle precision correctly (1)', testFixture, 'calc(1/100)', '0.01');

(0, _ava2.default)('should handle precision correctly (2)', testFixture, 'calc(5/1000000)', '0.00001');

(0, _ava2.default)('should handle precision correctly (3)', testFixture, 'calc(5/1000000)', '0.000005', 6);

(0, _ava2.default)('should reduce browser-prefixed calc (1)', testFixture, '-webkit-calc(1px + 1px)', '2px');

(0, _ava2.default)('should reduce browser-prefixed calc (2)', testFixture, '-moz-calc(1px + 1px)', '2px');

(0, _ava2.default)('should discard zero values (#2) (1)', testFixture, 'calc(100vw / 2 - 6px + 0px)', 'calc(50vw - 6px)');

(0, _ava2.default)('should discard zero values (#2) (2)', testFixture, 'calc(500px - 0px)', '500px');

(0, _ava2.default)('should not perform addition on unitless values (#3)', testFixture, 'calc(1px + 1)', 'calc(1px + 1)');

(0, _ava2.default)('should produce simpler result (postcss-calc#25) (1)', testFixture, 'calc(14px + 6 * ((100vw - 320px) / 448))', 'calc(9.71px + 1.34vw)', 2);

(0, _ava2.default)('should produce simpler result (postcss-calc#25) (2)', testFixture, '-webkit-calc(14px + 6 * ((100vw - 320px) / 448))', '-webkit-calc(9.71px + 1.34vw)', 2);

(0, _ava2.default)('should reduce mixed units of time (postcss-calc#33)', testFixture, 'calc(1s - 50ms)', '0.95s');

(0, _ava2.default)('should correctly reduce calc with mixed units (cssnano#211)', testFixture, 'bar:calc(99.99% * 1/1 - 0rem)', 'bar:99.99%');

(0, _ava2.default)('should apply algebraic reduction (cssnano#319)', testFixture, 'bar:calc((100px - 1em) + (-50px + 1em))', 'bar:50px');

(0, _ava2.default)('should apply optimization (cssnano#320)', testFixture, 'bar:calc(50% + (5em + 5%))', 'bar:calc(55% + 5em)');

(0, _ava2.default)('should throw an exception when attempting to divide by zero', testThrows, 'calc(500px/0)', /Cannot divide by zero/);

(0, _ava2.default)('should throw an exception when attempting to divide by unit', testThrows, 'calc(500px/2px)', 'Cannot divide by "px", number expected');