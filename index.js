/*
Copyright (c) 2022 McEndu.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import console from "console";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { argv, argv0, exit } from "process";
import { spawnSync } from "child_process";

import minimist from "minimist";
import rehypeFormat from "rehype-format";
import rehypeMathJax from "rehype-mathjax";
import rehypeStringify from "rehype-stringify";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import formatMath from "./lib/format-math.js";

const helpText = `Usage: ${argv0} [FILE]`

let inputFile, inputString;

const opts = minimist(argv.slice(2), {
    alias: {
        h: "help",
    },
    boolean: ["help"],
});

if (opts.help) {
    console.log(helpText);
    exit(0);
}

if (opts._.length == 0) {
    console.error(`${argv0}: error: no input files`);
    exit(2);
}

try {
    inputFile = await fs.open(opts._[0]);
    inputString = await inputFile.readFile("utf-8");
} catch (e) {
    console.error(`${argv0}: fatal error: cannot open input file`);
    exit(2);
} finally {
    await inputFile.close();
}

const baseProcessor = unified().use(remarkParse).use(remarkMath);

const expected = await baseProcessor()
    .use(remarkRehype)
    .use(rehypeMathJax)
    .use(rehypeFormat) // we are outputting diffs so a formatter is great help
    .use(rehypeStringify)
    .process(inputString);

const formatted = await baseProcessor()
    .use(formatMath)
    .use(remarkRehype)
    .use(rehypeMathJax)
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(inputString);

if (expected.value == formatted.value) {
    exit(0); // no output for no discrepancies
} else {
    console.log("MathJax output differs");
    console.log("Expected:");
    console.log(expected.value);
    console.log("Formatted:");
    console.log(formatted.value);
    exit(1);
}
