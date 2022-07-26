import generateLib from '@babel/generator';
import type { GeneratorResult } from '@babel/generator';
import { parse } from '@babel/parser';
import traverseLib from '@babel/traverse';
import type { NodePath } from '@babel/traverse';
import {
  stringLiteral,
  isIdentifier,
  identifier,
  isProgram,
  callExpression,
  ArrowFunctionExpression,
  CallExpression,
  VariableDeclarator,
  isVariableDeclarator,
  importDeclaration,
  importSpecifier,
} from '@babel/types';

const traverse = traverseLib.default;
const generate = generateLib.default;

export interface InjectSsrContextOptions {
  code: string;
  moduleId: string;
}

export interface InjectSsrContextResult {
  code: string;
  map: GeneratorResult['map'];
}

const COMPONENT_NAME_REGEX = /^[A-Z]/;
const withSsrContextIdentifier = identifier('withSsrContext');
const virtualModuleName = stringLiteral('virtual:react-ssr-context');

const injectImportStatement = (path: NodePath) => {
  const program = path.findParent((path) => path.isProgram());

  if (program && isProgram(program.node)) {
    const contextImportStatement = importDeclaration(
      [importSpecifier(withSsrContextIdentifier, withSsrContextIdentifier)],
      virtualModuleName,
    );

    program.node.body.unshift(contextImportStatement);
  }
};

const containsJsxElement = (path: NodePath): boolean => {
  let hasJsx = false;

  path.traverse({
    JSXElement(path) {
      hasJsx = true;
      path.stop();
    },
  });

  return hasJsx;
};

const getDeclaratorForFunctionalComponent = (
  path: NodePath<ArrowFunctionExpression>,
): VariableDeclarator | undefined => {
  const variableDeclaratorPath = path.findParent(
    (path) =>
      path.isVariableDeclarator() &&
      isIdentifier(path.node.id) &&
      COMPONENT_NAME_REGEX.test(path.node.id.name),
  );

  if (variableDeclaratorPath && isVariableDeclarator(variableDeclaratorPath.node)) {
    return variableDeclaratorPath.node;
  }

  return undefined;
};

const wrapWithSsrContextHoc = (fn: ArrowFunctionExpression, moduleId: string): CallExpression => {
  const moduleIdCallExpression = callExpression(withSsrContextIdentifier, [
    stringLiteral(moduleId),
  ]);

  return callExpression(moduleIdCallExpression, [fn]);
};

export const injectSsrContext = ({
  code,
  moduleId,
}: InjectSsrContextOptions): InjectSsrContextResult => {
  const ast = parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] });

  let hasInjectedImport = false;

  traverse(ast, {
    ArrowFunctionExpression(path) {
      const declarator = getDeclaratorForFunctionalComponent(path);

      if (!declarator || !containsJsxElement(path)) {
        // Probably not a functional component.
        return;
      }

      // Replace the component fn with one wrapped in the HOC.
      const wrappedComponent = wrapWithSsrContextHoc(path.node, moduleId);
      declarator.init = wrappedComponent;

      if (!hasInjectedImport) {
        // Inject the import statement once per file.
        injectImportStatement(path);
        hasInjectedImport = true;
      }
    },
    // TODO: Support function declarations and function expressions.
    // FunctionDeclaration(path) {
    //   if (!hasCapitalisedFunctionName(path)) {
    //     return;
    //   }

    //   if (!containsJsxElement(path)) {
    //     return;
    //   }

    //   const wrappedFunction = createWithCss(path.node);
    //   const variableDeclarator = getDeclarator(path);
    //   variableDeclarator.init = wrappedFunction;

    //   injectImportStatement(path);
    // },
  });

  const output = generate(
    ast,
    {
      retainLines: false,
    },
    code,
  );

  return {
    code: output.code,
    map: output.map,
  };
};
