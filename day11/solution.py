import sys

def count_paths(start_node, target_node, graph, memo):
    if start_node == target_node:
        return 1
    
    memo_key = (start_node, target_node)
    if memo_key in memo:
        return memo[memo_key]
    
    if start_node not in graph:
        return 0
    
    total_paths = 0
    for neighbor in graph[start_node]:
        total_paths += count_paths(neighbor, target_node, graph, memo)
    
    memo[memo_key] = total_paths
    return total_paths

def main():
    if len(sys.argv) < 2:
        print("Usage: python solution.py <input_file>")
        sys.exit(1)
        
    filename = sys.argv[1]
    graph = {}
    
    try:
        with open(filename, 'r') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                parts = line.split(':')
                source = parts[0].strip()
                destinations = parts[1].strip().split()
                graph[source] = destinations
                
        # Part 1: 'you' -> 'out'
        memo = {}
        result_part1 = count_paths('you', 'out', graph, memo)
        print(f"Part 1 - Total paths from 'you' to 'out': {result_part1}")
        
        # Part 2: 'svr' -> 'out' passing through 'dac' and 'fft'
        # The paths must be either svr -> dac -> fft -> out OR svr -> fft -> dac -> out
        # Since data flows in one direction, one of these orders will be possible, or neither, but not both in a loop (assuming DAG).
        # We calculate both combinations just in case.
        
        memo = {}
        
        # Path 1: svr -> dac -> fft -> out
        p1_seg1 = count_paths('svr', 'dac', graph, memo)
        p1_seg2 = count_paths('dac', 'fft', graph, memo)
        p1_seg3 = count_paths('fft', 'out', graph, memo)
        path1_total = p1_seg1 * p1_seg2 * p1_seg3
        
        # Path 2: svr -> fft -> dac -> out
        p2_seg1 = count_paths('svr', 'fft', graph, memo)
        p2_seg2 = count_paths('fft', 'dac', graph, memo)
        p2_seg3 = count_paths('dac', 'out', graph, memo)
        path2_total = p2_seg1 * p2_seg2 * p2_seg3
        
        result_part2 = path1_total + path2_total
        print(f"Part 2 - Total paths from 'svr' to 'out' via 'dac' and 'fft': {result_part2}")
        
    except FileNotFoundError:
        print(f"Error: File '{filename}' not found.")
        sys.exit(1)

if __name__ == "__main__":
    main()
