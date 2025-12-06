# Advent of Code - Day 5: Cafeteria

This repository contains the Rust solution for Advent of Code Day 5.

## Problem Description
The problem involves determining which ingredient IDs are "fresh" based on a list of fresh ID ranges.
- **Part 1**: Count fresh ingredients from a list of available IDs.
- **Part 2**: Calculate the total number of IDs covered by the fresh ingredient ranges (Union of Intervals).

## Prerequisites
- Rust (and Cargo) installed.

## How to Run

1.  **Run Tests:**
    Verify the logic with the example data provided in the problem description.
    ```sh
    cargo test
    ```
    *(Note: If `cargo` is not in your PATH, you may need to use `~/.cargo/bin/cargo test`)*

2.  **Run Solution:**
    Run the program with your input file.
    ```sh
    cargo run -- input.txt
    ```
    Or simply:
    ```sh
    cargo run
    ```
    (Defaults to `input.txt`)

## Project Structure
- `src/main.rs`: Contains the solution logic for both Part 1 and Part 2.
- `input.txt`: Place your puzzle input here.
