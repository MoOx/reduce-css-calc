import test from 'ava'

import reduceCalc from '..'

function testFixture(t, fixture, expected = null, precision = 5) {
  if (expected === null)
    expected = fixture

  const out = reduceCalc(fixture, precision)
  t.deepEqual(out, expected)
}

function testThrows(t, fixture, expected, precision = 5) {
  t.throws(() => reduceCalc(fixture, precision), expected)
}

test(
  'should reduce simple calc (1)',
  testFixture,
  'calc(1px + 1px)',
  '2px'
)

test(
  'should reduce simple calc (2)',
  testFixture,
  'calc(3em - 1em)',
  '2em'
)

test(
  'should reduce simple calc (3)',
  testFixture,
  'calc(1rem * 1.5)',
  '1.5rem'
)

test(
  'should reduce simple calc (4)',
  testFixture,
  'calc(2ex / 2)',
  '1ex'
)

test(
  'should ignore value surrounding calc function (1)',
  testFixture,
  'a calc(1px + 1px)',
  'a 2px'
)

test(
  'should ignore value surrounding calc function (2)',
  testFixture,
  'calc(1px + 1px) a',
  '2px a'
)

test(
  'should ignore value surrounding calc function (3)',
  testFixture,
  'a calc(1px + 1px) b',
  'a 2px b'
)

test(
  'should ignore value surrounding calc function (4)',
  testFixture,
  'a calc(1px + 1px) b calc(1em + 2em) c',
  'a 2px b 3em c'
)

test(
  'should reduce calc with newline characters',
  testFixture,
  'calc(\n1rem \n* 2 \n* 1.5)',
  '3rem'
)

test(
  'should preserve calc with incompatible units',
  testFixture,
  'calc(100% + 1px)',
  'calc(100% + 1px)'
)

test(
  'should parse fractions without leading zero',
  testFixture,
  'calc(2rem - .14285em)',
  'calc(2rem - 0.14285em)'
)

test(
  'should handle precision correctly (1)',
  testFixture,
  'calc(1/100)',
  '0.01'
)

test(
  'should handle precision correctly (2)',
  testFixture,
  'calc(5/1000000)',
  '0.00001'
)

test(
  'should handle precision correctly (3)',
  testFixture,
  'calc(5/1000000)',
  '0.000005',
  6
)

test(
  'should reduce browser-prefixed calc (1)',
  testFixture,
  '-webkit-calc(1px + 1px)',
  '2px'
)

test(
  'should reduce browser-prefixed calc (2)',
  testFixture,
  '-moz-calc(1px + 1px)',
  '2px'
)

test(
  'should discard zero values (#2) (1)',
  testFixture,
  'calc(100vw / 2 - 6px + 0px)',
  'calc(50vw - 6px)'
)

test(
  'should discard zero values (#2) (2)',
  testFixture,
  'calc(500px - 0px)',
  '500px'
)

test(
  'should not perform addition on unitless values (#3)',
  testFixture,
  'calc(1px + 1)',
  'calc(1px + 1)'
)


test(
  'should produce simpler result (postcss-calc#25) (1)',
  testFixture,
  'calc(14px + 6 * ((100vw - 320px) / 448))',
  'calc(9.71px + 1.34vw)',
  2
)

test(
  'should produce simpler result (postcss-calc#25) (2)',
  testFixture,
  '-webkit-calc(14px + 6 * ((100vw - 320px) / 448))',
  '-webkit-calc(9.71px + 1.34vw)',
  2
)

test(
  'should reduce mixed units of time (postcss-calc#33)',
  testFixture,
  'calc(1s - 50ms)',
  '0.95s'
)

test(
  'should correctly reduce calc with mixed units (cssnano#211)',
  testFixture,
  'bar:calc(99.99% * 1/1 - 0rem)',
  'bar:99.99%'
)

test(
  'should apply algebraic reduction (cssnano#319)',
  testFixture,
  'bar:calc((100px - 1em) + (-50px + 1em))',
  'bar:50px'
)

test(
  'should apply optimization (cssnano#320)',
  testFixture,
  'bar:calc(50% + (5em + 5%))',
  'bar:calc(55% + 5em)'
)

test(
  'should throw an exception when attempting to divide by zero',
  testThrows,
  'calc(500px/0)',
  /Cannot divide by zero/
)

test(
  'should throw an exception when attempting to divide by unit (#1)',
  testThrows,
  'calc(500px/2px)',
  'Cannot divide by "px", number expected'
)
