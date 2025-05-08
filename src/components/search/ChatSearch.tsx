'use client';

import { useState, useRef, useEffect, ReactElement, forwardRef, useImperativeHandle, Fragment } from 'react';
import { useNamespace } from '@/app/context/NamespaceContext';

interface Message {
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatSearchProps {
  selectedQuery?: string | null;
  onQueryUsed?: () => void;
}

export interface ChatSearchRef {
  scrollToMessage: (content: string) => void;
  setQuery: (query: string) => void;
}

// Function to detect and format hyperlinks
const formatMessageWithLinks = (text: string) => {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Find all URLs in the text
  const urls = text.match(urlRegex) || [];
  
  // If no URLs found, return the text as is
  if (urls.length === 0) {
    return text;
  }
  
  // Create an array of text and link elements
  const elements: (string | ReactElement)[] = [];
  let lastIndex = 0;
  
  // Process each URL
  urls.forEach((url, index) => {
    const urlIndex = text.indexOf(url, lastIndex);
    
    // Add text before the URL
    if (urlIndex > lastIndex) {
      const textBefore = text.slice(lastIndex, urlIndex).trim();
      if (textBefore) {
        elements.push(textBefore);
      }
    }
    
    // Add the URL as a link
    elements.push(
      <a
        key={`url-${index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline break-all block my-2"
      >
        View Link
      </a>
    );
    
    lastIndex = urlIndex + url.length;
  });
  
  // Add any remaining text
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex).trim();
    if (remainingText) {
      elements.push(remainingText);
    }
  }
  
  // Join elements with proper spacing
  return elements.map((element, index) => (
    <Fragment key={index}>
      {element}
      {index < elements.length - 1 && <br />}
    </Fragment>
  ));
};

const ChatSearch = forwardRef<ChatSearchRef, ChatSearchProps>((props, ref) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => {
    // Initialize messages from localStorage
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
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { namespace, setNamespace } = useNamespace();

  useImperativeHandle(ref, () => ({
    scrollToMessage: (content: string) => {
      const messageElement = messageRefs.current.get(content);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight the message briefly
        messageElement.classList.add('bg-yellow-100');
        setTimeout(() => {
          messageElement.classList.remove('bg-yellow-100');
        }, 2000);
      }
    },
    setQuery: (newQuery: string) => {
      setQuery(newQuery);
    }
  }));

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem('chatHistory', JSON.stringify(messages));
      } catch (error) {
        console.error('Error saving messages:', error);
      }
    }
  }, [messages]);

  // Set a default namespace if none is set
  useEffect(() => {
    if (!namespace) {
      setNamespace('681cc249dd2589b5d542e9fe');
    }
  }, [namespace, setNamespace]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle selected query from history
  useEffect(() => {
    if (props.selectedQuery) {
      setQuery(props.selectedQuery);
      handleSubmit(new Event('submit') as any);
    }
  }, [props.selectedQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user message
    const userMessage: Message = {
      type: 'user',
      content: query,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query, 
          namespace: namespace || 'default',
          useRecencyBias: true,
          resultCount: 5
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      
      // Add bot message
      const botMessage: Message = {
        type: 'bot',
        content: data.answer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      // Add error message
      const errorMessage: Message = {
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#ffeaea] shadow-lg">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-lg m-4 mr-0">
        {messages.length > 0 && (
          <div className="flex justify-end p-2">
            <button
              onClick={clearChatHistory}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear Chat History
            </button>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            ref={(el) => {
              if (el && message.type === 'user') {
                messageRefs.current.set(message.content, el);
              }
            }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} transition-colors duration-300`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-[#982727] text-white rounded-br-none cursor-pointer hover:bg-[#7a1e1e]'
                  : 'bg-[#ffffff] text-gray-800 rounded-bl-none shadow'
              }`}
              onClick={() => {
                if (message.type === 'user') {
                  setQuery(message.content);
                }
              }}
            >
              <div className="text-sm whitespace-pre-wrap">
                {message.type === 'bot' 
                  ? formatMessageWithLinks(message.content)
                  : message.content
                }
              </div>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 rounded-lg rounded-bl-none p-3 shadow">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4  bg-[#13294B] ">
        <div className="flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border  rounded-full focus:outline-none bg-white text-slate-900"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className={`px-4 py-2 rounded-full ${
              loading || !query.trim()
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-[#982727] hover:bg-red-600 text-white'
            } transition-colors duration-200`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
});

ChatSearch.displayName = 'ChatSearch';

export default ChatSearch; 