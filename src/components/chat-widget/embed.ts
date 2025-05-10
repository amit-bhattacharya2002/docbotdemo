interface WidgetConfig {
  departmentId: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
}

class DocBotWidget {
  private config: WidgetConfig;
  private container: HTMLDivElement | null = null;

  constructor(config: WidgetConfig) {
    this.config = config;
    this.init();
  }

  private init() {
    // Create container for the widget
    this.container = document.createElement('div');
    this.container.id = 'docbot-widget-container';
    document.body.appendChild(this.container);

    // Load the widget script
    const script = document.createElement('script');
    script.src = 'https://your-domain.com/widget.js'; // Replace with your actual domain
    script.async = true;
    script.onload = () => {
      // Initialize the widget after the script is loaded
      this.renderWidget();
    };
    document.head.appendChild(script);
  }

  private renderWidget() {
    if (!this.container) return;

    // Create the widget instance
    const widget = new (window as any).DocBotWidget({
      departmentId: this.config.departmentId,
      theme: this.config.theme,
    });

    // Render the widget in the container
    widget.mount(this.container);
  }
}

// Make the widget available globally
(window as any).DocBotWidget = DocBotWidget;

// Example usage:
/*
<script>
  new DocBotWidget({
    departmentId: 'your-department-id',
    theme: {
      primaryColor: '#0070f3',
      backgroundColor: '#ffffff',
      textColor: '#000000'
    }
  });
</script>
*/ 