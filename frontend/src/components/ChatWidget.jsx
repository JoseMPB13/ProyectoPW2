import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: '¡Hola! 👋', isBot: true },
        { id: 2, text: 'Mi nombre es Nathan. ¿Cómo puedo ayudarte hoy?', isBot: true }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [sessionId, setSessionId] = useState('');

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Simple session ID generator without external deps (fast)
        let storedSession = localStorage.getItem('chatSessionId');
        if (!storedSession) {
            // Generate a random string as session ID
            storedSession = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('chatSessionId', storedSession);
        }
        setSessionId(storedSession);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMessage = { id: Date.now(), text: inputText, isBot: false };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            // UPDATED Webhook URL from user request
            const webhookUrl = 'https://dev-automation.digicert.bo/webhook/83d320cc-8711-46a7-bae4-99aca79f93da/chat';

            // Payload matching n8n chat configuration
            const payload = {
                chatInput: userMessage.text,
                sessionId: sessionId
            };

            const response = await axios.post(webhookUrl, payload);

            // Handle n8n response safely
            let botResponseText = '';

            if (typeof response.data === 'string') {
                botResponseText = response.data;
            } else if (response.data.output) {
                botResponseText = response.data.output;
            } else if (response.data.text) {
                botResponseText = response.data.text;
            } else if (response.data.message) {
                botResponseText = response.data.message;
            } else {
                botResponseText = JSON.stringify(response.data);
            }

            const botMessage = { id: Date.now() + 1, text: botResponseText, isBot: true };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: 'Lo siento, hubo un problema técnico. Intenta de nuevo más tarde.',
                isBot: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // POSITION CHANGED TO BOTTOM-RIGHT (right-6)
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right animate-in fade-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-white">
                            <MessageCircle size={20} />
                            <span className="font-bold">Soporte Nathan</span>
                        </div>
                        <button
                            onClick={toggleChat}
                            className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 h-80 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50 space-y-3 custom-scrollbar">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.isBot
                                            ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-tl-none shadow-sm'
                                            : 'bg-blue-600 text-white rounded-tr-none shadow-md'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-2 text-gray-500">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span className="text-xs">Nathan está escribiendo...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Escribe tu pregunta..."
                            className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all placeholder-gray-400"
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim() || isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={toggleChat}
                className={`p-4 rounded-full shadow-lg transition-transform duration-300 hover:scale-110 flex items-center justify-center relative group
                    ${isOpen
                        ? 'bg-gray-700 text-white rotate-90'
                        : 'bg-blue-600 text-white animate-bounce-slow'
                    }
                `}
                aria-label="Abrir chat de soporte"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}

                {/* Tooltip hint when closed */}
                {!isOpen && (
                    <span className="absolute right-full mr-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
                        ¡Hola! 👋
                    </span>
                )}
            </button>
        </div>
    );
};

export default ChatWidget;
