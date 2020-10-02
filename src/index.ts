import { Plugin } from "rollup";
import { Node } from "estree";
import { walk } from "estree-walker";
import MagicString from "magic-string";

enum NodeType {
  Literal = "Literal",
  CallExpression = "CallExpression",
  Identifier = "Identifier",
  ImportDeclaration = "ImportDeclaration",
}

function isEmpty(array: any[] | undefined) {
  return !array || array.length === 0;
}

function getRequireSource(node: any): Node | false {
  if (node.type !== NodeType.CallExpression) {
    return false;
  }

  if (node.callee.type !== NodeType.Identifier || isEmpty(node.arguments)) {
    return false;
  }

  const args = node.arguments;

  if (node.callee.name !== "require" || args[0].type !== NodeType.Literal) {
    return false;
  }

  return args[0];
}

function getImportSource(node: any): Node | false {
  if (
    node.type !== NodeType.ImportDeclaration ||
    node.source.type !== NodeType.Literal
  ) {
    return false;
  }

  return node.source;
}

const importNodeTypes = [NodeType.ImportDeclaration, NodeType.CallExpression];

const plugin = (moduleName: string = "external"): Plugin => {
  return {
    name: "rename-external-node-modules",
    generateBundle(_, bundle) {
      const changedFiles: string[] = [];
      Object.entries(bundle).forEach(([fileName, chunkInfo]) => {
        if (fileName.includes("node_modules")) {
          const newFileName = fileName.replace("node_modules", moduleName);
          chunkInfo.fileName = newFileName;
          changedFiles.push(fileName);
        }
        if ("code" in chunkInfo) {
          if (chunkInfo.imports.some((i) => i.includes("node_modules"))) {
            const magicString = new MagicString(chunkInfo.code);
            const ast = this.parse(chunkInfo.code, {
              ecmaVersion: 6,
              sourceType: "module",
            });

            walk(ast, {
              enter(node) {
                if (importNodeTypes.includes(node.type as NodeType)) {
                  const req: any =
                    getRequireSource(node) || getImportSource(node);

                  if (req) {
                    const { start, end } = req;
                    if (req.value.includes("node_modules")) {
                      console.log(node);
                    }
                    const newPath = req.value.replace(
                      "node_modules",
                      moduleName
                    );

                    magicString.overwrite(start, end, `'${newPath}'`);
                  }
                }
              },
            });

            chunkInfo.map = magicString.generateMap();
            chunkInfo.code = magicString.toString();
          }
        }
      });
    },
  };
};

export default plugin;
