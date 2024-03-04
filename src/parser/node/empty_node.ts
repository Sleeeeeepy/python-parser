import { SyntaxNode } from "@parser/node/ast_node_base";

export class Statement extends SyntaxNode { }
export class Expression extends SyntaxNode {
    public inferredType?: string;
}
export class Type extends SyntaxNode { }
export class Target extends Expression { }
export class Literal extends Expression { }