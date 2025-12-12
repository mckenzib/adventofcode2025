package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run main.go <input_file>")
		return
	}

	inputFile := os.Args[1]
	grid, startRow, startCol := readGrid(inputFile)

	if startRow == -1 {
		fmt.Println("Error: Start position 'S' not found.")
		return
	}

	splitCount := solve(grid, startRow, startCol)
	fmt.Printf("Total splits: %d\n", splitCount)
}

func readGrid(filename string) ([][]rune, int, int) {
	file, err := os.Open(filename)
	if err != nil {
		panic(err)
	}
	defer file.Close()

	var grid [][]rune
	scanner := bufio.NewScanner(file)
	startRow, startCol := -1, -1

	rowIdx := 0
	for scanner.Scan() {
		line := scanner.Text()
		row := []rune(line)
		for c, char := range row {
			if char == 'S' {
				startRow = rowIdx
				startCol = c
			}
		}
		grid = append(grid, row)
		rowIdx++
	}

	return grid, startRow, startCol
}

func solve(grid [][]rune, startRow, startCol int) int {
	splits := 0
	height := len(grid)
	if height == 0 {
		return 0
	}
	width := len(grid[0]) // Assuming rectangular grid

	// Active columns for the current row
	activeCols := make(map[int]bool)
	activeCols[startCol] = true

	// Part 2: Count timelines
	// Map col -> number of timelines
	timelineCounts := make(map[int]int64)
	timelineCounts[startCol] = 1
	var totalFinishedTimelines int64 = 0

	// Simulate row by row starting from the row with 'S'
	for r := startRow; r < height; r++ {
		nextCols := make(map[int]bool)
		nextTimelineCounts := make(map[int]int64)

		for c := range activeCols {
			// Bounds check check
			if c < 0 || c >= width {
				continue
			}

			cell := grid[r][c]
			count := timelineCounts[c]

			if cell == '^' {
				splits++
				// Beam splits left and right for the NEXT row
				if r+1 < height {
					// Left branch
					if c-1 >= 0 {
						nextCols[c-1] = true
						nextTimelineCounts[c-1] += count
					} else {
						// Exits side
						totalFinishedTimelines += count
					}
					// Right branch
					if c+1 < width {
						nextCols[c+1] = true
						nextTimelineCounts[c+1] += count
					} else {
						// Exits side
						totalFinishedTimelines += count
					}
				} else {
					// Exits bottom (at next step)
					// The split creates 2 beams, both exit bottom immediately
					totalFinishedTimelines += count * 2
				}
			} else {
				// Beam continues straight down
				if r+1 < height {
					nextCols[c] = true
					nextTimelineCounts[c] += count
				} else {
					// Exits bottom
					totalFinishedTimelines += count
				}
			}
		}
		activeCols = nextCols
		timelineCounts = nextTimelineCounts

		if len(activeCols) == 0 {
			break
		}
	}

	fmt.Printf("Total splits: %d\n", splits)

	// Add any remaining active timelines that exited bottom
	// (Note: The loop logic adds to totalFinishedTimelines when r+1 >= height,
	// so we don't need to sum timelineCounts here?
	// Let's re-verify.
	// In the loop, if r+1 < height, we add to nextTimelineCounts.
	// If r+1 >= height (meaning current r is the last row), we add to totalFinishedTimelines.
	// So yes, totalFinishedTimelines should be complete.)

	fmt.Printf("Total timelines: %d\n", totalFinishedTimelines)

	return splits
}
