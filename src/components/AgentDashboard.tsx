import React, { useState } from 'react';

export interface Ticket {
  id: string;
  status: 'open' | 'resolved';
  messages: any[];
  draftResponse: string;
  ragData?: any;
}

interface AgentDashboardProps {
  tickets: Ticket[];
  onTicketResolved: (ticketId: string, finalMessage: string) => void;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ tickets, onTicketResolved }) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [editedDraft, setEditedDraft] = useState('');

  const activeTickets = tickets.filter(t => t.status === 'open');
  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  // When selecting a ticket, pre-fill its drafted response if it hasn't been modified in local state yet
  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicketId(ticket.id);
    setEditedDraft(ticket.draftResponse);
  };

  const handleSend = () => {
    if (selectedTicketId) {
      onTicketResolved(selectedTicketId, editedDraft);
      setSelectedTicketId(null);
      setEditedDraft('');
    }
  };

  return (
    <div className="agent-dashboard">
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Agent Workspace</h2>
        <span style={{ background: 'var(--accent-color)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
          {activeTickets.length} Active {activeTickets.length === 1 ? 'Escalation' : 'Escalations'}
        </span>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: '300px', borderRight: '1px solid var(--border-color)', overflowY: 'auto' }}>
          {activeTickets.length === 0 ? (
            <p style={{ padding: '24px', color: 'var(--text-secondary)', textAlign: 'center' }}>No active escalations. Inbox Zero! 🎉</p>
          ) : (
            activeTickets.map(t => (
              <div 
                key={t.id} 
                className="glass-panel"
                onClick={() => handleSelectTicket(t)}
                style={{
                  margin: '12px', 
                  padding: '16px', 
                  cursor: 'pointer',
                  border: selectedTicketId === t.id ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                  backgroundColor: selectedTicketId === t.id ? 'var(--bg-panel-hover)' : 'var(--bg-panel)'
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: 'var(--accent-color)' }}>{t.id}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.messages[t.messages.length - 2]?.text || 'New message'}
                </p>
                
                {/* Embedded Tags */}
                {t.ragData?.tags && t.ragData.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {t.ragData.tags.map((tag: string) => (
                      <span key={tag} style={{ padding: '2px 6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: t.ragData?.confidence === 'medium' ? '#eab308' : 'var(--danger-color)' }}></div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {t.ragData?.confidence === 'medium' ? 'Review Recommended' : 'Requires Review'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Main Workspace */}
        {selectedTicket ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-dark)' }}>
            
            {/* Context Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-panel)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: '0 0 16px 0' }}>Ticket Overview ({selectedTicket.id})</h3>
                {selectedTicket.ragData?.confidence && (
                   <span style={{ 
                     padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
                     backgroundColor: selectedTicket.ragData.confidence === 'low' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                     color: selectedTicket.ragData.confidence === 'low' ? 'var(--danger-color)' : '#fef08a',
                     border: `1px solid ${selectedTicket.ragData.confidence === 'low' ? 'var(--danger-color)' : '#eab308'}`
                   }}>
                     {selectedTicket.ragData.confidence} Confidence
                   </span>
                )}
              </div>

              {selectedTicket.ragData?.matchedArticle ? (
                <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', borderLeft: '4px solid var(--accent-color)' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>AI Matched Context:</p>
                  <p style={{ margin: 0, fontWeight: 500 }}>{selectedTicket.ragData.matchedArticle.title}</p>
                </div>
              ) : (
                <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--danger-color)' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>AI Context Assessment:</p>
                  <p style={{ margin: 0, fontWeight: 500 }}>{selectedTicket.ragData?.escalationReason || 'No exact match or customer expressed frustration.'}</p>
                </div>
              )}
            </div>

            {/* Chat History & Composer combined */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div>
                <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Interaction History</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedTicket.messages.filter(m => !m.isEscalated).map(msg => (
                    <div key={msg.id} style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      backgroundColor: msg.sender === 'user' ? 'var(--user-message-bg)' : 'var(--ai-message-bg)',
                      border: '1px solid var(--border-color)'
                    }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        {msg.sender === 'user' ? 'Customer' : 'AI Assistant'}
                      </span>
                      {msg.text}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 16px 0', color: 'var(--accent-color)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  AI Suggested Response
                </h4>
                <textarea
                  value={editedDraft}
                  onChange={(e) => setEditedDraft(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '150px',
                    padding: '16px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-dark)',
                    border: '1px solid var(--border-color)',
                    color: 'white',
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                    resize: 'vertical',
                    outline: 'none',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  
                  {/* Mock Draft Controls */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => alert("Mock: Drafting new response via LLM...")}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                      Regenerate
                    </button>
                    <button style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => alert("Mock: Opening KB Search modal...")}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                      Insert Link
                    </button>
                    <button style={{ padding: '8px 12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', color: 'var(--danger-color)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => alert("Mock: Escalate to Level 2 Engineering")}>
                       ⚠ Escalate Further
                    </button>
                  </div>

                  <button onClick={handleSend} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Approve & Send
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </button>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginBottom: '16px', opacity: 0.5 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <p>Select a ticket from the sidebar to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};
