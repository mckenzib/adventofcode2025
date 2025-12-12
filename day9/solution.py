import sys

def solve():
    if len(sys.argv) < 2:
        print("Usage: python3 solution.py <input_file>")
        sys.exit(1)

    filename = sys.argv[1]
    coords = []
    
    try:
        with open(filename, 'r') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                x, y = map(int, line.split(','))
                coords.append((x, y))
    except FileNotFoundError:
        print(f"Error: File '{filename}' not found.")
        sys.exit(1)
    except ValueError:
        print("Error: Invalid input format. Expected 'x,y' on each line.")
        sys.exit(1)

    max_area_p1 = 0
    max_area_p2 = 0
    n = len(coords)
    
    # Construct polygon edges
    poly_edges = []
    for i in range(n):
        p1 = coords[i]
        p2 = coords[(i + 1) % n]
        poly_edges.append((p1, p2))

    for i in range(n):
        for j in range(i + 1, n):
            x1, y1 = coords[i]
            x2, y2 = coords[j]
            
            width = abs(x1 - x2) + 1
            height = abs(y1 - y2) + 1
            area = width * height
            
            if area > max_area_p1:
                max_area_p1 = area
            
            # Optimization for Part 2: If area is not better than current max, skip checks
            if area <= max_area_p2:
                continue
                
            # Part 2 Validation
            min_x, max_x = min(x1, x2), max(x1, x2)
            min_y, max_y = min(y1, y2), max(y1, y2)
            
            # 1. Point in Polygon Test (Ray Casting)
            # Use center of rectangle to avoid boundary issues
            center_x = (min_x + max_x) / 2
            center_y = (min_y + max_y) / 2
            
            inside = False
            for edge_p1, edge_p2 in poly_edges:
                ex1, ey1 = edge_p1
                ex2, ey2 = edge_p2
                
                # Check if ray from (-inf, center_y) crosses the edge
                # Edge must straddle the y-coordinate of the point
                if (ey1 > center_y) != (ey2 > center_y):
                    # Compute x-coordinate of intersection
                    intersect_x = (ex2 - ex1) * (center_y - ey1) / (ey2 - ey1) + ex1
                    if center_x < intersect_x:
                        inside = not inside
            
            if not inside:
                continue
                
            # 2. Interior Intersection Test
            # Check if any polygon edge passes through the INTERIOR of the rectangle
            # Interior is (min_x, max_x) x (min_y, max_y)
            intersects = False
            for edge_p1, edge_p2 in poly_edges:
                ex1, ey1 = edge_p1
                ex2, ey2 = edge_p2
                
                # Check if vertical edge intersects horizontal range of rect interior
                if ex1 == ex2: # Vertical edge
                    # Edge X is strictly between Rect X bounds
                    if min_x < ex1 < max_x:
                        # Edge Y range overlaps Rect Y interior
                        emin_y, emax_y = min(ey1, ey2), max(ey1, ey2)
                        # Overlap if max(emin_y, min_y) < min(emax_y, max_y)
                        if max(emin_y, min_y) < min(emax_y, max_y):
                            intersects = True
                            break
                else: # Horizontal edge (ey1 == ey2)
                    # Edge Y is strictly between Rect Y bounds
                    if min_y < ey1 < max_y:
                        # Edge X range overlaps Rect X interior
                        emin_x, emax_x = min(ex1, ex2), max(ex1, ex2)
                        if max(emin_x, min_x) < min(emax_x, max_x):
                            intersects = True
                            break
            
            if intersects:
                continue
                
            # If we reached here, the rectangle is valid for Part 2
            max_area_p2 = area

    print(f"Part 1: {max_area_p1}")
    print(f"Part 2: {max_area_p2}")

if __name__ == "__main__":
    solve()
