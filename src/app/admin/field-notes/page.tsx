"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { FieldNote } from "@/lib/types";
import { PlusCircle, Pencil, Trash2, ExternalLink, Eye, EyeOff } from "lucide-react";
import { FieldNoteForm } from "@/components/admin/field-note-form";
import { useToast } from "@/hooks/use-toast";

export default function AdminFieldNotesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FieldNote | null>(null);

  const notesQuery = useMemoFirebase(
    () => query(collection(firestore, "fieldNotes"), orderBy("publishedAt", "desc")),
    [firestore]
  );
  const { data: notes, isLoading } = useCollection<Omit<FieldNote, "id">>(notesQuery);

  const openAdd = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (n: FieldNote) => { setEditing(n); setDialogOpen(true); };

  const handleDelete = async (n: FieldNote) => {
    if (!confirm(`Delete "${n.title}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(firestore, "fieldNotes", n.id));
      toast({ title: "Field note deleted", description: `"${n.title}" removed.` });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Field Notes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Write and edit the editorial articles shown at /field-notes.</p>
        </div>
        <Button onClick={openAdd}>
          <PlusCircle className="mr-2 h-4 w-4" /> New field note
        </Button>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-muted-foreground">Loading field notes…</p>
      ) : !notes || notes.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed py-16 text-center">
          <h3 className="text-lg font-semibold">No field notes yet</h3>
          <p className="mt-1 text-muted-foreground">Write your first article to start building topical authority.</p>
          <Button className="mt-4" onClick={openAdd}><PlusCircle className="mr-2 h-4 w-4" /> New field note</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <Card key={n.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 inline-flex shrink-0 items-center rounded border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    {n.category}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{n.title}</span>
                      {n.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-600"><Eye className="h-3 w-3" /> Published</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground"><EyeOff className="h-3 w-3" /> Draft</span>
                      )}
                    </div>
                    {n.deck && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.deck}</p>}
                    <a href={`/field-notes/${n.slug}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" /> /field-notes/{n.slug}
                    </a>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(n)}><Pencil className="h-4 w-4" /><span className="sr-only">Edit</span></Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(n)}><Trash2 className="h-4 w-4" /><span className="sr-only">Delete</span></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit field note" : "New field note"}</DialogTitle>
          </DialogHeader>
          <FieldNoteForm note={editing} onSuccess={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
