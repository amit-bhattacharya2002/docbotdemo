'use client';

import React, { useState } from 'react';
import { ChatWidget } from '@/components/chat-widget/ChatWidget';
import { NamespaceProvider } from '@/app/context/NamespaceContext';

export default function TestWidget() {
  const [selectedNamespace, setSelectedNamespace] = useState('681cc249dd2589b5d542e9fe');

  return (
    <NamespaceProvider>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">SFU DocBot Widget Test Page</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Test the Widget</h2>
            <p className="text-gray-600 mb-4">
              This page demonstrates how the SFU DocBot widget will look when embedded in other websites.
              The widget below is fully functional and connected to your local DocBot instance.
            </p>
            
            {/* Namespace Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Namespace
              </label>
              <select
                value={selectedNamespace}
                onChange={(e) => setSelectedNamespace(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="681cc249dd2589b5d542e9fe">Alumni Relations - FAQ</option>
                <option value="681cc249dd2589b5d542e9ff">Alumni Relations - General</option>
                <option value="681cc249dd2589b5d542e9fg">Finance - FAQ</option>
                <option value="681cc249dd2589b5d542e9fh">Finance - General</option>
              </select>
            </div>
            
            {/* Example of how to embed the widget */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-medium mb-2">Embed Code:</h3>
              <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto">
                {`<script>
  window.DocBotConfig = {
    departmentId: 'your-department-id',
    namespace: '${selectedNamespace}', // Specify which namespace to query
    theme: {
      primaryColor: '#CC0633',
      backgroundColor: '#13294B',
      textColor: '#000000'
    }
  };
</script>
<script src="http://localhost:3000/widget.js" async></script>`}
              </pre>
            </div>
          </div>

          {/* Test the widget */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Widget Preview</h2>
            <div className="h-[600px] relative">
              <ChatWidget 
                departmentId="681cc249dd2589b5d542e9fe"
                namespace={selectedNamespace}
                theme={{
                  primaryColor: '#CC0633',
                  backgroundColor: '#13294B',
                  textColor: '#000000'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </NamespaceProvider>
  );
} 