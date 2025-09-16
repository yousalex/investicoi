
import React from 'react';
import { Check, Square } from 'lucide-react';
import { CortexItem } from '../cortex-data';
import { LinkPreview } from '@/components/landing/LinkPreview';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface ListViewProps {
  items: CortexItem[];
  selectedItems?: string[];
  onSelectItem?: (id: string) => void;
}

const ListView = ({ 
  items, 
  selectedItems = [], 
  onSelectItem = () => {} 
}: ListViewProps) => {
  const { profile } = useAuth();

  return (
    <div className="flex flex-col gap-3 p-4">
      {items.map((item) => {
        const isSelected = selectedItems.includes(item.id);
        
        return (
          <div 
            key={item.id} 
            className={cn(
              "flex border-b border-border/50 pb-3 relative pl-10",
              isSelected && "bg-primary/5"
            )}
          >
            <div 
              className="absolute left-0 top-1 cursor-pointer"
              onClick={() => onSelectItem(item.id)}
            >
              {isSelected ? (
                <div className="rounded-md bg-primary text-white p-0.5">
                  <Check size={16} />
                </div>
              ) : (
                <div className="rounded-md border border-border p-0.5">
                  <Square size={16} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold">{item.title}</h3>
              <div className="flex items-center gap-3 mt-1 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-xs font-medium">
                  {item.type}
                </span>
                <span className="text-sm text-muted-foreground">{item.source}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{item.pitch}</p>
              <div className="flex flex-wrap gap-1">
                {item.keywords.map((keyword, idx) => (
                  <span 
                    key={idx} 
                    className="px-2 py-0.5 rounded-full bg-secondary/20 text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              {profile?.plan === 'gratuito' ? (
                <div className="text-sm text-muted-foreground">
                  Actualiza tu plan para ver la vista previa. 
                  <Link to="/planes-de-pago" className="text-blue-500 hover:underline">Ver planes</Link>
                </div>
              ) : (
                <LinkPreview url={item.url} description={item.title} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ListView;
