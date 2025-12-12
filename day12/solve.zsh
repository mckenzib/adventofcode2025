#!/bin/zsh

# --- Day 12: Christmas Tree Farm ---

INPUT_FILE="${1:-input.txt}"

# --- Data Structures ---
# storing shapes as strings of coordinates: "r,c r,c ..."
# shape_variations[id] -> array of variation strings

typeset -A shape_variations
typeset -A shape_counts

# --- Parsing Functions ---

read_input() {
    local state="shapes"
    local current_shape_id=""
    local current_shape_lines=()

    while IFS= read -r line || [[ -n "$line" ]]; do
        if [[ -z "$line" ]]; then
            if [[ "$state" == "shapes" && -n "$current_shape_id" ]]; then
                process_shape "$current_shape_id" "${current_shape_lines[@]}"
                current_shape_id=""
                current_shape_lines=()
            fi
            continue
        fi

        if [[ "$line" =~ ^([0-9]+):$ ]]; then
            state="shapes"
            current_shape_id="${match[1]}"
            current_shape_lines=()
        elif [[ "$line" =~ ^([0-9]+)x([0-9]+):[[:space:]]*(.*)$ ]]; then
            # Finish last shape if any
            if [[ -n "$current_shape_id" ]]; then
                process_shape "$current_shape_id" "${current_shape_lines[@]}"
                current_shape_id=""
                current_shape_lines=()
            fi
            state="problems"
            solve_problem "${match[1]}" "${match[2]}" "${match[3]}"
        else
            if [[ "$state" == "shapes" ]]; then
                current_shape_lines+=("$line")
            fi
        fi
    done < "$INPUT_FILE"
    
    # Handle case where file ends with a shape (unlikely based on example but good practice)
    if [[ -n "$current_shape_id" ]]; then
        process_shape "$current_shape_id" "${current_shape_lines[@]}"
    fi
}

# --- Geometry Helpers ---

# Normalize coordinate list so top-leftmost is at 0,0
normalize_shape() {
    local coords=($@)
    local min_r=9999
    local min_c=9999

    for pair in "${coords[@]}"; do
        local r="${pair%,*}"
        local c="${pair#*,}"
        (( r < min_r )) && min_r=$r
        (( c < min_c )) && min_c=$c
    done

    # Re-find min_c specifically for the row min_r to ensure consistent anchoring?
    # Actually, "first empty cell" logic matches standard scan order (row, then col).
    # We want the shape to be placed such that one of its cells covers the current target cell.
    # To simplify, we usually iterate all cells of the shape that *could* be the one covering the target.
    # OR, we anchor the shape by its first cell in reading order (min_r, then min_c).
    # Let's pivot by the top-left-most cell (in reading order).
    
    min_r=9999
    min_c=9999
    
    # First find min_r
    for pair in "${coords[@]}"; do
        local r="${pair%,*}"
        (( r < min_r )) && min_r=$r
    done
    
    # Then find min_c *among usage in min_r*
    for pair in "${coords[@]}"; do
        local r="${pair%,*}"
        local c="${pair#*,}"
        if (( r == min_r )); then
             (( c < min_c )) && min_c=$c
        fi
    done

    local normalized=()
    for pair in "${coords[@]}"; do
        local r="${pair%,*}"
        local c="${pair#*,}"
        normalized+=("$((r - min_r)),$((c - min_c))")
    done
    
    # Sort for canonical representation string
    echo "${(o)normalized}"
}

# Rotate 90 degrees clockwise: (r, c) -> (c, -r)
rotate_coords() {
    local coords=($@)
    local moved=()
    for pair in "${coords[@]}"; do
        local r="${pair%,*}"
        local c="${pair#*,}"
        moved+=("$c,$(( -r ))")
    done
    echo "${moved[@]}"
}

# Flip Horizontal: (r, c) -> (r, -c)
flip_coords() {
    local coords=($@)
    local moved=()
    for pair in "${coords[@]}"; do
        local r="${pair%,*}"
        local c="${pair#*,}"
        moved+=("$r,$(( -c ))")
    done
    echo "${moved[@]}"
}

process_shape() {
    local id="$1"
    shift
    local lines=($@)
    local base_coords=()
    
    local r=0
    for line in "${lines[@]}"; do
        local len=${#line}
        for ((c=0; c<len; c++)); do
            char="${line:$c:1}"
            if [[ "$char" == "#" ]]; then
                base_coords+=("$r,$c")
            fi
        done
        ((r++))
    done

    # Generate all 8 symmetries
    local variations=()
    local current="${base_coords[@]}"
    
    # 4 rotations
    for ((i=0; i<4; i++)); do
        local norm=$(normalize_shape ${=current})
        variations+=("$norm")
        current=$(rotate_coords ${=current})
    done
    
    # Flip
    current=$(flip_coords ${base_coords[@]})
    # 4 rotations of flipped
    for ((i=0; i<4; i++)); do
        local norm=$(normalize_shape ${=current})
        variations+=("$norm")
        current=$(rotate_coords ${=current})
    done

    # Deduplicate variations
    local unique_vars=()
    typeset -A seen
    for v in "${variations[@]}"; do
        # simple space-separated sorted string as key
        if [[ -z "${seen[$v]}" ]]; then
            seen[$v]=1
            # Check dimensions? No, just store list of coords
            unique_vars+=("$v")
        fi
    done
    
    # Store in global map. We need a way to store list of lists.
    # hack: join with '|'
    shape_variations[$id]="${(j:|:)unique_vars}"
}

# --- Solver ---

# grid is a single string of length W*H, '0' is empty, '1' is full.
# (Using 0/1 makes it easy to regex or check)

solve_problem() {
    local W="$1"
    local H="$2"
    local counts_str="$3"
    
    # Parse present counts
    local req_counts=(${=counts_str})
    local total_req_cells=0
    
    typeset -A current_counts
    local present_types=()
    
    local idx=0
    for count in "${req_counts[@]}"; do
        if (( count > 0 )); then
            current_counts[$idx]=$count
            present_types+=($idx)
            
            # Calculate total area needed (for quick fail check if we wanted, 
            # though input says we just need to fit them, assuming total area matches is implicit or <=)
            # Actually we just fit exactly these.
        fi
        ((idx++))
    done

    # Initialize grid
    # We'll use a globally scoped array for the grid to avoid passing huge strings? 
    # Or just a string. String is by value in Zsh usually.
    # Let's use an array `grid` purely global to the recursive function to save copying.
    
    # 0-based index: i = r * W + c
    grid=()
    for ((i=0; i<W*H; i++)); do grid[i+1]=0; done # 1-based array in Zsh default

    solved_flag=0
    
    # Start recursion
    solve_recursive "$W" "$H"
    
    if (( solved_flag )); then
        (( TOTAL_SOLVED++ ))
    fi
}

solve_recursive() {
    if (( solved_flag )); then return; fi
    # echo "Recurse: Grid filled $(grep -o "1" <<< "${grid[@]}" | wc -l)"
    
    local W="$1"
    local H="$2"
    local i
    local type_id
    local v
    local pair
    local pr pc tr tc idx cidx

    # Find first empty cell (1-based index)
    local first_empty=-1
    for ((i=1; i<=W*H; i++)); do
        if [[ "${grid[$i]}" == "0" ]]; then
            first_empty=$i
            break
        fi
    done

    # If no empty cell found, check if we used all presents.
    if (( first_empty == -1 )); then
        # Check if any counts remain
        for k in "${(@k)current_counts}"; do
            if (( current_counts[$k] > 0 )); then
                return # Should not happen if area matches, but just in case
            fi
        done
        solved_flag=1
        return
    fi

    # Convert linear index to (r, c)
    local start_r=$(( (first_empty - 1) / W ))
    local start_c=$(( (first_empty - 1) % W ))

    # Try each available shape type
    for type_id in "${(@k)current_counts}"; do
        if (( current_counts[$type_id] > 0 )); then
            
            # Decrement count
            (( current_counts[$type_id]-- ))
            if (( current_counts[$type_id] == 0 )); then
                unset "current_counts[$type_id]"
            fi

            # Iterate variations for this shape
            local vars_str="${shape_variations[$type_id]}"
            local vars=(${(s:|:)vars_str})
            
            for v in "${vars[@]}"; do
                # Check if fits at start_r, start_c (anchored at 0,0 of shape)
                local coords=(${(s: :)v})
                local fits=1
                local cells_to_fill=()
                
                for pair in "${coords[@]}"; do
                    pr="${pair%,*}"
                    pc="${pair#*,}"
                    
                    tr=$(( start_r + pr ))
                    tc=$(( start_c + pc ))
                    
                    # Boundary check
                    if (( tr < 0 || tr >= H || tc < 0 || tc >= W )); then
                        fits=0; break
                    fi
                    
                    # Collision check
                    idx=$(( tr * W + tc + 1 ))
                    if [[ "${grid[$idx]}" != "0" ]]; then
                        fits=0; break
                    fi
                    
                    cells_to_fill+=($idx)
                done
                
                if (( fits )); then
                    # Place
                    echo "Placing shape $type_id (var len ${#coords}) at $start_r,$start_c"
                    for cidx in "${cells_to_fill[@]}"; do
                        grid[$cidx]=1
                    done
                    
                    solve_recursive "$W" "$H"
                    if (( solved_flag )); then return; fi
                    
                    # Unplace (Backtrack)
                    for cidx in "${cells_to_fill[@]}"; do
                        grid[$cidx]=0
                    done
                fi
            done
            
            # Restore count
            if [[ -z "${current_counts[$type_id]}" ]]; then
                current_counts[$type_id]=1
            else
                (( current_counts[$type_id]++ ))
            fi
        fi
    done
}

# --- Main ---

TOTAL_SOLVED=0
read_input

# DEBUG
# for k in "${(@k)shape_variations}"; do
#     echo "Shape $k has variations: ${shape_variations[$k]}"
# done

echo "$TOTAL_SOLVED"
