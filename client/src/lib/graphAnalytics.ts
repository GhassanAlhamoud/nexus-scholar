/**
 * Graph Analytics Utilities
 * Implements various graph algorithms for knowledge graph analysis
 */

export interface GraphNode {
  id: number;
  title: string;
  tvObjectType?: string | null;
}

export interface GraphEdge {
  id: number;
  source: number;
  target: number;
  relationshipType?: string | null;
}

export interface CentralityResult {
  nodeId: number;
  score: number;
}

export interface PathResult {
  path: number[];
  length: number;
}

export interface Community {
  id: number;
  nodes: number[];
}

/**
 * Calculate degree centrality for all nodes
 * Degree centrality = number of connections a node has
 */
export function calculateDegreeCentrality(
  nodes: GraphNode[],
  edges: GraphEdge[]
): CentralityResult[] {
  const degrees = new Map<number, number>();
  
  // Initialize all nodes with 0
  nodes.forEach(n => degrees.set(n.id, 0));
  
  // Count connections (both incoming and outgoing)
  edges.forEach(e => {
    degrees.set(e.source, (degrees.get(e.source) || 0) + 1);
    degrees.set(e.target, (degrees.get(e.target) || 0) + 1);
  });
  
  return Array.from(degrees.entries())
    .map(([nodeId, score]) => ({ nodeId, score }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Calculate betweenness centrality
 * Measures how often a node appears on shortest paths between other nodes
 */
export function calculateBetweennessCentrality(
  nodes: GraphNode[],
  edges: GraphEdge[]
): CentralityResult[] {
  const betweenness = new Map<number, number>();
  nodes.forEach(n => betweenness.set(n.id, 0));
  
  // Build adjacency list
  const adj = buildAdjacencyList(nodes, edges);
  
  // For each pair of nodes, find shortest paths
  nodes.forEach(source => {
    const paths = bfsAllPaths(source.id, adj, nodes);
    
    nodes.forEach(target => {
      if (source.id === target.id) return;
      
      const pathsToTarget = paths.get(target.id) || [];
      if (pathsToTarget.length === 0) return;
      
      // Count how many shortest paths go through each node
      pathsToTarget.forEach(path => {
        // Skip first and last node
        for (let i = 1; i < path.length - 1; i++) {
          betweenness.set(path[i], (betweenness.get(path[i]) || 0) + 1);
        }
      });
    });
  });
  
  // Normalize by dividing by total possible pairs
  const n = nodes.length;
  const normalizer = (n - 1) * (n - 2) / 2;
  
  return Array.from(betweenness.entries())
    .map(([nodeId, score]) => ({ 
      nodeId, 
      score: normalizer > 0 ? score / normalizer : 0 
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Calculate closeness centrality
 * Measures average distance from a node to all other nodes
 */
export function calculateClosenessCentrality(
  nodes: GraphNode[],
  edges: GraphEdge[]
): CentralityResult[] {
  const closeness = new Map<number, number>();
  const adj = buildAdjacencyList(nodes, edges);
  
  nodes.forEach(node => {
    const distances = bfsDistances(node.id, adj, nodes);
    const totalDistance = Array.from(distances.values()).reduce((sum, d) => sum + d, 0);
    
    // Closeness is inverse of average distance
    const score = totalDistance > 0 ? (nodes.length - 1) / totalDistance : 0;
    closeness.set(node.id, score);
  });
  
  return Array.from(closeness.entries())
    .map(([nodeId, score]) => ({ nodeId, score }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Find shortest path between two nodes using BFS
 */
export function findShortestPath(
  sourceId: number,
  targetId: number,
  nodes: GraphNode[],
  edges: GraphEdge[]
): PathResult | null {
  const adj = buildAdjacencyList(nodes, edges);
  const queue: Array<{ nodeId: number; path: number[] }> = [{ nodeId: sourceId, path: [sourceId] }];
  const visited = new Set<number>([sourceId]);
  
  while (queue.length > 0) {
    const { nodeId, path } = queue.shift()!;
    
    if (nodeId === targetId) {
      return { path, length: path.length - 1 };
    }
    
    const neighbors = adj.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ nodeId: neighbor, path: [...path, neighbor] });
      }
    }
  }
  
  return null; // No path found
}

/**
 * Detect communities using simple label propagation algorithm
 */
export function detectCommunities(
  nodes: GraphNode[],
  edges: GraphEdge[],
  maxIterations: number = 10
): Community[] {
  const adj = buildAdjacencyList(nodes, edges);
  
  // Initialize each node with its own label
  const labels = new Map<number, number>();
  nodes.forEach(n => labels.set(n.id, n.id));
  
  // Iteratively update labels
  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;
    
    // Shuffle nodes for random order
    const shuffled = [...nodes].sort(() => Math.random() - 0.5);
    
    shuffled.forEach(node => {
      const neighbors = adj.get(node.id) || [];
      if (neighbors.length === 0) return;
      
      // Count neighbor labels
      const labelCounts = new Map<number, number>();
      neighbors.forEach(neighbor => {
        const label = labels.get(neighbor)!;
        labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
      });
      
      // Find most common label
      let maxCount = 0;
      let maxLabel = labels.get(node.id)!;
      labelCounts.forEach((count, label) => {
        if (count > maxCount) {
          maxCount = count;
          maxLabel = label;
        }
      });
      
      // Update if changed
      if (maxLabel !== labels.get(node.id)) {
        labels.set(node.id, maxLabel);
        changed = true;
      }
    });
    
    if (!changed) break;
  }
  
  // Group nodes by label
  const communities = new Map<number, number[]>();
  labels.forEach((label, nodeId) => {
    if (!communities.has(label)) {
      communities.set(label, []);
    }
    communities.get(label)!.push(nodeId);
  });
  
  return Array.from(communities.entries())
    .map(([id, nodes], index) => ({ id: index, nodes }))
    .filter(c => c.nodes.length > 1); // Filter out single-node communities
}

/**
 * Build adjacency list from edges
 */
function buildAdjacencyList(
  nodes: GraphNode[],
  edges: GraphEdge[]
): Map<number, number[]> {
  const adj = new Map<number, number[]>();
  
  nodes.forEach(n => adj.set(n.id, []));
  
  edges.forEach(e => {
    adj.get(e.source)!.push(e.target);
    adj.get(e.target)!.push(e.source); // Treat as undirected for centrality
  });
  
  return adj;
}

/**
 * BFS to find all shortest paths
 */
function bfsAllPaths(
  sourceId: number,
  adj: Map<number, number[]>,
  nodes: GraphNode[]
): Map<number, number[][]> {
  const paths = new Map<number, number[][]>();
  const distances = new Map<number, number>();
  const queue: Array<{ nodeId: number; path: number[]; dist: number }> = [
    { nodeId: sourceId, path: [sourceId], dist: 0 }
  ];
  
  distances.set(sourceId, 0);
  
  while (queue.length > 0) {
    const { nodeId, path, dist } = queue.shift()!;
    
    if (!paths.has(nodeId)) {
      paths.set(nodeId, []);
    }
    
    const currentDist = distances.get(nodeId)!;
    if (dist === currentDist) {
      paths.get(nodeId)!.push(path);
    }
    
    const neighbors = adj.get(nodeId) || [];
    for (const neighbor of neighbors) {
      const newDist = dist + 1;
      
      if (!distances.has(neighbor) || distances.get(neighbor)! >= newDist) {
        distances.set(neighbor, newDist);
        queue.push({ nodeId: neighbor, path: [...path, neighbor], dist: newDist });
      }
    }
  }
  
  return paths;
}

/**
 * BFS to calculate distances from source to all nodes
 */
function bfsDistances(
  sourceId: number,
  adj: Map<number, number[]>,
  nodes: GraphNode[]
): Map<number, number> {
  const distances = new Map<number, number>();
  const queue: Array<{ nodeId: number; dist: number }> = [{ nodeId: sourceId, dist: 0 }];
  const visited = new Set<number>([sourceId]);
  
  distances.set(sourceId, 0);
  
  while (queue.length > 0) {
    const { nodeId, dist } = queue.shift()!;
    
    const neighbors = adj.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        distances.set(neighbor, dist + 1);
        queue.push({ nodeId: neighbor, dist: dist + 1 });
      }
    }
  }
  
  return distances;
}
