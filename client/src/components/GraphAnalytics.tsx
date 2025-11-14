import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, TrendingUp, Network, Route } from "lucide-react";
import { useState } from "react";
import {
  calculateDegreeCentrality,
  calculateBetweennessCentrality,
  calculateClosenessCentrality,
  findShortestPath,
  detectCommunities,
  type GraphNode,
  type GraphEdge,
  type CentralityResult,
  type Community,
  type PathResult,
} from "@/lib/graphAnalytics";

interface GraphAnalyticsProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onHighlightNodes?: (nodeIds: number[]) => void;
  onHighlightPath?: (path: number[]) => void;
}

type AnalysisType = "degree" | "betweenness" | "closeness" | "communities" | "path";

export function GraphAnalytics({ nodes, edges, onHighlightNodes, onHighlightPath }: GraphAnalyticsProps) {
  const [analysisType, setAnalysisType] = useState<AnalysisType>("degree");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [degreeCentrality, setDegreeCentrality] = useState<CentralityResult[]>([]);
  const [betweennessCentrality, setBetweennessCentrality] = useState<CentralityResult[]>([]);
  const [closenessCentrality, setClosenessCentrality] = useState<CentralityResult[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [pathSource, setPathSource] = useState<string>("");
  const [pathTarget, setPathTarget] = useState<string>("");
  const [shortestPath, setShortestPath] = useState<PathResult | null>(null);

  const runAnalysis = () => {
    setIsAnalyzing(true);
    
    // Use setTimeout to avoid blocking UI
    setTimeout(() => {
      switch (analysisType) {
        case "degree":
          const degree = calculateDegreeCentrality(nodes, edges);
          setDegreeCentrality(degree);
          if (onHighlightNodes) {
            onHighlightNodes(degree.slice(0, 5).map(r => r.nodeId));
          }
          break;
          
        case "betweenness":
          const betweenness = calculateBetweennessCentrality(nodes, edges);
          setBetweennessCentrality(betweenness);
          if (onHighlightNodes) {
            onHighlightNodes(betweenness.slice(0, 5).map(r => r.nodeId));
          }
          break;
          
        case "closeness":
          const closeness = calculateClosenessCentrality(nodes, edges);
          setClosenessCentrality(closeness);
          if (onHighlightNodes) {
            onHighlightNodes(closeness.slice(0, 5).map(r => r.nodeId));
          }
          break;
          
        case "communities":
          const comms = detectCommunities(nodes, edges);
          setCommunities(comms);
          break;
          
        case "path":
          if (pathSource && pathTarget) {
            const path = findShortestPath(
              parseInt(pathSource),
              parseInt(pathTarget),
              nodes,
              edges
            );
            setShortestPath(path);
            if (path && onHighlightPath) {
              onHighlightPath(path.path);
            }
          }
          break;
      }
      
      setIsAnalyzing(false);
    }, 100);
  };

  const getNodeTitle = (nodeId: number) => {
    return nodes.find(n => n.id === nodeId)?.title || `Node ${nodeId}`;
  };

  return (
    <Card className="w-80 p-4 overflow-y-auto max-h-full">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Graph Analytics
          </h3>
          <p className="text-xs text-muted-foreground">
            Analyze your knowledge graph structure
          </p>
        </div>

        {/* Analysis Type Selector */}
        <div className="space-y-2">
          <Label className="text-sm">Analysis Type</Label>
          <Select value={analysisType} onValueChange={(value) => setAnalysisType(value as AnalysisType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="degree">Degree Centrality</SelectItem>
              <SelectItem value="betweenness">Betweenness Centrality</SelectItem>
              <SelectItem value="closeness">Closeness Centrality</SelectItem>
              <SelectItem value="communities">Community Detection</SelectItem>
              <SelectItem value="path">Shortest Path</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Path Finder Inputs */}
        {analysisType === "path" && (
          <div className="space-y-2">
            <div>
              <Label className="text-sm">Source Node</Label>
              <Select value={pathSource} onValueChange={setPathSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source..." />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map(node => (
                    <SelectItem key={node.id} value={node.id.toString()}>
                      {node.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Target Node</Label>
              <Select value={pathTarget} onValueChange={setPathTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target..." />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map(node => (
                    <SelectItem key={node.id} value={node.id.toString()}>
                      {node.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Run Analysis Button */}
        <Button 
          onClick={runAnalysis} 
          className="w-full"
          disabled={isAnalyzing || (analysisType === "path" && (!pathSource || !pathTarget))}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Network className="w-4 h-4 mr-2" />
              Run Analysis
            </>
          )}
        </Button>

        {/* Results */}
        <div className="border-t border-border pt-4">
          {analysisType === "degree" && degreeCentrality.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Top Nodes by Degree</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Nodes with most connections
              </p>
              <div className="space-y-2">
                {degreeCentrality.slice(0, 10).map((result, index) => (
                  <div key={result.nodeId} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1">
                      {index + 1}. {getNodeTitle(result.nodeId)}
                    </span>
                    <span className="font-mono text-xs bg-accent px-2 py-1 rounded">
                      {result.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisType === "betweenness" && betweennessCentrality.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Top Nodes by Betweenness</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Nodes that bridge different parts of the graph
              </p>
              <div className="space-y-2">
                {betweennessCentrality.slice(0, 10).map((result, index) => (
                  <div key={result.nodeId} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1">
                      {index + 1}. {getNodeTitle(result.nodeId)}
                    </span>
                    <span className="font-mono text-xs bg-accent px-2 py-1 rounded">
                      {result.score.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisType === "closeness" && closenessCentrality.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Top Nodes by Closeness</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Nodes closest to all other nodes on average
              </p>
              <div className="space-y-2">
                {closenessCentrality.slice(0, 10).map((result, index) => (
                  <div key={result.nodeId} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1">
                      {index + 1}. {getNodeTitle(result.nodeId)}
                    </span>
                    <span className="font-mono text-xs bg-accent px-2 py-1 rounded">
                      {result.score.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisType === "communities" && communities.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Detected Communities</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Found {communities.length} clusters
              </p>
              <div className="space-y-3">
                {communities.map((community, index) => (
                  <div key={community.id} className="p-2 bg-accent/50 rounded">
                    <div className="text-sm font-medium mb-1">
                      Community {index + 1} ({community.nodes.length} nodes)
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {community.nodes.slice(0, 3).map(nodeId => getNodeTitle(nodeId)).join(", ")}
                      {community.nodes.length > 3 && ` +${community.nodes.length - 3} more`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisType === "path" && shortestPath && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Route className="w-4 h-4" />
                Shortest Path
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Path length: {shortestPath.length} steps
              </p>
              <div className="space-y-2">
                {shortestPath.path.map((nodeId, index) => (
                  <div key={nodeId} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    <span className="truncate">{getNodeTitle(nodeId)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisType === "path" && shortestPath === null && pathSource && pathTarget && !isAnalyzing && (
            <div className="text-sm text-muted-foreground text-center py-4">
              No path found between selected nodes
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
