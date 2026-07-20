
'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { SiteImage } from '@/lib/types';

interface MediaContextType {
  images: SiteImage[] | null;
  getImage: (id: string) => SiteImage | null;
  isLoading: boolean;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider = ({
    children,
    initialImages = [],
}: {
    children: ReactNode;
    /**
     * Server-rendered `siteImages`, read in the root layout. Lets `getImage` resolve
     * on the very first render — so image URLs land in the SSR HTML instead of
     * appearing only after hydration + a Firestore round-trip.
     */
    initialImages?: SiteImage[];
}) => {
    const firestore = useFirestore();
    const hasServerImages = initialImages.length > 0;

    // When the server already supplied the images there is nothing to wait for, so
    // skip the realtime subscription entirely. `onSnapshot` holds a long-lived
    // channel open on every page, which kept the network from ever going quiet —
    // it was pushing time-to-interactive past 10s for zero visible benefit.
    // Admin screens that need live data run their own queries; edits made there
    // reach visitors on the layout's 5-minute revalidation.
    const imagesQuery = useMemoFirebase(
        () => (hasServerImages ? null : query(collection(firestore, 'siteImages'))),
        [firestore, hasServerImages]
    );
    const { data: images, isLoading } = useCollection<Omit<SiteImage, 'id'>>(imagesQuery);

    const resolvedImages = hasServerImages
        ? initialImages
        : (images as SiteImage[] | null);

    const getImage = (id: string): SiteImage | null => {
        return resolvedImages?.find(img => img.id === id) ?? null;
    }

    const value = {
        images: resolvedImages,
        getImage,
        // Server data already satisfies consumers, so don't make them show a spinner.
        isLoading: isLoading && resolvedImages === null,
    };

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
