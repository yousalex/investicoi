import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link as LinkIcon, Image as ImageIcon, Edit, Rss, Video, Newspaper, Users } from 'lucide-react';
import { LinkPreview } from './LinkPreview';
import JsonViewer from './JsonViewer';

const getIconForSection = (title: string) => {
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
  return <LinkIcon className="h-5 w-5 mr-2 text-primary" />;
};

interface Section {
  title: string;
  content?: string | { title: string; link: string; description?: string }[] | object;
  media?: { type: 'video' | 'image'; url: string };
}

const formatObjectToString = (obj: Record<string, unknown>, indent = 0): string => {
  if (typeof obj !== 'object' || obj === null) {
    return String(obj);
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return `[\n${obj.map(item => '  '.repeat(indent + 1) + formatObjectToString(item, indent + 1)).join(',\n')}\n${'  '.repeat(indent)}]`;
  }

  const entries = Object.entries(obj);
  if (entries.length === 0) return '{}';

  return `{\n${entries.map(([key, value]) => {
    const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const formattedValue = formatObjectToString(value as Record<string, unknown>, indent + 1);
    return '  '.repeat(indent + 1) + `${formattedKey}: ${formattedValue}`;
  }).join(',\n')}\n${'  '.repeat(indent)}}`;
};

interface FormattedResearchResultProps {
  sections: Section[];
  userPlan: string;
}

export const FormattedResearchResult = ({ sections, userPlan }: FormattedResearchResultProps) => {
  const processedSections = React.useMemo(() => {
    const titleMapping: { [key: string]: string } = {
      'chain_of_thought': 'Proceso de Pensamiento',
      'resumen_de_razonamiento': 'Resumen de Razonamiento',
      'information_extracted': 'Información Extraída',
      'web_links': 'Links a Webs',
      'video_links': 'Links a Videos',
      'blog_links': 'Links a Blogs',
      'noticia_links': 'Links a Noticias',
      'redessocial_links': 'Links a Redes Sociales',
      'totals': 'Totales',
      'detailed_description': 'Descripción Detallada',
      'texto_redactado': 'Texto Redactado',
    };

    const order = [
      'chain_of_thought',
      'resumen_de_razonamiento',
      'information_extracted',
      'web_links',
      'video_links',
      'blog_links',
      'noticia_links',
      'redessocial_links',
      'totals',
      'detailed_description',
      'texto_redactado',
    ];

    const mappedSections = sections
      .map(section => ({
        ...section,
        displayTitle: titleMapping[section.title.toLowerCase().replace(/ /g, '_')] || section.title,
      }))
      .filter(section => titleMapping[section.title.toLowerCase().replace(/ /g, '_')]);

    mappedSections.sort((a, b) => {
      const indexA = order.indexOf(a.title.toLowerCase().replace(/ /g, '_'));
      const indexB = order.indexOf(b.title.toLowerCase().replace(/ /g, '_'));
      return indexA - indexB;
    });

    return mappedSections;
  }, [sections]);

  if (!processedSections || processedSections.length === 0) return null;

  return (
    <div className="mt-8 animate-fade-in space-y-6">
      {processedSections.map((section, index) => {
        const isLinkSection = Array.isArray(section.content);
        const isMediaSection = section.media && section.media.url;

        return (
          <Card key={index} className="glass-panel border-primary/20 shadow-xl bg-gradient-to-br from-card to-muted/50">
            <CardHeader className="pb-4 bg-muted/50">
              <CardTitle className="text-lg flex items-center font-semibold">
                {getIconForSection(section.title)}
                {section.displayTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLinkSection ? (
                <div className="space-y-2">
                  {(section.content as {link: string, title: string}[]).map((link, i) => (
                    <LinkPreview key={i} url={link.link} description={link.title} />
                  ))}
                </div>
              ) : isMediaSection ? (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
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
              ) : typeof section.content === 'object' && section.content !== null ? (
                <div className="space-y-4 text-sm">
                  {Object.entries(section.content).map(([key, value]) => (
                    <div key={key}>
                      <p className="font-semibold capitalize text-base mb-1">{key.replace(/_/g, ' ')}:</p>
                      <div className="whitespace-pre-wrap text-foreground/90 pl-2 border-l-2 border-primary/20">
                        {typeof value === 'object' && value !== null ? formatObjectToString(value as Record<string, unknown>) : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <blockquote className="p-4 my-4 border-l-4 border-primary bg-muted/50 rounded-r-lg">
                  <div className="whitespace-pre-line text-base leading-relaxed text-foreground/90">
                    {section.content as string}
                  </div>
                </blockquote>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
