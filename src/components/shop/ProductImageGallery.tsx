
"use client"

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductImageGalleryProps {
  images: string[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selected, setSelected] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const safeImages = images && images.length > 0 ? images : []

  const prev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSelected(i => (i === 0 ? safeImages.length - 1 : i - 1))
  }, [safeImages.length])

  const next = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSelected(i => (i === safeImages.length - 1 ? 0 : i + 1))
  }, [safeImages.length])

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = useCallback(() => setLightboxOpen(false), [])

  const lightboxPrev = useCallback(() => {
    setLightboxIndex(i => (i === 0 ? safeImages.length - 1 : i - 1))
  }, [safeImages.length])

  const lightboxNext = useCallback(() => {
    setLightboxIndex(i => (i === safeImages.length - 1 ? 0 : i + 1))
  }, [safeImages.length])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') lightboxPrev()
      if (e.key === 'ArrowRight') lightboxNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxOpen, closeLightbox, lightboxPrev, lightboxNext])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxOpen])

  if (safeImages.length === 0) {
    return (
      <div className="bg-secondary/20 rounded-lg flex items-center justify-center aspect-square border border-border">
        <span className="text-muted-foreground text-sm">No image available</span>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3">

        {/* ── Main image ─────────────────────────────────────────── */}
        <div
          className="relative group rounded-lg overflow-hidden border border-border bg-white cursor-zoom-in"
          onClick={() => openLightbox(selected)}
        >
          <div className="relative aspect-square w-full">
            <Image
              key={safeImages[selected]}
              src={safeImages[selected]}
              alt={`${productName} — image ${selected + 1}`}
              fill
              priority={selected === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>

          {/* Zoom hint */}
          <div className="absolute bottom-3 right-3 bg-black/40 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <ZoomIn className="h-4 w-4" />
          </div>

          {/* Prev / Next arrows (only when >1 image) */}
          {safeImages.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-foreground rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-foreground rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* ── Thumbnails ─────────────────────────────────────────── */}
        {safeImages.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {safeImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={cn(
                  'relative h-16 w-16 rounded-md overflow-hidden border-2 bg-white transition-all shrink-0',
                  i === selected
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-border opacity-60 hover:opacity-100 hover:border-primary/50'
                )}
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={img}
                  alt={`${productName} thumbnail ${i + 1}`}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ───────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-10"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image counter */}
          {safeImages.length > 1 && (
            <p className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium tabular-nums">
              {lightboxIndex + 1} / {safeImages.length}
            </p>
          )}

          {/* Main lightbox image */}
          <div
            className="relative w-full h-full max-w-5xl mx-auto px-16 py-12 flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <Image
              key={lightboxIndex}
              src={safeImages[lightboxIndex]}
              alt={`${productName} — image ${lightboxIndex + 1}`}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>

          {/* Prev / Next */}
          {safeImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); lightboxPrev() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); lightboxNext() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          {/* Thumbnail strip at bottom */}
          {safeImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {safeImages.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i) }}
                  className={cn(
                    'relative h-12 w-12 rounded overflow-hidden border-2 bg-black transition-all shrink-0',
                    i === lightboxIndex ? 'border-white' : 'border-white/30 opacity-50 hover:opacity-80'
                  )}
                  aria-label={`Go to image ${i + 1}`}
                >
                  <Image src={img} alt="" fill sizes="48px" className="object-contain p-0.5" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
