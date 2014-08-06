/**
 * Module dependencies
 */
var balanced = require("balanced-match")
var reduceFunctionCall = require("reduce-function-call")

/**
 * Expose reduceCSSCalc plugin
 *
 * @type {Function}
 */
module.exports = reduceCSSCalc

/**
 * Reduce CSS calc() in a string, whenever it's possible
 *
 * @param {String} value css input
 */
function reduceCSSCalc(value) {
  return reduceFunctionCall(value, /((?:\-[a-z]+\-)?calc)\(/, evaluateExpression)
}

/**
 * Evaluates an expression
 *
 * @param {String} expression
 * @returns {String}
 * @api private
 */

function evaluateExpression (expression, functionIdentifier, call) {
  if (expression === "") {
    throw new Error(functionIdentifier + "(): '" + call + "' must contain a non-whitespace string")
  }

  var balancedExpr = balanced("(", ")", expression)
  while (balancedExpr) {
    if (balancedExpr.body === "") {
      throw new Error(functionIdentifier + "(): '" + expression + "' must contain a non-whitespace string")
    }

    var evaluated = evaluateExpression(balancedExpr.body, functionIdentifier, call)

    // if result didn't change since the last try, we consider it won't change anymore
    if (evaluated === balancedExpr.body) {
      balancedExpr = false
    }
    else {
      expression = balancedExpr.pre + evaluated + balancedExpr.post
      balancedExpr = balanced("(", ")", expression)
    }
  }

  var units = getUnitsInExpression(expression)

  // If multiple units let the expression be (i.e. browser calc())
  if (units.length > 1) {
    return functionIdentifier + "(" + expression + ")"
  }

  var unit = units[0] || ""

  if (unit === "%") {
    // Convert percentages to numbers, to handle expressions like: 50% * 50% (will become: 25%):
    expression = expression.replace(/\b[0-9\.]+%/g, function(percent) {
      return parseFloat(percent.slice(0, -1)) * 0.01
    })
  }

  // Remove units in expression:
  var toEvaluate = expression.replace(new RegExp(unit, "g"), "")
  var result

  try {
    result = eval(toEvaluate)
  }
  catch (e) {
    return functionIdentifier + "(" + expression + ")"
  }

  // Transform back to a percentage result:
  if (unit === "%") {
    result *= 100
  }

  // We don't need units for zero values...
  if (result !== 0) {
    result += unit
  }

  return result
}

/**
 * Checks what units are used in an expression
 *
 * @param {String} expression
 * @returns {Array}
 * @api private
 */

function getUnitsInExpression(expression) {
  var uniqueUnits = []
  var unitRegEx = /[\.0-9]([%a-z]+)/g
  var matches = unitRegEx.exec(expression)

  while (matches) {
    if (!matches || !matches[1]) {
      continue
    }

    if (uniqueUnits.indexOf(matches[1]) === -1) {
      uniqueUnits.push(matches[1])
    }

    matches = unitRegEx.exec(expression)
  }

  return uniqueUnits
}
