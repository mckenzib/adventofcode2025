package day8;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Solution {

    static class Point {
        long x, y, z;

        Point(long x, long y, long z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
    }

    static class Edge implements Comparable<Edge> {
        int u;
        int v;
        long distSq;

        Edge(int u, int v, long distSq) {
            this.u = u;
            this.v = v;
            this.distSq = distSq;
        }

        @Override
        public int compareTo(Edge other) {
            return Long.compare(this.distSq, other.distSq);
        }
    }

    static class DSU {
        int[] parent;
        int[] size;

        DSU(int n) {
            parent = new int[n];
            size = new int[n];
            for (int i = 0; i < n; i++) {
                parent[i] = i;
                size[i] = 1;
            }
        }

        int find(int i) {
            if (parent[i] != i) {
                parent[i] = find(parent[i]);
            }
            return parent[i];
        }

        boolean union(int i, int j) {
            int rootI = find(i);
            int rootJ = find(j);

            if (rootI != rootJ) {
                if (size[rootI] < size[rootJ]) {
                    int temp = rootI;
                    rootI = rootJ;
                    rootJ = temp;
                }
                parent[rootJ] = rootI;
                size[rootI] += size[rootJ];
                return true;
            }
            return false;
        }
    }

    public static void main(String[] args) {
        String filename = "input.txt";
        int limit = 1000;

        if (args.length > 0) {
            filename = args[0];
        }
        if (args.length > 1) {
            limit = Integer.parseInt(args[1]);
        }

        List<Point> points = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new FileReader(filename))) {
            String line;
            while ((line = br.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) continue;
                String[] parts = line.split(",");
                long x = Long.parseLong(parts[0]);
                long y = Long.parseLong(parts[1]);
                long z = Long.parseLong(parts[2]);
                points.add(new Point(x, y, z));
            }
        } catch (IOException e) {
            e.printStackTrace();
            return;
        }

        int n = points.size();
        List<Edge> edges = new ArrayList<>();

        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                Point p1 = points.get(i);
                Point p2 = points.get(j);
                long distSq = (p1.x - p2.x) * (p1.x - p2.x) +
                              (p1.y - p2.y) * (p1.y - p2.y) +
                              (p1.z - p2.z) * (p1.z - p2.z);
                edges.add(new Edge(i, j, distSq));
            }
        }

        Collections.sort(edges);

        DSU dsu = new DSU(n);
        int dsuComponents = n;
        
        long resultPart1 = 0;
        long resultPart2 = 0;

        // We iterate through all edges to find the full connectivity
        for (int i = 0; i < edges.size(); i++) {
            Edge edge = edges.get(i);
            
            // Part 1 Logic: "After making the ten shortest connections..." (in example)
            // The problem says "connect together the 1000 pairs...".
            // This means we process the first 1000 edges in the sorted list, regardless of whether they merge components or not.
            // We check this state exactly after processing 'limit' edges.
            if (i == limit) {
                Map<Integer, Integer> componentSizes = new HashMap<>();
                for (int node = 0; node < n; node++) {
                    int root = dsu.find(node);
                    // DSU size is maintained at the root
                    // However, we need to be careful. DSU class below updates size[root].
                    // Let's just trust dsu.size[root] for distinct roots.
                }

                // Let's gather sizes properly
                List<Integer> sizes = new ArrayList<>();
                boolean[] valVisited = new boolean[n];
                for(int node=0; node<n; node++) {
                    int root = dsu.find(node);
                    if (!valVisited[root]) {
                        sizes.add(dsu.size[root]);
                        valVisited[root] = true;
                    }
                }
                Collections.sort(sizes, Collections.reverseOrder());
                long p1 = 1;
                if (sizes.size() >= 1) p1 *= sizes.get(0);
                if (sizes.size() >= 2) p1 *= sizes.get(1);
                if (sizes.size() >= 3) p1 *= sizes.get(2);
                resultPart1 = p1;
            }

            // Part 2 Logic & DSU Application
            // We perform union on valid edges.
            // Even if we are past the limit, we continue for Part 2 until single component.
            boolean merged = dsu.union(edge.u, edge.v);
            if (merged) {
                dsuComponents--;
                if (dsuComponents == 1) {
                    // This was the connection that unified everything
                    Point pu = points.get(edge.u);
                    Point pv = points.get(edge.v);
                    resultPart2 = pu.x * pv.x;
                    // We can stop if we have found Part 2 AND we have passed Part 1 limit
                    if (i >= limit) break;
                }
            }
        }
        
        // Corner case: if limit >= edges.size(), we might not have set resultPart1 inside loop
        // The problem implies limit is reachable. But let's be safe.
        // Actually, for the real input limit=1000 is small compared to N*(N-1)/2.
        // For test input, limit=10.
        
        System.out.println("Part 1: " + resultPart1);
        System.out.println("Part 2: " + resultPart2);
    }
}
