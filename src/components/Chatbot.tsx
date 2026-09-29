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
        text: 'You can explore all structured Class 9–12 chapter notes in our dedicated Notes Library!',
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
        onClick={() => setIsOpen(!isOpen)}
        aria-label="ARCHIVUM Guide Chatbot"
        className="fixed bottom-[96px] right-4 md:bottom-6 md:right-6 z-40 w-12 h-12 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
        style={{ backgroundColor: 'var(--accent)', boxShadow: '0 5px 14px rgba(24,36,42,.08)' }}
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          className="fixed bottom-[160px] right-4 md:bottom-20 md:right-6 z-50 w-[92vw] max-w-sm sm:max-w-md h-[500px] max-h-[75vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-fade"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div
            className="p-4 border-b flex items-center justify-between"
            style={{
              borderColor: 'var(--border-light)',
              backgroundColor: 'var(--surface-raised)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-800">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-none">
                  SJS Guide
                </h3>
                <span className="text-[10px] text-zinc-400">Academic Navigator</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4" style={{ backgroundColor: 'var(--surface)' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm whitespace-pre-wrap leading-relaxed ${
                    msg.sender === 'user'
                      ? 'text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.options && msg.options.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[95%]">
                    {msg.options.map((opt, i) => (
                      opt.link ? (
                        <Link
                          key={i}
                          href={opt.link}
                          onClick={() => setIsOpen(false)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 dark:text-emerald-300 border border-emerald-300/30 transition-all flex items-center gap-1"
                        >
                          {opt.label}
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <button
                          key={i}
                          onClick={opt.action}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 dark:text-emerald-300 border border-emerald-300/30 transition-all"
                        >
                          {opt.label}
                        </button>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-1.5 overflow-x-auto text-xs no-scrollbar">
            <button
              onClick={() => handleSend('How do I find notes?')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shrink-0 hover:border-emerald-500"
            >
              📚 Notes
            </button>
            <button
              onClick={() => handleSend('Where are previous papers?')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shrink-0 hover:border-emerald-500"
            >
              📄 Papers
            </button>
            <button
              onClick={() => handleSend('Saved resources')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shrink-0 hover:border-emerald-500"
            >
              🔖 Saved
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask ARCHIVUM Guide..."
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 rounded-xl hover:opacity-90 disabled:opacity-40 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
