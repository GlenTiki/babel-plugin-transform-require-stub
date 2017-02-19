import path from 'path'
import _ from 'lodash'

export default function (obj) {
  const t = obj.types
  function extFix (ext) {
    return ext.charAt(0) === '.' ? ext : ('.' + ext)
  }

  function toObjectExpression (obj) {
    return Object.keys(obj).map((key) => t.objectProperty(t.identifier(key), mapProp(obj[key])))
  }

  function toArrayExpression (arr) {
    return arr.map((item) => mapProp(item))
  }

  function mapProp (prop) {
    if (_.isBoolean(prop)) {
      return t.booleanLiteral(prop)
    } else if (_.isString(prop)) {
      return t.stringLiteral(prop)
    } else if (_.isNumber(prop)) {
      return t.NumericLiteral(prop)
    } else if (_.isPlainObject(prop)) {
      return t.objectExpression(toObjectExpression(prop))
    } else if (_.isArray(prop)) {
      return t.arrayExpression(toArrayExpression(prop))
    } else if (_.isNull(prop)) {
      return t.nullLiteral()
    } else {
      throw new Error(`Unknown type of prop ${prop}`)
    }
  }

  function optionsToExpressionStub (options, value) {
    if (options.path) {
      return t.stringLiteral(value)
    } else if (options.value) {
      return mapProp(options.value)
    } else if (options.file) {
      const filePath = path.isAbsolute(options.file) ? options.file : path.resolve(process.cwd(), options.file)
      return t.callExpression(t.identifier('require'), [t.stringLiteral(filePath)])
    } else {
      throw new Error(`Cant handle properties on options. Expects properties of path, value or file`)
    }
  }

  return {
    visitor: {
      CallExpression: {
        enter (nodePath, { opts }) {
          const extensionsInput = [].concat(opts.extensions || [])
          if (extensionsInput.length === 0) {
            return
          }
          const extensions = extensionsInput.map(extFix)
          const callee = nodePath.get('callee')

          if (callee.isIdentifier() && callee.equals('name', 'require')) {
            const arg = nodePath.get('arguments')[0]
            const ext = path.extname(arg.node.value)
            if (arg && arg.isStringLiteral() && extensions.indexOf(ext) > -1) {
              if (opts[ext]) {
                return nodePath.replaceWith(t.expressionStatement(optionsToExpressionStub(opts[ext])))
              } else if (opts.defaultStub) {
                return nodePath.replaceWith(t.expressionStatement(optionsToExpressionStub(opts.defaultStub)))
              } else {
                return nodePath.replaceWith(t.expressionStatement(t.stringLiteral(arg.node.value)))
              }
            }
          }
        }
      }
    }
  }
}
