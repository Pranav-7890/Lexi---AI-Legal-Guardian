import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { AnalysisResult } from '../types';
import { getChatResponse } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface Props {
  analysisResult: AnalysisResult;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const LegalChatbot: React.FC<Props> = ({ analysisResult }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I've analyzed your document. I can help clarify specific clauses, explain risks, or answer questions about the summary. What would you like to know?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref for the scrolling container, not an element at the bottom
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Robust scroll to bottom that doesn't affect the parent window
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Format history for the API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await getChatResponse(history, userMessage, analysisResult);
      
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'model', text: error.message || "I'm sorry, I'm having trouble connecting to the server right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[600px] mt-6 animate-fade-in relative transition-colors duration-300">
      {/* Header */}
      <div className="bg-slate-900 dark:bg-slate-950 p-4 text-white flex items-center justify-between shrink-0 z-10 shadow-md transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-lg shadow-inner">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide">Lexi AI Guardian</h3>
            <div className="flex items-center gap-1.5 opacity-80">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                <span className="text-[10px] uppercase font-semibold text-emerald-100">Gemini 3.0 Pro Active</span>
            </div>
          </div>
        </div>
        <div className="bg-white/10 p-1.5 rounded-full backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-indigo-200" />
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent transition-colors duration-300"
      >
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[90%] rounded-2xl p-4 text-sm shadow-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-50 border border-slate-200 dark:border-slate-600 rounded-tl-none'
              }`}
            >
              {msg.role === 'user' ? (
                 <p>{msg.text}</p>
              ) : (
                <div className="markdown-content">
                    <ReactMarkdown
                        components={{
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-2 space-y-1" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal ml-5 mb-2 space-y-1" {...props} />,
                            li: ({node, ...props}) => <li className="pl-1" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-slate-900 dark:text-slate-50" {...props} />,
                            h1: ({node, ...props}) => <h3 className="font-bold text-base mb-2 mt-2" {...props} />,
                            h2: ({node, ...props}) => <h3 className="font-bold text-base mb-2 mt-2" {...props} />,
                            h3: ({node, ...props}) => <h3 className="font-bold text-sm mb-1 mt-2" {...props} />,
                        }}
                    >
                        {msg.text}
                    </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-700 dark:text-slate-50">Lexi AI Guardian</span>
                 <span className="text-[10px] text-slate-400 dark:text-slate-400">Lexi AI - Analyzing Context...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-300">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask a legal question about this document..."
            className="flex-grow bg-slate-100 dark:bg-slate-700 border border-transparent focus:border-blue-300 dark:focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none pr-12 text-slate-800 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1.5 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-center mt-2">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                AI can make mistakes. Always consult a qualified attorney.
            </p>
        </div>
      </div>
    </div>
  );
};

export default LegalChatbot;