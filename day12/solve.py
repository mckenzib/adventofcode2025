import sys
import collections

sys.setrecursionlimit(5000)

# --- Data Structures ---

class Shape:
    def __init__(self, id, lines):
        self.id = id
        self.coords = []
        for r, line in enumerate(lines):
            for c, char in enumerate(line):
                if char == '#':
                    self.coords.append((r, c))
        self.variations = self._generate_variations()

    def _normalize(self, coords):
        if not coords:
            return tuple()
        min_r = min(r for r, c in coords)
        # Find min_c among the rows that are equal to min_r (top-most rows)
        # Actually, standard normalization usually just translates strict bounding box to 0,0
        # BUT for the solver to work by "scanning" and placing the *first cell* of the shape
        # into the *first empty cell* of the grid, we need the shape coordinates to comprise:
        # (0, 0) and other offsets relative to that first cell.
        #
        # Let's sort the coords. The first one in reading order (r, then c) will be our anchor (0,0).
        
        sorted_coords = sorted(coords)
        base_r, base_c = sorted_coords[0]
        
        normalized = []
        for r, c in coords:
            normalized.append((r - base_r, c - base_c))
        
        return tuple(sorted(normalized))

    def _generate_variations(self):
        variations = set()
        
        curr = self.coords
        
        # 4 Rotations
        for _ in range(4):
            variations.add(self._normalize(curr))
            curr = [(c, -r) for r, c in curr]
            
        # Flip
        curr = [(r, -c) for r, c in self.coords]
        
        # 4 Rotations of flipped
        for _ in range(4):
            variations.add(self._normalize(curr))
            curr = [(c, -r) for r, c in curr]
            
        return list(variations)

def parse_input(filename):
    shapes = {}
    puzzles = []
    
    current_shape_id = None
    current_shape_lines = []
    
    with open(filename, 'r') as f:
        lines = [line.rstrip() for line in f]
        
    i = 0
    while i < len(lines):
        line = lines[i]
        
        if not line:
            if current_shape_id is not None:
                shapes[current_shape_id] = Shape(current_shape_id, current_shape_lines)
                current_shape_id = None
                current_shape_lines = []
            i += 1
            continue
            
        # Check for puzzle line first (contains "x" and ":")
        if 'x' in line and ':' in line:
            # Puzzle
            # Handle previous shape if any
            if current_shape_id is not None:
                shapes[current_shape_id] = Shape(current_shape_id, current_shape_lines)
                current_shape_id = None
                current_shape_lines = []
                
            parts = line.split(':')
            dims = parts[0].split('x')
            w, h = int(dims[0]), int(dims[1])
            counts = list(map(int, parts[1].strip().split()))
            puzzles.append({'w': w, 'h': h, 'counts': counts})
            
        elif line.endswith(':'):
            # Shape header
            current_shape_id = int(line[:-1])
            current_shape_lines = []
        else:
            if current_shape_id is not None:
                current_shape_lines.append(line)
        
        i += 1
        
    if current_shape_id is not None:
        shapes[current_shape_id] = Shape(current_shape_id, current_shape_lines)
        
    return shapes, puzzles

# --- Solver ---

class Solver:
    def __init__(self, w, h, shapes, counts):
        self.W = w
        self.H = h
        self.shapes = shapes
        self.initial_counts = counts
        # Expand counts into a list of shapes to place for easier recursion?
        # Or keep counts map. Counts map is better for "try one of type X".
        self.target_counts = {}
        for idx, count in enumerate(counts):
            if count > 0:
                self.target_counts[idx] = count
                
        self.grid = set() # Set of (r, c) occupied
        self.solution_found = False

    def solve(self):
        # Validation: check total area
        total_shape_area = 0
        for idx, count in self.target_counts.items():
            shape_area = len(self.shapes[idx].coords)
            total_shape_area += shape_area * count
            
        if total_shape_area > self.W * self.H:
            return False # Impossible
            
        return self._dfs(0)
        
    def _dfs(self, idx):
        # Base case: All shapes placed
        if not self.target_counts: 
            self.solution_found = True
            return True
        
        # Base case: End of grid
        if idx >= self.W * self.H: 
            return False
            
        r, c = divmod(idx, self.W)
        
        # If already occupied, move to next
        if (r, c) in self.grid:
            return self._dfs(idx + 1)
            
        # Optimization: Calculate if valid solution is even possible
        # Area Pruning
        remaining_needed = sum(len(self.shapes[t].coords) * cnt for t, cnt in self.target_counts.items())
        current_free = (self.W * self.H) - len(self.grid)
        
        # Option 1: Try to place shapes here (Anchored at r,c)
        # Only if we have enough space (strictly, though placement check handles geometry)
        if current_free >= remaining_needed:
            types = list(self.target_counts.keys())
            # Sort types to be deterministic? 
            # types.sort() 
            
            for type_id in types:
                shape = self.shapes[type_id]
                
                # Check variations
                for var_coords in shape.variations:
                    # Check fit
                    can_fit = True
                    cells_to_occupy = []
                    for dr, dc in var_coords:
                        nr, nc = r + dr, c + dc
                        if not (0 <= nr < self.H and 0 <= nc < self.W):
                            can_fit = False; break
                        if (nr, nc) in self.grid:
                            can_fit = False; break
                        cells_to_occupy.append((nr, nc))
                    
                    if can_fit:
                        # Place
                        for cr, cc in cells_to_occupy:
                            self.grid.add((cr, cc))
                        
                        # Decrement count
                        self.target_counts[type_id] -= 1
                        if self.target_counts[type_id] == 0:
                            del self.target_counts[type_id]
                            
                        # Recurse
                        if self._dfs(idx + 1):
                            return True
                            
                        # Backtrack
                        self.target_counts[type_id] = self.target_counts.get(type_id, 0) + 1
                        for cr, cc in cells_to_occupy:
                            self.grid.remove((cr, cc))
                            
        # Option 2: Leave cell empty (Skip)
        # Only valid if we still have enough area AFTER skipping this cell
        # (current_free - 1 since we waste this cell)
        if (current_free - 1) >= remaining_needed:
            if self._dfs(idx + 1):
                return True
                
        return False

def main():
    filename = sys.argv[1] if len(sys.argv) > 1 else 'input.txt'
    shapes, puzzles = parse_input(filename)
    
    print(f"Loaded {len(shapes)} shapes and {len(puzzles)} puzzles.")
    # for sid, s in shapes.items():
    #     print(f"Shape {sid}: {len(s.variations)} variations")
        
    solved_count = 0
    for i, puzzle in enumerate(puzzles):
        solver = Solver(puzzle['w'], puzzle['h'], shapes, puzzle['counts'])
        if solver.solve():
            print(f"Region {i}: Solved")
            solved_count += 1
        else:
            print(f"Region {i}: Impossible")
            
    print(solved_count)

if __name__ == '__main__':
    main()
