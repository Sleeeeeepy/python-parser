# Intro
직접 작성한 재귀하강파서로, 파이썬 코드를 파싱하여 json 형태로 출력하는 프로그램입니다.

## 기존 파이썬과 다른 점
변수 선언문은 반드시 타입을 가져야 합니다.
```py
a = 10      # 할당으로 인식
a: int = 10 # 변수 정의로 인식
```

함수의 정의에서 매개변수는 반드시 타입을 가져야합니다.
```py
# reject
def hello(name):
    print("hello, " + name)
#   Expected token of type :. but actual ) at 0:14
#      0 | def hello(name):
#          ^^^^^^^^^^^^^^
#      1 |  print("hello, " + name)
#      2 | 

# accept
def hello(name: str):
    print("hello, " + name)
```

예외 처리, 모듈, 튜플 분해, with문 등을 지원하지 않습니다.

## 실행결과 미리보기
```py
class Person:
    def init(self: Person, name: str, age: int):
        self.name = name
        self.age = age
    
    def say_hello(self:Person):
        print("Hello, my name is", self.name, "and I'm", self.age, "years old.")
```

위 파이썬 코드로부터 아래와 같은 AST를 생성합니다.

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
# 문법 및 우선 순위
[여기](grammar.md)를 클릭하세요.

# 문제 해결
## 문제 1: Variable Definition을 Assignment로 인식
다음과 같은 코드가 있습니다.
```py
a = 10      # 할당으로 인식됨
a: int = 10 # 변수 정의로 인식됨
```

이 때 id expr 꼴의 문법과, id: id expr을 구분하기 어려울 수 있습니다. 이 때 ':' 토큰은 lookahead를 이용해서 처리하여 간단하게 처리했습니다. 맨 처음 id가 나타나고, 이 다음에 곧바로 ':' 토큰이 나타난다면 변수 정의로 간주하여 처리합니다.

## 문제 2: Left-recursion
LL 파서와 마찬가지로 재귀하강파서 또한 좌측재귀(left-recursion) 문제가 있습니다. expr := expr bin_op expr  꼴은 다음과 같이 파싱할 수 있습니다.

``` typescript
function expr() {
  let left = expr();
  let bin_op = consume();
  let right = expr();

  return {
    left: left,
    right: right,
    op: bin_op
  };
}
```

하지만 이 코드에는 문제가 있습니다. lhs를 파싱할 때 무한루프가 발생합니다. 적어도 규칙의 왼쪽에서 하나 이상의 토큰을 소모해야합니다. 그렇지 않으면 무한히 재귀합니다. 따라서 하나 이상의 토큰을 소모하도록 조정하였습니다. 이 프로젝트에서는 atom이라는 규칙을 추가하였습니다. atom에서는 왼쪽에서 적어도 하나의 토큰을 소모합니다.

``` typescript
    private atom(parent?: SyntaxNode): Expression {
        const token = this.peek();

        // terminal
        if (this.isLiteral(token)) {
            return this.literal(parent);
        } 

        // expr
        if (this.isMatch(token, TokenType.LeftParentheses)) {
            this.consume();
            // ...
        }

        // list literal
        if (this.isMatch(token, TokenType.LeftSquare)) {
            const listExpression = new ListLiteral(parent);
            this.consume();
            // ...
            return listExpression;
        }

        if (this.isMatch(token, TokenType.ID)) {
            this.consume();
            return new Identifier(parent, token.value);
        }
        
        throw new ParserError("...", token.position);
    }
```

여기에서 각 재귀마다 적어도 하나의 토큰을 소모하도록 보장합니다. 따라서 무한 재귀 문제가 발생하지 않습니다. 왼쪽 재귀 문제를 해결할 수 있는 일반적인 방법이 있지만, 그 아이디어는 적어도 하나의 토큰을 소모하는 것과 비슷합니다.