# Day 7: Laboratories

## Problem Description
The problem involves simulating tachyon beams through a manifold containing splitters (`^`). 
- Beams start at `S` and move downward.
- Hitting a splitter stops the current beam and creates two new ones at immediate left and right, which then continue downward.
- The goal is to count the total number of times a beam is split.

## Solution
The solution is implemented in `main.go` using a row-by-row simulation logic.

## How to Run
```bash
go run main.go input.txt
```
