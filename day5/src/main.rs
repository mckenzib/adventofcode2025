use std::env;
use std::fs;
use std::ops::RangeInclusive;

fn main() {
    let args: Vec<String> = env::args().collect();
    let filename = if args.len() > 1 {
        &args[1]
    } else {
        "input.txt"
    };

    let contents = fs::read_to_string(filename).expect("Something went wrong reading the file");

    let p1_count = part1(&contents);
    println!("Part 1 - Fresh ingredients: {}", p1_count);

    let p2_count = part2(&contents);
    println!("Part 2 - Total fresh ingredients: {}", p2_count);
}

fn part1(input: &str) -> usize {
    let mut parts = input.split("\n\n");
    let ranges_part = parts.next().unwrap_or("");
    let candidates_part = parts.next().unwrap_or("");

    let ranges: Vec<RangeInclusive<u64>> = parse_ranges(ranges_part);

    let count = candidates_part
        .lines()
        .filter_map(|line| line.parse::<u64>().ok())
        .filter(|&id| is_fresh(id, &ranges))
        .count();

    count
}

fn part2(input: &str) -> u64 {
    let mut parts = input.split("\n\n");
    let ranges_part = parts.next().unwrap_or("");
    
    let mut ranges: Vec<RangeInclusive<u64>> = parse_ranges(ranges_part);
    if ranges.is_empty() {
        return 0;
    }

    // Sort by start
    ranges.sort_by_key(|r| *r.start());

    let mut merged_count = 0;
    let mut current_range = ranges[0].clone();

    for next_range in ranges.iter().skip(1) {
        if next_range.start() <= current_range.end() || (*next_range.start() == current_range.end() + 1) {
            // Overlap or adjacent, extend current range
            if next_range.end() > current_range.end() {
                current_range = *current_range.start()..=*next_range.end();
            }
        } else {
            // No overlap, push current count and start new range
            merged_count += current_range.end() - current_range.start() + 1;
            current_range = next_range.clone();
        }
    }
    // Add the last range
    merged_count += current_range.end() - current_range.start() + 1;

    merged_count
}

fn parse_ranges(input: &str) -> Vec<RangeInclusive<u64>> {
    input
        .lines()
        .filter_map(|line| {
            let mut s = line.split('-');
            let start = s.next()?.parse::<u64>().ok()?;
            let end = s.next()?.parse::<u64>().ok()?;
            Some(start..=end)
        })
        .collect()
}

fn is_fresh(id: u64, ranges: &[RangeInclusive<u64>]) -> bool {
    ranges.iter().any(|range| range.contains(&id))
}

#[cfg(test)]
mod tests {
    use super::*;

    const EXAMPLE_INPUT: &str = "3-5
10-14
16-20
12-18

1
5
8
11
17
32";

    #[test]
    fn test_part1_example() {
        assert_eq!(part1(EXAMPLE_INPUT), 3);
    }

    #[test]
    fn test_part2_example() {
        assert_eq!(part2(EXAMPLE_INPUT), 14);
    }
}
