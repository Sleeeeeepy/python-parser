
import { SyntaxNode, AbstractSyntaxTree } from "@parser/node/ast_node_base";
import { Token, TokenType } from "@parser/token";
import { CompileError, ParserError } from "@exceptions/exceptions";
import { Program, ClassDefinition, FunctionDefinition, VariableDefinition, GlobalDeclaration, NonlocalDeclaration, IfStatement, ElifStatement, WhileStatement, ForStatement, PassStatement, ReturnStatement, SimpleExpressionStatement, AssignStatement, ConditionalExpression, BinaryExpression, UnaryExpression, CallExpression, IndexExpression, MemberExpression, ListLiteral, Identifier, TypedVariable, IdentifierType, ListType, StringLiteral, IntLiteral, NoneLiteral, BoolLiteral } from "./node/ast_node";
import { Expression, Statement, Type } from "./node/empty_node";
import { Location } from "@parser/token";
import { JsonCustomSerializable } from "@interface/json";
import { Operator, tokenToOperator } from "@parser/node/operator";

export class SyntaxError implements JsonCustomSerializable {
    private _message: string;
    private _startsAt: Location;
    private _endsAt: Location;

    public constructor(message: string, startsAt: Location, endsAt: Location) {
        this._message = message;
        this._startsAt = startsAt.clone();
        this._endsAt = endsAt.clone();
    }

    public get message() {
        return this._message;
    }

    public get startsAt() {
        return this._startsAt.clone();
    }

    public get endsAt() {
        return this._endsAt.clone();
    }

    toJSON(): object {
        return { 
            message: this.message,
            location: [this._startsAt.row, this._startsAt.column, this._endsAt.row, this._endsAt.column]
        };
    }
}

export class Parser {
    private _tokens: ReadonlyArray<Token>;
    private cursor: number;
    private syntaxTree: AbstractSyntaxTree;
    private errors: Array<SyntaxError>;

    public constructor(tokens?: Array<Token>) {
        this._tokens = tokens ?? new Array<Token>();
        this.cursor = 0;
        this.syntaxTree = new AbstractSyntaxTree();
        this.errors = new Array<SyntaxError>();
    }

    public parse() {
        this.syntaxTree.root = this.program();
        return this.syntaxTree;
    }

// #region grammars
    private program(): Program {
        const PROGRAM = new Program();
        
        while (true) {
            let token = this.peek();
            if (this.isMatch(token, TokenType.Class)) {
                PROGRAM.classes.push(this.classDefinition(PROGRAM));
            } else if (this.isMatch(token, TokenType.Def)) {
                PROGRAM.functions.push(this.functionDefinition(PROGRAM));
            } else if (this.isMatch(token, TokenType.ID) &&
                       this.isMatch(this.lookAhead(), TokenType.Colon)) {
                PROGRAM.variables.push(this.variableDefinition(PROGRAM));
            } else if (this.isMatch(token, TokenType.EOF)) {
                break;
            } else if (this.isMatch(token, TokenType.NewLine)) {
                this.consume();
                continue;
            } else {
                PROGRAM.statements.push(this.statement(PROGRAM));
            }
        }
        return PROGRAM
    }

    private classDefinition(parent: SyntaxNode): ClassDefinition {
        const CLASS_DEF = new ClassDefinition(parent);
        this.consumeAndMatch(TokenType.Class);
        const ID = this.consumeAndMatch(TokenType.ID);
        const hasBaseClass = this.peekAndTest(TokenType.LeftParentheses);
        if (hasBaseClass) {
            this.consume();
            const BASE_CLASS_ID = this.consumeAndMatch(TokenType.ID).value;
            CLASS_DEF.base = BASE_CLASS_ID;
            this.consumeAndMatch(TokenType.RightParentheses);
        }

        this.consumeAndMatch(TokenType.Colon);
        this.consumeAndMatch(TokenType.NewLine);
        this.consumeAndMatch(TokenType.Indent);

        CLASS_DEF.name = ID.value;
        CLASS_DEF.body?.push(...this.classBody(CLASS_DEF));
        this.consumeAndMatch(TokenType.Dedent);
        return CLASS_DEF;
    }

    private classBody(parent: ClassDefinition): (FunctionDefinition | VariableDefinition)[] {
        const CLASS_BODY = new Array<FunctionDefinition | VariableDefinition>();
        
        while (true) {
            let token = this.peek();
            if (this.isMatch(token, TokenType.Def)) {
                let funcDef = this.functionDefinition(parent);
                funcDef.isMethod = true;
                CLASS_BODY.push(funcDef);
            }
            else if (this.isMatch(token, TokenType.ID) &&
                     this.isMatch(this.lookAhead(), TokenType.Colon)) {
                CLASS_BODY.push(this.variableDefinition(parent));
            } 
            else if (this.isMatch(token, TokenType.Pass)) {
                if (CLASS_BODY.length !== 0) {
                    throw new ParserError("Unexpected token: Pass", token.position);
                }
                this.consume();
                this.consumeAndMatch(TokenType.NewLine);
                return CLASS_BODY;
            }
            else if (this.isMatch(token, TokenType.Dedent)) {
                break;
            }
            else if (this.isMatch(token, TokenType.NewLine)) {
                this.consume();
            }
            else {
                throw new ParserError("Expected function definition, variable definition, or pass", token.position);
            }
        }

        if (CLASS_BODY.length === 0) {
            throw new ParserError("A class definition requires at least one variable definition or function definition.");
        }
        return CLASS_BODY;
    }

    private functionDefinition(parent: SyntaxNode): FunctionDefinition {
        this.consumeAndMatch(TokenType.Def);
        const ID = this.consumeAndMatch(TokenType.ID).value;
        this.consumeAndMatch(TokenType.LeftParentheses);
        const FUNCTION_DEF = new FunctionDefinition(parent);
        FUNCTION_DEF.name = ID;

        while (true) {
            let token = this.peek();
            if (!this.isMatch(token, TokenType.ID)) {
                break;
            }

            FUNCTION_DEF.args?.push(this.typedVariable(FUNCTION_DEF));
            if (!this.peekAndTest(TokenType.Comma)) {
                break;
            }
            this.consume();
        }

        this.consumeAndMatch(TokenType.RightParentheses);
        
        if (this.peekAndTest(TokenType.Arrow)) {
            this.consume();
            FUNCTION_DEF.returnType = this.type(FUNCTION_DEF);
        }

        this.consumeAndMatch(TokenType.Colon);
        this.consumeAndMatch(TokenType.NewLine);
        this.consumeAndMatch(TokenType.Indent);
        FUNCTION_DEF.body?.push(...this.functionBody(FUNCTION_DEF));
        this.consumeAndMatch(TokenType.Dedent);
        return FUNCTION_DEF;
    }

    private functionBody(parent: SyntaxNode): (FunctionDefinition | VariableDefinition | Statement | GlobalDeclaration | NonlocalDeclaration)[] {
        const FUNCTION_BODY = new Array<FunctionDefinition | VariableDefinition | Statement | GlobalDeclaration | NonlocalDeclaration>();
        let hasStatement = false;
        while (true) {
            let token = this.peek();
            switch (token.type) {
                case TokenType.Global:
                    FUNCTION_BODY.push(this.global(parent));
                    break;
                case TokenType.Nonlocal:
                    FUNCTION_BODY.push(this.nonlocal(parent));
                    break;
                case TokenType.Def:
                    FUNCTION_BODY.push(this.functionDefinition(parent));
                    break;
                case TokenType.ID:
                    if (this.isMatch(this.lookAhead(), TokenType.Colon)) {
                        FUNCTION_BODY.push(this.variableDefinition(parent));
                        this.skipIf(TokenType.NewLine);
                        break;
                    }
                    hasStatement = true;
                    FUNCTION_BODY.push(this.statement(parent));
                    break;
                case TokenType.Dedent:
                case TokenType.EOF:
                    if (!hasStatement) 
                        throw new ParserError("A function body must have at least one statement.");
                    return FUNCTION_BODY;
                default:
                    hasStatement = true;
                    FUNCTION_BODY.push(this.statement(parent));
                    break;
            }
        }
    }

    private statement(parent: SyntaxNode) {
        const token = this.peek();
        switch (token.type) {
            case TokenType.If:
                return this.ifStatement(parent);
            case TokenType.While:
                return this.whileStatement(parent);
            case TokenType.For:
                return this.forStatement(parent);
            default:
                const STMT = this.simpleStatement(parent);
                this.skipIf(TokenType.NewLine);
                return STMT;
        }
    }

    private ifStatement(parent: SyntaxNode): IfStatement {
        const IF_STMT = new IfStatement(parent);
        this.consumeAndMatch(TokenType.If);
        IF_STMT.test = this.expression(IF_STMT);
        
        this.consumeAndMatch(TokenType.Colon);
        IF_STMT.body = this.block(IF_STMT);

        while (true) {
            if (!this.peekAndTest(TokenType.Elif)) {
                break;
            }

            const ELIF_STMT = new ElifStatement(IF_STMT);
            this.consumeAndMatch(TokenType.Elif);
            ELIF_STMT.test = this.expression(ELIF_STMT);
            this.consumeAndMatch(TokenType.Colon);
            IF_STMT.body = this.block(ELIF_STMT);
            IF_STMT.orelse?.push(ELIF_STMT);
        }

        if (this.isMatch(this.peek(), TokenType.Else)) {
            this.consumeAndMatch(TokenType.Else);
            this.consumeAndMatch(TokenType.Colon);
            IF_STMT.elseBlock = this.block(IF_STMT);
        }
        return IF_STMT;
    }

    private block(parent: SyntaxNode): Array<Statement> {
        this.consumeAndMatch(TokenType.NewLine);
        this.consumeAndMatch(TokenType.Indent);
        let body = this.statementList(parent);
        this.consumeAndMatch(TokenType.Dedent);
        return body;
    }

    private statementList(parent: SyntaxNode): Array<Statement> {
        let stmt_list = new Array<Statement>();
        while (true) {
            if (this.isMatch(this.peek(), TokenType.EOF) || this.isMatch(this.peek(), TokenType.Dedent)) {
                break;
            }

            stmt_list.push(this.statement(parent));
        }
        return stmt_list;
    }

    private whileStatement(parent: SyntaxNode): WhileStatement {
        const whileStatement = new WhileStatement(parent);
        this.consumeAndMatch(TokenType.While);
        whileStatement.test = this.expression(whileStatement);
        this.consumeAndMatch(TokenType.Colon);
        whileStatement.body = this.block(whileStatement);
        return whileStatement;
    }

    private forStatement(parent: SyntaxNode): ForStatement {
        const forStatement = new ForStatement(parent);
        this.consumeAndMatch(TokenType.For);
        forStatement.target = this.consumeAndMatch(TokenType.ID).value;
        this.consumeAndMatch(TokenType.In);
        forStatement.iter = this.expression(forStatement);
        this.consumeAndMatch(TokenType.Colon);
        forStatement.body = this.block(forStatement);
        return forStatement;
    }

    private simpleStatement(parent: SyntaxNode) {
        if (this.peekAndTest(TokenType.Pass)) {
            this.consume();
            return new PassStatement(parent);
        } 
        
        if (this.peekAndTest(TokenType.Return)) {
            const RETURN_STMT = new ReturnStatement(parent);
            this.consumeAndMatch(TokenType.Return);
            if (!this.peekAndTest(TokenType.Dedent) || !this.peekAndTest(TokenType.NewLine)) {
                RETURN_STMT.value = this.expression(RETURN_STMT);
                return RETURN_STMT;
            }
            return RETURN_STMT;
        }
        
        let expression = this.expression();
        if (!this.isTarget(expression)) {
            const STMT = new SimpleExpressionStatement(parent);
            expression.parent = STMT;
            STMT.body = expression;
            return STMT;
        }

        const TARGET_STMT = new AssignStatement(parent);
        this.consumeAndMatch(TokenType.Assign);
        TARGET_STMT.targets?.push(expression);
        expression.parent = TARGET_STMT;
        while (true) {
            const token = this.peek();
            if (this.isMatch(token, TokenType.NewLine) || this.isMatch(token, TokenType.Dedent) || this.isMatch(token, TokenType.EOF)) {
                break;
            }
            
            if (this.isMatch(token, TokenType.Assign)) {
                this.consume();
            }

            let expr = this.expression(TARGET_STMT);
            TARGET_STMT.targets?.push(expr);
        }

        TARGET_STMT.body = TARGET_STMT.targets?.pop();
        if (!TARGET_STMT.targets) {
            throw new CompileError("Failed to parse target body");
        }

        for (let target of TARGET_STMT.targets) {
            if (!this.isTarget(target)) {
                throw new ParserError(`${target} is not a target`);
            }
        }
        return TARGET_STMT;
    }
// #region expression
    private expression(parent?: SyntaxNode): Expression {
        // entrance of expression
        return this.ternaryIfExpression(parent);
    }

    private ternaryIfExpression(parent?: SyntaxNode): Expression {
        let left = this.orExpression(parent);
        
        if (!this.peekAndTest(TokenType.If)) {
            return left;
        }

        this.consumeAndMatch(TokenType.If);
        const expression = new ConditionalExpression(parent);  
        let middle = this.ternaryIfExpression(expression);
        
        this.consumeAndMatch(TokenType.Else);
        let right = this.expression(expression);

        left.parent = expression;
        expression.test = left;
        expression.consequent = middle;
        expression.alternate = right;
        return expression;
    }

    // TODO: Change this to an iterative method (or ~ unary)
    private orExpression(parent?: SyntaxNode): Expression {
        let left = this.andExpression(parent);
        if (!this.peekAndTest(TokenType.Or)) {
            return left;
        }

        this.consumeAndMatch(TokenType.Or);
        const expression = new BinaryExpression(parent);
        let right = this.expression(expression);

        left.parent = expression;
        expression.left = left;
        expression.right = right;
        expression.operator = Operator.Or;
        return expression;
    }

    private andExpression(parent?: SyntaxNode): Expression {
        let left = this.notExpression(parent);
        if (!this.peekAndTest(TokenType.And)) {
            return left;
        }

        this.consumeAndMatch(TokenType.And);
        const expression = new BinaryExpression(parent);
        let right = this.expression(expression);

        left.parent = expression;
        expression.left = left;
        expression.right = right;
        expression.operator = Operator.And;
        return expression;
    }

    private notExpression(parent?: SyntaxNode): Expression {
        if (!this.peekAndTest(TokenType.Not)) {
            return this.compareExpression(parent);
        }

        this.consumeAndMatch(TokenType.Not);
        const expression = new UnaryExpression(parent);
        let arg = this.expression(expression);
        expression.argument = arg;
        expression.operator = Operator.Not;
        return expression;
    }

    private compareExpression(parent?: SyntaxNode): Expression {
        let left = this.additionalExpression(parent);
        if (!this.isCompareOperator(this.peek())) {
            return left;
        }

        const operator = this.consume().type;
        const expression = new BinaryExpression(parent);
        let right = this.expression(expression);
        left.parent = expression
        expression.operator = tokenToOperator(operator);
        expression.right = right;
        return expression;
    }

    private additionalExpression(parent?: SyntaxNode): Expression {
        let left = this.multiplyExpression(parent);

        if (!this.isAdditionalExpression(this.peek())) {
            return left;
        }

        const operator = this.consume().type;
        const expression = new BinaryExpression(parent);
        let right = this.expression(expression);

        left.parent = expression;
        expression.left = left;
        expression.right = right;
        expression.operator = tokenToOperator(operator);
        return expression;
    }

    private multiplyExpression(parent?: SyntaxNode): Expression {
        let left = this.unaryExpression(parent);

        if (!this.isMultiplyExpression(this.peek())) {
            return left;
        }

        const operator = this.consume().type;
        const expression = new BinaryExpression(parent);
        let right = this.expression(expression);

        left.parent = expression;
        expression.left = left;
        expression.right = right;
        expression.operator = tokenToOperator(operator);
        return expression;
    }

    private unaryExpression(parent?: SyntaxNode): UnaryExpression {
        if (!this.isUnaryExpression(this.peek())) {
            return this.memberOrIndexOrFunctionCallExpression(parent);
        }

        this.consumeAndMatch(TokenType.Not);
        const expression = new UnaryExpression(parent);

        let arg = this.expression(expression);
        expression.argument = arg;
        expression.operator = Operator.Minus;
        return expression;
    }

    private memberOrIndexOrFunctionCallExpression(parent?: SyntaxNode): Expression {
        let left = this.atom(parent);
        while (true) {
            const token = this.peek();
            if (this.isMatch(token, TokenType.LeftParentheses)) {
                 this.consume();
                 const CALL_EXPRESSION = new CallExpression(parent);

                 if (!this.peekAndTest(TokenType.RightParentheses)) {
                    while (true) {
                        let arg = this.expression(CALL_EXPRESSION);
                        CALL_EXPRESSION.parameter?.push(arg);
                        if (this.peekAndTest(TokenType.RightParentheses)) {
                            break;
                        } else if (!this.peekAndTest(TokenType.Comma)) {
                            throw new ParserError("Expected `,` or `)`", token.position);
                        }
                        this.consumeAndMatch(TokenType.Comma);
                    }
                 }

                 CALL_EXPRESSION.name = left;
                 this.consumeAndMatch(TokenType.RightParentheses);
                 left.parent = CALL_EXPRESSION;
                 left = CALL_EXPRESSION;
            } else if (this.isMatch(token, TokenType.LeftSquare)) {
                this.consume();
                const INDEX_EXPRESSION = new IndexExpression(parent);
                let index = this.expression(INDEX_EXPRESSION);
                INDEX_EXPRESSION.index = index;
                INDEX_EXPRESSION.object = left;
                left.parent = INDEX_EXPRESSION;
                left = INDEX_EXPRESSION;
                this.consumeAndMatch(TokenType.RightSquare);
            } else if (this.isMatch(token, TokenType.Dot)) {
                this.consume();
                const MEMBER_EXPRESSION = new MemberExpression(parent);
                let member = this.consumeAndMatch(TokenType.ID).value;
                MEMBER_EXPRESSION.member = member;
                MEMBER_EXPRESSION.object = left;
                left.parent = MEMBER_EXPRESSION;
                left = MEMBER_EXPRESSION;
            } else {
                break;
            }
        }
        return left;
    }

    private atom(parent?: SyntaxNode): Expression {
        const token = this.peek();
        if (this.isLiteral(token)) {
            return this.literal(parent);
        } 

        if (this.isMatch(token, TokenType.LeftParentheses)) {
            this.consume();
            const expression = this.expression(parent);
            this.consumeAndMatch(TokenType.RightParentheses);
            return expression;
        }

        if (this.isMatch(token, TokenType.LeftSquare)) {
            const listExpression = new ListLiteral(parent);
            this.consume();
            while (true) {
                let expression = this.expression(listExpression);
                listExpression.elements?.push(expression);

                let current = this.peek();
                if (this.isMatch(current, TokenType.Comma)) {
                    this.consume();
                } else if (this.isMatch(current, TokenType.RightSquare)) {
                    this.consume();
                    break;
                } else {
                    throw new ParserError("Expected `]`, or `,`", token.position);
                }
            }
            return listExpression;
        }

        if (this.isMatch(token, TokenType.ID)) {
            this.consume();
            return new Identifier(parent, token.value);
        }

        throw new ParserError("Expected identifier, literal, list literal, or `(`expression`),\n Or the following keywords are not supported: import, from, try, raise, finally, yield, with, async, await, as, assert, lambda", token.position);
    }

// #endregion
    private global(parent: SyntaxNode) {
        this.consumeAndMatch(TokenType.Global);
        const ID = this.consumeAndMatch(TokenType.ID).value;
        this.consumeAndMatch(TokenType.NewLine);
        return new GlobalDeclaration(parent, ID);
    }
    
    private nonlocal(parent: SyntaxNode) {
        this.consumeAndMatch(TokenType.Nonlocal);
        const ID = this.consumeAndMatch(TokenType.ID).value;
        this.consumeAndMatch(TokenType.NewLine);
        return new NonlocalDeclaration(parent, ID);
    }

    private typedVariable(parent: SyntaxNode): TypedVariable {
        const TYPED_VAR = new TypedVariable(parent);
        const ID = this.consumeAndMatch(TokenType.ID).value;
        TYPED_VAR.name = ID;
        this.consumeAndMatch(TokenType.Colon);
        TYPED_VAR.type = this.type(TYPED_VAR);
        return TYPED_VAR;
    }

    private type(parent: SyntaxNode): Type {
        const token = this.consume();

        if (this.isMatch(token, TokenType.ID)) {
            const type = new IdentifierType(parent);
            type.name = token.value;
            return type;
        } else if (this.isMatch(token, TokenType.LeftSquare)) {
            const listType = new ListType(parent);
            const innerType = this.type(listType);
            listType.elementType = innerType;
            this.consumeAndMatch(TokenType.RightSquare);
            return listType;
        } else {
            throw new ParserError("Expected type.", token.position);
        }
    }

    private variableDefinition(parent: SyntaxNode): VariableDefinition {
        const VARIABLE_DEF = new VariableDefinition(parent);
        const TYPED_VAR = this.typedVariable(VARIABLE_DEF);
        this.consumeAndMatch(TokenType.Assign);
        const LITERAL = this.literal(VARIABLE_DEF);
        VARIABLE_DEF.type = TYPED_VAR;
        VARIABLE_DEF.value = LITERAL;
        this.skipIf(TokenType.NewLine);
        return VARIABLE_DEF;
    }

    private literal(parent?: SyntaxNode) {
        const token = this.consume();
        switch (token.type) {
            case TokenType.String:
                return new StringLiteral(parent, token.value);
            case TokenType.Integer:
                return new IntLiteral(parent, Number.parseInt(token.value));
            case TokenType.None:
                return new NoneLiteral(parent);
            case TokenType.True:
                return new BoolLiteral(parent, true);
            case TokenType.False:
                return new BoolLiteral(parent, false);
            default:
                throw new ParserError("Expected string, integer, None, True, or False", token.position);
        }
    }
// #endregion
// #region token utilities
    private peekAndMatch(tokenType: TokenType): Token {
        const token = this.peek();
        if (!token || token.type !== tokenType) {
            throw new ParserError(`Expected token of type ${tokenType}. but actual ${token.type} at ${token.position}`, token.position);
        }
        return token;
    }

    private consumeAndMatch(tokenType: TokenType): Token {
        const token = this.consume();
        if (!token || token.type !== tokenType) {
            throw new ParserError(`Expected token of type ${tokenType}. but actual ${token.type} at ${token.position}`, token.position);
        }
        return token;
    }

    private peekAndTest(tokenType: TokenType): boolean {
        const token = this.peek();
        return token && token.type === tokenType;
    }

    private consumeAndTest(tokenType: TokenType): boolean {
        const token = this.consume();
        return token && token.type === tokenType;
    }

    private peek(): Token {
        const token = this._tokens.at(this.cursor);
        if (!token) {
            throw new ParserError("Reached end of the input.");
        }
        return token;
    }

    private consume(): Token {
        const token = this._tokens.at(this.cursor++);
        if (!token) {
            throw new ParserError("Reached end of the input.");
        }
        return token;
    }

    private lookBehind(k: number = 1): Token {
        const token = this._tokens[this.cursor - k];
        if (!token) {
            throw new ParserError("Reached beginning of the input.");
        }
        return token;
    }

    private lookAhead(k: number = 1): Token {
        const token = this._tokens[this.cursor + k];
        if (!token) {
            throw new ParserError("Reached end of the input.");
        }
        return token;
    }

    private skipIf(tokenType: TokenType) {
        const token = this.peek();
        if (token && token.type === tokenType) {
            this.consume();
        }
    }

    private skipUntil(tokenType: TokenType) {
        const temp = this.cursor;
        while (this.cursor < this._tokens.length && this._tokens[this.cursor].type !== tokenType) {
            this.cursor++;
        }

        const success = this.cursor < this._tokens.length && this._tokens[this.cursor].type === tokenType;
        if (success) {
            this.cursor++;
        } else {
            this.cursor = temp;
        }
        return success;
    }

    private error(message: string, startsAt: Location) {
        let currentLocation = this._tokens[this.cursor].position;
        this.skipUntil(TokenType.NewLine);
        return new SyntaxError(message, startsAt, currentLocation);
    }
// #endregion
// #region condition helpers
    private isMatch(token: Token, tokenType: TokenType): boolean {
        return token && token.type === tokenType;
    }

    private isLiteral(token: Token): boolean {
        switch (token.type) {
            case TokenType.String:
            case TokenType.Integer:
            case TokenType.None:
            case TokenType.True:
            case TokenType.False:
                return true;
            default:
                return false;
        }
    }

    private isCompareOperator(token: Token): boolean {
        switch (token.type) {
            case TokenType.Equal:
            case TokenType.NotEqual:
            case TokenType.LessEqual:
            case TokenType.GreaterEqual:
            case TokenType.Less:
            case TokenType.Greater:
            case TokenType.Is:
                return true;
            default:
                return false;
        }
    }

    private isAdditionalExpression(token: Token): boolean {
        switch (token.type) {
            case TokenType.Plus:
            case TokenType.Minus:
                return true;
            default:
                return false;
        }
    }

    private isMultiplyExpression(token: Token): boolean {
        switch (token.type) {
            case TokenType.Multiply:
            case TokenType.Divide:
            case TokenType.Mod:
            case TokenType.Power:
            case TokenType.FloorDivide:
                return true;
            default:
                return false;
        }
    }

    private isUnaryExpression(token: Token): boolean {
        switch (token.type) {
            case TokenType.Minus:
//          case TokenType.Plus:
                return true;
            default:
                return false;
        }
    }

    private isTarget(expression: Expression) {
        if (expression instanceof Identifier) {
            return true;
        }
        
        if (expression instanceof MemberExpression) {
            return true;
        }

        if (expression instanceof IndexExpression) {
            return true;
        }

        return false;
    }
// #endregion
// #region getters and setters
    public get tokens() {
        return new Array<Token>(...this._tokens);
    }

    public set tokens(tokens: Array<Token>) {
        this._tokens = tokens;
        this.cursor = 0;
        this.syntaxTree = new AbstractSyntaxTree();
    }
// #endregion
}