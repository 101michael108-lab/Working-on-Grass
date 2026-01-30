
"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaForm } from "@/components/admin/media-form";
import type { SiteImage } from "@/lib/types";
import { PlusCircle } from "lucide-react";

export default function AdminMediaPage() {
  const firestore = useFirestore();
  const imagesQuery = useMemoFirebase(() => query(collection(firestore, 'siteImages'), orderBy('__name__')), [firestore]);
  const { data: images, isLoading } = useCollection<Omit<SiteImage, 'id'>>(imagesQuery);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SiteImage | null>(null);

  const handleEdit = (image: SiteImage) => {
    setSelectedImage(image);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedImage(null);
    setDialogOpen(true);
  }

  const onFormSuccess = () => {
    setDialogOpen(false);
    setSelectedImage(null);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
              <CardTitle>Manage Site Images</CardTitle>
              <CardDescription>Add or edit image spots used across your website.</CardDescription>
          </div>
          <Button onClick={handleAdd}>
              <PlusCircle className="mr-2 h-4 w-4"/>
              Add Image Spot
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading images...</p>}
          {!isLoading && (
            <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead>Preview</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {images?.map(image => (
                      <TableRow key={image.id}>
                          <TableCell>
                            <Image src={image.imageUrl} alt={image.description} width={80} height={80} className="rounded-md object-cover aspect-square bg-secondary"/>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{image.id}</TableCell>
                          <TableCell>{image.description}</TableCell>
                          <TableCell>
                              <Button variant="outline" size="sm" onClick={() => handleEdit(image)}>Edit</Button>
                          </TableCell>
                      </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedImage ? "Edit Image Details" : "Add New Image Spot"}</DialogTitle>
          </DialogHeader>
          <MediaForm image={selectedImage} onSuccess={onFormSuccess} />
        </DialogContent>
      </Dialog>
    </>
  )
}
