import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, Plus, Trash2, FileText, Network } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Notes() {
  const { user, loading: authLoading } = useAuth();
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { data: notes, isLoading: notesLoading } = trpc.notes.list.useQuery(undefined, {
    enabled: !!user,
  });

  const createMutation = trpc.notes.create.useMutation({
    onSuccess: (newNote) => {
      utils.notes.list.invalidate();
      setSelectedNoteId(newNote.id);
      setTitle(newNote.title);
      setContent(newNote.content);
      setIsCreating(false);
    },
  });

  const updateMutation = trpc.notes.update.useMutation({
    onSuccess: () => {
      utils.notes.list.invalidate();
    },
  });

  const deleteMutation = trpc.notes.delete.useMutation({
    onSuccess: () => {
      utils.notes.list.invalidate();
      setSelectedNoteId(null);
      setTitle("");
      setContent("");
    },
  });

  const utils = trpc.useUtils();

  const selectedNote = useMemo(() => {
    return notes?.find(n => n.id === selectedNoteId);
  }, [notes, selectedNoteId]);

  const handleSelectNote = (noteId: number) => {
    const note = notes?.find(n => n.id === noteId);
    if (note) {
      setSelectedNoteId(noteId);
      setTitle(note.title);
      setContent(note.content);
      setIsCreating(false);
      setShowPreview(false);
    }
  };

  const handleNewNote = () => {
    setIsCreating(true);
    setSelectedNoteId(null);
    setTitle("");
    setContent("");
    setShowPreview(false);
  };

  const handleSave = () => {
    if (!title.trim()) return;

    if (isCreating) {
      createMutation.mutate({ title, content });
    } else if (selectedNoteId) {
      updateMutation.mutate({ id: selectedNoteId, title, content });
    }
  };

  const handleDelete = () => {
    if (selectedNoteId && confirm("Delete this note?")) {
      deleteMutation.mutate({ id: selectedNoteId });
    }
  };

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
            Please sign in to access your research notes.
          </p>
          <Button asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
                <a className="flex items-center gap-2 text-primary font-medium">
                  <FileText className="w-4 h-4" />
                  Notes
                </a>
              </Link>
              <Link href="/graph">
                <a className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
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

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar - Note List */}
        <div className="w-80 border-r border-border bg-card overflow-y-auto">
          <div className="p-4 border-b border-border">
            <Button onClick={handleNewNote} className="w-full" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>
          <div className="p-2">
            {notesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : notes && notes.length > 0 ? (
              <div className="space-y-1">
                {notes.map(note => (
                  <button
                    key={note.id}
                    onClick={() => handleSelectNote(note.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedNoteId === note.id
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50 text-foreground"
                    }`}
                  >
                    <div className="font-medium truncate">{note.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No notes yet. Create your first note!
              </div>
            )}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {(selectedNoteId || isCreating) ? (
            <>
              <div className="border-b border-border bg-card p-4 flex items-center justify-between">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title..."
                  className="text-xl font-semibold border-none bg-transparent focus-visible:ring-0 px-0"
                />
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? "Edit" : "Preview"}
                  </Button>
                  {selectedNoteId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    onClick={handleSave}
                    size="sm"
                    disabled={!title.trim() || createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {showPreview ? (
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your note in Markdown... Use [[Note Title]] to link to other notes."
                    className="min-h-full resize-none border-none bg-transparent focus-visible:ring-0 text-base font-mono"
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a note or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
