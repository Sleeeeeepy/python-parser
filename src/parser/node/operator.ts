import { TokenType } from "@parser/token";

export enum Operator {
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

    Not = "not",
    And = "and",
    Or = "or",
    Is = "is"
}

export function tokenToOperator(tokenType: TokenType) {
    switch (tokenType) {
        case TokenType.Plus:
            return Operator.Plus;
        case TokenType.Minus:
            return Operator.Minus;
        case TokenType.Power:
            return Operator.Power;
        case TokenType.Multiply:
            return Operator.Multiply;
        case TokenType.FloorDivide:
            return Operator.FloorDivide;
        case TokenType.Divide:
            return Operator.Divide;
        case TokenType.Mod:
            return Operator.Mod;
        case TokenType.Equal:
            return Operator.Equal;
        case TokenType.NotEqual:
            return Operator.NotEqual;
        case TokenType.LessEqual:
            return Operator.LessEqual;
        case TokenType.GreaterEqual:
            return Operator.GreaterEqual;
        case TokenType.Less:
            return Operator.Less;
        case TokenType.Greater:
            return Operator.Greater;
        case TokenType.Not:
            return Operator.Not;
        case TokenType.And:
            return Operator.And;
        case TokenType.Or:
            return Operator.Or;
        case TokenType.Is:
            return Operator.Is;
    }
}