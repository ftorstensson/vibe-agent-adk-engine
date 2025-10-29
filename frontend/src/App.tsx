/*
 * Vibe Coder Frontend - App.tsx
 * Version: 3.0 (The ADK Bedrock Connection)
 * Last Updated: 2025-10-28
 *
 * This version connects the frontend to the live, ADK-based AI Services Engine.
 * - Targets the definitive '/run' endpoint.
 * - Simplifies the request body to the ADK standard { "input": "..." }.
 * - Adapts the health check to a known-good endpoint.
 * - Simplifies the response parsing for the '/run' stream format.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ChatMessagesView } from "@/components/ChatMessagesView";

// NOTE: All interfaces and complex types from the previous version are preserved for future reference.
type DisplayData = string | null;
interface MessageWithAgent {
  type: "human" | "ai";
  content: string;
  id: string;
  agent?: string;
  finalReportWithCitations?: boolean;
}
interface ProcessedEvent {
  title: string;
  data: any;
}

export default function App() {
  const [messages, setMessages] = useState<MessageWithAgent[]>([]);
  const [displayData, setDisplayData] = useState<DisplayData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messageEvents, setMessageEvents] = useState<Map<string, ProcessedEvent[]>>(new Map());
  const [websiteCount, setWebsiteCount] = useState<number>(0);
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [isCheckingBackend, setIsCheckingBackend] = useState(true);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // --- GROUND TRUTH ---
  const API_BASE_URL = "https://vibe-agent-adk-engine-534939227554.australia-southeast1.run.app";

  const checkBackendHealth = async (): Promise<boolean> => {
    try {
      // FIX: The /docs endpoint returns a 500. Ping the root URL instead.
      // A 404 response from the root proves the service is up and running.
      const response = await fetch(API_BASE_URL);
      return response.status === 404;
    } catch (error) {
      console.log("Backend not ready yet:", error);
      return false;
    }
  };
  
  const handleSubmit = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    const userMessageId = Date.now().toString();
    const aiMessageId = Date.now().toString() + "_ai";

    const newMessages: MessageWithAgent[] = [
      ...messages,
      { type: "human", content: query, id: userMessageId },
      { type: "ai", content: "", id: aiMessageId, agent: 'Thinking...' },
    ];
    setMessages(newMessages);

    try {
      // FIX: Target the correct /run endpoint
      const response = await fetch(`${API_BASE_URL}/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // FIX: Simplify the request body to what the default ADK server expects.
        body: JSON.stringify({
          input: query,
        }),
      });

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullResponse = "";
      
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        
        // FIX: Simplify parsing for the /run endpoint's stream format.
        // The /run endpoint streams JSON objects, each with an "output" key.
        const jsonChunks = chunk.split('\n').filter(line => line.trim().startsWith('{'));
        
        for (const jsonChunk of jsonChunks) {
          try {
            const parsed = JSON.parse(jsonChunk);
            if (parsed.output) {
              fullResponse += parsed.output;
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === aiMessageId
                    ? { ...msg, content: fullResponse, agent: parsed.author || 'Agent' }
                    : msg
                )
              );
              setDisplayData(fullResponse);
            }
          } catch (e) {
            // Ignore parsing errors for incomplete JSON chunks
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = `Sorry, there was an error processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId ? { ...msg, content: errorMessage, agent: 'Error' } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [messages, API_BASE_URL]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    const checkBackend = async () => {
      setIsCheckingBackend(true);
      const maxAttempts = 60; // 2 minutes with 2-second intervals
      for (let attempts = 0; attempts < maxAttempts; attempts++) {
        if (await checkBackendHealth()) {
          setIsBackendReady(true);
          setIsCheckingBackend(false);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      setIsCheckingBackend(false);
      console.error("Backend failed to start within 2 minutes");
    };
    checkBackend();
  }, []);

  const handleCancel = useCallback(() => {
    setMessages([]);
    setDisplayData(null);
    setMessageEvents(new Map());
    setWebsiteCount(0);
    window.location.reload();
  }, []);

  const BackendLoadingScreen = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Waiting for backend to be ready...</h1>
        <p>This may take a moment on first startup.</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-neutral-800 text-neutral-100 font-sans antialiased">
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <div className={`flex-1 overflow-y-auto ${(messages.length === 0 || isCheckingBackend) ? "flex" : ""}`}>
          {isCheckingBackend ? (
            <BackendLoadingScreen />
          ) : !isBackendReady ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-red-400">Backend Unavailable</h2>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <WelcomeScreen
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              onCancel={handleCancel}
            />
          ) : (
            <ChatMessagesView
              messages={messages}
              isLoading={isLoading}
              scrollAreaRef={scrollAreaRef}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              displayData={displayData}
              messageEvents={messageEvents}
              websiteCount={websiteCount}
            />
          )}
        </div>
      </main>
    </div>
  );
}