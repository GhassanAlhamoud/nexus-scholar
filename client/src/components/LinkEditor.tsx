import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Trash2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { RELATIONSHIP_TYPES } from "@shared/tvobjects";
import type { Note, Link } from "../../../drizzle/schema";

interface LinkEditorProps {
  currentNoteId: number;
  notes: Note[];
}

export function LinkEditor({ currentNoteId, notes }: LinkEditorProps) {
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");
  const [relationshipType, setRelationshipType] = useState<string>("");

  const utils = trpc.useUtils();

  const { data: links, isLoading: linksLoading } = trpc.links.forNote.useQuery(
    { noteId: currentNoteId },
    { enabled: !!currentNoteId }
  );

  const createLinkMutation = trpc.links.create.useMutation({
    onSuccess: () => {
      utils.links.forNote.invalidate({ noteId: currentNoteId });
      utils.graph.data.invalidate();
      setSelectedTargetId("");
      setRelationshipType("");
    },
  });

  const deleteLinkMutation = trpc.links.delete.useMutation({
    onSuccess: () => {
      utils.links.forNote.invalidate({ noteId: currentNoteId });
      utils.graph.data.invalidate();
    },
  });

  const handleCreateLink = () => {
    if (!selectedTargetId || !relationshipType) return;

    createLinkMutation.mutate({
      sourceNoteId: currentNoteId,
      targetNoteId: parseInt(selectedTargetId),
      relationshipType,
    });
  };

  const handleDeleteLink = (linkId: number) => {
    if (confirm("Delete this link?")) {
      deleteLinkMutation.mutate({ id: linkId });
    }
  };

  const getNoteTitle = (noteId: number) => {
    return notes.find(n => n.id === noteId)?.title || `Note #${noteId}`;
  };

  const availableNotes = notes.filter(n => n.id !== currentNoteId);

  return (
    <Card className="p-4 bg-card/50">
      <h3 className="text-sm font-semibold mb-4">Relationships</h3>

      {/* Create New Link */}
      <div className="space-y-3 mb-4 pb-4 border-b border-border">
        <div className="space-y-2">
          <Label className="text-xs">Link to Note</Label>
          <Select value={selectedTargetId} onValueChange={setSelectedTargetId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a note..." />
            </SelectTrigger>
            <SelectContent>
              {availableNotes.map(note => (
                <SelectItem key={note.id} value={note.id.toString()}>
                  {note.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Relationship Type</Label>
          <Select value={relationshipType} onValueChange={setRelationshipType}>
            <SelectTrigger>
              <SelectValue placeholder="Select relationship..." />
            </SelectTrigger>
            <SelectContent>
              {RELATIONSHIP_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleCreateLink}
          size="sm"
          className="w-full"
          disabled={!selectedTargetId || !relationshipType || createLinkMutation.isPending}
        >
          {createLinkMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Relationship
            </>
          )}
        </Button>
      </div>

      {/* Existing Links */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Existing Links</Label>
        {linksLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : links && links.length > 0 ? (
          <div className="space-y-2">
            {links.map(link => {
              const isOutgoing = link.sourceNoteId === currentNoteId;
              const otherNoteId = isOutgoing ? link.targetNoteId : link.sourceNoteId;
              const otherNoteTitle = getNoteTitle(otherNoteId);

              return (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-accent/50 text-sm"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isOutgoing ? (
                      <>
                        <span className="text-xs text-muted-foreground">This note</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-xs text-primary truncate">
                          {link.relationshipType?.replace(/_/g, " ") || "linked to"}
                        </span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{otherNoteTitle}</span>
                      </>
                    ) : (
                      <>
                        <span className="truncate">{otherNoteTitle}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-xs text-primary truncate">
                          {link.relationshipType?.replace(/_/g, " ") || "linked to"}
                        </span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">This note</span>
                      </>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLink(link.id)}
                    disabled={deleteLinkMutation.isPending}
                    className="ml-2 flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            No links yet. Create one above or use [[wiki-links]] in your note content.
          </p>
        )}
      </div>
    </Card>
  );
}
