import path from 'path'

export default function () {
  function extFix (ext) {
    return ext.charAt(0) === '.' ? ext : ('.' + ext)
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
            console.error(`Nodepath: ${nodePath}`)
            const arg = nodePath.get('arguments')[0]
            if (arg && arg.isStringLiteral() && extensions.indexOf(path.extname(arg.node.value)) > -1) {
              if (nodePath.parentPath.isVariableDeclarator()) {
                throw new Error(`${arg.node.value} should not assign to variable.`)
              } else {
                nodePath.remove()
              }
            }
          }
        }
      }
    }
  }
}
