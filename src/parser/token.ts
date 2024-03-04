import { Cloneable } from "@interface/clone";
import { JsonCustomSerializable } from "@interface/json";

export enum TokenType {
    EOF = "eof",
    UNKOWN = "unkown", // token that is not accepted.
    Comment = "comment", // this is not token.
    WhiteSpace = "whitespace",
    NewLine = "newline",
    Indent = "indent",
    Dedent = "dedent",
    Integer = "int",
    ID = "id",
    // IDString, // I decided not to distinguish IDString from ID.
    String = "str",
    
    // keywords
    False = "False",
    None = "None",
    True = "True",
    And = "and",
    As = "as",
    Assert = "assert",
    Async = "async",
    Await = "await",
    Break = "break",
    Class = "class",
    Continue = "continue",
    Def = "def",
    Del = "del",
    Elif = "elif",
    Else = "else",
    Except = "except",
    Finally = "finally",
    For = "for",
    From = "from",
    Global = "global",
    If = "if",
    Import = "import",
    In = "in",
    Is = "is", // binary operator
    Lambda = "lambda",
    Nonlocal = "nonlocal",
    Not = "not",
    Or = "or",
    Pass = "pass",
    Raise = "raise",
    Return = "return",
    Try = "try",
    While = "while",
    With = "with",
    Yield = "yield",

    // operators
    Assign = "=",
    Plus = "+",
    Minus = "-",
    Power = "**",
    Multiply = "*",
    FloorDivide = "//",
    Divide = "/",
    Mod = "%",
    Equal = "==",
    NotEqual = "!=",
    LessEqual = "<=",
    GreaterEqual = ">=",
    Less = "<",
    Greater = ">",


    // Arrow
    Arrow = "->",

    // sign
    LeftParentheses = "(",
    RightParentheses = ")",
    LeftSquare = "[",
    RightSquare = "]",
    Comma = ",",
    Colon = ":",
    Dot = "."
};

export const keywords: ReadonlyArray<TokenType> = [
    TokenType.False,
    TokenType.None,
    TokenType.True,
    TokenType.And,
    TokenType.As,
    TokenType.Assert,
    TokenType.Async,
    TokenType.Await,
    TokenType.Break,
    TokenType.Class,
    TokenType.Continue,
    TokenType.Def,
    TokenType.Del,
    TokenType.Elif,
    TokenType.Else,
    TokenType.Except,
    TokenType.Finally,
    TokenType.For,
    TokenType.From,
    TokenType.Global,
    TokenType.If,
    TokenType.Import,
    TokenType.In,
    TokenType.Is,
    TokenType.Lambda,
    TokenType.Nonlocal,
    TokenType.Not,
    TokenType.Or,
    TokenType.Pass,
    TokenType.Raise,
    TokenType.Return,
    TokenType.Try,
    TokenType.While,
    TokenType.With,
    TokenType.Yield
];

export class Token implements JsonCustomSerializable {
    private _type = TokenType.UNKOWN;
    private _position = new Location(0, 0);
    private _value = "";

    public constructor(type: TokenType) {
        this._type = type;
    }

    public set type(type: TokenType) {
        this._type = type;
    }
    
    public get type() {
        return this._type;
    }

    public get value() {
        return this._value;
    }

    public get position() {
        return this._position;
    }

    public static fromPosition(type: TokenType, location: Location, value: string) {
        let token = new Token(type);
        token._position = location.clone();
        token._value = value;
        return token;
    }

    public toJSON(): object {
        return { type: this._type, position: this._position, value: this._value };
    }
}

export class Location implements JsonCustomSerializable, Cloneable<Location> {
    private _row: number;
    private _column: number;

    public constructor(row: number, column: number) {
        this._row = row;
        this._column = column;
    }

    public get row() {
        return this._row;
    }

    public set row(value: number) {
        this._row = value;
    }

    public get column() {
        return this._column;
    }

    public set column(value: number) {
        this._column = value;
    }

    public toString(): string {
        return `${this._row}:${this._column}`;
    }

    public clone(): Location {
        return new Location(this._row, this._column);
    }

    toJSON(): object {
        return {row: this._row, column: this._column};
    }
}