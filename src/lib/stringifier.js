const order = {
  "*": 0,
  "/": 0,
  "+": 1,
  "-": 1
}

function round(value, prec) {
  if (prec !== false) {
    const precision = Math.pow(10, prec)
    return Math.round(value * precision) / precision
  }
  return value
}

function stringify(node, prec) {
  switch (node.type) {
    case "MathExpression": {
      const {left, right, operator: op} = node
      let str = ""

      if (left.type === 'MathExpression' && order[op] < order[left.operator])
        str += "(" + stringify(left, prec) + ")"
      else
        str += stringify(left, prec)

      str += " " + node.operator + " "

      if (right.type === 'MathExpression' && order[op] < order[right.operator])
        str += "(" + stringify(right, prec) + ")"
      else
        str += stringify(right, prec)

      return str
    }
    case "Value":
      return round(node.value, prec)
    default:
      return round(node.value, prec) + node.unit
  }
}

export default function (calc, node, precision) {
  let str = stringify(node, precision)

  if (node.type === "MathExpression") {
    // if calc expression couldn't be resolved to a single value, re-wrap it as
    // a calc()
    str = calc + "(" + str + ")"
  }
  return str
}
