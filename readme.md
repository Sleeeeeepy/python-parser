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

문법 구조 상 예외 처리, 모듈, 튜플 분해, with문 등을 지원하지 않습니다.

## 실행결과 미리보기
```py
class Person:
    def init(self: Person, name: str, age: int):
        self.name = name
        self.age = age
    
    def say_hello(self: Person):
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

# 해결된 문제
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

        // identifier
        if (this.isMatch(token, TokenType.ID)) {
            this.consume();
            return new Identifier(parent, token.value);
        }
        
        throw new ParserError("...", token.position);
    }
```

여기에서 각 재귀마다 적어도 하나의 토큰을 소모하도록 보장합니다. 따라서 무한 재귀 문제가 발생하지 않습니다. 왼쪽 재귀 문제를 해결할 수 있는 일반적인 방법이 있지만, 그 아이디어는 적어도 하나의 토큰을 소모하는 것과 비슷합니다.

# 미해결 문제
해결되지 않았지만, 제 나름대로의 해답은 찾은 문제입니다.
## 문제 3: 재귀하강파서와 bnf가 너무 다릅니다.
왼쪽 재귀 문제를 해결하면서 재귀호출 구조가 bnf와 너무 다르게 변했습니다. 에를 들면 아래와 같은 문법이 있다고 합시다.

``` bnf
expr ::= expr + expr
      | expr * expr
      | ( expr )
      | literal

literal ::= number
```

이 문법은 모호합니다. 연산자의 우선 순위에 대한 문제가 있고, 왼쪽 재귀 문제가 있습니다. 특히, 왼쪽 재귀 문제에 대해서는 크게 두 가지 해결 방법이 있습니다.

1. 문법을 바꿉니다.
2. 재귀가 아니라 루프를 사용합니다.
3. LR 파서를 이용합니다.

1번과 2번은 한 번의 재귀호출의 종료 시점 혹은 루프 종료 시점에 적어도 하나의 토큰을 소모하는 형태로 작성됩니다. 즉 위 문법에 따르면 아래와 같이 작성할 수 있습니다.

``` typescript
/* 문제가 발생하는 재귀 호출 구조 */
function expr() {
  let left = expr(); // 여기서 스택 오버플로우가 발생합니다.
  consume_binop();
  let right = expr();
}

/* 
 * 왼쪽 재귀 문제를 해결하고 우선 순위 문제도 잘 해결합니다.
 * 그러나 우선 순위에 따라 문법을 수정해야 하는 문제가 발생합니다.
 */
function fixed_expr() {
  let left = atom();
  consume_binop();
  let right = expr();  
}

/* 
 * 문제를 해결하고, 문법을 수정하지 않아도 됩니다.
 * 그러나 우선 순위를 적용하는 코드를 작성해야합니다.
 * shunting yard 알고리즘을 이용할 수도 있겠습니다.
 */
function iter_expr() {
  let atom = atom();
  while comsume_binop() {
    atom();
  }
}

/* 말단 노드를 파싱합니다. */
function atom() {
  switch (this.peek()) {
    case TokenType.Number:
    case ToeknType.LP:
      // ...
  }

  return node;
}
```

반복적인 방법과 재귀적인 방법을 섞어서 구성한다면 어느정도 문법 구조를 변경하지 않고 왼쪽 재귀와 우선 순위 문제를 해결할 수 있습니다. 양 쪽의 장점을 취하는 것이죠.

이 때 결합성(associativity) 때문에 토큰의 우선 순위와 하위 식의 우선순위가 달라야 합니다. 예를 들어 아래와 같은 코드가 있다고 가정합시다.
``` py
a = b = 10
```
그러면 이 구문은 `b = 10`이 먼저 평가된 다음에 `a = b`가 평가되어야 합니다. 즉, `=` 연산자 우선 순위가 하위식 `(b = 10)`의 우선 순위보다 커야합니다. 이를 조금 더 쉽게 생각하기 위해서 하나의 연산자가 왼쪽 결합력과 오른쪽 결합력이라는 두 개의 우선 순위를 가진 것으로 생각합니다.  
```
expr |   a   =   b   =   10
prec | 0   2   1   2   1   0
```

그리고 다음과 같은 코드를 생각합니다. 이전 호출의 오른쪽 결합력이 현재의 왼쪽 결합력보다 크면 중지하고, 그렇지 않으면 재귀합니다. 각 재귀 및 루프에서는 적어도 하나의 토큰을 소모합니다.

``` typescript
function expr(prev_bp) {
  let lhs = atom();
  consume();

  while (true) {
    let operator = operator();
    let left_bp = getLeftBindingPower(operator);
    let right_bp = getRightBindingPower(operator);

    if (left_bp < prev_bp) {
      break;
    }

    consume();
    let rhs = expr(right_bp);
    lhs = new BinaryExpr(operator, lhs, rhs);
  }

  return lhs;
}
```

즉 `1 + 2 + 3`과 같은 경우 `(1 + 2) + 3`과 같이 파싱이 됨을 알 수 있습니다(재귀를 통해 (1 + 2), 반복을 통해 + 3 파싱). 반대로 `a = b = 10`은 `a = (b = 10)`으로 파싱됩니다.

이를 이용하면 재귀호출 구조를 간단하게 유지할 수 있습니다. 물론 장점만 있는 것은 아닙니다. 여전히 재귀호출을 사용하고 있기 때문에 스택 오버플로우의 위험은 여전히 존재합니다.

예를 들어서 위와 같은 방법으로 구성할 경우 다음과 같은 표현식을 파싱할 때 호출의 깊이가 지나치게 깊어질 가능성이 있습니다.

```
[[[[[[[[[[[[[[[[[10]]]]]]]]]]]]]]]]]
```

이 경우 스택을 사용한 전통적인 연산자 우선순위 파싱 방법이 유리할 수 있겠습니다.