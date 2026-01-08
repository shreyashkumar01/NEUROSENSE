import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, UserAccount, UserRole } from '../types';
import { dataService } from '../services/supabase.service';
import { supabase } from '../lib/supabase';
import { Icons } from './Icons';
import { useCall } from './CallContext';

interface ChatSystemProps {
    currentUser: UserAccount;
    otherUser: UserAccount;
    onClose?: () => void;
    darkMode: boolean;
}

const ChatSystem: React.FC<ChatSystemProps> = ({ currentUser, otherUser, onClose, darkMode }) => {
    const { startCall, callState } = useCall();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const blockPollRef = useRef<boolean>(false);
    const blockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const stickyEditsRef = useRef<Record<string, string>>({}); // Tracks unconfirmed local edits

    const fetchMessages = async () => {
        try {
            const data = await dataService.getMessages(currentUser.id, otherUser.id);

            // Mark as read if there are unread messages from the other user
            const hasUnread = data.some(m => m.receiverId === currentUser.id && !m.isRead);
            if (hasUnread) {
                dataService.markAllAsRead(currentUser.id, otherUser.id).catch(console.error);
            }

            // State Reconciliation: Sync local "sticky" edits with server confirmation.
            const syncedData = data.map(m => {
                const stickyContent = stickyEditsRef.current[m.id];
                if (stickyContent) {
                    if (m.content === stickyContent) {
                        delete stickyEditsRef.current[m.id];
                        return m;
                    } else {
                        return { ...m, content: stickyContent };
                    }
                }
                return m;
            });

            if (!blockPollRef.current) {
                setMessages(syncedData);
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);

        // --- Real-time Presence Implementation ---
        const channel = supabase.channel('presence-chat', {
            config: {
                presence: {
                    key: currentUser.id,
                },
            }
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const online = Object.keys(state).includes(otherUser.id);
                setIsOnline(online);
            })
            .on('presence', { event: 'join' }, ({ key }) => {
                if (key === otherUser.id) setIsOnline(true);
            })
            .on('presence', { event: 'leave' }, ({ key }) => {
                if (key === otherUser.id) setIsOnline(false);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        online_at: new Date().toISOString(),
                        user_id: currentUser.id
                    });
                }
            });

        return () => {
            clearInterval(interval);
            channel.unsubscribe();
        };
    }, [currentUser.id, otherUser.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const content = newMessage.trim();
        setNewMessage('');

        try {
            if (editingId) {
                blockPollRef.current = true;
                if (blockTimeoutRef.current) clearTimeout(blockTimeoutRef.current);
                blockTimeoutRef.current = setTimeout(() => { blockPollRef.current = false; }, 5000);

                const oldMessages = [...messages];
                setMessages(prev => prev.map(m => m.id === editingId ? { ...m, content } : m));
                setEditingId(null);

                try {
                    stickyEditsRef.current[editingId] = content;
                    const updatedMsg = await dataService.editMessage(editingId, content);
                    setMessages(prev => prev.map(m => m.id === editingId ? updatedMsg : m));

                    if (updatedMsg.content === content) {
                        delete stickyEditsRef.current[editingId];
                    }
                } catch (err: any) {
                    delete stickyEditsRef.current[editingId];
                    setMessages(oldMessages);
                    console.error('Edit failed:', err);
                    alert('Failed to save edit. Please try again or check your connection.');
                }
            } else {
                await dataService.sendMessage(currentUser.id, otherUser.id, content);
                fetchMessages();
            }
        } catch (err) {
            console.error('Failed to process message:', err);
        }
    };

    const handleDelete = async (messageId: string) => {
        try {
            blockPollRef.current = true;
            if (blockTimeoutRef.current) clearTimeout(blockTimeoutRef.current);
            blockTimeoutRef.current = setTimeout(() => { blockPollRef.current = false; }, 5000);

            await dataService.deleteMessage(messageId, currentUser.id);
            setMessages(prev => prev.filter(m => m.id !== messageId));
        } catch (err) {
            console.error('Failed to delete message:', err);
        }
    };

    const startEdit = (message: ChatMessage) => {
        setEditingId(message.id);
        setNewMessage(message.content);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setNewMessage('');
    };

    const isDoctor = currentUser.role === UserRole.DOCTOR;
    const accentColor = isDoctor ? '#10b981' : '#48c1cf';

    const renderMessageContent = (msg: ChatMessage) => {
        if (msg.content.startsWith('🎥')) {
            const isMissed = msg.content.includes('Missed') || msg.content.includes('Declined') || msg.content.includes('Busy');
            const displayText = msg.content.replace('🎥', '').trim();

            return (
                <div className="flex items-center gap-3 py-1 px-1">
                    <div className={`p-2.5 rounded-full flex items-center justify-center ${isMissed ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                        {isMissed ? <Icons.VideoOff size={18} /> : <Icons.Video size={18} />}
                    </div>
                    <div className="flex flex-col">
                        <span className={`font-bold text-sm ${isMissed ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'}`}>
                            {displayText}
                        </span>
                        {!isMissed && (
                            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Click to call back
                            </span>
                        )}
                    </div>
                </div>
            );
        }
        return (
            <span>
                {msg.content}
                {msg.isEdited && <span className="text-[9px] opacity-60 ml-1 font-normal italic">(edited)</span>}
            </span>
        );
    };

    return (
        <div className={`flex flex-col h-full rounded-[2.5rem] border-2 shadow-2xl overflow-hidden transition-all duration-300 ${darkMode ? 'bg-[#050505] border-white/10' : 'bg-white border-slate-100'}`}>
            {/* Chat Header */}
            <div className={`p-6 border-b flex items-center justify-between ${darkMode ? 'border-white/5 bg-white/5' : 'border-slate-50 bg-slate-50'}`}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg relative overflow-hidden"
                        style={{ backgroundColor: isDoctor ? '#48c1cf' : '#10b981' }}>
                        {otherUser.avatarUrl ? (
                            <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-full h-full object-cover" />
                        ) : (
                            otherUser.name.charAt(0)
                        )}
                        {isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#050505] rounded-full"></div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-black text-lg tracking-tight leading-none text-[#1a365d] dark:text-white">{otherUser.name}</h3>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
                            {otherUser.role === UserRole.DOCTOR ? 'Verified Physician' : 'Clinical Patient'}
                        </p>
                    </div>
                    {/* Video Call Button - Uses Global Context */}
                    {callState === 'IDLE' && (
                        <button
                            onClick={() => startCall(otherUser)}
                            className="p-3 rounded-xl transition-all active:scale-95 hover:bg-emerald-500/10 text-emerald-500 ml-2"
                            title="Start Video Call"
                        >
                            <Icons.Video size={20} />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchMessages()}
                        className={`p-3 rounded-xl transition-all active:scale-95 ${loading ? 'animate-spin text-[#48c1cf]' : 'text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                        title="Sync Messages"
                    >
                        <Icons.Stats size={18} />
                    </button>
                    {onClose && (
                        <button onClick={onClose} className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-400">
                            <Icons.Back size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-10">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center text-slate-300 mb-4">
                            <Icons.Mic size={32} />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">
                            Start a secure conversation.<br />Clinical data is encrypted.
                        </p>
                    </div>
                ) : (
                    messages.map((m, idx) => {
                        const isMe = m.senderId === currentUser.id;
                        const timeDiff = new Date().getTime() - new Date(m.timestamp).getTime();
                        const canModify = isMe && timeDiff < 5 * 60 * 1000;
                        const isCallLog = m.content.startsWith('🎥');

                        // Chronological Dates
                        const mDate = new Date(m.timestamp);
                        const prevM = idx > 0 ? messages[idx - 1] : null;
                        const showDateSeparator = !prevM ||
                            new Date(prevM.timestamp).toLocaleDateString() !== mDate.toLocaleDateString();

                        const getDateLabel = (date: Date) => {
                            const today = new Date();
                            const yesterday = new Date();
                            yesterday.setDate(today.getDate() - 1);

                            if (date.toLocaleDateString() === today.toLocaleDateString()) return 'Today';
                            if (date.toLocaleDateString() === yesterday.toLocaleDateString()) return 'Yesterday';
                            return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
                        };

                        return (
                            <React.Fragment key={m.id}>
                                {showDateSeparator && (
                                    <div className="flex justify-center my-6 relative z-0"> {/* Removed sticky */}
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border ${darkMode
                                            ? 'bg-white/5 border-white/10 text-slate-400'
                                            : 'bg-slate-100 border-slate-200 text-slate-500 shadow-inner'
                                            }`}>
                                            {getDateLabel(mDate)}
                                        </span>
                                    </div>
                                )}
                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group animate-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`flex items-center gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`p-4 rounded-3xl text-sm font-medium shadow-md relative ${isMe
                                            ? `bg-[${accentColor}] text-white rounded-br-none shadow-[${accentColor}]/20`
                                            : `${darkMode ? 'bg-white/10 text-white' : 'bg-slate-100 text-[#1a365d]'} rounded-bl-none`
                                            } ${isCallLog ? 'w-full max-w-xs' : ''}`}
                                            style={isMe && !isCallLog ? { backgroundColor: accentColor } : {}}>

                                            {renderMessageContent(m)}

                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span className={`text-[8px] font-bold uppercase tracking-tighter opacity-50 ${isMe ? 'text-white' : 'text-slate-400'}`}>
                                                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isMe && (
                                                    <div className="flex items-center">
                                                        {m.isRead ? (
                                                            <Icons.Verified size={12} className="text-white" />
                                                        ) : (
                                                            <Icons.Check size={12} className="opacity-50" /> // Assuming Check icon exists or fallback
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {canModify && !editingId && !isCallLog && (
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEdit(m)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 dark:text-white transition-colors" title="Edit">
                                                    <Icons.Edit size={12} />
                                                </button>
                                                <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors" title="Delete">
                                                    <Icons.VideoOff size={12} /> {/* Reusing icon or Delete if available */}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className={`p-6 border-t ${darkMode ? 'border-white/5' : 'border-slate-50'}`}>
                {editingId && (
                    <div className="flex items-center justify-between mb-3 px-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#48c1cf]">Editing Message</span>
                        <button onClick={cancelEdit} className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:underline">Cancel</button>
                    </div>
                )}
                <form onSubmit={handleSend} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={editingId ? "Update your message..." : "Type your message..."}
                        className={`flex-grow px-6 py-4 rounded-2xl text-sm font-medium transition-all outline-none border-2 ${darkMode
                            ? 'bg-white/5 border-white/5 focus:border-[#48c1cf]/30 text-white'
                            : 'bg-slate-50 border-slate-50 focus:border-[#48c1cf]/30 text-[#1a365d]'
                            }`}
                    />
                    <button
                        type="submit"
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all shimmer"
                        style={{ backgroundColor: accentColor }}
                    >
                        {editingId ? (
                            <Icons.Edit size={20} />
                        ) : (
                            <Icons.Activity size={24} className="rotate-45" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatSystem;
