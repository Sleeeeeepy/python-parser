import { SyntaxNode } from "@parser/node/ast_node_base";
import { Visitor } from "@interface/visitor";
import { Expression, Literal, Statement, Target, Type } from "./empty_node";
import { Operator } from "@parser/node/operator";

export class Program extends SyntaxNode {
    public variables: VariableDefinition[];
    public classes: ClassDefinition[];
    public statements: Statement[]; // top-level statements
    public functions: FunctionDefinition[];

    public constructor(parent?: SyntaxNode) {
        super(parent);
        this.variables = new Array<VariableDefinition>();
        this.classes = new Array<ClassDefinition>();
        this.statements = new Array<Statement>();
        this.functions = new Array<FunctionDefinition>();
    }

    public toJSON(): object {
        return {
            kind: this.nodeType,
            variables: this.variables,
            classes: this.classes,
            statements: this.statements,
            functions: this.functions
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitProgram(this);
    }
}

export class ClassDefinition extends SyntaxNode {
    public name?: string;
    public base?: string;
    public body?: (VariableDefinition  | FunctionDefinition )[];

    public constructor(parent?: SyntaxNode) {
        super(parent);
        this.body = new Array<VariableDefinition | FunctionDefinition>();
    }

    public toJSON(): object {
        return {
            kind: this.nodeType,
            name: this.name,
            base: this.base,
            body: this.body
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitClassDefinition(this);
    }
}

export class FunctionDefinition extends SyntaxNode {
    public name?: string;
    public args?: TypedVariable[];
    public returnType?: Type;
    public body?: (GlobalDeclaration | NonlocalDeclaration | VariableDefinition  | FunctionDefinition  | Statement)[];
    public isMethod?: boolean;

    public constructor(parent: SyntaxNode) {
        super(parent);
        this.args = new Array<TypedVariable>();
        this.body = new Array<GlobalDeclaration | NonlocalDeclaration | VariableDefinition  | FunctionDefinition  | Statement>();
        this.isMethod = false;
    }

    public toJSON(): object {
        return {
            kind: this.nodeType,
            name: this.name,
            args: this.args,
            returnType: this.returnType,
            body: this.body
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitFunctionDefinition(this);
    }
}

export class TypedVariable extends SyntaxNode {
    public name?: string;
    public type?: Type;

    public toJSON(): object {
        return {
            kind: this.nodeType,
            name: this.name,
            type: this.type
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitTypedVariable(this);
    }
}

export class GlobalDeclaration extends SyntaxNode {
    public name?: string;

    public constructor(parent?: SyntaxNode, name?: string) {
        super(parent);
        this.name = name;
    }

    public toJSON(): object {
        return {
            kind: this.nodeType,
            name: this.name
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitGlobalDeclaration(this);
    }
}

export class NonlocalDeclaration extends SyntaxNode {
    public name?: string;

    public constructor(parent?: SyntaxNode, name?: string) {
        super(parent);
        this.name = name;
    }

    public toJSON(): object {
        return {
            kind: this.nodeType,
            name: this.name
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitNonlocalDeclaration(this);
    }
}

export class VariableDefinition  extends SyntaxNode {
    public name?: string;
    public value?: Literal;
    public type?: TypedVariable;

    public toJSON(): object {
        return {
            kind: this.nodeType,
            name: this.name,
            value: this.value,
            type: this.type
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitVariableDefinition(this);
    }
}

export class AssignStatement extends Statement {
    public targets?: Target[];
    public body?: Expression;

    public constructor(parent?: SyntaxNode) {
        super(parent);
        this.targets = new Array<Target>();
    }

    public toJSON(): object {
        return {
            kind: this.nodeType,
            targets: this.targets,
            body: this.body
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitAssignStatement(this);
    }
}

export class SimpleExpressionStatement extends Statement {
    public body?: Expression;
    
    public toJSON(): object {
        return {
            kind: this.nodeType,
            body: this.body
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitSimpleStatement(this);
    }
}

export class PassStatement extends Statement {
    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitPassStatement(this);
    }
}

export class IfStatement extends Statement {
    public test?: Expression;
    public body?: Statement[];
    public orelse?: ElifStatement[] | null;
    public elseBlock?: Statement[] | null;

    public toJSON(): object {
        return {
            kind: this.nodeType,
            test: this.test,
            body: this.body,
            elif: this.orelse,
            else: this.elseBlock
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitIfStatement(this);
    }
}

export class ElifStatement extends Statement {
    public test?: Expression;
    public body?: Statement[];

    public toJSON(): object {
        return {
            kind: this.nodeType,
            test: this.test,
            body: this.body
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitElifStatement(this);
    }
}
export class WhileStatement extends Statement {
    public test?: Expression;
    public body?: Statement[];

    public toJSON(): object {
        return {
            kind: this.nodeType,
            test: this.test,
            body: this.body
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitWhileStatement(this);
    }
}

export class ForStatement extends Statement {
    public target?: string;
    public iter?: Expression;
    public body?: Statement[];

    public toJSON(): object {
        return {
            kind: this.nodeType,
            target: this.target,
            iter: this.iter,
            body: this.body
        };
    }
    
    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitForStatement(this);
    }
}

export class ExpressionStatement extends Statement {
    public value?: Expression;

    public toJSON(): object {
        return {
            kind: this.nodeType,
            value: this.value
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpressionStatement(this);
    }
}

export class ReturnStatement extends Statement {
    public value?: Expression;

    public toJSON(): object {
        return {
            kind: this.nodeType,
            value: this.value
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitReturnStatement(this);
    }
}

export class Identifier extends Expression {
    public name?: string;

    public constructor(parent?: SyntaxNode, name?: string) {
        super(parent);
        this.name = name;
    }

    public toJSON(): object {
        return {
            kind: this.nodeType,
            name: this.name
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitIdentifier(this);
    }
}

export class MemberExpression extends Target {
    public object?: Expression;
    public member?: string;

    public constructor(parent?: SyntaxNode, object?: Expression, member?: string) {
        super(parent);
        this.object = object;
        this.member = member;
    }

    public toJSON(): object {
        return {
            kind: this.nodeType,
            object: this.object,
            member: this.member
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitMemberExpression(this);
    }
}

export class IndexExpression extends Target {
    public object?: Expression;
    public index?: Expression;

    public constructor(parent?: SyntaxNode, object?: Expression, index?: Expression) {
        super(parent);
        this.object = object;
        this.index = index;
    }

    public toJSON(): object {
        return {
            kind: this.nodeType,
            object: this.object,
            index: this.index
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitIndexExpression(this);
    }
}

export class UnaryExpression extends Expression {
    public operator?: Operator;
    public argument?: Expression;

    public toJSON(): object {
        return {
            kind: this.nodeType,
            operator: this.operator,
            arguments: this.argument
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitUnaryExpression(this);
    }
}

export class BinaryExpression extends Expression {
    public operator?: Operator;
    public left?: Expression;
    public right?: Expression;

    public toJSON(): object {
        return {
            kind: this.nodeType,
            left: this.left,
            operator: this.operator,
            right: this.right
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitBinaryExpression(this);
    }
}

export class ConditionalExpression extends Expression {
    public test?: Expression;
    public consequent?: Expression;
    public alternate?: Expression;

    public toJSON(): object {
        return {
            kind: this.nodeType,
            test: this.test,
            consequent: this.consequent,
            alternate: this.alternate
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitConditionalExpression(this);
    }
}

export class CallExpression extends Expression {
    public name?: Expression;
    public parameter?: Expression[];

    public constructor(parent?: SyntaxNode) {
        super(parent);
        this.parameter ??= new Array<Expression>();
    }

    public toJSON(): object {
        return {
            kind: this.nodeType,
            name: this.name,
            parameter: this.parameter
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitCallExpression(this);
    }
}



export class NoneLiteral extends Literal {
    public toJSON(): object {
        return {
            kind: this.nodeType
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitNoneLiteral(this);
    }
}

export class BoolLiteral extends Literal {
    public value?: boolean;

    public constructor(parent?: SyntaxNode, value?: boolean) {
        super(parent);
        this.value = value;
    }

    public toJSON(): object {
        return {
            kind: this.nodeType,
            value: this.value
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitBoolLiteral(this);
    }
}

export class IntLiteral extends Literal {
    public value?: number;

    public constructor(parent?: SyntaxNode, value?: number) {
        super(parent);
        this.value = value;
    }

    public toJSON(): object {
        return {
            kind: this.nodeType,
            value: this.value
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitIntLiteral(this);
    }
}

export class StringLiteral extends Literal {
    public value?: string;

    public constructor(parent?: SyntaxNode, value?: string) {
        super(parent);
        this.value = value;
    }

    public toJSON(): object {
        return {
            kind: this.nodeType,
            value: this.value
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStringLiteral(this);
    }
}

export class ListLiteral extends Literal {
    public elements?: Expression[] | null;

    public constructor(parent?: SyntaxNode, elements?: Expression[]) {
        super(parent);
        this.elements = elements;
        this.elements ??= new Array<Expression>();
    }

    public toJSON(): object {
        return {
            kind: this.nodeType,
            value: this.elements
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitListLiteral(this);
    }
}



export class IdentifierType extends Type {
    public name?: string;

    public toJSON(): object {
        return {
            kind: this.nodeType,
            name: this.name
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitIdentifierType(this);
    }
}

export class ListType extends Type {
    public elementType?: Type;

    public toJSON(): object {
        return {
            kind: this.nodeType,
            elementType: this.elementType
        };
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitListType(this);
    }
}