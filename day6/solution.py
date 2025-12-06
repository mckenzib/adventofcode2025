import sys

def solve():
    filename = sys.argv[1] if len(sys.argv) > 1 else 'input.txt'
    try:
        with open(filename, 'r') as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"Error: File '{filename}' not found.")
        return

    # Determine width of the input
    if not lines:
        return
    
    width = len(lines[0].rstrip('\n'))
    
    # Identify columns that are completely empty (separators)
    # We'll check each column index from 0 to width-1
    # A column is a separator if it's all spaces in all lines
    
    # Pad lines to max width to avoid index errors
    padded_lines = [line.rstrip('\n').ljust(width) for line in lines]
    
    is_separator = []
    for col in range(width):
        col_chars = [line[col] for line in padded_lines]
        if all(c == ' ' for c in col_chars):
            is_separator.append(True)
        else:
            is_separator.append(False)
            
    # Group columns into problems
    problems = []
    current_problem_cols = []
    
    for col in range(width):
        if is_separator[col]:
            if current_problem_cols:
                problems.append(current_problem_cols)
                current_problem_cols = []
        else:
            current_problem_cols.append(col)
            
    if current_problem_cols:
        problems.append(current_problem_cols)
        
    grand_total = 0
    
    for problem_cols in problems:
        # Extract the text for this problem
        # Each problem has numbers and an operator at the bottom
        # We need to find the numbers and the operator
        
        # Let's look at the rows for this problem's columns
        # The operator is likely in the last non-empty line for this block
        
        # Extract all tokens from this vertical slice
        tokens = []
        
        # We can iterate through lines and extract the chunk corresponding to these columns
        # Then parse numbers/operators from that chunk
        
        problem_lines = []
        for line in padded_lines:
            chunk = "".join([line[c] for c in problem_cols]).strip()
            if chunk:
                problem_lines.append(chunk)
                
        # The last item should be the operator
        operator = problem_lines[-1]
        numbers = [int(x) for x in problem_lines[:-1]]
        
        result = 0
        if operator == '+':
            result = sum(numbers)
        elif operator == '*':
            result = 1
            for n in numbers:
                result *= n
        
        grand_total += result
        # print(f"Problem: {numbers} {operator} = {result}")

    print(f"Part 1 Grand Total: {grand_total}")

    # Part 2
    grand_total_part2 = 0
    
    for problem_cols in problems:
        # For Part 2, we read columns right-to-left
        # Each column is a number (top to bottom)
        
        numbers = []
        # Iterate columns in reverse (right to left)
        for col in reversed(problem_cols):
            # Extract digits from this column (excluding the last row which is operator)
            # Note: The operator is at the bottom of the problem block.
            # We need to find the operator row index. It seems to be the last non-empty line of the block?
            # In Part 1 we assumed the last line of the block text was the operator.
            # Let's be more precise. The operator is in the last line of the input (or the last line that has content for this block).
            
            # Let's gather the column characters
            col_chars = [padded_lines[r][col] for r in range(len(padded_lines))]
            
            # The operator is at the bottom.
            # Let's find the operator. It's the last non-space character in the block's columns?
            # Actually, the problem says "at the bottom of the problem is the symbol".
            # Let's assume it's the last character in the column that is not a space?
            # No, the operator is "at the bottom of the problem". It might span multiple columns?
            # "Problems are separated by a full column of only spaces. The left/right alignment of numbers within each problem can be ignored."
            # "at the bottom of the problem is the symbol for the operation that needs to be performed."
            # In the example:
            # *   +   *   +
            # It seems the operator is in the last line.
            
            # So for a given column, the last character (in the last line) might be the operator or space.
            # But the numbers are "above" it.
            
            # Let's extract the digits.
            digits = ""
            for r in range(len(padded_lines) - 1): # Exclude last line (operator line)
                char = padded_lines[r][col]
                if char.isdigit():
                    digits += char
            
            if digits:
                numbers.append(int(digits))
        
        # Find operator
        # It's in the last line, somewhere within problem_cols
        operator = None
        last_line_chars = [padded_lines[-1][c] for c in problem_cols]
        for char in last_line_chars:
            if char in ['+', '*']:
                operator = char
                break
        
        if not operator:
             # Fallback if operator is not in the very last line of the file (e.g. trailing empty lines)
             # But based on example, it is.
             pass

        result = 0
        if operator == '+':
            result = sum(numbers)
        elif operator == '*':
            result = 1
            for n in numbers:
                result *= n
        
        grand_total_part2 += result
        # print(f"Part 2 Problem: {numbers} {operator} = {result}")

    print(f"Part 2 Grand Total: {grand_total_part2}")


if __name__ == '__main__':
    solve()
