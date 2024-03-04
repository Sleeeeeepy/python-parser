import { AssignStatement, BinaryExpression, BoolLiteral, CallExpression, ClassDefinition, ConditionalExpression, ElifStatement, ExpressionStatement, ForStatement, FunctionDefinition, GlobalDeclaration, Identifier, IfStatement, IndexExpression, IntLiteral, ListLiteral, ListType, MemberExpression, NoneLiteral, NonlocalDeclaration, PassStatement, Program, ReturnStatement, SimpleExpressionStatement, StringLiteral, TypedVariable, UnaryExpression, VariableDefinition, WhileStatement } from "@parser/node/ast_node";
import { SyntaxNode } from "@parser/node/ast_node_base";

export interface Visitable {
    accept<T>(visitor: Visitor<T>): T;
}

export interface Visitor<T> {
    visitDefault(node: SyntaxNode): T;
    visitProgram(node: Program): T;
    visitClassDefinition(node: ClassDefinition): T;
    visitFunctionDefinition(node: FunctionDefinition): T;
    visitTypedVariable(node: TypedVariable): T;
    visitGlobalDeclaration(node: GlobalDeclaration): T;
    visitNonlocalDeclaration(node: NonlocalDeclaration): T;
    visitVariableDefinition(node: VariableDefinition): T;
    visitAssignStatement(node: AssignStatement): T;
    visitSimpleStatement(node: SimpleExpressionStatement): T;
    visitPassStatement(node: PassStatement): T;
    visitIfStatement(node: IfStatement): T;
    visitElifStatement(node: ElifStatement): T;
    visitWhileStatement(node: WhileStatement): T;
    visitForStatement(node: ForStatement): T;
    visitExpressionStatement(node: ExpressionStatement): T;
    visitReturnStatement(node: ReturnStatement): T;
    visitIdentifier(node: Identifier): T;
    visitMemberExpression(node: MemberExpression): T;
    visitIndexExpression(node: IndexExpression): T;
    visitUnaryExpression(node: UnaryExpression): T;
    visitBinaryExpression(node: BinaryExpression): T;
    visitConditionalExpression(node: ConditionalExpression): T;
    visitCallExpression(node: CallExpression): T;
    visitNoneLiteral(node: NoneLiteral): T;
    visitBoolLiteral(node: BoolLiteral): T;
    visitIntLiteral(node: IntLiteral): T;
    visitStringLiteral(node: StringLiteral): T;
    visitListLiteral(node: ListLiteral): T;
    visitIdentifierType(node: Identifier): T;
    visitListType(node: ListType): T;
}