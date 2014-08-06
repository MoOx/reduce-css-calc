var test = require("tape")
var reduceCSSCalc = require("..")

test("throws an syntax error if a parenthese is missing", function(t) {
  t.throws(function() { reduceCSSCalc("calc(")}, SyntaxError)
  t.throws(function() { reduceCSSCalc("calc((2 + 1)")}, SyntaxError)
  t.throws(function() { reduceCSSCalc("a calc(calc(2 + 1) b()")}, SyntaxError)
  t.end()
})

test("throws an error if a calc() is empty", function(t) {
  t.throws(function() { reduceCSSCalc("calc()")}, Error)
  t.throws(function() { reduceCSSCalc("calc(2 + ())")}, SyntaxError)
  t.throws(function() { reduceCSSCalc("calc(2 + calc())")}, SyntaxError)
  t.end()
})

test("complete reduce for simple css calc()", function(t) {
  t.equal(reduceCSSCalc("calc(1 + 1)"), "2", "addition")
  t.equal(reduceCSSCalc("calc(1 - 1)"), "0", "substraction")
  t.equal(reduceCSSCalc("calc(2 * 2)"), "4", "multiplication")
  t.equal(reduceCSSCalc("calc(8 / 2)"), "4", "division")
  t.equal(reduceCSSCalc("calc((6 / 2) - (4 * 2) + 1)"), "-4", "embed operations")
  t.end()
})

test("complete reduce for css calc() with a single unit", function(t) {
  t.equal(reduceCSSCalc("calc(3px * 2 - 1px)"), "5px", "px")
  t.equal(reduceCSSCalc("calc(3rem * 2 - 1rem)"), "5rem", "rem")
  t.equal(reduceCSSCalc("calc(3em * 2 - 1em)"), "5em", "em")
  t.equal(reduceCSSCalc("calc(3pt * 2 - 1pt)"), "5pt", "pt")
  t.equal(reduceCSSCalc("calc(3vh * 2 - 1vh)"), "5vh", "vh")
  t.end()
})

test("complete & accurate reduce for css calc() with percentages", function(t) {
  t.equal(reduceCSSCalc("calc(2 * 50%)"), "100%", "integer * percentage")
  t.equal(reduceCSSCalc("calc(120% * 50%)"), "60%", "percentage * percentage")
  t.end()
})

test("ignore value around css calc() functions ", function(t) {
  t.equal(reduceCSSCalc("calc(1 + 1) a"), "2 a", "value after")
  t.equal(reduceCSSCalc("a calc(1 + 1)"), "a 2", "value before")
  t.equal(reduceCSSCalc("calc(1 + 1) a calc(1 - 1)"), "2 a 0", "value between 2 calc()")
  t.equal(reduceCSSCalc("a calc(1 + 1) b calc(1 - 1)"), "a 2 b 0", "value before & between 2 calc()")
  t.equal(reduceCSSCalc("a calc(1 + 1) b calc(1 - 1) c"), "a 2 b 0 c", "value before, between & after 2 calc()")
  t.end()
})

test("reduce complexe css calc()", function(t) {
  t.equal(reduceCSSCalc("calc(calc(100 + 10) + 1)"), "111", "integer")
  t.equal(reduceCSSCalc("calc(calc(calc(1rem * 0.75) * 1.5) - 1rem)"), "0.125rem", "with a single unit")
  t.equal(reduceCSSCalc("calc(calc(calc(1rem * 0.75) * 1.5) - 1px)"), "calc(1.125rem - 1px)", "multiple units with explicit calc")
  t.equal(reduceCSSCalc("calc(((1rem * 0.75) * 1.5) - 1px)"), "calc(1.125rem - 1px)", "multiple units with implicit calc")
  t.equal(reduceCSSCalc("calc(-1px + (1.5 * (1rem * 0.75)))"), "calc(-1px + 1.125rem)", "multiple units with implicit calc, reverse order")
  t.equal(reduceCSSCalc("calc(2rem * (2 * (2 + 3)) + 4 + (5/2))"), "26.5rem", "complex math formula works correctly")

  t.equal(reduceCSSCalc("calc((4 * 2) + 4.2 + 1 + (2rem * .4) + (2px * .4))"), "calc(8 + 4.2 + 1 + 0.8rem + 0.8px)", "handle long formula")
  t.end()
})

test("reduce prefixed css calc()", function(t) {
  t.equal(reduceCSSCalc("-webkit-calc(120% * 50%)"), "60%", "-webkit, complete reduce")
  t.equal(reduceCSSCalc("-webkit-calc(100% - 2em)"), "-webkit-calc(100% - 2em)", "-webkit, multiple unit")

  t.equal(reduceCSSCalc("-moz-calc(100px / 2)"), "50px", "-moz, complete reduce")
  t.equal(reduceCSSCalc("-moz-calc(50% - 2em)"), "-moz-calc(50% - 2em)","-moz, multiple unit")
  t.end()
})

test("ignore unrecognized values", function(t) {
  t.equal(reduceCSSCalc("calc((4px * 2) + 4.2 + a1 + (2rem * .4))"), "calc(8px + 4.2 + a1 + 0.8rem)", "ignore when eval fail")
  t.end()
})
