
"use client"

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from '@/lib/utils'

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [mainApi, setMainApi] = useState<CarouselApi>()
  const [thumbApi, setThumbApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [fullscreenOpen, setFullscreenOpen] = useState(false)
  const [fullscreenApi, setFullscreenApi] = useState<CarouselApi>()

  const onThumbClick = useCallback((index: number) => {
    mainApi?.scrollTo(index)
  }, [mainApi])

  const onSelect = useCallback(() => {
    if (!mainApi || !thumbApi) return
    setSelectedIndex(mainApi.selectedScrollSnap())
    thumbApi.scrollTo(mainApi.selectedScrollSnap())
  }, [mainApi, thumbApi])

  const openFullscreen = (index: number) => {
    setSelectedIndex(index);
    setFullscreenOpen(true);
  }

  useEffect(() => {
    if (!mainApi) return
    onSelect()
    mainApi.on("select", onSelect)
    mainApi.on("reInit", onSelect)
    return () => {
        mainApi.off("select", onSelect)
        mainApi.off("reInit", onSelect)
    }
  }, [mainApi, onSelect])

  useEffect(() => {
    if (fullscreenApi) {
        fullscreenApi.scrollTo(selectedIndex, true)
    }
  }, [fullscreenOpen, selectedIndex, fullscreenApi])

  if (!images || images.length === 0) {
    return (
      <div className="bg-secondary/30 rounded-lg flex items-center justify-center p-8 aspect-square">
        <Image
          src={`https://placehold.co/600x600/e2e8f0/64748b?text=No+Image`}
          alt="No image available"
          width={600}
          height={600}
          className="object-cover w-full h-full"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Carousel setApi={setMainApi} className="w-full group">
        <CarouselContent>
          {images.map((imgUrl, index) => (
            <CarouselItem key={index} onClick={() => openFullscreen(index)}>
              <Card className="overflow-hidden cursor-pointer">
                <CardContent className="p-0 flex aspect-square items-center justify-center bg-secondary/30">
                  <Image
                    src={imgUrl}
                    alt={`${productName} - image ${index + 1}`}
                    width={600}
                    height={600}
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover h-full w-full group-hover:scale-105 transition-transform"
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
            <>
                <CarouselPrevious className="absolute left-2 text-foreground bg-white/50 hover:bg-white/80" />
                <CarouselNext className="absolute right-2 text-foreground bg-white/50 hover:bg-white/80" />
            </>
        )}
      </Carousel>

      {images.length > 1 && (
        <Carousel setApi={setThumbApi} opts={{ align: "start", slidesToScroll: 1, dragFree: true }} className="w-full">
            <CarouselContent className="-ml-2">
            {images.map((imgUrl, index) => (
                <CarouselItem key={index} onClick={() => onThumbClick(index)} className="pl-2 basis-1/4 md:basis-1/5">
                <div className={cn("overflow-hidden rounded-md cursor-pointer aspect-square", selectedIndex === index ? "ring-2 ring-primary ring-offset-2" : "opacity-60 hover:opacity-100 transition-opacity")}>
                    <Image
                    src={imgUrl}
                    alt={`${productName} - thumbnail ${index + 1}`}
                    width={120}
                    height={120}
                    className="object-cover h-full w-full"
                    />
                </div>
                </CarouselItem>
            ))}
            </CarouselContent>
        </Carousel>
      )}
      
      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent className="max-w-none w-[90vw] h-[90vh] bg-transparent border-none shadow-none p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Image gallery for {productName}</DialogTitle>
            <DialogDescription>Use the arrow buttons to navigate through the product images.</DialogDescription>
          </DialogHeader>
          <Carousel className="w-full h-full" setApi={setFullscreenApi} opts={{ startIndex: selectedIndex, loop: true }}>
            <CarouselContent className="h-full">
              {images.map((imgUrl, index) => (
                <CarouselItem key={index} className="relative">
                    <Image src={imgUrl} alt={`${productName} - image ${index + 1}`} fill className="object-contain p-4"/>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 text-white bg-black/50 hover:bg-black/80 hover:text-white border-none h-12 w-12"/>
            <CarouselNext className="absolute right-4 text-white bg-black/50 hover:bg-black/80 hover:text-white border-none h-12 w-12" />
          </Carousel>
        </DialogContent>
      </Dialog>
    </div>
  )
}
