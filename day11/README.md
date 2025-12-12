# Day 11: Reactor

## Problem Description
The goal is to analyze the electrical conduit network to fix pathing issues.

### Part 1
Count the number of distinct paths from a starting device `you` to an ending device `out`. Data flows in one direction through directed connections.

### Part 2
Count the number of distinct paths from a server rack `svr` to `out` that must pass through *both* the digital-to-analog converter (`dac`) and the fast Fourier transform device (`fft`).

## Solution
The solution is implemented in Python and uses Depth First Search (DFS) with memoization.

### Approach
- **Part 1**: Standard path counting from `you` to `out`.
- **Part 2**: Decomposes the path into segments to ensure both `dac` and `fft` are visited. Since the graph is directed and likely acyclic (DAG), the path must be one of:
    1. `svr` -> `dac` -> `fft` -> `out`
    2. `svr` -> `fft` -> `dac` -> `out`
    It calculates the counts for each segment independently and sums the products of the valid sequences.

## Usage
To run the solution:
```bash
python3 solution.py input.txt
```
This will output the results for both Part 1 and Part 2.
