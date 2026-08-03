'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatThread, ChatMessage, User } from '@/lib/types';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Send, Lock, Globe, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { sendMessage, resolveThread, deleteThread, markThreadAsRead } from '@/lib/actions/chat';
import { useRouter } from 'next/navigation';
import { getPusherClient } from '@/lib/pusher-client';

/**
 * ChatThreadView Component
 * 
 * Renders the actual chat interface for a Q&A thread. Includes real-time polling 
 * for new messages, read receipts, scrolling to bottom, and admin controls 
 * (resolving and deleting threads).
 * 
 * @param {ChatThread & { messages: ChatMessage[] }} thread - The thread object populated with messages.
 * @param {User} currentUser - The currently authenticated user viewing the thread.
 */
export function ChatThreadView({ 
  thread, 
  currentUser 
}: { 
  thread: ChatThread & { messages: ChatMessage[] };
  currentUser: User;
}) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>(thread.messages || []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setRealtimeMessages((prev) => {
      const merged = new Map();
      prev.forEach(m => merged.set(m.id, m));
      (thread.messages || []).forEach(m => merged.set(m.id, m));
      
      // Sort chronologically
      return Array.from(merged.values()).sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
  }, [thread.messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [realtimeMessages.length]); // scroll when message count changes

  useEffect(() => {
    if (thread.unreadCount && thread.unreadCount > 0) {
      markThreadAsRead(thread.id).then(() => {
        router.refresh();
      });
    } else {
      markThreadAsRead(thread.id);
    }

    // Initialize Pusher for real-time messages on a secure private channel
    const pusher = getPusherClient();
    const channelName = `private-chat-thread-${thread.id}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('new-message', (newMessage: ChatMessage) => {
      setRealtimeMessages((prev) => {
        if (prev.some(m => m.id === newMessage.id)) return prev;
        
        if (newMessage.senderId === currentUser.id) {
          const optimisticIndex = prev.findIndex(m => String(m.id).startsWith('temp-') && m.content === newMessage.content);
          if (optimisticIndex !== -1) {
            const next = [...prev];
            next[optimisticIndex] = newMessage;
            return next;
          }
        }

        return [...prev, newMessage];
      });
      
      router.refresh();
      
      // Mark as read instantly if we are actively viewing
      if (newMessage.senderId !== currentUser.id) {
        markThreadAsRead(thread.id);
      }
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [thread.id, router, thread.unreadCount, currentUser.id]);

  const handleSend = async () => {
    if (!content.trim() || isSending) return;
    
    const optimisticMessage: any = {
      id: `temp-${Date.now()}`,
      threadId: thread.id,
      senderId: currentUser.id,
      content: content.trim(),
      isCodeSnippet: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      sender: currentUser,
    };
    
    setRealtimeMessages((prev) => [...prev, optimisticMessage]);
    const messageContent = content.trim();
    setContent('');
    setIsSending(true);

    try {
      await sendMessage(thread.id, messageContent, false);
      setRealtimeMessages((prev) => prev.filter(m => m.id !== optimisticMessage.id));
      setContent('');
    } catch (error) {
      console.error("Failed to send message:", error);
      setRealtimeMessages((prev) => prev.filter(m => m.id !== optimisticMessage.id));
      setContent(messageContent);
    } finally {
      setIsSending(false);
    }
  };
  const otherParticipant = thread.participants.find(p => p.id !== currentUser.id);
  const isAdmin = currentUser.role === 'ADMIN';

  const handleResolve = async () => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    try {
      await resolveThread(thread.id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsActionLoading(true);
    try {
      await deleteThread(thread.id);
      router.push(isAdmin ? '/admin/qna' : '/qna');
    } catch (error) {
      console.error('Failed to delete thread:', error);
    } finally {
      setIsActionLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden animate-page-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-[var(--border-subtle)] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {thread.type === 'PRIVATE' ? (
              <Lock className="w-4 h-4 text-[var(--status-warning)]" />
            ) : (
              <Globe className="w-4 h-4 text-[var(--status-info)]" />
            )}
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              {thread.type === 'PRIVATE' && otherParticipant ? otherParticipant.name : thread.title}
            </h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {thread.type === 'PRIVATE' ? 'Private message with TA' : 'Public forum thread'}
            {thread.isResolved && ' • Resolved'}
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-2">
            {!thread.isResolved && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleResolve}
                disabled={isActionLoading}
              >
                Mark Resolved
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[var(--status-urgent)] hover:bg-[var(--status-urgent-bg)] hover:text-[var(--status-urgent)]"
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={isActionLoading}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {realtimeMessages.map((msg) => {
          const isMe = msg.sender.id === currentUser.id;
          return (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>

              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-xs font-medium text-[var(--text-primary)] flex items-center gap-1">
                    {msg.sender.name}
                    {msg.sender.role === 'ADMIN' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--status-info-bg)] text-[var(--status-info)] border border-[var(--status-info)]">TA</span>
                    )}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div 
                  className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.sender.role === 'ADMIN'
                      ? `bg-[var(--status-info-bg)] border border-[var(--status-info)] text-[var(--text-primary)] shadow-[0_0_10px_var(--status-info-bg)] ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`
                      : isMe 
                        ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)] rounded-tr-sm' 
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      {thread.isResolved && !isAdmin ? (
        <div className="p-4 bg-[var(--bg-tertiary)]/50 border-t border-[var(--border-subtle)] text-center">
          <p className="text-sm text-[var(--text-secondary)]">This thread has been marked as resolved by a TA.</p>
        </div>
      ) : (
        <div className="p-4 bg-[var(--bg-tertiary)]/50 border-t border-[var(--border-subtle)] flex items-end gap-2">
          <Textarea 
            placeholder="Type a message... (Shift+Enter for new line)" 
            className="flex-1 bg-[var(--bg-secondary)] min-h-[44px] max-h-32 resize-none py-3" 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isSending}
            rows={1}
          />
          <Button variant="primary" className="px-3 h-[44px]" onClick={handleSend} disabled={!content.trim() || isSending}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}

      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Delete Thread"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-[var(--status-urgent)] bg-[var(--status-urgent-bg)] p-3 rounded-lg">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">This action cannot be undone.</p>
          </div>
          <p className="text-[var(--text-secondary)] text-sm">
            Are you sure you want to completely delete the thread <span className="font-semibold text-[var(--text-primary)]">&quot;{thread.title}&quot;</span>? All messages inside this thread will be permanently erased.
          </p>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleDelete}
              disabled={isActionLoading}
              className="bg-[var(--status-urgent)] text-white hover:bg-[var(--status-urgent)]/90"
            >
              {isActionLoading ? 'Deleting...' : 'Delete Thread'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
