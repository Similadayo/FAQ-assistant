import React, { useState, useRef, useEffect } from 'react';
import { simulateRagQuery, type RagResult } from '../utils/ragSimulator';

type Message = {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  isEscalated?: boolean;
  ragData?: RagResult;
};

interface CustomerChatWidgetProps {
  onTicketEscalated: (ticketId: string, messages: Message[], draft: string, sourceArticle?: any) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isAgentTyping: boolean;
}

export const CustomerChatWidget: React.FC<CustomerChatWidgetProps> = ({ 
  onTicketEscalated, 
  messages, 
  setMessages, 
  isAgentTyping 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotTyping, isAgentTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: inputValue };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsBotTyping(true);

    try {
      const ragResult = await simulateRagQuery(userMsg.text);
      setIsBotTyping(false);

      if (ragResult.confidence === 'high' && ragResult.finalResponse) {
        setMessages([...newMessages, { 
          id: (Date.now() + 1).toString(), 
          sender: 'agent', 
          text: ragResult.finalResponse,
          ragData: ragResult
        }]);
      } else if (ragResult.confidence === 'medium' && ragResult.finalResponse) {
        setMessages([...newMessages, { 
          id: (Date.now() + 1).toString(), 
          sender: 'agent', 
          text: ragResult.finalResponse,
          ragData: ragResult
        }]);
      } else {
        const escalationMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'system',
          text: 'Escalating to a human agent. Please hold...',
          isEscalated: true,
          ragData: ragResult
        };
        setMessages([...newMessages, escalationMsg]);
        onTicketEscalated(`TK-${Date.now()}`, [...newMessages, escalationMsg], ragResult.suggestedDraft, ragResult);
      }
    } catch (error) {
      setIsBotTyping(false);
      setMessages([...newMessages, { id: 'err', sender: 'system', text: 'Error connecting to support.' }]);
    }
  };

  return (
    <div className="chat-widget glass-panel">
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(30, 41, 59, 0.9)', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Support Assistant</h3>
        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--success-color)' }}>● Online</p>
      </div>
      
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 'auto', marginBottom: 'auto' }}>
            How can we help you today?
          </p>
        )}
        
        {messages.map(msg => (
          <div key={msg.id} className="animate-fade-in" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '85%',
              padding: '10px 14px',
              borderRadius: '12px',
              backgroundColor: msg.sender === 'user' ? 'var(--user-message-bg)' : msg.sender === 'system' ? 'transparent' : 'var(--ai-message-bg)',
              color: msg.sender === 'system' ? 'var(--text-secondary)' : 'var(--text-primary)',
              border: msg.sender === 'agent' ? '1px solid var(--ai-message-border)' : msg.sender === 'system' ? 'none' : '1px solid var(--border-color)',
              fontStyle: msg.sender === 'system' ? 'italic' : 'normal',
              whiteSpace: 'pre-wrap',
              fontSize: '0.95rem'
            }}>
              {msg.text}
              
              {msg.ragData?.matchedArticle && msg.ragData.confidence === 'high' && (
                <div style={{ marginTop: '12px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '3px solid var(--success-color)' }}>
                  <details style={{ cursor: 'pointer' }}>
                    <summary style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--success-color)', outline: 'none' }}>
                      Source: {msg.ragData.matchedArticle.title}
                    </summary>
                    <p style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      "{msg.ragData.matchedArticle.content.substring(0, 80)}..."
                    </p>
                    <a href={msg.ragData.matchedArticle.url} style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none' }}>Read full article →</a>
                  </details>
                </div>
              )}
              
              {msg.ragData?.confidence === 'medium' && (
                 <div style={{ marginTop: '12px', padding: '8px 10px', backgroundColor: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', borderLeft: '3px solid #eab308' }}>
                    <span style={{ fontSize: '0.75rem', color: '#fef08a' }}>⚠️ Medium Confidence Match</span>
                 </div>
              )}

            </div>
            {msg.sender === 'agent' && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '4px' }}>AI Assistant</span>}
          </div>
        ))}
        
        {(isBotTyping || isAgentTyping) && (
          <div className="animate-fade-in" style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: '12px', backgroundColor: 'var(--ai-message-bg)', border: '1px solid var(--ai-message-border)' }}>
            <span style={{ animation: 'fadeIn 1s infinite alternate', color: 'var(--text-secondary)' }}>● ● ●</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question..."
          style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'white', outline: 'none' }}
        />
        <button type="submit" className="btn-primary">Send</button>
      </form>
    </div>
  );
};
