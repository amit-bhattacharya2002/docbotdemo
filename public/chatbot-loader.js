(function() {
  try {
    console.log('Initializing chatbot loader...');
    
    // Configuration
    const config = {
      chatbotUrl: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000'  // Local development
        : 'https://your-chatbot-domain.com', // Production
      position: 'bottom-right', // or 'bottom-left', 'top-right', 'top-left'
      theme: 'light', // or 'dark'
      universityDomain: 'test-university.edu', // Use a proper university domain for testing
      departmentPath: new URLSearchParams(window.location.search).get('department') || null,
      isDevelopment: window.location.hostname === 'localhost'
    };

    console.log('Chatbot configuration:', config);

    // Create container for the chatbot
    const container = document.createElement('div');
    container.id = 'docbot-container';
    container.style.position = 'fixed';
    container.style.zIndex = '9999';
    
    // Position the container
    switch(config.position) {
      case 'bottom-right':
        container.style.bottom = '20px';
        container.style.right = '20px';
        break;
      case 'bottom-left':
        container.style.bottom = '20px';
        container.style.left = '20px';
        break;
      case 'top-right':
        container.style.top = '20px';
        container.style.right = '20px';
        break;
      case 'top-left':
        container.style.top = '20px';
        container.style.left = '20px';
        break;
    }

    // Create iframe
    const iframe = document.createElement('iframe');
    const iframeUrl = `${config.chatbotUrl}/embed?university=${encodeURIComponent(config.universityDomain)}&department=${encodeURIComponent(config.departmentPath || '')}`;
    console.log('Loading chatbot from:', iframeUrl);
    
    iframe.src = iframeUrl;
    iframe.style.border = 'none';
    iframe.style.borderRadius = '10px';
    iframe.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    iframe.style.width = '350px';
    iframe.style.height = '500px';
    iframe.style.backgroundColor = config.theme === 'dark' ? '#1a1a1a' : '#ffffff';

    // Add iframe to container
    container.appendChild(iframe);
    document.body.appendChild(container);

    // Handle messages from the iframe
    window.addEventListener('message', (event) => {
      if (event.origin === config.chatbotUrl) {
        console.log('Message from chatbot:', event.data);
      }
    });

    // Add development mode indicator
    if (config.isDevelopment) {
      const devIndicator = document.createElement('div');
      devIndicator.style.position = 'fixed';
      devIndicator.style.top = '0';
      devIndicator.style.right = '0';
      devIndicator.style.background = '#ff4444';
      devIndicator.style.color = 'white';
      devIndicator.style.padding = '5px 10px';
      devIndicator.style.fontSize = '12px';
      devIndicator.style.zIndex = '10000';
      devIndicator.textContent = 'Development Mode';
      document.body.appendChild(devIndicator);
    }

    console.log('Chatbot loader initialized successfully');
  } catch (error) {
    console.error('Error initializing chatbot:', error);
    // Try to show error in the page
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '20px';
    errorDiv.style.right = '20px';
    errorDiv.style.background = '#ff4444';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '10px';
    errorDiv.style.borderRadius = '5px';
    errorDiv.style.zIndex = '10000';
    errorDiv.textContent = 'Error loading chatbot: ' + error.message;
    document.body.appendChild(errorDiv);
  }
})(); 