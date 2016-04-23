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
  t.equal(reduceCSSCalc("calc((2 * 100) / 12)"), reduceCSSCalc("calc((100 / 12) * 2)", "indentical, wrong rounded")
  t.end()
})

test("reduce prefixed css calc()", function(t) {
  t.equal(reduceCSSCalc("-webkit-calc(120% * 50%)"), "60%", "-webkit, complete reduce")
  t.equal(reduceCSSCalc("-webkit-calc(100% - 2em)"), "-webkit-calc(100% - 2em)", "-webkit, multiple unit")

  t.equal(reduceCSSCalc("-moz-calc(100px / 2)"), "50px", "-moz, complete reduce")
  t.equal(reduceCSSCalc("-moz-calc(50% - 2em)"), "-moz-calc(50% - 2em)","-moz, multiple unit")

  t.equal(reduceCSSCalc("-webkit-calc(calc(-moz-calc(1rem * 0.75) * 1.5) - 1px)"), "-webkit-calc(1.125rem - 1px)", "complex prefixed formula")

  t.end()
})

test("handle rounding issues", function(t) {
  t.equal(reduceCSSCalc("calc(10% * 20%)"), "2%", "should round percentage")
  t.equal(reduceCSSCalc("calc(3rem * 1.2)"), "3.6rem", "should round floats")
  t.equal(reduceCSSCalc("calc(1/3)"), "0.33333", "should round with default precision to 5 decimals")
  t.equal(reduceCSSCalc("calc(1/3)", 10), "0.3333333333", "should round with desired precision (10)")
  t.equal(reduceCSSCalc("calc(3 * 1.2)", 0), "4", "should round with desired precision (O)")
  t.end()
})

test("ignore unrecognized values", function(t) {
  t.equal(reduceCSSCalc("calc((4px * 2) + 4.2 + a1 + (2rem * .4))"), "calc(8px + 4.2 + a1 + 0.8rem)", "ignore when eval fail")

  t.equal(reduceCSSCalc("calc(z)"), "calc(z)", "ignore when there is something unknow")

  t.equal(reduceCSSCalc("calc((a) + 1)"), "calc((a) + 1)", "ignore when there is something unknow in ( )")

  t.equal(reduceCSSCalc("calc(1 (a))"), "calc(1 (a))", "ignore when there is something unknow in ( ) after something else")

  t.equal(reduceCSSCalc("calc(b(a) + 1)"), "calc(b(a) + 1)", "ignore when there is unknown function used")

  t.equal(reduceCSSCalc("calc(var(--foo) + 10px)"), "calc(var(--foo) + 10px)", "ignore when there is css var() at the beginning")
  t.equal(reduceCSSCalc("calc(10px + var(--foo))"), "calc(10px + var(--foo))", "ignore when there is css var() at the end")
  t.equal(reduceCSSCalc("calc(10px + var(--foo) + 2)"), "calc(10px + var(--foo) + 2)", "ignore when there is css var() in the middle")

  t.equal(reduceCSSCalc("calc((4px + 8px) + --foo + (10% * 20%))"), "calc(12px + --foo + 2%)", "ignore unrecognized part")
  t.equal(reduceCSSCalc("calc((4px + 8px) + (--foo) + (10% * 20%))"), "calc(12px + (--foo) + 2%)", "ignore unrecognized part between parenthesis")
  t.equal(reduceCSSCalc("calc((4px + 8px) + var(--foo) + (10% * 20%))"), "calc(12px + var(--foo) + 2%)", "ignore unrecognized function")

  t.equal(reduceCSSCalc("calc(calc(4px + 8px) + calc(var(--foo) + 10px) + calc(10% * 20%))"), "calc(12px + calc(var(--foo) + 10px) + 2%)", "ignore unrecognized nested call")

  t.equal(reduceCSSCalc("calc(100% - var(--my-var))"), "calc(100% - var(--my-var))", "should not try to reduce 100% - var");
  t.end()
})

test("non-lowercase units", function(t) {
  t.equal(reduceCSSCalc("calc(1PX)"), "1PX", "all uppercase");
  t.equal(reduceCSSCalc("calc(1Px)"), "1Px", "first letter uppercase");
  t.equal(reduceCSSCalc("calc(50% - 42Px)"), "calc(50% - 42Px)", "preserves percentage");
  t.equal(reduceCSSCalc("calc(1Px + 1pX)"), "2Px", "combines same units mixed case");

  t.end()
})
