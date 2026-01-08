import React, { useEffect, useState } from 'react';
import { UserAccount } from '../types';
import { Icons } from './Icons';
import { webrtcService } from '../services/webrtc.service';

interface VideoCallOverlayProps {
    otherUser: UserAccount;
    callState: 'CALLING' | 'INCOMING' | 'ACTIVE' | 'IDLE';
    onAccept: () => void;
    onReject: () => void;
    onEnd: () => void;
    localVideoRef: React.RefObject<HTMLVideoElement>;
    remoteVideoRef: React.RefObject<HTMLVideoElement>;
    peerConnection: RTCPeerConnection | null;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    toggleAudio: () => void;
    toggleVideo: () => void;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
}

export const VideoCallOverlay: React.FC<VideoCallOverlayProps> = ({
    otherUser,
    callState,
    onAccept,
    onReject,
    onEnd,
    localVideoRef,
    remoteVideoRef,
    peerConnection,
    localStream,
    remoteStream,
    toggleAudio,
    toggleVideo,
    isAudioEnabled,
    isVideoEnabled
}) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Responsive listener
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Attach streams to video elements when they mount or change
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, callState]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, callState]);

    // Sound Management
    useEffect(() => {
        if (callState === 'INCOMING') {
            webrtcService.playRingSound('ringtone');
        } else if (callState === 'CALLING') {
            webrtcService.playRingSound('ringback');
        } else {
            webrtcService.stopRingSound();
        }

        // Cleanup on unmount or state change
        return () => webrtcService.stopRingSound();
    }, [callState]);

    const handleSwitchCamera = async () => {
        if (peerConnection) {
            await webrtcService.switchCamera(peerConnection);
        }
    };

    if (callState === 'IDLE') return null;

    return (
        <div className="fixed inset-0 z-[100] bg-[#0f172a] flex flex-col items-center justify-center overflow-hidden">
            {/* Background Blur Effect (using User Avatar) */}
            <div className="absolute inset-0 opacity-20 blur-3xl scale-110 pointer-events-none">
                {otherUser.avatarUrl ? (
                    <img src={otherUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-black"></div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 w-full h-full">

                {/* ACTIVE STATE: FULL SCREEN VIDEO */}
                {callState === 'ACTIVE' && (
                    <div className="absolute inset-0 w-full h-full bg-black">
                        {/* Remote Video (Full Screen) */}
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            // Add mirror if using front camera? Remote usually not mirrored.
                            className="w-full h-full object-cover"
                        />

                        {/* Video Off Placeholder for Remote */}
                        {/* We can detect if remote track is muted? Complex. */}

                        {/* Local Video (Floating PiP) */}
                        <div className="absolute top-4 right-4 w-32 h-48 md:w-48 md:h-36 bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20 transition-all hover:scale-105 z-20">
                            {isVideoEnabled ? (
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover mirror"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-white/50">
                                    <Icons.VideoOff size={24} />
                                </div>
                            )}

                            {/* Camera Switch (Mobile Friendly) inside PiP */}
                            <button
                                onClick={handleSwitchCamera}
                                className="absolute bottom-2 right-2 p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-white/20"
                            >
                                <Icons.Camera size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* INCOMING / CALLING STATE: CENTERED USER CARD */}
                {(callState === 'INCOMING' || callState === 'CALLING') && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in zoom-in duration-300 z-10">
                        {/* Avatar Ring */}
                        <div className="relative">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/10 shadow-2xl overflow-hidden relative z-10">
                                {otherUser.avatarUrl ? (
                                    <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-4xl font-black text-white">
                                        {otherUser.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            {/* Pulse Animation */}
                            <div className="absolute inset-0 -m-4 bg-emerald-500/20 rounded-full animate-ping"></div>
                            <div className="absolute inset-0 -m-8 bg-emerald-500/10 rounded-full animate-pulse delay-75"></div>
                        </div>

                        {/* Name & Status */}
                        <div className="space-y-2">
                            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">{otherUser.name}</h2>
                            <p className="text-emerald-400 font-bold uppercase tracking-widest text-sm animate-pulse">
                                {callState === 'INCOMING' ? 'Incoming Video Call...' : 'Ringing...'}
                            </p>
                        </div>
                    </div>
                )}

                {/* CONTROLS BAR (Bottom - Always on top) */}
                <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 w-full flex items-center justify-center gap-8 md:gap-12 bg-gradient-to-t from-black/90 to-transparent z-50">

                    {/* REJECT / END BUTTON */}
                    <button
                        onClick={callState === 'ACTIVE' ? onEnd : onReject}
                        className="group flex flex-col items-center gap-2"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 transition-all active:scale-95 group-hover:scale-110">
                            <Icons.VideoOff size={32} />
                        </div>
                        <span className="text-xs font-bold text-white/80 uppercase tracking-widest">{callState === 'ACTIVE' ? 'End' : 'Decline'}</span>
                    </button>

                    {/* ACCEPT BUTTON (Only for Incoming) */}
                    {callState === 'INCOMING' && (
                        <button
                            onClick={onAccept}
                            className="group flex flex-col items-center gap-2"
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all active:scale-95 group-hover:scale-110 relative">
                                <div className="absolute inset-0 rounded-full border-2 border-emerald-400 opacity-0 group-hover:opacity-100 animate-ping"></div>
                                <Icons.Video size={32} />
                            </div>
                            <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Accept</span>
                        </button>
                    )}

                    {/* MUTE / CAMERA TOGGLES (Only Active) */}
                    {callState === 'ACTIVE' && (
                        <>
                            {/* Mic Toggle */}
                            <button
                                onClick={toggleAudio}
                                className={`w-12 h-12 rounded-full backdrop-blur flex items-center justify-center transition-all ${isAudioEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-black'}`}
                            >
                                {isAudioEnabled ? <Icons.Mic size={20} /> : <Icons.MicOff size={20} />}
                            </button>

                            {/* Video Toggle */}
                            <button
                                onClick={toggleVideo}
                                className={`w-12 h-12 rounded-full backdrop-blur flex items-center justify-center transition-all md:hidden ${isVideoEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-black'}`}
                            >
                                {isVideoEnabled ? <Icons.Video size={20} /> : <Icons.VideoOff size={20} />}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
