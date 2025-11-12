import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import './Chats.css';

const Chats = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(Date.now() - 60000)
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getAIResponse = async (userInput) => {
    try {
      const response = await fetch('http://localhost:5000/getAIResponse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.reply || 'Failed to get AI response');
      }
      
      const data = await response.json();
      return data.reply || "I'm sorry, I couldn't process your request at the moment.";
    } catch (error) {
      console.error('Error getting AI response:', error);
      return "I'm having trouble connecting to the AI service. Please try again later.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userInput = inputValue; // Store before clearing

    // Add user message
    const userMessage = {
      id: uuidv4(),
      text: userInput,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get AI response from backend
      const aiResponseText = await getAIResponse(userInput);
      
      const aiResponse = {
        id: uuidv4(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error in chat:', error);
      // Add error message to chat
      const errorMessage = {
        id: uuidv4(),
        text: "Sorry, I encountered an error. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format text with markdown-like syntax
  const formatText = (text) => {
    if (!text) return '';
    
    // Convert **bold** to <strong>bold</strong>
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic* to <em>italic</em>
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert `code` to <code>code</code>
    formattedText = formattedText.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Convert newlines to <br />
    formattedText = formattedText.replace(/\n/g, '<br />');
    
    return formattedText;
  };

  return (
    <div className="chats-container">
      <div className="chats-header">
        <h2>AI Assistant</h2>
        <p>Ask me anything about hotels, flights, restaurants, car rentals & more</p>
      </div>

      <div className="chats-messages">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.sender}`}
          >
            <div className="message-avatar">
              {message.sender === 'ai' ? (
                <div className="ai-avatar">
                  <Bot size={20} />
                </div>
              ) : (
                <div className="user-avatar">
                  <User size={20} />
                </div>
              )}
            </div>
            <div className="message-content">
              <div 
                className="message-text" 
                dangerouslySetInnerHTML={{ __html: formatText(message.text) }}
              />
              <div className="message-time">{formatTime(message.timestamp)}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message ai">
            <div className="message-avatar">
              <div className="ai-avatar">
                <Bot size={20} />
              </div>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chats-input-container">
        <div className="chats-input-wrapper">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message here..."
            className="chats-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chats;