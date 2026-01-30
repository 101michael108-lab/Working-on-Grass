
"use client";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { SiteImage, MediaLibraryItem } from "@/lib/types";
import { PlusCircle, ImagePlus, CheckCircle, Pencil } from "lucide-react";
import { MediaLibraryForm } from "@/components/admin/media-library-form";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// --- Main Page Component ---
export default function AdminMediaPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  // Dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editingLibraryItem, setEditingLibraryItem] = useState<MediaLibraryItem | null>(null);
  const [assigningToSpot, setAssigningToSpot] = useState<SiteImage | null>(null);

  // Data fetching
  const spotsQuery = useMemoFirebase(() => query(collection(firestore, 'siteImages'), orderBy('__name__')), [firestore]);
  const { data: spots, isLoading: isLoadingSpots } = useCollection<Omit<SiteImage, 'id'>>(spotsQuery);

  const libraryQuery = useMemoFirebase(() => query(collection(firestore, 'mediaLibrary'), orderBy('uploadedAt', 'desc')), [firestore]);
  const { data: library, isLoading: isLoadingLibrary } = useCollection<Omit<MediaLibraryItem, 'id'>>(libraryQuery);

  const assignedImageUrls = useMemo(() => spots?.map(spot => spot.imageUrl) || [], [spots]);

  // Handlers
  const handleOpenUploadDialog = (item: MediaLibraryItem | null = null) => {
    setEditingLibraryItem(item);
    setUploadDialogOpen(true);
  };

  const handleOpenAssignDialog = (spot: SiteImage) => {
    setAssigningToSpot(spot);
    setAssignDialogOpen(true);
  };

  const handleAssignImage = (libraryItem: MediaLibraryItem) => {
    if (!assigningToSpot) return;

    const spotRef = doc(firestore, 'siteImages', assigningToSpot.id);
    const updatedSpotData = {
      imageUrl: libraryItem.imageUrl,
      description: libraryItem.description || libraryItem.name,
      imageHint: '', // Or find a way to manage this
    };

    setDocumentNonBlocking(spotRef, updatedSpotData, { merge: true });
    toast({ title: "Spot Updated!", description: `Spot '${assigningToSpot.id}' now uses '${libraryItem.name}'.` });
    setAssignDialogOpen(false);
    setAssigningToSpot(null);
  };

  const isLoading = isLoadingSpots || isLoadingLibrary;

  return (
    <div className="space-y-8">
      {/* Section 1: Image Spots */}
      <Card>
        <CardHeader>
          <CardTitle>Image Spots</CardTitle>
          <CardDescription>These are the fixed image locations on your website. Assign images to them from your library.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSpots ? <p>Loading spots...</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {spots?.map(spot => (
                <Card key={spot.id}>
                  <CardHeader className="p-3">
                    <p className="font-mono text-xs text-muted-foreground">{spot.id}</p>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <Image src={spot.imageUrl} alt={spot.description} width={200} height={200} className="rounded-md object-cover aspect-square w-full bg-secondary"/>
                  </CardContent>
                  <CardFooter className="p-3">
                    <Button className="w-full" variant="outline" onClick={() => handleOpenAssignDialog(spot)}>
                      Assign from Library
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Media Library */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Media Library</CardTitle>
            <CardDescription>Your collection of uploaded images. Upload new assets and manage existing ones here.</CardDescription>
          </div>
          <Button onClick={() => handleOpenUploadDialog()}>
            <ImagePlus className="mr-2"/>
            Upload to Library
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingLibrary ? <p>Loading library...</p> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {library?.map(item => {
                const isAssigned = assignedImageUrls.includes(item.imageUrl);
                return (
                   <Card key={item.id} className="group relative">
                    {isAssigned && (
                      <Badge variant="success" className="absolute -top-2 -right-2 z-10 pl-1.5">
                        <CheckCircle className="h-3 w-3 mr-1"/> Assigned
                      </Badge>
                    )}
                    <Image src={item.imageUrl} alt={item.name} width={200} height={200} className="rounded-t-md object-cover aspect-square w-full bg-secondary"/>
                     <div className="p-2 text-xs">
                        <p className="font-medium truncate">{item.name}</p>
                     </div>
                     <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="secondary" size="sm" onClick={() => handleOpenUploadDialog(item)}>
                            <Pencil className="mr-2 h-4 w-4"/> Edit
                        </Button>
                     </div>
                  </Card>
                )
              })}
            </div>
          )}
           {!isLoadingLibrary && library?.length === 0 && (
             <div className="text-center py-12 border-dashed border-2 rounded-md">
                <h3 className="text-lg font-semibold">Your Media Library is Empty</h3>
                <p className="text-muted-foreground mt-1">Start by uploading your first image.</p>
                <Button className="mt-4" onClick={() => handleOpenUploadDialog()}><PlusCircle className="mr-2"/>Upload Image</Button>
             </div>
           )}
        </CardContent>
      </Card>

      {/* Dialog for Uploading/Editing Library Items */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLibraryItem ? "Edit Media Item" : "Upload to Library"}</DialogTitle>
            <DialogDescription>Upload a new image file or edit the details of an existing one.</DialogDescription>
          </DialogHeader>
          <MediaLibraryForm 
            mediaItem={editingLibraryItem}
            onSuccess={() => setUploadDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Dialog for Assigning an Image to a Spot */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Assign Image to Spot: <span className="font-mono text-primary">{assigningToSpot?.id}</span></DialogTitle>
            <DialogDescription>Select an image from your library to assign to this spot.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-h-[60vh] overflow-y-auto p-1">
             {library?.map(item => (
                <button key={item.id} className="group relative border rounded-md overflow-hidden" onClick={() => handleAssignImage(item)}>
                  <Image src={item.imageUrl} alt={item.name} width={200} height={200} className="object-cover aspect-square w-full"/>
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm text-center">Assign</p>
                  </div>
                </button>
             ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
