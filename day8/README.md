# Day 8: Playground

## Problem Description
The Elves need to connect junction boxes in a 3D playground with strings of lights to form circuits.
Input is a list of 3D coordinates (X, Y, Z).

### Part 1
Connect the 1000 pairs of junction boxes that are closest together.
Calculate the product of the sizes of the three largest circuits.

### Part 2
Continue connecting the closest unconnected pairs until all junction boxes form a single circuit.
Calculate the product of the X coordinates of the two junction boxes in the final connection that unifies the components.

## Solution
Implemented in Java.

### How to Run
Compile:
```bash
javac day8/Solution.java
```

Run with input file (default `input.txt`):
```bash
java -cp . day8.Solution day8/input.txt
```

Or specify limit explicitly (though Part 2 logic handles automatic completion):
```bash
java -cp . day8.Solution day8/input.txt 1000
```
