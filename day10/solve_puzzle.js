
import { solveAll } from './src/lib/solver.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
    const inputPath = path.join(__dirname, 'input.txt');
    const input = fs.readFileSync(inputPath, 'utf-8');

    console.log(`Reading input from ${inputPath}...`);
    const result = solveAll(input);
    console.log(`Puzzle Answer Part 1: ${result.part1}`);
    console.log(`Puzzle Answer Part 2: ${result.part2}`);
} catch (err) {
    console.error("Error reading or processing input:", err);
}
