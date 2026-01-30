
'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { SiteImage } from '@/lib/types';

interface MediaContextType {
  images: SiteImage[] | null;
  getImage: (id: string) => SiteImage | undefined;
  isLoading: boolean;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider = ({ children }: { children: ReactNode }) => {
    const firestore = useFirestore();
    const imagesQuery = useMemoFirebase(() => query(collection(firestore, 'siteImages')), [firestore]);
    const { data: images, isLoading } = useCollection<Omit<SiteImage, 'id'>>(imagesQuery);

    const getImage = (id: string) => {
        return images?.find(img => img.id === id);
    }

    const value = { images, getImage, isLoading };

    return (
        <MediaContext.Provider value={value}>
            {children}
        </MediaContext.Provider>
    );
};

export const useMedia = () => {
    const context = useContext(MediaContext);
    if (context === undefined) {
        throw new Error('useMedia must be used within a MediaProvider');
    }
    return context;
};
