import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link as LinkIcon, Image as ImageIcon, Edit, Rss, Video, Newspaper, Users } from 'lucide-react';
import { LinkPreview } from './LinkPreview';
import JsonViewer from './JsonViewer';

const getIconForSection = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.startsWith('detailed_description')) return <ImageIcon className="h-5 w-5 mr-2 text-primary" />;
    if (lowerTitle.includes('web_links')) return <LinkIcon className="h-5 w-5 mr-2 text-primary" />;
    if (lowerTitle.includes('video_links')) return <Video className="h-5 w-5 mr-2 text-primary" />;
    if (lowerTitle.includes('blog_links')) return <Rss className="h-5 w-5 mr-2 text-primary" />;
    if (lowerTitle.includes('noticia_links')) return <Newspaper className="h-5 w-5 mr-2 text-primary" />;
    if (lowerTitle.includes('redessocial_links')) return <Users className="h-5 w-5 mr-2 text-primary" />;
    if (lowerTitle.startsWith('texto_redactado')) return <Edit className="h-5 w-5 mr-2 text-primary" />;
    if (lowerTitle.startsWith('chain_of_thought')) return <Edit className="h-5 w-5 mr-2 text-primary" />;
    if (lowerTitle.startsWith('resumen_de_razonamiento')) return <Edit className="h-5 w-5 mr-2 text-primary" />;
    if (lowerTitle.startsWith('information_extracted')) return <Edit className="h-5 w-5 mr-2 text-primary" />;
    return <LinkIcon className="h-5 w-5 mr-2 text-primary" />; // Default icon
}

interface Section {
  title: string;
  content?: string | { title: string; link: string }[];
  media?: { type: 'video' | 'image'; url: string; }; // New media property
}

interface FormattedResearchResultProps {
  sections: Section[];
  userPlan: string; // Added userPlan prop
}

export const FormattedResearchResult = ({ sections, userPlan }: FormattedResearchResultProps) => {
  const processedSections = React.useMemo(() => {
    // If userPlan is not 'gratuito' or 'mensual', return all sections without limits
    if (userPlan !== 'gratuito' && userPlan !== 'mensual') {
      return sections;
    }

    const limitedSections: Section[] = [];
    let webLinksCount = 0;
    let videoLinksCount = 0;
    let blogLinksCount = 0;
    let noticiaLinksCount = 0;
    let socialLinksCount = 0;

    sections.forEach(section => {
      const lowerTitle = section.title.toLowerCase();

      // Always show "cadena de pensamiento" (thought chain)
      if (lowerTitle.includes('pensamiento') || lowerTitle.includes('razonamiento')) {
        limitedSections.push(section);
        return; // Move to the next section after processing
      }

      // Handle non-link content (e.g., "Texto redactado", "Descripción detallada")
      // For 'gratuito' plan, these are hidden. For 'mensual' and above, they are shown.
      if (!Array.isArray(section.content)) {
        if (userPlan === 'gratuito') {
          return; // Hide for free users
        } else {
          limitedSections.push(section); // Show for paid users
          return;
        }
      }

      // Apply limits based on userPlan
      if (userPlan === 'gratuito') {
        if (lowerTitle.includes('web_links')) {
          const availableSlots = 2 - webLinksCount;
          if (availableSlots > 0) {
            const links = (section.content as { title: string; link: string }[]).slice(0, availableSlots);
            webLinksCount += links.length;
            limitedSections.push({ ...section, content: links });
          }
        } else if (lowerTitle.includes('video_links')) {
          const availableSlots = 1 - videoLinksCount;
          if (availableSlots > 0) {
            const links = (section.content as { title: string; link: string }[]).slice(0, availableSlots);
            videoLinksCount += links.length;
            limitedSections.push({ ...section, content: links });
          }
        } else if (lowerTitle.includes('redessocial_links')) {
          const availableSlots = 1 - socialLinksCount;
          if (availableSlots > 0) {
            const links = (section.content as { title: string; link: string }[]).slice(0, availableSlots);
            socialLinksCount += links.length;
            limitedSections.push({ ...section, content: links });
          }
        }
        // blog_links, noticia_links are ignored for free users as per existing logic
      } else if (userPlan === 'mensual') {
        if (lowerTitle.includes('web_links')) {
          const availableSlots = 2 - webLinksCount;
          if (availableSlots > 0) {
            const links = (section.content as { title: string; link: string }[]).slice(0, availableSlots);
            webLinksCount += links.length;
            limitedSections.push({ ...section, content: links });
          }
        } else if (lowerTitle.includes('video_links')) {
          const availableSlots = 2 - videoLinksCount; // 2 for mensual
          if (availableSlots > 0) {
            const links = (section.content as { title: string; link: string }[]).slice(0, availableSlots);
            videoLinksCount += links.length;
            limitedSections.push({ ...section, content: links });
          }
        } else if (lowerTitle.includes('blog_links')) {
          const availableSlots = 1 - blogLinksCount; // 1 for mensual
          if (availableSlots > 0) {
            const links = (section.content as { title: string; link: string }[]).slice(0, availableSlots);
            blogLinksCount += links.length;
            limitedSections.push({ ...section, content: links });
          }
        } else if (lowerTitle.includes('noticia_links')) {
          const availableSlots = 1 - noticiaLinksCount; // 1 for mensual
          if (availableSlots > 0) {
            const links = (section.content as { title: string; link: string }[]).slice(0, availableSlots);
            noticiaLinksCount += links.length;
            limitedSections.push({ ...section, content: links });
          }
        } else if (lowerTitle.includes('redessocial_links')) {
          const availableSlots = 1 - socialLinksCount; // 1 for mensual
          if (availableSlots > 0) {
            const links = (section.content as { title: string; link: string }[]).slice(0, availableSlots);
            socialLinksCount += links.length;
            limitedSections.push({ ...section, content: links });
          }
        }
      }
    });

    return limitedSections;
  }, [sections, userPlan]);

  if (!processedSections || processedSections.length === 0) return null;

  return (
    <div className="mt-8 animate-fade-in space-y-6">
      {processedSections.map((section, index) => {
        const isLinkSection = Array.isArray(section.content);
        const isMediaSection = section.media && section.media.url; // Check for new media property
        
        return (
          <Card key={index} className="glass-panel border-primary/20 shadow-xl bg-gradient-to-br from-card to-muted/50 transition-all hover:shadow-2xl">
            <CardHeader className="pb-4 bg-muted/50">
              <CardTitle className="text-lg flex items-center font-semibold">
                {getIconForSection(section.title)}
                {section.title.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLinkSection ? (
                <div className="space-y-2">
                  {(section.content as { title: string; link: string }[]).map((link, i) => (
                    <LinkPreview key={i} url={link.link} description={link.title} />
                  ))}
                </div>
              ) : isMediaSection ? ( // Render media if available
                <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 Aspect Ratio */ }}>
                  {section.media.type === 'video' && (
                    <iframe
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      src={section.media.url}
                      title={section.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  )}
                  {section.media.type === 'image' && (
                    <img
                      className="absolute top-0 left-0 w-full h-full object-contain rounded-lg"
                      src={section.media.url}
                      alt={section.title}
                    />
                  )}
                </div>
              ) : (
                (() => {
                  try {
                    const parsed = JSON.parse(section.content as string);
                    return <JsonViewer data={parsed} />;
                  } catch (e) {
                    return (
                      <div className="whitespace-pre-line text-base leading-relaxed text-foreground/90">
                        {section.content as string}
                      </div>
                    );
                  }
                })()
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};