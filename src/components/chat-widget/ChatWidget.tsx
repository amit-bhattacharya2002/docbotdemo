import React, { useState, useEffect } from 'react';
import styles from './ChatWidget.module.css';
import { useNamespace } from '@/app/context/NamespaceContext';

interface Message {
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  departmentId: string;
  namespace?: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ 
  departmentId, 
  namespace: initialNamespace,
  theme 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem('chatHistory');
      if (savedMessages) {
        try {
          return JSON.parse(savedMessages).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        } catch (error) {
          console.error('Error parsing saved messages:', error);
          return [];
        }
      }
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { namespace, setNamespace } = useNamespace();

  // Set namespace based on props
  useEffect(() => {
    if (initialNamespace) {
      setNamespace(initialNamespace);
    } else if (departmentId) {
      setNamespace(departmentId);
    }
  }, [departmentId, initialNamespace, setNamespace]);

  // Save messages to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem('chatHistory', JSON.stringify(messages));
      } catch (error) {
        console.error('Error saving messages:', error);
      }
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      type: 'user',
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get the last 5 messages for context
      const recentMessages = messages.slice(-5);
      
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: input, 
          namespace: namespace || initialNamespace || departmentId,
          useRecencyBias: true,
          resultCount: 5,
          conversationHistory: recentMessages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        type: 'bot',
        content: data.answer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
  };

  return (
    <div className={styles.widgetContainer}>
      {!isOpen && (
        <button 
          className={styles.chatButton}
          onClick={() => setIsOpen(true)}
          style={{ backgroundColor: theme?.primaryColor || '#CC0633' }}
        >
          <span>Chat with us</span>
        </button>
      )}
      
      {isOpen && (
        <div className={styles.chatWindow} style={{ backgroundColor: theme?.backgroundColor || '#13294B' }}>
          <div className={styles.chatHeader}>
            <h3>SFU Department Assistant</h3>
            <button 
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>
          
          <div className={styles.messagesContainer}>
            {messages.length > 0 && (
              <div className={styles.clearButton}>
                <button onClick={clearChatHistory}>
                  Clear Chat History
                </button>
              </div>
            )}
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`${styles.message} ${
                  message.type === 'user' ? styles.userMessage : styles.assistantMessage
                }`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className={styles.loading}>
                <div className={styles.loadingDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className={styles.inputForm}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              style={{ color: theme?.textColor || '#000000' }}
            />
            <button 
              type="submit" 
              disabled={isLoading}
              style={{ backgroundColor: theme?.primaryColor || '#CC0633' }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}; 