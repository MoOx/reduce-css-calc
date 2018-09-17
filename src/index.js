import valueParser from 'postcss-value-parser'

import { parser } from './parser' // eslint-disable-line
import reducer from './lib/reducer'
import stringifier from './lib/stringifier'

const MATCH_CALC = /((?:\-[a-z]+\-)?calc)/

export default (value, precision = 5) => {
  return valueParser(value).walk(node => {
    // skip anything which isn't a calc() function
    if (node.type !== 'function' || !MATCH_CALC.test(node.value))
      return

    // stringify calc expression and produce an AST
    const contents = valueParser.stringify(node.nodes)

    // skip constant() and env()
    if (contents.indexOf('constant') >= 0 || contents.indexOf('env') >= 0) return;

    const ast = parser.parse(contents)

    // reduce AST to its simplest form, that is, either to a single value
    // or a simplified calc expression
    const reducedAst = reducer(ast, precision)

    // stringify AST and write it back
    node.type = 'word'
    node.value = stringifier(node.value, reducedAst, precision)

  }, true).toString()
}
