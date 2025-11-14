import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, Network, Download, BarChart3, Search, Filter, Maximize2, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import * as d3 from "d3";
import { TV_OBJECT_TYPES } from "@shared/tvobjects";
import { GraphAnalytics } from "@/components/GraphAnalytics";

interface GraphNode extends d3.SimulationNodeDatum {
  id: number;
  title: string;
  tvObjectType?: string | null;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  id: number;
  relationshipType?: string | null;
}

type LayoutType = "force" | "hierarchical" | "circular" | "grid" | "radial";

export default function Graph() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const svgRef = useRef<SVGSVGElement>(null);
  const [layout, setLayout] = useState<LayoutType>("force");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredTypes, setFilteredTypes] = useState<Set<string>>(new Set(TV_OBJECT_TYPES));
  const [showStats, setShowStats] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<number>>(new Set());
  const [highlightedPath, setHighlightedPath] = useState<number[]>([]);

  const { data: graphData, isLoading } = trpc.graph.data.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (!graphData || !svgRef.current) return;

    // Filter nodes and links based on selected types
    const nodes: GraphNode[] = graphData.nodes
      .filter(n => !n.tvObjectType || filteredTypes.has(n.tvObjectType))
      .map(n => ({ ...n }));
    
    const nodeIds = new Set(nodes.map(n => n.id));
    const links: GraphLink[] = graphData.edges
      .filter((l: any) => nodeIds.has(l.source as number) && nodeIds.has(l.target as number))
      .map((l: any) => ({ ...l }));

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Add zoom behavior
    const g = svg.append("g");
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom);

    // Apply layout
    applyLayout(nodes, links, width, height, layout);

    // Create arrow marker
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5")
      .attr("fill", "#6b7280")
      .style("stroke", "none");

    // Create links
    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#6b7280")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6)
      .attr("marker-end", "url(#arrowhead)");

    // Create link labels
    const linkLabel = g.append("g")
      .selectAll("text")
      .data(links)
      .join("text")
      .attr("class", "link-label")
      .attr("text-anchor", "middle")
      .attr("fill", "#9ca3af")
      .attr("font-size", "10px")
      .attr("pointer-events", "none")
      .text(d => d.relationshipType ? d.relationshipType.replace(/_/g, " ") : "");

    // Create nodes
    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(d3.drag<SVGGElement, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    // Add circles to nodes
    node.append("circle")
      .attr("r", 20)
      .attr("fill", d => getNodeColor(d.tvObjectType))
      .attr("stroke", d => {
        if (selectedNode === d.id) return "#fbbf24";
        if (highlightedNodes.has(d.id)) return "#10b981";
        if (highlightedPath.includes(d.id)) return "#f59e0b";
        if (searchTerm && d.title.toLowerCase().includes(searchTerm.toLowerCase())) return "#fbbf24";
        return "#fff";
      })
      .attr("stroke-width", d => {
        if (selectedNode === d.id || highlightedNodes.has(d.id) || highlightedPath.includes(d.id)) return 4;
        if (searchTerm && d.title.toLowerCase().includes(searchTerm.toLowerCase())) return 4;
        return 2;
      });

    // Add labels to nodes
    node.append("text")
      .text(d => d.title.length > 15 ? d.title.substring(0, 15) + "..." : d.title)
      .attr("text-anchor", "middle")
      .attr("dy", 35)
      .attr("font-size", "12px")
      .attr("fill", "#e5e7eb")
      .attr("pointer-events", "none");

    // Add tooltips
    node.append("title")
      .text(d => `${d.title}\nType: ${d.tvObjectType || "Note"}`);

    // Click handler
    node.on("click", (event, d) => {
      event.stopPropagation();
      setSelectedNode(d.id);
      setLocation("/notes");
    });

    // Create simulation for force layout
    let simulation: d3.Simulation<GraphNode, GraphLink> | null = null;
    
    if (layout === "force") {
      simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(40));

      simulation.on("tick", () => {
        link
          .attr("x1", d => (d.source as GraphNode).x!)
          .attr("y1", d => (d.source as GraphNode).y!)
          .attr("x2", d => (d.target as GraphNode).x!)
          .attr("y2", d => (d.target as GraphNode).y!);

        linkLabel
          .attr("x", d => ((d.source as GraphNode).x! + (d.target as GraphNode).x!) / 2)
          .attr("y", d => ((d.source as GraphNode).y! + (d.target as GraphNode).y!) / 2 - 5);

        node.attr("transform", d => `translate(${d.x},${d.y})`);
      });
    } else {
      // For non-force layouts, just position nodes
      link
        .attr("x1", d => (d.source as GraphNode).x!)
        .attr("y1", d => (d.source as GraphNode).y!)
        .attr("x2", d => (d.target as GraphNode).x!)
        .attr("y2", d => (d.target as GraphNode).y!);

      linkLabel
        .attr("x", d => ((d.source as GraphNode).x! + (d.target as GraphNode).x!) / 2)
        .attr("y", d => ((d.source as GraphNode).y! + (d.target as GraphNode).y!) / 2 - 5);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    }

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
      if (simulation && !event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
      if (simulation && !event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      if (simulation) simulation.stop();
    };
  }, [graphData, layout, filteredTypes, searchTerm, selectedNode, highlightedNodes, highlightedPath, setLocation]);

  const applyLayout = (nodes: GraphNode[], links: GraphLink[], width: number, height: number, layoutType: LayoutType) => {
    switch (layoutType) {
      case "hierarchical":
        applyHierarchicalLayout(nodes, links, width, height);
        break;
      case "circular":
        applyCircularLayout(nodes, width, height);
        break;
      case "grid":
        applyGridLayout(nodes, width, height);
        break;
      case "radial":
        applyRadialLayout(nodes, links, width, height);
        break;
      case "force":
      default:
        // Force layout is handled by simulation
        break;
    }
  };

  const applyHierarchicalLayout = (nodes: GraphNode[], links: GraphLink[], width: number, height: number) => {
    // Simple hierarchical layout - organize by levels
    const levels = new Map<number, number>();
    const visited = new Set<number>();
    
    // Find root nodes (nodes with no incoming edges)
    const inDegree = new Map<number, number>();
    nodes.forEach(n => inDegree.set(n.id, 0));
    links.forEach(l => {
      const targetId = typeof l.target === 'number' ? l.target : (l.target as GraphNode).id;
      inDegree.set(targetId, (inDegree.get(targetId) || 0) + 1);
    });
    
    const roots = nodes.filter(n => inDegree.get(n.id) === 0);
    
    // BFS to assign levels
    const queue: Array<{ node: GraphNode, level: number }> = roots.map(n => ({ node: n, level: 0 }));
    
    while (queue.length > 0) {
      const { node, level } = queue.shift()!;
      if (visited.has(node.id)) continue;
      
      visited.add(node.id);
      levels.set(node.id, level);
      
      // Find children
      links.forEach(l => {
        const sourceId = typeof l.source === 'number' ? l.source : (l.source as GraphNode).id;
        const targetId = typeof l.target === 'number' ? l.target : (l.target as GraphNode).id;
        if (sourceId === node.id) {
          const targetNode = nodes.find(n => n.id === targetId);
          if (targetNode && !visited.has(targetId)) {
            queue.push({ node: targetNode, level: level + 1 });
          }
        }
      });
    }
    
    // Position nodes by level
    const levelGroups = new Map<number, GraphNode[]>();
    nodes.forEach(n => {
      const level = levels.get(n.id) || 0;
      if (!levelGroups.has(level)) levelGroups.set(level, []);
      levelGroups.get(level)!.push(n);
    });
    
    const maxLevel = Math.max(...Array.from(levels.values()));
    const levelHeight = height / (maxLevel + 2);
    
    levelGroups.forEach((nodesInLevel, level) => {
      const levelWidth = width / (nodesInLevel.length + 1);
      nodesInLevel.forEach((node, index) => {
        node.x = levelWidth * (index + 1);
        node.y = levelHeight * (level + 1);
      });
    });
  };

  const applyCircularLayout = (nodes: GraphNode[], width: number, height: number) => {
    const radius = Math.min(width, height) / 2 - 100;
    const centerX = width / 2;
    const centerY = height / 2;
    const angleStep = (2 * Math.PI) / nodes.length;
    
    nodes.forEach((node, index) => {
      const angle = index * angleStep;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });
  };

  const applyGridLayout = (nodes: GraphNode[], width: number, height: number) => {
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const rows = Math.ceil(nodes.length / cols);
    const cellWidth = width / (cols + 1);
    const cellHeight = height / (rows + 1);
    
    nodes.forEach((node, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      node.x = cellWidth * (col + 1);
      node.y = cellHeight * (row + 1);
    });
  };

  const applyRadialLayout = (nodes: GraphNode[], links: GraphLink[], width: number, height: number) => {
    // Center on selected node or first node
    const centerNode = nodes.find(n => n.id === selectedNode) || nodes[0];
    if (!centerNode) return;
    
    centerNode.x = width / 2;
    centerNode.y = height / 2;
    
    // Find connected nodes
    const connected = new Set<number>();
    links.forEach(l => {
      const sourceId = typeof l.source === 'number' ? l.source : (l.source as GraphNode).id;
      const targetId = typeof l.target === 'number' ? l.target : (l.target as GraphNode).id;
      if (sourceId === centerNode.id) connected.add(targetId);
      if (targetId === centerNode.id) connected.add(sourceId);
    });
    
    const connectedNodes = nodes.filter(n => connected.has(n.id));
    const radius = 200;
    const angleStep = (2 * Math.PI) / connectedNodes.length;
    
    connectedNodes.forEach((node, index) => {
      const angle = index * angleStep;
      node.x = centerNode.x! + radius * Math.cos(angle);
      node.y = centerNode.y! + radius * Math.sin(angle);
    });
    
    // Position remaining nodes in outer circle
    const remaining = nodes.filter(n => n.id !== centerNode.id && !connected.has(n.id));
    const outerRadius = 350;
    const outerAngleStep = (2 * Math.PI) / remaining.length;
    
    remaining.forEach((node, index) => {
      const angle = index * outerAngleStep;
      node.x = centerNode.x! + outerRadius * Math.cos(angle);
      node.y = centerNode.y! + outerRadius * Math.sin(angle);
    });
  };

  const getNodeColor = (type: string | null | undefined) => {
    const colors: Record<string, string> = {
      "Actor": "#3b82f6",
      "Event": "#10b981",
      "Condition": "#f59e0b",
      "Ideology": "#8b5cf6",
      "Source": "#ec4899",
      "Claim": "#06b6d4",
      "Method": "#84cc16",
    };
    return type ? colors[type] || "#6b7280" : "#6b7280";
  };

  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "graph.svg";
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleTypeFilter = (type: string) => {
    const newFiltered = new Set(filteredTypes);
    if (newFiltered.has(type)) {
      newFiltered.delete(type);
    } else {
      newFiltered.add(type);
    }
    setFilteredTypes(newFiltered);
  };

  const calculateStats = () => {
    if (!graphData) return null;
    
    const nodeCount = graphData.nodes.length;
    const edgeCount = graphData.edges.length;
    const density = nodeCount > 1 ? (2 * edgeCount) / (nodeCount * (nodeCount - 1)) : 0;
    const avgDegree = nodeCount > 0 ? (2 * edgeCount) / nodeCount : 0;
    
    return { nodeCount, edgeCount, density: density.toFixed(3), avgDegree: avgDegree.toFixed(2) };
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Network className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-4">Sign in to view your knowledge graph</h2>
        <a href={getLoginUrl()} className="text-blue-500 hover:underline">
          Sign in
        </a>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Network className="w-6 h-6" />
              <h1 className="text-xl font-bold">Knowledge Graph</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Layout Selector */}
              <div className="flex items-center gap-2">
                <Label className="text-sm">Layout:</Label>
                <Select value={layout} onValueChange={(value) => setLayout(value as LayoutType)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="force">Force-Directed</SelectItem>
                    <SelectItem value="hierarchical">Hierarchical</SelectItem>
                    <SelectItem value="circular">Circular</SelectItem>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="radial">Radial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search nodes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                />
              </div>

              {/* Controls */}
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Stats
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAnalytics(!showAnalytics)}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportSVG}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Main Graph Area */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : graphData && graphData.nodes.length > 0 ? (
            <svg ref={svgRef} className="w-full h-full bg-background" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <Network className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">No notes yet. Create some notes to see your knowledge graph!</p>
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="w-64 m-4 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Filter by Type</h3>
            <div className="space-y-2">
              {TV_OBJECT_TYPES.map(type => (
                <div key={type} className="flex items-center gap-2">
                  <Checkbox
                    checked={filteredTypes.has(type)}
                    onCheckedChange={() => toggleTypeFilter(type)}
                  />
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getNodeColor(type) }}
                    />
                    <span className="text-sm">{type}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Analytics Panel */}
        {showAnalytics && graphData && (
          <GraphAnalytics
            nodes={graphData.nodes}
            edges={graphData.edges}
            onHighlightNodes={(nodeIds) => setHighlightedNodes(new Set(nodeIds))}
            onHighlightPath={(path) => setHighlightedPath(path)}
          />
        )}

        {/* Stats Panel */}
        {showStats && stats && !showAnalytics && (
          <Card className="w-64 m-4 p-4">
            <h3 className="font-semibold mb-4">Graph Statistics</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Nodes</div>
                <div className="text-2xl font-bold">{stats.nodeCount}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Edges</div>
                <div className="text-2xl font-bold">{stats.edgeCount}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Density</div>
                <div className="text-2xl font-bold">{stats.density}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Avg Degree</div>
                <div className="text-2xl font-bold">{stats.avgDegree}</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
