
import { solveAll } from './src/lib/solver.js';

const input = `
[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
[...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
[.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}
`;

const result = solveAll(input);
console.log(`Result Part 1: ${result.part1}`);
console.log(`Result Part 2: ${result.part2}`);

if (result.part1 === 7 && result.part2 === 33) {
    console.log("PASS: Results match expected values (P1=7, P2=33).");
    process.exit(0);
} else {
    console.error(`FAIL: Expected P1=7, P2=33. Got P1=${result.part1}, P2=${result.part2}.`);
    process.exit(1);
}
