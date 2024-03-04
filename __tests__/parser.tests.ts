import { Lexer } from "@parser/lexer";
import { Parser } from "@parser/parser";

test("class", () => {
    const code = String.raw
`class Person:
    def init(self:Person, name:str, age:int):
        self.name = name
        self.age = age
    
    def say_hello(self:Person):
        print("Hello, my name is", self.name, "and I'm", self.age, "years old.")`;
    
    let lexer = new Lexer(code);
    let tokens = lexer.tokenize();
    let parser =  new Parser(tokens);
    let tree = parser.parse();

    const actual = String.raw`{"root":{"kind":"Program","variables":[],"classes":[{"kind":"ClassDefinition","name":"Person","body":[{"kind":"FunctionDefinition","name":"init","args":[{"kind":"TypedVariable","name":"self","type":{"kind":"IdentifierType","name":"Person"}},{"kind":"TypedVariable","name":"name","type":{"kind":"IdentifierType","name":"str"}},{"kind":"TypedVariable","name":"age","type":{"kind":"IdentifierType","name":"int"}}],"body":[{"kind":"AssignStatement","targets":[{"kind":"MemberExpression","object":{"kind":"Identifier","name":"self"},"member":"name"}],"body":{"kind":"Identifier","name":"name"}},{"kind":"AssignStatement","targets":[{"kind":"MemberExpression","object":{"kind":"Identifier","name":"self"},"member":"age"}],"body":{"kind":"Identifier","name":"age"}}]},{"kind":"FunctionDefinition","name":"say_hello","args":[{"kind":"TypedVariable","name":"self","type":{"kind":"IdentifierType","name":"Person"}}],"body":[{"kind":"SimpleExpressionStatement","body":{"kind":"CallExpression","name":{"kind":"Identifier","name":"print"},"parameter":[{"kind":"StringLiteral","value":"\"Hello, my name is\""},{"kind":"MemberExpression","object":{"kind":"Identifier","name":"self"},"member":"name"},{"kind":"StringLiteral","value":"\"and I'm\""},{"kind":"MemberExpression","object":{"kind":"Identifier","name":"self"},"member":"age"},{"kind":"StringLiteral","value":"\"years old.\""}]}}]}]}],"statements":[],"functions":[]}}`;
    expect(actual).toBe(JSON.stringify(tree));
});