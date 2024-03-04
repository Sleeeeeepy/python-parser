import { JsonCustomSerializable } from "@interface/json";
import { Visitable, Visitor } from "@interface/visitor";

export class AbstractSyntaxTree implements JsonCustomSerializable {
    private _root?: SyntaxNode;

    public constructor(root?: SyntaxNode) {
        this._root = root;
    }

    public set root(node: SyntaxNode) {
        this._root = node;
    }

    public get root() {
        if (!this._root) {
            throw new Error("property _root is not set.");
        }
        return this._root;
    }

    public toJSON(): object {
        return {root: this.root};
    }
}

export abstract class SyntaxNode implements JsonCustomSerializable, Visitable {
    private _parent?: SyntaxNode;
    protected nodeType: string;

    public constructor(parent?: SyntaxNode) {
        this._parent = parent;
        this.nodeType = this.constructor.name;
    }

    public get parent(): SyntaxNode {
        if (!this._parent) 
            throw new Error("property _parent is not set.");
        return this._parent;
    }

    public set parent(parent: SyntaxNode) {
        this._parent = parent;
    }

    public toJSON(): object {
        return {kind: this.nodeType};
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitDefault(this);
    }
}