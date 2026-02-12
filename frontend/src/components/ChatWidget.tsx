import { useState } from 'react';
import { X, Send, MessageCircle, Sparkles, Bot } from 'lucide-react';
import type { User } from '../App';

interface ChatWidgetProps {
  user: User;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'other';
  text: string;
  time: string;
}

export function ChatWidget({ user, onClose }: ChatWidgetProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'other', text: 'Bienvenue dans la ligne directe de la Maison. Tu cherches quel type de produit ?', time: '10:30' },
    { id: '2', sender: 'user', text: 'Je veux un objet rare pour une soiree horreur.', time: '10:32' },
    { id: '3', sender: 'other', text: 'Parfait, je te partage les meilleurs contenus en vitrine.', time: '10:33' },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: message,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage('');
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-end p-3 sm:p-5">
      <div className="pointer-events-auto w-full overflow-hidden rounded-3xl border border-cyan-300/35 bg-[#040816]/95 shadow-[0_0_70px_rgba(45,212,191,0.22)] sm:w-[470px]">
        <header className="border-b border-cyan-300/20 bg-gradient-to-r from-cyan-500/15 to-emerald-500/15 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-cyan-300/35 bg-cyan-300/10 p-2">
                <MessageCircle className="h-4 w-4 text-cyan-100" />
              </div>
              <div>
                <h3 className="text-sm text-[#effbff]">Canal des gardiens</h3>
                <p className="text-xs text-cyan-100/75">Session ouverte: {user.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-xl border border-cyan-300/35 bg-cyan-300/10 p-1.5 text-cyan-100 hover:bg-cyan-300/20">
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex items-center gap-2 border-b border-cyan-300/15 bg-[#091126] px-4 py-2 text-xs text-cyan-100/80">
          <Sparkles className="h-3.5 w-3.5" />
          Modere automatiquement. Reste dans le cadre de la plateforme.
        </div>

        <div className="h-[360px] space-y-3 overflow-y-auto bg-[#060c1e] px-4 py-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${
                  msg.sender === 'user'
                    ? 'rounded-br-md bg-gradient-to-r from-cyan-500 to-emerald-500 text-white'
                    : 'rounded-bl-md border border-cyan-300/20 bg-[#0c1730] text-cyan-50'
                }`}
              >
                {msg.sender === 'other' && (
                  <p className="mb-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-cyan-200/70">
                    <Bot className="h-3 w-3" /> Support
                  </p>
                )}
                <p>{msg.text}</p>
                <p className={`mt-1 text-[10px] ${msg.sender === 'user' ? 'text-cyan-100/85' : 'text-cyan-200/60'}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="border-t border-cyan-300/20 bg-[#040816] p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ecris un message..."
              className="flex-1 rounded-xl border border-cyan-300/25 bg-[#0a1226] px-3 py-2 text-sm text-cyan-50 placeholder:text-cyan-200/40 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
            />
            <button type="submit" className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-3 text-white">
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-[10px] text-cyan-100/55">Ne partage pas d'information personnelle dans le chat.</p>
        </form>
      </div>
    </div>
  );
}
