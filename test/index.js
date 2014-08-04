var test = require("tape")
var reduceCssCalc = require("..")

test("throws an syntax error if a parenthese is missing", function(t) {
  t.throws(function() { reduceCssCalc("calc(")}, SyntaxError)
  t.throws(function() { reduceCssCalc("calc((2 + 1)")}, SyntaxError)
  t.throws(function() { reduceCssCalc("a calc(calc(2 + 1) b()")}, SyntaxError)
  t.end()
})

test("throws an error if a calc() is empty", function(t) {
  t.throws(function() { reduceCssCalc("calc()")}, Error)
  t.throws(function() { reduceCssCalc("calc(2 + ())")}, SyntaxError)
  t.throws(function() { reduceCssCalc("calc(2 + calc())")}, SyntaxError)
  t.end()
})

test("complete reduce for simple css calc()", function(t) {
  t.equal(reduceCssCalc("calc(1 + 1)"), "2", "addition")
  t.equal(reduceCssCalc("calc(1 - 1)"), "0", "substraction")
  t.equal(reduceCssCalc("calc(2 * 2)"), "4", "multiplication")
  t.equal(reduceCssCalc("calc(8 / 2)"), "4", "division")
  t.equal(reduceCssCalc("calc((6 / 2) - (4 * 2) + 1)"), "-4", "embed operations")
  t.end()
})

test("complete reduce for css calc() with a single unit", function(t) {
  t.equal(reduceCssCalc("calc(3px * 2 - 1px)"), "5px", "px")
  t.equal(reduceCssCalc("calc(3rem * 2 - 1rem)"), "5rem", "rem")
  t.equal(reduceCssCalc("calc(3em * 2 - 1em)"), "5em", "em")
  t.equal(reduceCssCalc("calc(3pt * 2 - 1pt)"), "5pt", "pt")
  t.equal(reduceCssCalc("calc(3vh * 2 - 1vh)"), "5vh", "vh")
  t.end()
})

test("complete & accurate reduce for css calc() with percentages", function(t) {
  t.equal(reduceCssCalc("calc(2 * 50%)"), "100%", "integer * percentage")
  t.equal(reduceCssCalc("calc(120% * 50%)"), "60%", "percentage * percentage")
  t.end()
})

test("ignore value around css calc() functions ", function(t) {
  t.equal(reduceCssCalc("calc(1 + 1) a"), "2 a", "value after")
  t.equal(reduceCssCalc("a calc(1 + 1)"), "a 2", "value before")
  t.equal(reduceCssCalc("calc(1 + 1) a calc(1 - 1)"), "2 a 0", "value between 2 calc()")
  t.equal(reduceCssCalc("a calc(1 + 1) b calc(1 - 1)"), "a 2 b 0", "value before & between 2 calc()")
  t.equal(reduceCssCalc("a calc(1 + 1) b calc(1 - 1) c"), "a 2 b 0 c", "value before, between & after 2 calc()")
  t.end()
})

test("reduce complexe css calc()", function(t) {
  t.equal(reduceCssCalc("calc(calc(100 + 10) + 1)"), "111", "integer")
  t.equal(reduceCssCalc("calc(calc(calc(1rem * 0.75) * 1.5) - 1rem)"), "0.125rem", "with a single unit")
  t.equal(reduceCssCalc("calc(calc(calc(1rem * 0.75) * 1.5) - 1px)"), "calc(1.125rem - 1px)", "multiple units")
  t.end()
})

test("reduce prefixed css calc()", function(t) {
  t.equal(reduceCssCalc("-webkit-calc(120% * 50%)"), "60%", "-webkit, complete reduce")
  t.equal(reduceCssCalc("-webkit-calc(100% - 2em)"), "-webkit-calc(100% - 2em)", "-webkit, multiple unit")

  t.equal(reduceCssCalc("-moz-calc(100px / 2)"), "50px", "-moz, complete reduce")
  t.equal(reduceCssCalc("-moz-calc(50% - 2em)"), "-moz-calc(50% - 2em)","-moz, multiple unit")
  t.end()
})
