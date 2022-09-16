import * as fs from "fs/promises";

import minimist from "minimist";
import { remark } from "remark";
import remarkMath from "remark-math";

import formatMath from "../index.js";

const args = minimist(process.argv.slice(2), {
    alias: {
        "h": "help"
    },
    boolean: [
        "help"
    ]
});

if (args._.length < 1) {
    console.error('remark-format-math: error: no input files');
    process.exit(1);
}

const input = await fs.readFile(args._[0]);

const output = await remark()
    .use(remarkMath)
    .use(formatMath)
    .process(input);

process.stdout.write(output.value);
process.exit(0);
