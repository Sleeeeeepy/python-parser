import { Location } from "@parser/token";

export class CompileError extends Error {
    public location?: Location;

    public constructor(message: string, location?: Location) {
        super(message);
        this.location = location;
    }
}

export class TokenError extends CompileError {
    public constructor(message: string, location?: Location) {
        super(message, location);
    }
}

export class IndentationError extends CompileError { 
    public constructor(message: string, location?: Location) {
        super(message, location);
    }
}

export class ParserError extends CompileError {
    public constructor(message: string, location?: Location) {
        super(message, location);
    }
}

export class UndefinedClassException extends Error {
    public constructor(message: string) {
        super(message);
    }
}