import { Location } from "@parser/token";

export function showCode(code: string, minLines: number = 5, startsAt?: Location) {
    const startRow = startsAt?.row ?? 0;
    const startColumn = startsAt?.column ?? 0;

    const lines = code.split("\n").slice(0, startRow + minLines);
    for (let i = startRow; i < lines.length; i++) {
        const lineNumber = startRow + i;
        const lineContent = lines[i];

        const gutter = lineNumber.toString().padStart(4, " ");
        console.log(`${gutter} | ${lineContent}`);
        if (startsAt.row == i) {
            const marker = "^".repeat(startColumn == 0 ? 1 : startColumn);
            console.log(" ".repeat(4) + "   " + marker);
        }
    }
}
