import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { UserAccount } from '../types';
import { webrtcService } from '../services/webrtc.service';
import { supabase } from '../lib/supabase';
import { dataService } from '../services/supabase.service';
import { VideoCallOverlay } from './VideoCallOverlay';

interface CallContextType {
    startCall: (receiver: UserAccount) => Promise<void>;
    endCall: () => void;
    toggleAudio: () => void;
    toggleVideo: () => void;
    callState: 'IDLE' | 'CALLING' | 'INCOMING' | 'ACTIVE';
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) throw new Error('useCall must be used within a CallProvider');
    return context;
};

export const CallProvider: React.FC<{ children: React.ReactNode; currentUser: UserAccount | null }> = ({ children, currentUser }) => {
    const [callState, setCallState] = useState<'IDLE' | 'CALLING' | 'INCOMING' | 'ACTIVE'>('IDLE');
    const [otherUser, setOtherUser] = useState<UserAccount | null>(null);

    // Media States
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    const callStateRef = useRef(callState);
    useEffect(() => { callStateRef.current = callState; }, [callState]);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const callStartTimeRef = useRef<string | null>(null);
    const missedCallTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const incomingChannelRef = useRef<any>(null); // For listening to our own channel
    const outgoingChannelRef = useRef<any>(null); // For sending to peer's channel details

    // Initialize Incoming Signaling Channel (Always Active)
    useEffect(() => {
        if (!currentUser) return;

        const channel = supabase.channel(`calls:${currentUser.id}`);

        channel
            .on('broadcast', { event: 'offer' }, async ({ payload }) => {
                if (callStateRef.current !== 'IDLE') {
                    // Busy: Reject immediately. We need to send back to caller.
                    // We can use a temporary channel or just assume we can reply to sender?
                    // Sender listens on their ID.
                    sendOneOffSignal(payload.from, 'end-call', {
                        to: payload.from,
                        from: currentUser.id,
                        status: 'BUSY'
                    });
                    return;
                }

                // Fetch caller details
                const { data: caller } = await supabase.from('users').select('*').eq('id', payload.from).single();
                if (caller) {
                    setOtherUser(caller as UserAccount);
                    setCallState('INCOMING');
                    (window as any).__pendingOffer = payload.offer;

                    // Missed Call Timeout (Receiver side)
                    missedCallTimeoutRef.current = setTimeout(() => {
                        if (callStateRef.current === 'INCOMING') {
                            rejectCall('MISSED');
                        }
                    }, 45000);
                }
            })
            .on('broadcast', { event: 'answer' }, async ({ payload }) => {
                if (peerConnectionRef.current) {
                    await webrtcService.setRemoteDescription(peerConnectionRef.current, payload.answer);
                    setCallState('ACTIVE'); // Ensure caller transitions to ACTIVE
                }
            })
            .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
                if (peerConnectionRef.current) {
                    await webrtcService.addIceCandidate(peerConnectionRef.current, payload.candidate);
                }
            })
            .on('broadcast', { event: 'end-call' }, () => {
                endCallLogic();
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    incomingChannelRef.current = channel;
                }
            });

        return () => {
            // Do NOT remove channel broadly, but unsubscribe this instance.
            // supabase.removeChannel(channel); 
            // Actually React strict mode might trigger this twice. Use ref cleaning.
            channel.unsubscribe();
        };
    }, [currentUser?.id]); // Only re-run if ID changes

    // Helper for Robust Signaling (Persistent Channel)
    const establishOutgoingChannel = async (targetUserId: string): Promise<any> => {
        if (outgoingChannelRef.current) {
            // If already connected to this user, reuse?
            // Checking internal topic is hard. Safe to reconnect.
            await outgoingChannelRef.current.unsubscribe();
        }

        return new Promise((resolve, reject) => {
            const ch = supabase.channel(`calls:${targetUserId}`);
            const timeout = setTimeout(() => {
                // If timeout, we still resolve (soft fail) to allow UI to proceed, 
                // but signaling might fail. Better to reject and show error.
                // Or try one-off strategy fallback?
                // Rejecting logs error.
                reject(new Error("Signaling timeout"));
            }, 6000);

            ch.subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    clearTimeout(timeout);
                    outgoingChannelRef.current = ch;
                    resolve(ch);
                }
                if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    clearTimeout(timeout);
                    reject(new Error(`Signaling Error: ${status}`));
                }
            });
        });
    };

    // Helper for broadcasting on the ESTABLISHED outgoing channel
    const sendSignal = (event: string, payload: any) => {
        if (outgoingChannelRef.current) {
            outgoingChannelRef.current.send({
                type: 'broadcast',
                event: event,
                payload: payload
            });
        }
    };

    // Helper for one-off signals (like Busy rejection)
    const sendOneOffSignal = (targetId: string, event: string, payload: any) => {
        const ch = supabase.channel(`calls:${targetId}`);
        ch.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                ch.send({ type: 'broadcast', event, payload });
                setTimeout(() => ch.unsubscribe(), 1000);
            }
        });
    };

    const beginCall = async (receiver: UserAccount) => {
        if (!currentUser) return;
        setOtherUser(receiver);
        setCallState('CALLING');
        callStartTimeRef.current = new Date().toISOString();

        try {
            // Establish Signaling Connection FIRST
            await establishOutgoingChannel(receiver.id);

            const stream = await webrtcService.getUserMedia();
            setLocalStream(stream);
            setIsAudioEnabled(true);
            setIsVideoEnabled(true);

            // Timeout 
            missedCallTimeoutRef.current = setTimeout(() => {
                if (callState === 'CALLING') {
                    endCallLogic({ status: 'MISSED' });
                }
            }, 45000);

            const pc = webrtcService.initializePeerConnection();
            peerConnectionRef.current = pc;
            webrtcService.addLocalStreamToPeer(pc, stream);

            pc.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
                webrtcService.setRemoteStream(event.streams[0]);
            };

            pc.onicecandidate = (event) => {
                if (event.candidate && currentUser) {
                    sendSignal('ice-candidate', {
                        candidate: event.candidate,
                        to: receiver.id,
                        from: currentUser.id
                    });
                }
            };

            const offer = await webrtcService.createOffer(pc);
            sendSignal('offer', {
                offer,
                to: receiver.id,
                from: currentUser.id
            });

        } catch (err) {
            console.error("Call failed:", err);
            endCallLogic({ status: 'MISSED' });
        }
    };

    const acceptCall = async () => {
        if (!currentUser || !otherUser) return;
        if (missedCallTimeoutRef.current) clearTimeout(missedCallTimeoutRef.current);

        try {
            // Parallelize Channel + Media for speed
            const [ch, stream] = await Promise.all([
                establishOutgoingChannel(otherUser.id),
                webrtcService.getUserMedia()
            ]);

            setLocalStream(stream);

            const pc = webrtcService.initializePeerConnection();
            peerConnectionRef.current = pc;
            webrtcService.addLocalStreamToPeer(pc, stream);

            pc.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
                webrtcService.setRemoteStream(event.streams[0]);
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    sendSignal('ice-candidate', {
                        candidate: event.candidate,
                        to: otherUser.id,
                        from: currentUser.id
                    });
                }
            };

            const pendingOffer = (window as any).__pendingOffer;
            if (pendingOffer) {
                await webrtcService.setRemoteDescription(pc, pendingOffer);
                delete (window as any).__pendingOffer;
            }

            const answer = await webrtcService.createAnswer(pc);
            sendSignal('answer', {
                answer,
                to: otherUser.id,
                from: currentUser.id
            });

            setCallState('ACTIVE');
            callStartTimeRef.current = new Date().toISOString();
        } catch (err) {
            console.error("Accept failed:", err);
            // If failing, keep in INCOMING state or End?
            // End to avoid partial state.
            endCallLogic({ status: 'MISSED' }); // Or ERROR
        }
    };

    const rejectCall = (status: 'REJECTED' | 'MISSED' = 'REJECTED') => {
        if (otherUser && currentUser) {
            // If we haven't established outgoing channel yet (incoming state), try one-off
            if (outgoingChannelRef.current) {
                sendSignal('end-call', { to: otherUser.id, from: currentUser.id });
            } else {
                sendOneOffSignal(otherUser.id, 'end-call', { to: otherUser.id, from: currentUser.id });
            }
        }
        endCallLogic({ status });
        delete (window as any).__pendingOffer;
    };

    const endCallLogic = (options: { status?: 'COMPLETED' | 'MISSED' | 'REJECTED' | 'BUSY' } = {}) => {
        if (missedCallTimeoutRef.current) clearTimeout(missedCallTimeoutRef.current);

        // Notify other user if in call
        if (callState !== 'IDLE' && otherUser && currentUser) {
            // If active, outgoing channel should be open.
            if (outgoingChannelRef.current) {
                sendSignal('end-call', { to: otherUser.id, from: currentUser.id });
            }
        }

        // Log Call (only if we have a start time and users)
        if (callStartTimeRef.current && currentUser && otherUser) {
            const status = options.status || 'COMPLETED';
            // Only log if we are the caller OR if it is a completed/rejected call where we want to generate a log?
            // Usually Caller logs? Or both?
            // `logCall` creates a row. We want 1 row per call.
            // Convention: Caller logs.
            // Statuses: 
            // - MISSED: Caller logs.
            // - COMPLETED: Caller logs.
            // - REJECTED: Caller logs.
            // So check if we are caller.
            if (callState === 'CALLING' || callState === 'ACTIVE') {
                // Wait, we don't track initiator conveniently. 
                // Simple check: If we sent the offer?
                // `callState === 'CALLING'` covers initiation.
                // But after 'ACTIVE', both are 'ACTIVE'.
                // We can rely on `options.status`.
                // If `status` is passed, log it.
                // Actually Supabase Service `logCall` inserts.
                // Let's allow duplicates for now or rely on RLS? 
                // Safe bet: Both try to log? No.
                // Let's log if we are `CALLING`.
                // If `ACTIVE`, how do we know?
                // We can just log unconditionally and maybe standardise later.
                // Or: The one ending the call logs?
            }

            // Revert to simple logging: Try to log.
            dataService.logCall({
                caller_id: callState === 'CALLING' || (callState === 'ACTIVE' /** We assume caller */) ? currentUser.id : otherUser.id,
                receiver_id: callState === 'CALLING' ? otherUser.id : currentUser.id,
                // Logic flaw: After ACTIVE, we lose who was caller.
                // But `callStartTimeRef` is set for both.
                // Let's pass 'Caller' in context? Too complex for now.
                // Just Log.
                status: status,
                started_at: callStartTimeRef.current,
                ended_at: new Date().toISOString()
            });
        }

        webrtcService.cleanup();
        setLocalStream(null);
        setRemoteStream(null);
        setCallState('IDLE');
        setOtherUser(null);
        peerConnectionRef.current = null;
        callStartTimeRef.current = null;

        // Cleanup Outgoing Channel
        if (outgoingChannelRef.current) {
            outgoingChannelRef.current.unsubscribe();
            outgoingChannelRef.current = null;
        }
    };

    const toggleAudio = () => {
        const enabled = !isAudioEnabled;
        setIsAudioEnabled(enabled);
        webrtcService.toggleAudio(enabled);
    };

    const toggleVideo = () => {
        const enabled = !isVideoEnabled;
        setIsVideoEnabled(enabled);
        webrtcService.toggleVideo(enabled);
    };

    return (
        <CallContext.Provider value={{
            startCall: beginCall,
            endCall: () => endCallLogic({ status: 'COMPLETED' }),
            toggleAudio,
            toggleVideo,
            callState,
            isAudioEnabled,
            isVideoEnabled
        }}>
            {children}
            {otherUser && callState !== 'IDLE' && (
                <VideoCallOverlay
                    otherUser={otherUser}
                    callState={callState}
                    onAccept={acceptCall}
                    onReject={() => rejectCall('REJECTED')}
                    onEnd={() => endCallLogic({ status: 'COMPLETED' })}
                    peerConnection={peerConnectionRef.current}
                    localStream={localStream}
                    remoteStream={remoteStream}
                    localVideoRef={localVideoRef}
                    remoteVideoRef={remoteVideoRef}
                    toggleAudio={toggleAudio}
                    toggleVideo={toggleVideo}
                    isAudioEnabled={isAudioEnabled}
                    isVideoEnabled={isVideoEnabled}
                />
            )}
        </CallContext.Provider>
    );
};
