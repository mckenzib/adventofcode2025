# Day 6: Trash Compactor

## Problem Description
The problem involves parsing a "cephalopod math" worksheet. The worksheet contains multiple arithmetic problems arranged horizontally.

### Part 1
- Problems are separated by empty columns.
- Numbers are arranged vertically within each problem block.
- An operator (`+` or `*`) is at the bottom of each block.
- The goal is to calculate the result of each problem and sum them up to get a grand total.

### Part 2
- The parsing rules change.
- Numbers are now read **right-to-left** in columns within each problem block.
- Each column represents a number (most significant digit at the top).
- The operator is still at the bottom.
- The goal is again to calculate the grand total.

## Solution
The solution is implemented in `solution.py`.

### How to Run
To run the solution with the provided input file:
```bash
python3 solution.py input.txt
```

To run with the example/test input:
```bash
python3 solution.py test_input.txt
```

### Output
The script prints the grand total for both Part 1 and Part 2.

```
Part 1 Grand Total: 7098065460541
Part 2 Grand Total: 13807151830618
```
