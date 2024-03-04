import { IndentationError, TokenError } from "@exceptions/exceptions";
import { Location, Token, TokenType, keywords } from "@parser/token";
import { DefaultTabSpace } from "@src/configuration";
export class Lexer {
    private static regexMap = new Map<TokenType, RegExp>([
        [TokenType.WhiteSpace, new RegExp("^\\t|^ ")],
        [TokenType.Indent, new RegExp(`^\\t+|^[ ]+`)],
        [TokenType.Plus, new RegExp("^\\+")],
        [TokenType.Arrow, new RegExp("^->")],
        [TokenType.Minus, new RegExp("^-")],
        [TokenType.Power, new RegExp("^\\*\\*")],
        [TokenType.Multiply, new RegExp("^\\*")],
        [TokenType.FloorDivide, new RegExp("^\\/\\/")],
        [TokenType.Divide, new RegExp("^\\/")],
        [TokenType.Mod, new RegExp("^%")],
        [TokenType.Equal, new RegExp("^==")],
        [TokenType.Assign, new RegExp("^=")],
        [TokenType.NotEqual, new RegExp("^!=")],
        [TokenType.LessEqual, new RegExp("^<=")],
        [TokenType.GreaterEqual, new RegExp("^>=")],
        [TokenType.Less, new RegExp("^<")],
        [TokenType.Greater, new RegExp("^>")],
        [TokenType.LeftParentheses, new RegExp("^\\(")],
        [TokenType.RightParentheses, new RegExp("^\\)")],
        [TokenType.LeftSquare, new RegExp("^\\[")],
        [TokenType.RightSquare, new RegExp("^\\]")],
        [TokenType.Comma, new RegExp("^,")],
        [TokenType.Colon, new RegExp("^:")],
        [TokenType.Dot, new RegExp("^\\.")],
        [TokenType.Comment, new RegExp("^#.+")],
        [TokenType.String, new RegExp(String.raw`^"([ -!#-[\]-~]|\\|\\\\|\\t|\\n")*"`)],
        [TokenType.ID, new RegExp("^[a-zA-Z_][a-zA-Z0-9_]*")],
        [TokenType.Integer, new RegExp("^0|^([1-9][0-9]*)")]
    ]);

    private _code: string;
    private position: Location;
    private indentationStack: Array<number>;
    private indentationLevel: number;
    private tabIndex?: number;
    private isSpace?: boolean;

    public constructor(code?: string) {
        this._code = code ?? "";
        this.position = new Location(0, 0);
        this.indentationStack = new Array<number>();
        this.indentationLevel = 0;
    }

    public get code(): string {
        return this._code;
    }

    public set code(code: string) {
        this._code = code;
        this.position = new Location(0, 0);
        this.indentationStack = new Array<number>();
        this.indentationLevel = 0;
        this.tabIndex = undefined;
        this.isSpace = undefined;
    }

    public tokenize(): Array<Token> {
        let tokens = new Array<Token>();
        let lines = this._code.split(/\r?\n/);

        for (let i = 0; i < lines.length - 1; i++) {
            let indent = this.matchIndentation(lines[i]);
            let lineTokens = this.tokenizeLine(lines[i]);
            this.position.row++;
            this.position.column = 0;
            tokens.push(...indent, ...lineTokens, Token.fromPosition(TokenType.NewLine, this.position, "\n"));
        }
        const lastLine = lines[lines.length - 1];
        let indent = this.matchIndentation(lastLine);
        let lineTokens = this.tokenizeLine(lastLine);
        tokens.push(...indent, ...lineTokens);

        this.addDedentation(tokens, 0);
        tokens.push(Token.fromPosition(TokenType.EOF, this.position, ""));
        return tokens;
    }

    private tokenizeLine(line: string): Array<Token> {
        let tokens = new Array<Token>();
        this.position.column = 0;
        for (let i = this.position.column; i < line.length; i++) {
            this.position.column = i;
            let isMatched = false;
            let remainingLine = line.slice(i);

            for (const [type, regex] of Lexer.regexMap) {
                let match = regex.exec(remainingLine);
                if (!match) {
                    continue;
                }

                isMatched = true;
                i += match[0].length - 1;
                if (this.isWhiteSpaceOrComment(type)) {
                    break;
                }

                let token = Token.fromPosition(type, this.position, match[0]);
                if (type === TokenType.ID) {
                    this.updateTokenTypeIfKeyword(token)
                }
                tokens.push(token);
                break;
            }

            if (!isMatched) {
                throw new TokenError(`Invalid Token at ${this.position.toString()}`, this.position);
            }
        }
        return tokens;
    }

    private updateTokenTypeIfKeyword(token: Token) {
        for (let tokenType of keywords) {
            if (token.value === tokenType.toString()) {
                token.type = tokenType;
                break;
            }
        }
    }

    private isWhiteSpaceOrComment(type: TokenType) {
        switch (type) {
            case TokenType.WhiteSpace:
            case TokenType.Comment:
                return true;
        }
        return false;
    }
    
    private matchIndentation(line: string) {
        let tokens = new Array<Token>();
        let indentMatch = Lexer.regexMap.get(TokenType.Indent)?.exec(line);
        if (indentMatch) {
            this.position.column = 0;
            this.addIndentation(tokens, Token.fromPosition(TokenType.Indent, this.position, indentMatch[0]));
            this.position.column += indentMatch.length;
        } else {
            if (this.indentationLevel > 0) {
                this.addDedentation(tokens, 0);
            }
        }
        return tokens;
    }

    private addDedentation(tokenArray: Array<Token>, level: number) {
        if (this.indentationLevel > level) {
            while (this.indentationLevel > level) {
                let indent = this.indentationStack.pop();
                if (!indent) {
                    throw new IndentationError("Indentation Error", this.position);
                }
                tokenArray.push(Token.fromPosition(TokenType.Dedent, this.position, ""));
                this.indentationLevel--;
            }
            return;
        }
    }
    
    private addIndentation(tokenArray: Array<Token>, token: Token) {
        let measuredIndentLevel = 0;
        if (token.type !== TokenType.Indent) {
            throw new IndentationError("Indentation Error", this.position);
        }

        if (token.value[0] == " ") {
            if (this.isSpace === false) throw new IndentationError("Indentation Error", this.position);
            this.isSpace = true;
            if (!this.tabIndex) {
                this.tabIndex = token.value.length;
            }
            measuredIndentLevel = token.value.length / (this.tabIndex ?? DefaultTabSpace);
        } else {
            if (this.isSpace === true) throw new IndentationError("Indentation Error", this.position);
            this.isSpace = false;
            measuredIndentLevel = token.value.length;
        }

        if (!Number.isInteger(measuredIndentLevel)) {
            throw new IndentationError("Indentation Error", this.position);
        }

        if (this.indentationLevel === measuredIndentLevel) {
            return;
        }

        if (this.indentationLevel > measuredIndentLevel) {
            this.addDedentation(tokenArray, measuredIndentLevel);
            return;
        }

        if (this.indentationLevel < measuredIndentLevel) {
            this.indentationLevel = measuredIndentLevel;
            this.indentationStack.push(this.indentationLevel);
            tokenArray.push(token)
        }
    }
}