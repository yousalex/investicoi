import React from 'react';
import { User, Bot, ExternalLink, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import AnimatedTransition from '@/components/AnimatedTransition';
import { Chat, ChatMessage } from '@/types/chat';

interface FormattedAIResponseProps {
  content: string;
}

const FormattedAIResponse: React.FC<FormattedAIResponseProps> = ({ content }) => {
  // Clean the content by removing asterisks and formatting
  const cleanContent = content.replace(/\*/g, '');
  
  // Extract different types of links
  const extractLinks = (text: string) => {
    const webLinkRegex = /https?:\/\/[^\s\)]+/g;
    const videoLinkRegex = /🔗 Resultados útiles encontrados en video_links[\s\S]*?(?=🔗|$)/g;
    
    const webLinks = text.match(webLinkRegex) || [];
    const videoSections = text.match(videoLinkRegex) || [];
    
    const videoLinks: string[] = [];
    videoSections.forEach(section => {
      const links = section.match(webLinkRegex) || [];
      videoLinks.push(...links);
    });
    
    return { webLinks, videoLinks };
  };
  
  const { webLinks, videoLinks } = extractLinks(cleanContent);
  
  // Replace URLs with clickable links
  const formatTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\[\/\/][^\s\)]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
          >
            {part.length > 50 ? `${part.substring(0, 50)}...` : part}
            <ExternalLink size={12} />
          </a>
        );
      }
      return part;
    });
  };
  
  // Get YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?#]+)/);
    return match ? match[1] : null;
  };
  
  return (
    <div className="space-y-4">
      {/* Main content */}
      <div className="glass-panel p-4 rounded-lg border-l-4 border-primary">
        <div className="prose prose-sm max-w-none">
          <div className="text-sm whitespace-pre-wrap">
            {formatTextWithLinks(cleanContent)}
          </div>
        </div>
      </div>
      
      {/* Video previews */}
      {videoLinks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Play size={16} />
            Videos relacionados
          </h4>
          <div className="grid gap-3">
            {videoLinks.slice(0, 3).map((link, index) => {
              const youtubeId = getYouTubeId(link);
              
              return (
                <div key={index} className="glass-panel p-3 rounded-lg">
                  {youtubeId ? (
                    <div className="space-y-2">
                      <div className="aspect-video rounded overflow-hidden">
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeId}`}
                          title={`Video ${index + 1}`}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                      >
                        Ver en YouTube
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                      <Play size={16} className="text-primary" />
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                      >
                        {link.length > 60 ? `${link.substring(0, 60)}...` : link}
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

interface ChatMessagesProps {
  activeChat: Chat | null;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ activeChat }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <AnimatedTransition
        show={activeChat?.messages.length === 0}
        animation="fade"
        className="h-full flex items-center justify-center"
      >
        <div className="text-center space-y-2 max-w-md">
          <h3 className="text-xl font-medium">Search Your Second Brain</h3>
          <p className="text-muted-foreground">
            Ask questions to search across your notes, documents, and knowledge base.
          </p>
        </div>
      </AnimatedTransition>
      
      <AnimatedTransition
        show={activeChat?.messages.length > 0}
        animation="fade"
        className="space-y-4"
      >
        {activeChat?.messages.map((message: ChatMessage) => (
          <div 
            key={message.id}
            className={cn(
              "flex gap-3 p-4 rounded-lg",
              message.type === 'user' 
                ? "bg-primary/10 ml-auto max-w-[80%]" 
                : "bg-muted/10 mr-auto max-w-[80%]"
            )}
          >
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
              message.type === 'user' ? "bg-primary/20" : "bg-secondary/20"
            )}>
              {message.type === 'user' ? (
                <User size={16} className="text-primary" />
              ) : (
                <Bot size={16} className="text-secondary" />
              )}
            </div>
            <div className="flex-1">
              {message.type === 'assistant' ? (
                <FormattedAIResponse content={message.content} />
              ) : (
                <p className="text-sm">{message.content}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(message.timestamp).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
      </AnimatedTransition>
    </div>
  );
};

export default ChatMessages;