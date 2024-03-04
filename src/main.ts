import { Lexer } from "@parser/lexer";
import { Parser } from "@parser/parser";
import { showCode } from "./utils/code_viewer";
import { CompileError } from "./exceptions/exceptions";
import * as fs from 'fs';

console.log("Please enter the code. Enter Ctrl+D to complete the input:");
let code = fs.readFileSync(0, {
    encoding: "utf-8"
});
main(code);
function main(code: string) {
    try {
        let lexer = new Lexer(code);
        let tokens = lexer.tokenize();
        let parser = new Parser(tokens);
        let ast = parser.parse();
        console.log(JSON.stringify(ast, undefined, 2));
    } catch (err) {
        console.error(err.message);
        if (err instanceof CompileError) {
            showCode(code, 3, err.location)
        }
    }
}