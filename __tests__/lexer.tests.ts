import { Lexer } from "@parser/lexer";
import { TokenType } from "@parser/token";
let lexer = new Lexer();

beforeEach(() => {
    lexer.code = "";
});

afterEach(() => {
    lexer.code = "";
});

test("arithmetic_expression", () => {
    lexer.code = String.raw`x + 2 * y - z / 4`;
    let tokens = lexer.tokenize();
    let tokenType = [TokenType.ID, TokenType.Plus, TokenType.Integer, TokenType.Multiply, TokenType.ID,
                    TokenType.Minus, TokenType.ID, TokenType.Divide, TokenType.Integer, TokenType.EOF];
    
    for (let i = 0; i < tokens.length; i++) {
        expect(tokens[i].type).toBe(tokenType[i]);
    }
});

test("boolean_expression", () => {
    lexer.code = String.raw`if x > y and z <= 10 or not flag:`;
    let tokens = lexer.tokenize();
    let tokenType = [TokenType.If, TokenType.ID, TokenType.Greater, TokenType.ID, TokenType.And,
                    TokenType.ID, TokenType.LessEqual, TokenType.Integer, TokenType.Or,
                    TokenType.Not, TokenType.ID, TokenType.Colon, TokenType.EOF];
    
    for (let i = 0; i < tokens.length; i++) {
        expect(tokens[i].type).toBe(tokenType[i]);
    }
});

test("function", () => {
    lexer.code = String.raw`def hello:`;
    let tokens = lexer.tokenize();
    let tokenType = [TokenType.Def, TokenType.ID, TokenType.Colon, TokenType.EOF];
    
    for (let i = 0; i < tokens.length; i++) {
        expect(tokens[i].type).toBe(tokenType[i]);
    }
});

test("string", () => {
    lexer.code = String.raw`"Hello"`;
    let tokens = lexer.tokenize();
    let tokenType = [TokenType.String, TokenType.EOF];

    for (let i = 0; i < tokens.length; i++) {
        expect(tokens[i].type).toBe(tokenType[i]);
    }
});

test("function_call", () => {
    lexer.code = String.raw`print("Hello")`;
    let tokens = lexer.tokenize();
    let tokenType = [TokenType.ID, TokenType.LeftParentheses, TokenType.String, TokenType.RightParentheses, TokenType.EOF];

    for (let i = 0; i < tokens.length; i++) {
        expect(tokens[i].type).toBe(tokenType[i]);
    }
});

test("while", () => {
    lexer.code = String.raw`while x < y:`
    let tokens = lexer.tokenize();
    let tokenType = [TokenType.While, TokenType.ID, TokenType.Less, TokenType.ID, TokenType.Colon, TokenType.EOF];

    for (let i = 0; i < tokens.length; i++) {
        expect(tokens[i].type).toBe(tokenType[i]);
    }
});

test("indent", () => {
    lexer.code = String.raw
`if foo:
    if bar:
        x = 42
else:
    x = 20`;

    let tokens = lexer.tokenize();
    let tokenType = [TokenType.If, TokenType.ID, TokenType.Colon, TokenType.NewLine, TokenType.Indent, 
                    TokenType.If, TokenType.ID, TokenType.Colon, TokenType.NewLine, TokenType.Indent, 
                    TokenType.ID, TokenType.Assign, TokenType.Integer, TokenType.NewLine, TokenType.Dedent,
                    TokenType.Dedent, TokenType.Else, TokenType.Colon, TokenType.NewLine, TokenType.Indent,
                    TokenType.ID, TokenType.Assign, TokenType.Integer, TokenType.Dedent, TokenType.EOF];

    for (let i = 0; i < tokens.length; i++) {
        expect(tokens[i].type).toBe(tokenType[i]);
    }         
});

test("list", () => {
    lexer.code = String.raw`list = [1, 2, 3]`;
    let tokens = lexer.tokenize();
    let tokenType = [TokenType.ID, TokenType.Assign, TokenType.LeftSquare,
                    TokenType.Integer, TokenType.Comma, TokenType.Integer,
                    TokenType.Comma, TokenType.Integer, TokenType.RightSquare,
                    TokenType.EOF];
    
    for (let i = 0; i < tokens.length; i++) {
        expect(tokens[i].type).toBe(tokenType[i]);
    }
});

test("for_loop", () => {
    lexer.code = String.raw`for i in range(10):`;
    let tokens = lexer.tokenize();
    let tokenType = [TokenType.For, TokenType.ID, TokenType.In, TokenType.ID,
                    TokenType.LeftParentheses, TokenType.Integer, TokenType.RightParentheses,
                    TokenType.Colon, TokenType.EOF];

    for (let i = 0; i < tokens.length; i++) {
        expect(tokens[i].type).toBe(tokenType[i]);
    }
});

test("comments", () => {
    lexer.code = String.raw`# this is a comment`;
    let tokens = lexer.tokenize();
    let tokenType = [TokenType.EOF];

    expect(tokens.length).toBe(1);
    expect(tokens[0].type).toBe(tokenType[0]);
});

test("lambda_expression", () => {
    lexer.code = String.raw`f = lambda x: x**2`;
    let tokens = lexer.tokenize();
    let tokenType = [TokenType.ID, TokenType.Assign, TokenType.Lambda, TokenType.ID,
    TokenType.Colon, TokenType.ID, TokenType.Power, TokenType.Integer, TokenType.EOF];

    for (let i = 0; i < tokens.length; i++) {
        expect(tokens[i].type).toBe(tokenType[i]);
    }
});

test("class_definition", () => {
    lexer.code = String.raw
`class MyClass:
    pass`;
    let tokens = lexer.tokenize();
    let tokenType = [TokenType.Class, TokenType.ID, TokenType.Colon, TokenType.NewLine, TokenType.Indent,
                     TokenType.Pass, TokenType.Dedent, TokenType.EOF];

    for (let i = 0; i < tokens.length; i++) {
        expect(tokens[i].type).toBe(tokenType[i]);
    }
});

test("class_inheritance", () => {
    lexer.code = String.raw
`class MyChildClass(MyParentClass):
    pass`;

    let tokens = lexer.tokenize();
    let tokenType = [TokenType.Class, TokenType.ID, TokenType.LeftParentheses,
                     TokenType.ID, TokenType.RightParentheses, TokenType.Colon, TokenType.NewLine,
                     TokenType.Indent, TokenType.Pass, TokenType.Dedent, TokenType.EOF];

    for (let i = 0; i < tokens.length; i++) {
        expect(tokens[i].type).toBe(tokenType[i]);
    }
});

test("class_attribute_assignment", () => {
    lexer.code = String.raw
`class MyClass:
    def __init__(self):
        self.x = 42`;

    let tokens = lexer.tokenize();
    let tokenType = [TokenType.Class, TokenType.ID, TokenType.Colon, TokenType.NewLine, TokenType.Indent,
                     TokenType.Def, TokenType.ID, TokenType.LeftParentheses, TokenType.ID, TokenType.RightParentheses, 
                     TokenType.Colon, TokenType.NewLine, TokenType.Indent, TokenType.ID, TokenType.Dot, TokenType.ID, 
                     TokenType.Assign, TokenType.Integer, TokenType.Dedent, TokenType.Dedent, TokenType.EOF];

    for (let i = 0; i < tokens.length; i++) {
        expect(tokens[i].type).toBe(tokenType[i]);
    }
});

test("class", () => {
    lexer.code = String.raw
`class Person:
    def init(self, name, age):
        self.name = name
        self.age = age
    
    def say_hello(self):
        print("Hello, my name is", self.name, "and I'm", self.age, "years old.")`;

    let tokens = lexer.tokenize();
    let tokenType = [TokenType.Class, TokenType.ID, TokenType.Colon, TokenType.NewLine, 
                     TokenType.Indent, TokenType.Def, TokenType.ID, TokenType.LeftParentheses, TokenType.ID, TokenType.Comma, TokenType.ID, TokenType.Comma, TokenType.ID, TokenType.RightParentheses, TokenType.Colon, TokenType.NewLine,
                     TokenType.Indent, TokenType.ID, TokenType.Dot, TokenType.ID, TokenType.Assign, TokenType.ID, TokenType.NewLine,
                     TokenType.ID, TokenType.Dot, TokenType.ID, TokenType.Assign, TokenType.ID, TokenType.NewLine,
                     TokenType.Dedent, TokenType.Def, TokenType.ID, TokenType.LeftParentheses, TokenType.ID, TokenType.RightParentheses, TokenType.Colon, TokenType.NewLine,
                     TokenType.Indent, TokenType.ID, TokenType.LeftParentheses, TokenType.String, TokenType.Comma, TokenType.ID, TokenType.Dot, TokenType.ID, TokenType.Comma, TokenType.String, TokenType.Comma,
                     TokenType.ID, TokenType.Dot, TokenType.ID, TokenType.Comma, TokenType.String, TokenType.RightParentheses, TokenType.Dedent, TokenType.Dedent, TokenType.EOF];
        
    for (let i = 0; i < tokens.length; i++) {
        expect(tokens[i].type).toBe(tokenType[i]);
    }
});

test("tabIndexTest", () => {
    lexer.code = String.raw
`class Animal:
  def init(self, kind):
    self.kind = kind
`;
    let tokens = lexer.tokenize();
    let tokenType = [TokenType.Class, TokenType.ID, TokenType.Colon, TokenType.NewLine, TokenType.Indent,
                     TokenType.Def, TokenType.ID, TokenType.LeftParentheses, TokenType.ID, TokenType.Comma, TokenType.ID, TokenType.RightParentheses, TokenType.Colon, TokenType.NewLine, TokenType.Indent,
                     TokenType.ID, TokenType.Dot, TokenType.ID, TokenType.Assign, TokenType.ID, TokenType.NewLine,
                     TokenType.Dedent, TokenType.Dedent, TokenType.EOF];
    
    for (let i = 0; i < tokens.length; i++) {
        expect(tokens[i].type).toBe(tokenType[i]);
    }
});