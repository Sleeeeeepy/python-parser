# Intro
```py
class Person:
    def init(self: Person, name: str, age: int):
        self.name = name
        self.age = age
    
    def say_hello(self:Person):
        print("Hello, my name is", self.name, "and I'm", self.age, "years old.")
```

위 파이썬 코드는 아래와 같은 AST를 생성합니다.

``` json
{
  "root": {
    "kind": "Program",
    "variables": [],
    "classes": [
      {
        "kind": "ClassDefinition",
        "name": "Person",
        "body": [
          {
            "kind": "FunctionDefinition",
            "name": "init",
            "args": [
              {
                "kind": "TypedVariable",
                "name": "self",
                "type": {
                  "kind": "IdentifierType",
                  "name": "Person"
                }
              },
              {
                "kind": "TypedVariable",
                "name": "name",
                "type": {
                  "kind": "IdentifierType",
                  "name": "str"
                }
              },
              {
                "kind": "TypedVariable",
                "name": "age",
                "type": {
                  "kind": "IdentifierType",
                  "name": "int"
                }
              }
            ],
            "body": [
              {
                "kind": "AssignStatement",
                "targets": [
                  {
                    "kind": "MemberExpression",
                    "object": {
                      "kind": "Identifier",
                      "name": "self"
                    },
                    "member": "name"
                  }
                ],
                "body": {
                  "kind": "Identifier",
                  "name": "name"
                }
              },
              {
                "kind": "AssignStatement",
                "targets": [
                  {
                    "kind": "MemberExpression",
                    "object": {
                      "kind": "Identifier",
                      "name": "self"
                    },
                    "member": "age"
                  }
                ],
                "body": {
                  "kind": "Identifier",
                  "name": "age"
                }
              }
            ]
          },
          {
            "kind": "FunctionDefinition",
            "name": "say_hello",
            "args": [
              {
                "kind": "TypedVariable",
                "name": "self",
                "type": {
                  "kind": "IdentifierType",
                  "name": "Person"
                }
              }
            ],
            "body": [
              {
                "kind": "SimpleExpressionStatement",
                "body": {
                  "kind": "CallExpression",
                  "name": {
                    "kind": "Identifier",
                    "name": "print"
                  },
                  "parameter": [
                    {
                      "kind": "StringLiteral",
                      "value": "\"Hello, my name is\""
                    },
                    {
                      "kind": "MemberExpression",
                      "object": {
                        "kind": "Identifier",
                        "name": "self"
                      },
                      "member": "name"
                    },
                    {
                      "kind": "StringLiteral",
                      "value": "\"and I'm\""
                    },
                    {
                      "kind": "MemberExpression",
                      "object": {
                        "kind": "Identifier",
                        "name": "self"
                      },
                      "member": "age"
                    },
                    {
                      "kind": "StringLiteral",
                      "value": "\"years old.\""
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ],
    "statements": [],
    "functions": []
  }
}
```

# Grammar
``` bnf
program ::= [var_def | func_def | class_def]* stmt*

class_def ::= 'class' ID '('ID')' : NEWLINE INDENT class_body DEDENT

class_body ::= 'pass' NEWLINE | [var_def | func_def]+

func_def ::= 'def' ID '('[typed_var [',' typed_var]* ]?')' ['->' type]? : NEWLINE INDENT func_body DEDENT

func_body ::= [global_decl | nonlocal_decl | var_def | func_def ]* stmt+

typed_var ::= ID ':' type

type ::= ID | IDSTRING | [type]

global_decl ::= 'global' ID NEWLINE

nonlocal_decl ::= 'nonlocal' ID NEWLINE

var_def ::= typed_var '=' literal NEWLINE

stmt ::= simple_stmt NEWLINE | 'if' expr: block ['elif' expr: block]* ['else': block]? | 'while' expr: block | 'for' ID 'in' expr: block

simple_stmt ::= 'pass' | expr | 'return' [expr]? | [target '=']+ expr

block ::= NEWLINE INDENT stmt+ DEDENT

literal ::= 'NONE' | 'TRUE' | 'FALSE' | INTEGER | IDSTRING | STRING

expr ::= cexpr | 'not' expr | expr ['and' | 'or' ] expr | expr 'if' expr 'else' expr

cexpr ::= ID | literal | '['[expr [',' expr]*]?']' | '('expr')' | member_expr | index_expr | member_expr '('[expr [',' expr]*]?')' | ID '('[expr [',' expr]*]?')' | cexpr bin_op cexpr | '-' cexpr

bin_op ::= '+' | '-' | '*' | '//' | '%' | '==' | '!=' | '<=' | '>=' | '<' | '>' | 'is'

member_expr ::= cexpr '.' ID

index_expr ::= cexpr '['expr']'

target ::= ID | member_expr | index_expr
```

# Precedence and Associativity
|Precedence|Operator(s)|Associativity|
|:---:|:---:|:---:|
|1|· if · else ·|Right|
|2|or|Left|
|3|and|Left|
|4|not|N/A|
|5|==, !=, <, >, <=, >=, is| None
|6|+, - (binary)|Left
|7|*, //, %|Left
|8|- (unary)|N/A
|9| ., []|Left

