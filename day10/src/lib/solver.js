
/**
 * Solves the Day 10 "Factory" problem.
 * 
 * Problem Summary:
 * We need to find the minimum number of button presses to match a target configuration of lights.
 * 
 * Mathematical Formulation:
 * We can model this as a system of linear equations over GF(2).
 * 
 * Let L be the vector of lights (size N).
 * Target T is the configuration where lights match the diagram.
 *  - Diagram "[.##.]" means we want lights to be [0, 1, 1, 0].
 *  - Initially all lights are 0.
 *  - Wait, re-reading: "To start a machine, its indicator lights must match those shown in the diagram... The machine has the number of indicator lights shown, but its indicator lights are all initially off."
 *  - So we want to reach state T = [d1, d2, ..., dn] from state [0, ..., 0].
 * 
 * Each button j affects a set of lights. We can represent button j as a vector Bj where Bj[i] = 1 if button toggles light i, else 0.
 * If we press button j x_j times, the final state is sum(x_j * Bj) mod 2.
 * We want sum(x_j * Bj) = T (mod 2).
 * 
 * This is Mx = T where M is a matrix with columns Bj.
 * 
 * We want to minimize sum(x_j). Since we are in GF(2), x_j is either 0 or 1.
 * Wait, "You have to push each button an integer number of times... You can push each button as many times as you like."
 * In GF(2), pushing a button 2 times is same as 0 times. So x_j is effectively 0 or 1.
 * So we want to minimize the Hamming weight of vector x.
 * 
 * Algorithm:
 * 1. Parse input to build M and T.
 * 2. Solve Mx = T using Gaussian elimination.
 * 3. Find the particular solution xp.
 * 4. Find the basis for the null space (kernel) of M. Let these be n1, n2, ..., nk.
 * 5. General solution is x = xp + c1*n1 + ... + ck*nk.
 * 6. Iterate all 2^k combinations of c's to find the one that minimizes Hamming weight of x.
 */

export function parseInput(input) {
    const lines = input.trim().split('\n');
    const machines = [];

    for (const line of lines) {
        if (!line.trim()) continue;
        // Example: [.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}

        // 1. Extract Diagram [...]
        const diagramMatch = line.match(/\[([.#]+)\]/);
        if (!diagramMatch) continue;
        const diagramStr = diagramMatch[1];
        const target = diagramStr.split('').map(c => c === '#' ? 1 : 0);
        const numLights = target.length;

        // 2. Extract Buttons (...)
        // Matches all (x,y,z) groups
        const buttonMatches = line.matchAll(/\(([\d,]+)\)/g);
        const buttons = [];
        for (const match of buttonMatches) {
            const indices = match[1].split(',').map(Number);
            const vec = new Array(numLights).fill(0);
            indices.forEach(idx => {
                if (idx < numLights) vec[idx] = 1;
            });
            buttons.push(vec);
        }

        // 3. Extract Joltage {...}
        const joltageMatch = line.match(/\{([\d,]+)\}/);
        let joltage = null;
        if (joltageMatch) {
            joltage = joltageMatch[1].split(',').map(Number);
        }

        machines.push({ target, buttons, joltage, originalLine: line });
    }
    return machines;
}

/**
 * Solves a single machine configuration.
 * Returns the minimum presses, or Infinity if unsolvable.
 * 
 * M has dimensions numLights (rows) x numButtons (cols).
 * [ M | T ]
 */
function solveMachine(machine) {
    const { target, buttons } = machine;
    const numRows = target.length;
    const numCols = buttons.length;

    // Augmented matrix: Rows are lights, Cols are buttons + last col is target
    // We work with rows directly.
    // Let's create an augmented matrix where each row represents an equation for a light.
    // row[i] = [b0[i], b1[i], ..., bn[i], target[i]]

    let matrix = [];
    for (let r = 0; r < numRows; r++) {
        let row = [];
        for (let c = 0; c < numCols; c++) {
            row.push(buttons[c][r]);
        }
        row.push(target[r]);
        matrix.push(row);
    }

    const { pivotRows, freeVars, consistent } = gaussianElimination(matrix, numRows, numCols);

    if (!consistent) return Infinity;

    // Extract particular solution
    // Initialize x with 0
    let x = new Array(numCols).fill(0);

    // Back substitution for pivot variables
    // For a row in RREF: [0...0 1 f1 f2 ... | rhs]
    // x_pivot + sum(f_j * x_free) = rhs
    // x_pivot = rhs - sum(...) = rhs + sum(...) in GF(2)

    // Ideally we set all free vars to 0 initially to get a particular solution.
    // Then constructing the null space basis.

    // Actually, typical way:
    // 1. Particular solution: Set all free variables to 0. Solving for pivots is easy.
    // 2. Homogenous solutions (Null space): 
    //    For each free variable f_i:
    //      Set f_i = 1, all other free vars = 0.
    //      Solve for pivots. This gives a basis vector for the null space.

    // Let's identify pivot columns and free columns.
    const pivotColToRow = new Map();
    pivotRows.forEach((r, idx) => {
        // Find the pivot col (first 1)
        let c = 0;
        while (c < numCols && matrix[r][c] === 0) c++;
        if (c < numCols) {
            pivotColToRow.set(c, r);
        }
    });

    const pivotCols = new Set(pivotColToRow.keys());
    const freeCols = [];
    for (let c = 0; c < numCols; c++) {
        if (!pivotCols.has(c)) freeCols.push(c);
    }

    // Function to compute solution given values for free variables
    const getSolution = (freeValAssignment) => {
        // freeValAssignment is a map or array corresponding to freeCols
        const sol = new Array(numCols).fill(0);

        // Set free variables
        for (let i = 0; i < freeCols.length; i++) {
            sol[freeCols[i]] = freeValAssignment[i];
        }

        // Solve for pivot variables
        // We go upwards or just look at each pivot row.
        // Since it's RREF, for a pivot at col c in row r:
        // 1*x_c + sum(M[r][k] * x_k for k > c) = M[r][numCols]
        // x_c = M[r][numCols] - sum(...) = M[r][numCols] + sum(...)

        // We can just iterate backwards through equations (if we sorted rows by pivot col, but we have pivotColToRow)
        // Wait, standard back substitution requires order.
        // In RREF, for pivot col c, equation is x_c + ... = rhs.
        // The ... only involves variables with higher index (if properly sorted) OR just other variables.
        // But since it's RREF, the other variables in this row must be FREE variables (because all other pivot cols are 0 in this row).
        // YES! That is the property of RREF. Pivot column has 0s everywhere else.
        // So: x_c + sum(M[r][free_k] * x_free_k) = rhs
        // x_c = rhs + sum(...)

        for (const c of pivotCols) {
            const r = pivotColToRow.get(c);
            let sum = 0;
            for (const fc of freeCols) {
                if (matrix[r][fc] === 1) {
                    sum ^= sol[fc];
                }
            }
            sol[c] = matrix[r][numCols] ^ sum;
        }
        return sol;
    };


    // We have k = freeCols.length free variables.
    // Iterate all 2^k assignments.
    // Since N is small enough generally?
    // How big is freeCols?
    // Machine input: light diagrams are short, maybe 10-20 lights? Buttons maybe 10-20?
    // 2^20 is 1 million, feasible in JS.
    // If it's larger we might need optimization but brute forcing free vars is standard for "fewest presses" in these types of AoC problems if null space is small.
    // Given the example, it seems small.

    let minPresses = Infinity;
    const numFree = freeCols.length;
    const limit = 1 << numFree;

    for (let i = 0; i < limit; i++) {
        const assignment = [];
        for (let bit = 0; bit < numFree; bit++) {
            assignment.push((i >> bit) & 1);
        }
        const sol = getSolution(assignment);
        const weight = sol.reduce((a, b) => a + b, 0);
        if (weight < minPresses) {
            minPresses = weight;
        }
    }

    return minPresses;
}

/**
 * Performs Gaussian Elimination over GF(2)
 * Modifies matrix in place to be in Row Echelon Form (specifically RREF usually desired).
 * Returns pivot information.
 */
function gaussianElimination(matrix, rows, cols) {
    let pivotRow = 0;
    const pivotRows = []; // store which rows act as pivots

    // Forward elimination
    for (let c = 0; c < cols && pivotRow < rows; c++) {
        // Find pivot in current column c, starting from pivotRow
        let r = pivotRow;
        while (r < rows && matrix[r][c] === 0) r++;

        if (r < rows) {
            // Found a pivot at (r, c)
            // Swap row r with pivotRow
            [matrix[pivotRow], matrix[r]] = [matrix[r], matrix[pivotRow]];

            // Eliminate other rows
            for (let i = 0; i < rows; i++) {
                if (i !== pivotRow && matrix[i][c] === 1) {
                    // Row add (XOR)
                    for (let j = c; j <= cols; j++) {
                        matrix[i][j] ^= matrix[pivotRow][j];
                    }
                }
            }
            pivotRows.push(pivotRow);
            pivotRow++;
        }
    }

    // Check consistency
    // If any row is [0 0 ... 0 | 1], then inconsistent
    let consistent = true;
    for (let r = pivotRow; r < rows; r++) {
        if (matrix[r][cols] === 1) {
            consistent = false;
            break;
        }
    }

    return { pivotRows, consistent };
}

export function solveAll(input) {
    const machines = parseInput(input);
    let totalP1 = 0;
    let totalP2 = 0;

    for (const m of machines) {
        // Part 1
        const presses1 = solveMachine(m);
        // If impossible, treat as 0 or error? Prompt asks for sum of "fewest total presses ... required to correctly configure ... all".
        // Implicitly assumes solution exists.
        if (presses1 === Infinity) {
            // console.warn("Part 1 Impossible for machine:", m.originalLine);
        } else {
            totalP1 += presses1;
        }

        // Part 2
        const presses2 = solveMachinePart2(m);
        if (presses2 === Infinity) {
            // console.warn("Part 2 Impossible for machine:", m.originalLine);
        } else {
            totalP2 += presses2;
        }
    }
    return { part1: totalP1, part2: totalP2 };
}

/**
 * Solves Part 2: Integer Linear System Ax = b, x >= 0, minimize sum(x).
 * A is 0/1 matrix (buttons), b is joltage target vector.
 */
function solveMachinePart2(machine) {
    if (!machine.joltage) return 0;

    const target = machine.joltage;
    const buttons = machine.buttons; // These are 0/1 vectors
    const numRows = target.length;
    const numCols = buttons.length;

    // We use Fractions to avoid precision issues during elimination.
    // However, JS doesn't have built-in Fraction. 
    // Given the constraints (numbers up to ~200), floating point might suffice if we use epsilon.
    // Or we can implement a tiny Fraction class. Let's try floating point with epsilon and see if it holds provided numbers aren't huge (inputs seem < 1000).
    // Actually, Gaussian Elim is numerically stable enough for small integers.

    // Matrix [buttons | target]
    let matrix = [];
    for (let r = 0; r < numRows; r++) {
        let row = [];
        for (let c = 0; c < numCols; c++) {
            row.push(buttons[c][r]);
        }
        row.push(target[r]);
        matrix.push(row);
    }

    // Gaussian Elimination (Real/Rational field, not GF(2))
    const pivotRows = [];
    let pivotRow = 0;

    for (let c = 0; c < numCols && pivotRow < numRows; c++) {
        // Find pivot
        let r = pivotRow;
        while (r < numRows && Math.abs(matrix[r][c]) < 1e-9) r++;

        if (r < numRows) {
            // Swap
            [matrix[pivotRow], matrix[r]] = [matrix[r], matrix[pivotRow]];

            // Normalize pivot row
            const pivotVal = matrix[pivotRow][c];
            for (let j = c; j <= numCols; j++) {
                matrix[pivotRow][j] /= pivotVal;
            }
            // Now pivot is 1.

            // Eliminate others
            for (let i = 0; i < numRows; i++) {
                if (i !== pivotRow && Math.abs(matrix[i][c]) > 1e-9) {
                    const factor = matrix[i][c];
                    for (let j = c; j <= numCols; j++) {
                        matrix[i][j] -= factor * matrix[pivotRow][j];
                    }
                }
            }

            pivotRows.push({ row: pivotRow, col: c });
            pivotRow++;
        }
    }

    // Check consistency (Row of zeros = Non-zero)
    for (let r = pivotRow; r < numRows; r++) {
        if (Math.abs(matrix[r][numCols]) > 1e-5) return Infinity;
    }

    // Identify Free and Pivot variables
    const pivotCols = new Set(pivotRows.map(p => p.col));
    const freeCols = [];
    for (let c = 0; c < numCols; c++) {
        if (!pivotCols.has(c)) freeCols.push(c);
    }

    // Back substitution logic is builtin to RREF.
    // For each pivot variable x_p:
    // x_p + sum(coeff * x_free) = rhs
    // x_p = rhs - sum(coeff * x_free)

    // We need to find non-negative integers x_free such that all x_p are non-negative integers.
    // Minimize sum(x).

    // If no free vars, just check if solution is integer & >= 0.
    if (freeCols.length === 0) {
        let sum = 0;
        for (const p of pivotRows) {
            const val = matrix[p.row][numCols];
            if (val < -1e-5 || Math.abs(val - Math.round(val)) > 1e-5) return Infinity; // Not non-negative integer
            sum += Math.round(val);
        }
        return sum;
    }

    // If there ARE free variables, we search.
    // Search space?
    // Start x_free at 0.
    // Max value? RHS values are ~100. So x can't be huge (since coeffs are mostly positive 0/1 in original matrix, but in RREF they can be anything).
    // Original A has 0/1 entries. x >= 0. Ax = b.
    // b_i ~ 100.
    // sum(A_ij * x_j) = b_i.
    // Since A_ij >= 0, and x_j >= 0, then no x_j can exceed max(b_i) if A_ij is 1.
    // If A_ij is 0 for all i, that button does nothing (useless).
    // So upper bound for any x_j is essentially max(target).

    // Let's determine a specialized max bound.
    const maxTarget = Math.max(...target);
    const searchLimit = maxTarget + 5; // A bit of buffer

    let minTotal = Infinity;

    // Recursively assign free variables
    // Optimization: Try to pick smaller values first.

    // Note: With e.g. 5 free vars and limit 100, 100^5 is too big.
    // Only works if k is very small.
    // What if k is large?
    // In AoC Day 10, usually inputs are constrained.
    // Let's try simple recursion with pruning.

    function solveRecursive(freeIdx, currentFreeVals) {
        if (freeIdx === freeCols.length) {
            // All free vars assigned. Calculate pivots.
            let currentSum = 0;
            for (const v of currentFreeVals) currentSum += v;

            // Check pivots
            for (const p of pivotRows) {
                const r = p.row;
                const c = p.col;
                // x_c = rhs - sum(coeff * x_free)
                let val = matrix[r][numCols];
                for (let i = 0; i < freeCols.length; i++) {
                    const fc = freeCols[i];
                    val -= matrix[r][fc] * currentFreeVals[i];
                }

                // Must be non-negative integer
                if (val < -1e-5 || Math.abs(val - Math.round(val)) > 1e-5) return;
                currentSum += Math.round(val);
            }

            if (currentSum < minTotal) minTotal = currentSum;
            return;
        }

        const colIdx = freeCols[freeIdx];

        // Try values 0 to searchLimit
        // Can we bound this?
        // x_p = rhs - coeff * x_free ...
        // If coeff > 0, increasing x_free decreases x_p. x_p >= 0 implies x_free upper bound.
        // If coeff < 0, increasing x_free increases x_p. No upper bound from this eqn.

        // Compute strict bounds for this free variable based on PARTIAL assignment?
        // No, other free vars contribute.

        // Simpler bound: Just iterate 0 to searchLimit.
        // If freeCols is large, we might timeout.
        // Assuming k is small (0, 1, 2) based on inspection.

        for (let v = 0; v <= searchLimit; v++) {
            currentFreeVals[freeIdx] = v;
            // Pruning: if partial sum already exceeds minTotal, stop (since pivots >= 0)
            // But we don't know pivots yet. Pivots could be 0.
            // But currentFreeVals sum contributes.
            let partialSum = 0;
            for (let i = 0; i <= freeIdx; i++) partialSum += currentFreeVals[i];
            if (partialSum >= minTotal) break;

            solveRecursive(freeIdx + 1, currentFreeVals);
        }
    }

    solveRecursive(0, new Array(freeCols.length));

    return minTotal;
}

