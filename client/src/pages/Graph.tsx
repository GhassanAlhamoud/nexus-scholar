import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, FileText, Network } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import * as d3 from "d3";

interface GraphNode extends d3.SimulationNodeDatum {
  id: number;
  title: string;
  tvObjectType: string | null;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  id: number;
  source: number | GraphNode;
  target: number | GraphNode;
  relationshipType: string | null;
}

export default function Graph() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const svgRef = useRef<SVGSVGElement>(null);
  const { data: graphData, isLoading: graphLoading } = trpc.graph.data.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (!svgRef.current || !graphData || graphData.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const g = svg.append("g");

    // Create nodes and links data
    const nodes: GraphNode[] = graphData.nodes.map(n => ({
      id: n.id,
      title: n.title,
      tvObjectType: n.tvObjectType,
    }));

    const links: GraphLink[] = graphData.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      relationshipType: e.relationshipType,
    }));

    // Create force simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    // Create arrow marker for directed edges
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
      .call(d3.drag<SVGGElement, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    // Add circles to nodes
    node.append("circle")
      .attr("r", 20)
      .attr("fill", d => {
        if (!d.tvObjectType) return "#3b82f6";
        const typeColors: Record<string, string> = {
          "Actor": "#ef4444",
          "Event": "#10b981",
          "Condition": "#f59e0b",
          "Ideology": "#8b5cf6",
          "Source": "#06b6d4",
          "Claim": "#ec4899",
        };
        return typeColors[d.tvObjectType] || "#3b82f6";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer");

    // Add labels to nodes
    node.append("text")
      .text(d => d.title.length > 20 ? d.title.substring(0, 20) + "..." : d.title)
      .attr("x", 0)
      .attr("y", 35)
      .attr("text-anchor", "middle")
      .attr("fill", "#e5e7eb")
      .attr("font-size", "12px")
      .attr("pointer-events", "none");

    // Add click handler to navigate to note
    node.on("click", (event, d) => {
      event.stopPropagation();
      setLocation("/notes");
      // Note: In a full implementation, we'd pass the note ID to select it
    });

    // Update positions on simulation tick
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

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [graphData, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Sign in required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to access your knowledge graph.
          </p>
          <Button asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <a className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
                The Nexus Scholar
              </a>
            </Link>
            <nav className="flex gap-4">
              <Link href="/notes">
                <a className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <FileText className="w-4 h-4" />
                  Notes
                </a>
              </Link>
              <Link href="/graph">
                <a className="flex items-center gap-2 text-primary font-medium">
                  <Network className="w-4 h-4" />
                  Graph
                </a>
              </Link>
            </nav>
          </div>
          <div className="text-sm text-muted-foreground">
            {user.name || user.email}
          </div>
        </div>
      </header>

      <div className="flex-1 relative">
        {graphLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : graphData && graphData.nodes.length > 0 ? (
          <>
            <svg
              ref={svgRef}
              className="w-full h-full"
              style={{ background: "#0a0a0a" }}
            />
            <div className="absolute top-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg">
              <h3 className="font-semibold mb-2 text-sm">Legend</h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Note</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Actor</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Event</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span>Condition</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span>Ideology</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  <span>Source</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                  <span>Claim</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                <p>Drag nodes to reposition</p>
                <p>Scroll to zoom</p>
                <p>Click node to view note</p>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No notes yet</p>
              <p className="text-sm">Create some notes with [[links]] to see your knowledge graph</p>
              <Button asChild className="mt-4">
                <Link href="/notes">
                  <a>Go to Notes</a>
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
