
"use client";

import React from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { MediaLibraryItem } from '@/lib/types';
import { MediaLibraryForm } from './media-library-form';

interface ProductImageSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageSelect: (image: MediaLibraryItem) => void;
}

export function ProductImageSelector({ open, onOpenChange, onImageSelect }: ProductImageSelectorProps) {
  const firestore = useFirestore();
  const libraryQuery = useMemoFirebase(() => query(collection(firestore, 'mediaLibrary'), orderBy('uploadedAt', 'desc')), [firestore]);
  const { data: library, isLoading: isLoadingLibrary } = useCollection<Omit<MediaLibraryItem, 'id'>>(libraryQuery);

  const handleSelect = (item: MediaLibraryItem) => {
    onImageSelect(item);
    onOpenChange(false);
  };

  const handleUploadSuccess = (newItem: MediaLibraryItem) => {
    onImageSelect(newItem);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl min-h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select or Upload Product Image</DialogTitle>
          <DialogDescription>Choose an existing image from your library or upload a new one.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="select" className="flex-grow flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select">Select from Library</TabsTrigger>
            <TabsTrigger value="upload">Upload New Image</TabsTrigger>
          </TabsList>
          <TabsContent value="select" className="flex-grow overflow-auto mt-4">
            {isLoadingLibrary ? <p>Loading...</p> : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-1">
                {library?.map(item => (
                  <button key={item.id} className="group relative border rounded-md overflow-hidden" onClick={() => handleSelect(item)}>
                    <Image src={item.imageUrl} alt={item.name} width={200} height={200} className="object-cover aspect-square w-full" />
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm text-center">Select</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="upload" className="mt-4">
            <MediaLibraryForm mediaItem={null} onSuccess={handleUploadSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
