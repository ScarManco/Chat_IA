import { useEffect } from 'react';

declare global {
  interface Window {
    watsonAssistantChatOptions: {
      integrationID: string;
      region: string;
      serviceInstanceID: string;
      onLoad: (instance: any) => Promise<void>;
      clientVersion?: string;
    };
  }
}

export function WatsonAssistant() {
  useEffect(() => {
    window.watsonAssistantChatOptions = {
      integrationID: "84e9fcc1-4cd6-4d60-8d6c-7df3d3bf968e",
      region: "au-syd",
      serviceInstanceID: "31d297b1-c700-41ab-b0dd-a18433799990",
      onLoad: async (instance) => { await instance.render(); }
    };

    const script = document.createElement('script');
    script.src = "https://web-chat.global.assistant.watson.appdomain.cloud/versions/latest/WatsonAssistantChatEntry.js";
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}