import { useState } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
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
    {
      id: '1',
      sender: 'other',
      text: 'Bonjour ! Je suis interesse par votre objet.',
      time: '10:30'
    },
    {
      id: '2',
      sender: 'user',
      text: 'Bonjour ! Bien sur, que souhaitez-vous savoir ?',
      time: '10:32'
    },
    {
      id: '3',
      sender: 'other',
      text: "L'objet est-il toujours disponible ?",
      time: '10:33'
    }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: message,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-slate-950 rounded-2xl shadow-xl border border-slate-800 flex flex-col max-h-[600px] z-50">
      <div className="bg-slate-900 text-slate-100 p-4 rounded-t-2xl flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-rose-200" />
          <h3>Messagerie</h3>
        </div>
        <button onClick={onClose} className="text-slate-300 hover:text-rose-200">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-lg p-3 ${msg.sender === 'user' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-100 border border-slate-800'}`}
            >
              <p>{msg.text}</p>
              <p className={`mt-1 ${msg.sender === 'user' ? 'text-rose-100' : 'text-slate-500'}`}>{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Tapez votre message..."
            className="flex-1 px-4 py-2 border border-slate-700 bg-slate-900 text-slate-100 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-rose-600 text-white p-2 rounded-lg hover:bg-rose-500 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="text-slate-500 mt-2 text-xs">Note : Les informations personnelles sont filtrees automatiquement</p>
      </form>
    </div>
  );
}
