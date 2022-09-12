import { parseMath } from "@unified-latex/unified-latex-util-parse";
import { printLatexAst } from "./printer";

const languages = [
    {
        name: "latex",
        extensions: [".tex"],
        parsers: ["latex-parser"],
    },
];

const parsers = {
    "latex-parser": {
        parseMath,
        astFormat: "latex-ast",
        locStart: (node) => (node.position ? node.position.start.offset : 0),
        locEnd: (node) => (node.position ? node.position.end.offset : 1),
    },
};

const printers = {
    "latex-ast": {
        print: printLatexAst,
    },
};

const prettierPluginLatexMath = { languages, parsers, printers };

export { prettierPluginLatexMath };
