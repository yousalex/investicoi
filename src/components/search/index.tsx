import React, { useState, useEffect } from 'react';
import { SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Chat, ChatMessage } from '@/types/chat';
import { generateId, createNewChat as createNewChatUtil } from '@/utils/chatUtils';
import ChatSidebar from './ChatSidebar';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UsageLimitModal } from '@/components/UsageLimitModal';
import { plans } from '@/lib/planData'; // Add this import

export const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { canUseService, profile, isAuthenticated, user } = useAuth();
  
  const getStorageKey = () => {
    if (!isAuthenticated || !user) return 'cortex_chats_guest';
    return `cortex_chats_${user.id}`;
  };

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  
  useEffect(() => {
    const storageKey = getStorageKey();
    const savedChats = localStorage.getItem(storageKey);
    let currentChats: Chat[] = [];

    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);
        currentChats = parsedChats.map((chat: Chat) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg: ChatMessage) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      } catch (e) {
        console.error("Error parsing chats from storage", e);
        currentChats = [];
      }
    }
    
    setChats(currentChats);

    if (currentChats.length > 0) {
      const sortedChats = [...currentChats].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setActiveChat(sortedChats[0]);
    } else {
      const newChat = createNewChatUtil();
      setChats([newChat]);
      setActiveChat(newChat);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem(getStorageKey(), JSON.stringify(chats));
    }
  }, [chats]);

  const [isEditingTitle, setIsEditingTitle] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [usageCount, setUsageCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [modalType, setModalType] = useState<'limit-reached' | 'auth-required'>('auth-required');
  const [isProcessingSearch, setIsProcessingSearch] = useState(false);
  const navigate = useNavigate();

  const isDisabled = isProcessingSearch || (!isAuthenticated && usageCount >= 3);

  const createNewChat = () => {
    const newChat = createNewChatUtil();
    setChats([newChat, ...chats]);
    setActiveChat(newChat);
  };

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);

    if (activeChat && activeChat.id === chatId) {
      const newActiveChat = updatedChats.length > 0 ? updatedChats[0] : null;
      setActiveChat(newActiveChat);
      if (updatedChats.length === 0) {
        const newChat = createNewChatUtil();
        setChats([newChat]);
        setActiveChat(newChat);
      }
    } else if (updatedChats.length === 0) {
        const newChat = createNewChatUtil();
        setChats([newChat]);
        setActiveChat(newChat);
    }
  };

  const startEditingTitle = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setIsEditingTitle(chatId);
      setEditTitle(chat.title);
    }
  };

  const saveTitle = (chatId: string) => {
    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        return { ...chat, title: editTitle || 'Untitled Chat' };
      }
      return chat;
    });
    setChats(updatedChats);
    setIsEditingTitle(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessingSearch || !searchQuery.trim() || !activeChat) return;

    setIsProcessingSearch(true);

    if (!isAuthenticated) {
      if (usageCount >= 3) {
        setModalType('limit-reached');
        setShowLimitModal(true);
        setIsProcessingSearch(false);
        return;
      }
      setUsageCount(prev => prev + 1);
    } else {
      const canUse = await canUseService();
      if (!canUse) {
        setModalType('limit-reached');
        setShowLimitModal(true);
        setIsProcessingSearch(false);
        return;
      }
    }

    const userMessage: ChatMessage = {
      id: generateId(),
      type: 'user',
      content: searchQuery,
      timestamp: new Date()
    };

    const currentChatId = activeChat.id;

    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === currentChatId) {
        const newTitle = chat.messages.length === 0 
          ? (searchQuery.length > 25 ? `${searchQuery.substring(0, 22)}...` : searchQuery)
          : chat.title;
        const updatedChat = {
          ...chat,
          title: newTitle,
          messages: [...chat.messages, userMessage],
          updatedAt: new Date()
        };
        setActiveChat(updatedChat);
        return updatedChat;
      }
      return chat;
    }));

    setSearchQuery('');
    
    setTimeout(async () => {
      try {
        const formData = new FormData();
        formData.append('type', 'text');
        formData.append('text', userMessage.content);
        formData.append('fecha_hora', new Date().toISOString());
        if (user?.id) formData.append('user_id', user.id);
        if (user?.email) formData.append('user_email', user.email);
        if (currentChatId) formData.append('sessionId', currentChatId);

        const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://gzip-ac-shift-earth.trycloudflare.com/webhook-test/enviar';
        const response = await fetch(webhookUrl, {
          method: 'POST',
          body: formData
        });

        let aiMessage: ChatMessage;

        if (response.ok) {
          const data = await response.json();
          let webhookResponse = 'No response received';

          if (data.Message) {
            toast.error(data.Message);
            webhookResponse = data.Message;
          } else {
            let parsedData = data;
            if (typeof data === 'string') {
              try {
                parsedData = JSON.parse(data);
              } catch (e) {
                console.error("Failed to parse stringified JSON from webhook", e);
              }
            }
            if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].output) {
              webhookResponse = parsedData[0].output;
            } else if (parsedData && typeof parsedData.output === 'string') {
              webhookResponse = parsedData.output;
            }
          }
          
          aiMessage = {
            id: generateId(),
            type: 'assistant',
            content: webhookResponse,
            timestamp: new Date()
          };

        } else {
          aiMessage = {
            id: generateId(),
            type: 'assistant',
            content: `Lo siento, el servidor respondió con un error: ${response.status}`,
            timestamp: new Date()
          };
        }
        
        setChats(prevChats => prevChats.map(chat => {
          if (chat.id === currentChatId) {
            const updatedChat = {
              ...chat,
              messages: [...chat.messages, aiMessage],
              updatedAt: new Date()
            };
            setActiveChat(updatedChat);
            return updatedChat;
          }
          return chat;
        }));

      } catch (error) {
        console.error('Error calling webhook:', error);
        const aiMessage: ChatMessage = {
          id: generateId(),
          type: 'assistant',
          content: 'Lo siento, hubo un error al procesar tu consulta.',
          timestamp: new Date()
        };
        setChats(prevChats => prevChats.map(chat => {
          if (chat.id === currentChatId) {
             const updatedChat = {
              ...chat,
              messages: [...chat.messages, aiMessage],
              updatedAt: new Date()
            };
            setActiveChat(updatedChat);
            return updatedChat;
          }
          return chat;
        }));
      } finally {
        setIsProcessingSearch(false);
      }
    }, 800);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="w-full h-[calc(100vh-120px)] flex">
      <ChatSidebar 
        chats={chats}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        createNewChat={createNewChat}
        deleteChat={deleteChat}
        showSidebar={showSidebar}
        isEditingTitle={isEditingTitle}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        startEditingTitle={startEditingTitle}
        saveTitle={saveTitle}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="border-b py-2 px-4 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="mr-2"
          >
            <SearchIcon size={18} />
          </Button>
          <h2 className="font-medium">
            {activeChat?.title || 'Universal Search'}
          </h2>
        </div>
        
        <ChatMessages activeChat={activeChat} />
        
        <ChatInput 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSubmit={handleSubmit}
          isFocused={isFocused}
          setIsFocused={setIsFocused}
          disabled={isDisabled}
        />
      </div>
      
      <UsageLimitModal 
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        type={modalType}
      />
    </div>
  );
};

export default Search;