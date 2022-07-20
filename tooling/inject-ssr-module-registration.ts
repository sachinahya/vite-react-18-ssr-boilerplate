import generate, { GeneratorResult } from '@babel/generator';
import { parse } from '@babel/parser';
import template from '@babel/template';
import traverse, { NodePath } from '@babel/traverse';
import {
  stringLiteral,
  Statement,
  isIdentifier,
  isProgram,
  blockStatement,
  returnStatement,
  isBlockStatement,
  ArrowFunctionExpression,
  FunctionDeclaration,
} from '@babel/types';

export interface InjectSsrModuleRegistrationOptions {
  code: string;
  moduleId: string;
}

export interface InjectSsrModuleRegistrationResult {
  code: string;
  map: GeneratorResult['map'];
}

const registerSsrModuleTemplate = template.default('useRegisterSsrModule(MODULE_ID);');
const getRegisterSsrModuleStatement = (moduleId: string): Statement => {
  return registerSsrModuleTemplate({
    MODULE_ID: stringLiteral(moduleId),
  }) as Statement;
};

const contextImportStatement = template.default(
  "import { useRegisterSsrModule } from 'virtual:react-ssr-context';",
)() as Statement;

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

const COMPONENT_NAME_REGEX = /^[A-Z]/;
const hasCapitalisedFunctionName = (
  path: NodePath<ArrowFunctionExpression> | NodePath<FunctionDeclaration>,
): boolean => {
  if (path.isArrowFunctionExpression()) {
    const hasp = path.findParent(
      (path) =>
        path.isVariableDeclarator() &&
        isIdentifier(path.node.id) &&
        COMPONENT_NAME_REGEX.test(path.node.id.name),
    );

    return !!hasp;
  }

  if (path.isFunctionDeclaration()) {
    return COMPONENT_NAME_REGEX.test(path.node.id?.name || '');
  }

  return false;
};

export const injectSsrModuleRegistration = ({
  code,
  moduleId,
}: InjectSsrModuleRegistrationOptions): InjectSsrModuleRegistrationResult => {
  const ast = parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] });

  let hasInjectedImport = false;

  const injectImportStatement = (path: NodePath) => {
    if (!hasInjectedImport) {
      const program = path.findParent((path) => path.isProgram());
      if (program && isProgram(program.node)) {
        program.node.body.unshift(contextImportStatement);
        hasInjectedImport = true;
      }
    }
  };

  traverse.default(ast, {
    ArrowFunctionExpression(path) {
      if (!hasCapitalisedFunctionName(path)) {
        return;
      }

      if (!containsJsxElement(path)) {
        return;
      }

      if (isBlockStatement(path.node.body)) {
        const statement = getRegisterSsrModuleStatement(moduleId);
        path.node.body.body.unshift(statement);
      } else {
        const blockStatement2 = blockStatement([
          getRegisterSsrModuleStatement(moduleId),
          returnStatement(path.node.body),
        ]);
        path.node.body = blockStatement2;
      }

      injectImportStatement(path);
    },
    FunctionDeclaration(path) {
      if (!hasCapitalisedFunctionName(path)) {
        return;
      }

      if (!containsJsxElement(path)) {
        return;
      }

      path.node.body.body.unshift(getRegisterSsrModuleStatement(moduleId));

      injectImportStatement(path);
    },
  });

  const output = generate.default(
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
