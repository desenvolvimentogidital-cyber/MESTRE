
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Send, User as UserIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Message, OS } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface ChatInternoProps {
  os: OS;
}

export function ChatInterno({ os }: ChatInternoProps) {
  const { user, updateOS } = useStore();
  const [newMessage, setNewMessage] = useState('');

  const messages = os.internalMessages || [];

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const message: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      senderName: user.name,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    updateOS({
      ...os,
      internalMessages: [...messages, message],
    });
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[400px] bg-secondary/10 rounded-xl border border-primary/5 overflow-hidden">
      <div className="p-3 bg-secondary/20 border-b border-primary/5 flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Send className="w-4 h-4 text-primary" />
          Chat Interno (Supervisor)
        </h3>
        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Apenas Equipe</span>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground/30 flex flex-col items-center gap-2">
              <Send className="w-8 h-8 opacity-10" />
              <p className="text-xs">Nenhuma mensagem técnica ainda.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[80%] gap-1",
                  msg.senderId === user?.id ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
                  <span>{msg.senderName}</span>
                  <span>•</span>
                  <span>{format(new Date(msg.timestamp), 'HH:mm')}</span>
                </div>
                <div
                  className={cn(
                    "px-3 py-2 rounded-2xl text-sm",
                    msg.senderId === user?.id
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-card border border-primary/10 rounded-tl-none"
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-3 bg-card border-t border-primary/5 flex gap-2">
        <Input
          placeholder="Tire sua dúvida com o supervisor..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 bg-secondary/10 h-9 text-sm"
        />
        <Button size="sm" onClick={handleSendMessage} className="bg-primary text-primary-foreground h-9 px-3">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
