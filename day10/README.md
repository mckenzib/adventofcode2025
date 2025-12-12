# Day 10: Factory Initialization

This project is a React-based solution for the Day 10 Advent of Code problem. It features a "fun and beautiful" neon-industrial interface to interact with the factory machine puzzles.

## Features

-   **Linear Algebra Solver**: Uses Gaussian Elimination over GF(2) (Galois Field 2) to solve for the button press combinations.
-   **Minimization**: Automatically finds the combination of button presses with the minimum Hamming weight (fewest total presses) even when there are free variables (multiple solutions).
-   **Neon UI**: Styled with a dark mode, cyberpunk-inspired factory aesthetic.

## How to Run

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```
3.  Open the local URL (usually `http://localhost:5173`).
4.  Paste your puzzle input into the text area and click "Analyze Configuration".

## Project Structure

-   `src/lib/solver.js`: Core algorithmic logic.
-   `src/App.jsx`: Main UI component.
-   `src/index.css`: Custom neon styles (no tailwind!).
