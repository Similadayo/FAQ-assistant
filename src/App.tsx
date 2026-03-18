import React, { useState } from 'react';
import { CustomerChatWidget } from './components/CustomerChatWidget';
import { AgentDashboard, type Ticket } from './components/AgentDashboard';

type Message = {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  isEscalated?: boolean;
};

const App: React.FC = () => {
  const [customerMessages, setCustomerMessages] = useState<Message[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);

  const handleTicketEscalated = (ticketId: string, messages: Message[], draft: string, sourceArticle?: any) => {
    const newTicket: Ticket = {
      id: ticketId,
      status: 'open',
      messages: messages,
      draftResponse: draft,
      ragData: sourceArticle // CustomerChatWidget passes ragResult as 4th arg now
    };
    setTickets([...tickets, newTicket]);
  };

  const handleTicketResolved = async (ticketId: string, finalMessage: string) => {
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: 'resolved' } : t));
    
    // Simulate Agent typing delay to make it feel real
    setIsAgentTyping(true);
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
    setIsAgentTyping(false);

    const resolvedMsg: Message = {
      id: Date.now().toString(),
      sender: 'agent',
      text: finalMessage
    };
    
    setCustomerMessages(prev => [...prev, resolvedMsg]);
  };

  return (
    <div className="app-container">
      {/* Left Pane: Customer View */}
      <div className="customer-view">
        <CustomerChatWidget 
          onTicketEscalated={handleTicketEscalated}
          messages={customerMessages}
          setMessages={setCustomerMessages}
          isAgentTyping={isAgentTyping}
        />
      </div>

      {/* Right Pane: Agent Dashboard */}
      <AgentDashboard 
        tickets={tickets} 
        onTicketResolved={handleTicketResolved} 
      />
    </div>
  );
};

export default App;
