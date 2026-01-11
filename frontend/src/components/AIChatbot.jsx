import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: '¡Hola! Soy tu asistente de taller. ¿En qué puedo ayudarte hoy?' }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Auto-scroll to bottom
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const newMessage = { id: Date.now(), sender: 'user', text: inputText };
        setMessages(prev => [...prev, newMessage]);
        setInputText('');
        setLoading(true);

        try {
            const response = await api.post('/ai/ask', { question: newMessage.text });
            const aiMessage = { 
                id: Date.now() + 1, 
                sender: 'ai', 
                text: response.data.response 
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error asking AI", error);
            const errorMessage = { 
                id: Date.now() + 1, 
                sender: 'ai', 
                text: 'Lo siento, tuve un problema al procesar tu pregunta. Intenta de nuevo.' 
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-80 sm:w-96 h-96 flex flex-col mb-4 transition-all duration-300 ease-in-out">
                    {/* Header */}
                    <div className="bg-blue-600 rounded-t-lg p-4 flex justify-between items-center">
                        <h3 className="text-white font-bold flex items-center">
                            <span className="mr-2">🤖</span> Asistente IA
                        </h3>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-blue-100 hover:text-white focus:outline-none"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col space-y-3">
                        {messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`max-w-[80%] rounded-lg p-3 text-sm ${
                                    msg.sender === 'user' 
                                        ? 'bg-blue-500 text-white self-end rounded-br-none' 
                                        : 'bg-white text-gray-800 border border-gray-200 self-start rounded-bl-none shadow-sm'
                                }`}
                            >
                                {msg.text}
                            </div>
                        ))}
                        {loading && (
                            <div className="self-start bg-gray-100 rounded-lg p-2 text-xs text-gray-500 italic">
                                Escribiendo...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer Input */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t bg-white rounded-b-lg flex">
                        <input
                            type="text"
                            className="flex-1 border rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Escribe tu pregunta..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 disabled:bg-blue-300 transition"
                            disabled={loading || !inputText.trim()}
                        >
                            Envia
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button (FAB) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
                {isOpen ? (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default AIChatbot;
