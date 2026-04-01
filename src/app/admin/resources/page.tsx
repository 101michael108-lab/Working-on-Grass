
"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Resource } from "@/lib/types";
import { PlusCircle, Pencil, Trash2, ExternalLink, Eye, EyeOff } from "lucide-react";
import { ResourceForm } from "@/components/admin/resource-form";
import { useToast } from "@/hooks/use-toast";

const TYPE_COLORS: Record<Resource['resourceType'], string> = {
  PDF:       "bg-red-100 text-red-700 border-red-200",
  Video:     "bg-purple-100 text-purple-700 border-purple-200",
  Article:   "bg-blue-100 text-blue-700 border-blue-200",
  Template:  "bg-green-100 text-green-700 border-green-200",
  Guide:     "bg-amber-100 text-amber-700 border-amber-200",
  Map:       "bg-teal-100 text-teal-700 border-teal-200",
  Checklist: "bg-orange-100 text-orange-700 border-orange-200",
};

export default function AdminResourcesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const resourcesQuery = useMemoFirebase(
    () => query(collection(firestore, 'resources'), orderBy('createdAt', 'desc')),
    [firestore]
  );
  const { data: resources, isLoading } = useCollection<Omit<Resource, 'id'>>(resourcesQuery);

  const handleOpenAdd = () => {
    setEditingResource(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (resource: Resource) => {
    setEditingResource(resource);
    setDialogOpen(true);
  };

  const handleDelete = async (resource: Resource) => {
    const confirmed = confirm(
      `Are you sure you want to delete "${resource.title}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteDoc(doc(firestore, 'resources', resource.id));
      toast({ title: "Resource deleted", description: `"${resource.title}" has been removed.` });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to delete the resource.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resources</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage downloadable files, guides, and links shown on the Resources page.
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Resource
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-muted-foreground py-8 text-center">Loading resources…</p>
      ) : !resources || resources.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-semibold">No resources yet</h3>
          <p className="text-muted-foreground mt-1">
            Add your first resource to get started.
          </p>
          <Button className="mt-4" onClick={handleOpenAdd}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Resource
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((resource) => (
            <Card key={resource.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Type badge */}
                  <span
                    className={`shrink-0 mt-0.5 inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold ${TYPE_COLORS[resource.resourceType]}`}
                  >
                    {resource.resourceType}
                  </span>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{resource.title}</span>
                      {resource.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-green-600 font-medium">
                          <Eye className="h-3 w-3" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                          <EyeOff className="h-3 w-3" /> Draft
                        </span>
                      )}
                    </div>
                    {resource.description && (
                      <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                        {resource.description}
                      </p>
                    )}
                    {resource.fileUrl && (
                      <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                      >
                        <ExternalLink className="h-3 w-3" /> View file
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(resource)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(resource)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingResource ? "Edit Resource" : "Add Resource"}
            </DialogTitle>
          </DialogHeader>
          <ResourceForm
            resource={editingResource}
            onSuccess={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
