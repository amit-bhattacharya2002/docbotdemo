'use client';

import React, { useState, useRef, useEffect } from 'react';
import ChatSearch from '@/components/search/ChatSearch';

const Docbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeSection, setActiveSection] = useState<'main' | 'searchHistory' | 'about'>('main');
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const chatSearchRef = useRef<{ scrollToMessage: (content: string) => void; setQuery: (query: string) => void }>(null);

  // Close chat when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (chatWindowRef.current && !chatWindowRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

  const [title, setTitle] = useState('Alumni Relations - FAQ Chatbot');

  // Get query history from localStorage
  const getQueryHistory = () => {
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem('chatHistory');
      if (savedMessages) {
        try {
          const messages = JSON.parse(savedMessages);
          return messages
            .filter((msg: any) => msg.type === 'user')
            .map((msg: any) => msg.content);
        } catch (error) {
          console.error('Error parsing saved messages:', error);
          return [];
        }
      }
    }
    return [];
  };

  const handleQuerySelect = (query: string) => {
    chatSearchRef.current?.scrollToMessage(query);
    chatSearchRef.current?.setQuery(query);
    setShowHistory(false);
  };

  const renderDropdownContent = () => {
    switch (activeSection) {
      case 'main':
        return (
          <>
            <div 
              className="p-2 hover:bg-gray-100 text-gray-800 text-sm cursor-pointer border-b border-gray-200 flex items-center justify-between"
              onClick={() => setActiveSection('searchHistory')}
            >
              <span>Search History</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div 
              className="p-2 hover:bg-gray-100 text-gray-800 text-sm cursor-pointer border-b border-gray-200 flex items-center justify-between"
              onClick={() => setActiveSection('about')}
            >
              <span>About</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </>
        );
      case 'searchHistory':
        return (
          <>
            <div 
              className="p-2 hover:bg-gray-100 text-gray-800 text-sm cursor-pointer border-b border-gray-200 flex items-center"
              onClick={() => setActiveSection('main')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Back</span>
            </div>
            {/* <div className="p-2 text-gray-800 text-sm border-b border-gray-200">
              <p>Search History</p>
            </div> */}
            {getQueryHistory().map((query: string, index: number) => (
              <div
                key={index}
                className="p-2 hover:bg-gray-100 text-gray-800 text-sm cursor-pointer border-b border-gray-200 truncate"
                onClick={() => handleQuerySelect(query)}
              >
                {query}
              </div>
            ))}
          </>
        );
      case 'about':
        return (
          <>
            <div 
              className="p-2 hover:bg-gray-100 text-gray-800 text-sm cursor-pointer border-b border-gray-200 flex items-center"
              onClick={() => setActiveSection('main')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Back</span>
            </div>
            <div className="p-2 text-gray-800 text-sm w-[80%]">
              <h3 className="font-semibold mb-2">About SFU DocBot</h3>
              <p className="mb-2 whitespace-normal">SFU DocBot is an AI-powered chatbot designed to help you find information about SFU.</p>
              <p className="whitespace-normal">Version 1.0.0</p>
            </div>
          </>
        );
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#CC0633] hover:bg-[#a80529] text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className="absolute bottom-16 right-0 w-[450px] h-[700px] bg-[#13294B] rounded-lg shadow-xl overflow-hidden transition-all duration-300 border-2 border-white"
        >
            {/* #CC0633 */}
            {/* #A6192E */}
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-[#A6192E] text-white p-4 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold">{title}</h2>
                <div className="relative w-fit">
                  <button
                    onClick={() => {
                      setShowHistory(!showHistory);
                      setActiveSection('main');
                    }}
                    className="p-1 hover:bg-[#CC0633] rounded-full transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {showHistory && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[450px] bg-white rounded-lg shadow-lg overflow-hidden z-50">
                      <div className="max-h-48 overflow-y-auto">
                        {renderDropdownContent()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowHistory(false);
                  setActiveSection('main');
                }}
                className="text-white hover:text-gray-200"
                aria-label="Close chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-hidden">
              <ChatSearch ref={chatSearchRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Docbot;