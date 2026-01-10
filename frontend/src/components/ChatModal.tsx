import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';

interface Message {
    role: 'user' | 'ai';
    content: string;
}

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    messages: Message[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

export const ChatModal: React.FC<ChatModalProps> = ({
    isOpen,
    onClose,
    messages,
    onSendMessage,
    isLoading,
}) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-background/95 backdrop-blur-xl text-foreground border border-border rounded-xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 relative">

                {/* Background Gradients */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-900/10 dark:bg-purple-900/20 blur-[100px] rounded-full" />
                    <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-blue-900/10 dark:bg-blue-900/20 blur-[100px] rounded-full" />
                    <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] bg-indigo-900/10 dark:bg-indigo-900/20 blur-[100px] rounded-full" />
                </div>

                <div className="relative z-10 flex flex-col h-full">

                    {/* Header */}
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                                <Bot size={18} />
                            </div>
                            <h2 className="font-bold text-lg text-foreground">GenAI Stack Chat</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto bg-transparent flex flex-col">
                        {messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-4 p-6">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-primary">
                                    <Bot size={32} />
                                </div>
                                <p className="font-medium">Start a conversation to test your stack</p>
                            </div>
                        ) : (
                            <div className="flex-col justify-end p-6 space-y-6">
                                {messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        {/* Avatar */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground shrink-0 ${msg.role === 'user' ? 'bg-primary' : 'bg-muted'
                                            }`}>
                                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-foreground" />}
                                        </div>

                                        {/* Bubble */}
                                        <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                                            : 'bg-muted text-foreground border border-border rounded-tl-none shadow-sm'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-foreground shrink-0">
                                            <Bot size={16} />
                                        </div>
                                        <div className="bg-muted border border-border px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex gap-2 items-center">
                                            <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-card border-t border-border shrink-0">
                        <form
                            onSubmit={handleSubmit}
                            className="flex items-center gap-2 border border-border rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm bg-background"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Send a message"
                                className="flex-1 bg-transparent border-none text-sm py-2 text-foreground placeholder:text-muted-foreground outline-none focus:outline-none"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="p-2 bg-transparent text-primary hover:bg-muted rounded-full disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};
