
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, MessageCircle, Share2 } from 'lucide-react';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
      color: 'hover:text-green-600',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'hover:text-blue-600',
    },
    {
      name: 'X',
      icon: Twitter, // Lucide doesn't have X, using Twitter icon as placeholder
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: 'hover:text-sky-500',
    }
  ];

  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
        <Share2 className="h-3 w-3" /> Share:
      </span>
      <div className="flex items-center gap-2">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Share on ${link.name}`}
          >
            <Button variant="ghost" size="icon" className={`h-8 w-8 text-muted-foreground ${link.color}`}>
              <link.icon className="h-4 w-4" />
            </Button>
          </a>
        ))}
      </div>
    </div>
  );
}
