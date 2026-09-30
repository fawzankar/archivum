'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, X, Send, BookOpen, FileText, Search, Bookmark, Smartphone, HelpCircle, ArrowRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  options?: { label: string; action: () => void; link?: string }[];
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: '👋 Hey there! I am the **ARCHIVUM Guide**.\nWhat are you looking for today?',
      options: [
        { label: '📚 Find Notes', link: '/notes', action: () => {} },
        { label: '📄 Find Previous Papers', link: '/previous-papers', action: () => {} },
        { label: '🔎 Search Resources', link: '/search', action: () => {} },
        { label: '🔖 Saved Resources', link: '/saved', action: () => {} },
        { label: '📱 Install App', link: '/about#pwa', action: () => {} },
        { label: '❓ About ARCHIVUM', link: '/about', action: () => {} },
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const botResponse = generateBotResponse(userText);
      setMessages((prev) => [...prev, botResponse]);
    }, 400);
  };

  const generateBotResponse = (text: string): ChatMessage => {
    const q = text.toLowerCase().trim();

    if (q.includes('note') || q.includes('notes') || q.includes('chapter')) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'You can explore all structured Class 9 to 12 chapter notes in our dedicated Notes Library!',
        options: [
          { label: 'Go to Notes Library 📚', link: '/notes', action: () => setIsOpen(false) },
          { label: 'Class 10 Science Notes', link: '/search?class=10&subject=Science&type=Notes', action: () => setIsOpen(false) },
          { label: 'Class 12 Physics Notes', link: '/search?class=12&subject=Physics&type=Notes', action: () => setIsOpen(false) },
        ],
      };
    }

    if (q.includes('paper') || q.includes('pyq') || q.includes('board') || q.includes('preboard') || q.includes('exam') || q.includes('test')) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'Looking for previous year board papers or school exam papers? Check out the Paper Finder!',
        options: [
          { label: 'Open Previous Papers Finder 📄', link: '/previous-papers', action: () => setIsOpen(false) },
          { label: 'JKBOSE Board Papers', link: '/previous-papers?paperType=Board', action: () => setIsOpen(false) },
          { label: 'School Pre-board Papers', link: '/previous-papers?paperType=Pre-board', action: () => setIsOpen(false) },
        ],
      };
    };

    if (q.includes('save') || q.includes('bookmark') || q.includes('saved')) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'Simply tap the 🔖 Bookmark icon on any resource card to save it locally to your device. Access all your saves in "My Saved Resources".',
        options: [
          { label: 'View Saved Resources 🔖', link: '/saved', action: () => setIsOpen(false) },
        ],
      };
    }

    if (q.includes('install') || q.includes('pwa') || q.includes('app') || q.includes('download app')) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'ARCHIVUM is a Progressive Web App (PWA). You can install it on your mobile phone or laptop home screen directly from your browser menu!',
        options: [
          { label: 'Learn how to install 📱', link: '/about#pwa', action: () => setIsOpen(false) },
        ],
      };
    }

    if (q.includes('class') || q.includes('classes') || q.includes('grade')) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'ARCHIVUM supports school students of **Classes 9, 10, 11, and 12**.',
        options: [
          { label: 'Class 9', link: '/search?class=9', action: () => setIsOpen(false) },
          { label: 'Class 10', link: '/search?class=10', action: () => setIsOpen(false) },
          { label: 'Class 11', link: '/search?class=11', action: () => setIsOpen(false) },
          { label: 'Class 12', link: '/search?class=12', action: () => setIsOpen(false) },
        ],
      };
    }

    if (q.includes('jkbose') || q.includes('board') || q.includes('ecosystem')) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'ARCHIVUM is primarily designed around the **JKBOSE (Jammu and Kashmir Board of School Education)** ecosystem.',
        options: [
          { label: 'Browse JKBOSE Resources', link: '/search?board=JKBOSE', action: () => setIsOpen(false) },
        ],
      };
    }

    if (q.includes('account') || q.includes('login') || q.includes('sign up') || q.includes('register')) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'No student accounts required! You can browse, search, download, rate, and save resources freely.',
      };
    }

    return {
      id: Date.now().toString(),
      sender: 'bot',
      text: "I'm the ARCHIVUM Guide, so I can mainly help you navigate the platform.\n\nTry asking me about:\n- Notes\n- Previous Papers\n- Searching\n- Saved resources\n- Installing the app",
      options: [
        { label: '📚 Notes', link: '/notes', action: () => setIsOpen(false) },
        { label: '📄 Papers', link: '/previous-papers', action: () => setIsOpen(false) },
        { label: '🔎 Search', link: '/search', action: () => setIsOpen(false) },
      ],
    };
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(v => !v)}
        aria-label="ARCHIVUM Guide Chatbot"
        className="arch-chat-launcher"
      >
        {isOpen ? <X /> : <MessageSquare />}
      </button>

      {isOpen && (
        <>
          <button className="arch-chat-backdrop" type="button" onClick={() => setIsOpen(false)} aria-label="Close ARCHIVUM Guide" />
          <section className="arch-chat-window" aria-label="ARCHIVUM Guide">
            <header className="arch-chat-head">
              <div className="arch-chat-brand">
                <div className="arch-chat-avatar"><MessageSquare /></div>
                <div>
                  <div className="arch-chat-title">ARCHIVUM Guide</div>
                  <span className="arch-chat-subtitle">Your academic navigator</span>
                </div>
              </div>
              <button className="arch-chat-close" type="button" onClick={() => setIsOpen(false)} aria-label="Close chat">
                <X />
              </button>
            </header>

            <div className="arch-chat-body">
              {messages.map((msg) => (
                <div key={msg.id} className={`arch-chat-msg ${msg.sender}`}>
                  <div className="arch-chat-bubble">{msg.text}</div>
                  {msg.options && msg.options.length > 0 && (
                    <div className="arch-chat-options">
                      {msg.options.map((opt, i) => opt.link ? (
                        <Link key={i} href={opt.link} onClick={() => setIsOpen(false)} className="arch-chat-option">
                          {opt.label}<ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <button key={i} type="button" onClick={opt.action} className="arch-chat-option">{opt.label}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="arch-chat-quick" aria-label="Quick questions">
              <button type="button" onClick={() => handleSend('How do I find notes?')}>Notes</button>
              <button type="button" onClick={() => handleSend('Where are previous papers?')}>Previous papers</button>
              <button type="button" onClick={() => handleSend('Saved resources')}>Saved</button>
              <button type="button" onClick={() => handleSend('How do I search?')}>Search</button>
            </div>

            <form className="arch-chat-form" onSubmit={(e) => { e.preventDefault(); handleSend(input); }}>
              <input
                className="arch-chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about notes, papers or ARCHIVUM..."
                aria-label="Ask ARCHIVUM Guide"
              />
              <button className="arch-chat-send" type="submit" disabled={!input.trim()} aria-label="Send message">
                <Send />
              </button>
            </form>
          </section>
        </>
      )}
    </>
  );

}
