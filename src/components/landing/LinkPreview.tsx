import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link as LinkIcon, Youtube } from 'lucide-react';

const getYouTubeVideoId = (url: string) => {
  if (!url) return null;
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const LinkPreview = ({ url, description }: { url: string, description: string }) => {
  const videoId = getYouTubeVideoId(url);

  if (videoId) {
    return (
      <div className="my-4">
        <Card className="overflow-hidden border-primary/20 shadow-lg transition-all hover:shadow-xl">
          <div className="aspect-video bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
          <CardContent className="p-4 bg-muted/50">
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline break-all flex items-start gap-2">
              <Youtube size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <span className="truncate">{description || url}</span>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For non-video links, render a preview card
  return (
    <div className="my-3">
      <a href={url} target="_blank" rel="noopener noreferrer">
        <Card className="border-primary/10 hover:border-primary/30 transition-all hover:shadow-md bg-muted/50">
            <CardContent className="p-4 flex items-start gap-3">
                <LinkIcon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground font-medium">{description || url}</span>
            </CardContent>
        </Card>
      </a>
    </div>
  );
};


