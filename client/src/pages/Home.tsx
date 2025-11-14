import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Network, FileText, Brain, Link as LinkIcon } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-foreground">{APP_TITLE}</div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/notes">
                  <a>
                    <Button variant="ghost">Notes</Button>
                  </a>
                </Link>
                <Link href="/graph">
                  <a>
                    <Button variant="ghost">Graph</Button>
                  </a>
                </Link>
                <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
              </>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container py-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Your Research is a Network of Ideas
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            The Nexus Scholar transforms your notes, data, and literature into a dynamic, queryable knowledge graph.
            Built on the TVAS framework for rigorous academic research.
          </p>
          {user ? (
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/notes">
                  <a className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Go to Notes
                  </a>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/graph">
                  <a className="flex items-center gap-2">
                    <Network className="w-5 h-5" />
                    View Graph
                  </a>
                </Link>
              </Button>
            </div>
          ) : (
            <Button asChild size="lg">
              <a href={getLoginUrl()}>Get Started</a>
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <LinkIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Bidirectional Linking</h3>
            <p className="text-muted-foreground">
              Create connections between notes with [[wiki-style]] links. Every link is automatically bidirectional,
              building a robust web of knowledge.
            </p>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
              <Network className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Interactive Graph</h3>
            <p className="text-muted-foreground">
              Visualize your entire research corpus as an interactive network. Discover patterns, clusters,
              and hidden connections through force-directed layouts.
            </p>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">TVAS Framework</h3>
            <p className="text-muted-foreground">
              Built on Textual Visual Algebraic Systems for formal knowledge modeling. Define TV-Objects,
              relationships, and axioms for rigorous research.
            </p>
          </Card>
        </div>

        <div className="mt-20 max-w-3xl mx-auto">
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border">
            <h2 className="text-2xl font-bold mb-4 text-center">Perfect for PhD Research</h2>
            <p className="text-muted-foreground text-center mb-6">
              The Nexus Scholar is designed specifically for academics engaged in literature reviews,
              data analysis, and long-form scholarly writing. Transform qualitative research into
              computationally tractable models without sacrificing interpretive depth.
            </p>
            <div className="flex justify-center">
              {user ? (
                <Button asChild size="lg" variant="outline">
                  <Link href="/notes">
                    <a>Start Building Your Knowledge Graph</a>
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg">
                  <a href={getLoginUrl()}>Sign In to Get Started</a>
                </Button>
              )}
            </div>
          </Card>
        </div>
      </main>

      <footer className="border-t border-border mt-20 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>The Nexus Scholar - A PhD Research Assistant Built on the TVAS Framework</p>
        </div>
      </footer>
    </div>
  );
}
