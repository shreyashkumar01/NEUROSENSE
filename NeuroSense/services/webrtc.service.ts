/**
 * WebRTC Service
 * Manages peer connections and media streams for video calling
 */

export class WebRTCService {
    private peerConnection: RTCPeerConnection | null = null;
    private localStream: MediaStream | null = null;
    private remoteStream: MediaStream | null = null;
    private currentFacingMode: 'user' | 'environment' = 'user';
    private audioContext: AudioContext | null = null;
    private oscillator: OscillatorNode | null = null;
    private gainNode: GainNode | null = null;
    private ringInterval: any = null;

    private iceServers: RTCIceServer[] = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ];

    /**
     * Play a ringing sound (Simple synthesized tone)
     * type: 'ringtone' (incoming) or 'ringback' (outgoing)
     */
    playRingSound(type: 'ringtone' | 'ringback'): void {
        this.stopRingSound(); // Ensure no previous sound

        try {
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            if (!AudioContextClass) return;

            this.audioContext = new AudioContextClass();
            const ctx = this.audioContext;

            // Master Volume
            const mainGain = ctx.createGain();
            mainGain.connect(ctx.destination);
            mainGain.gain.value = 0.2;

            const playCycle = () => {
                const t = ctx.currentTime;

                if (type === 'ringback') {
                    // Standard Phone Ringback (Low tone pulse)
                    const osc = ctx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(440, t);
                    osc.frequency.setValueAtTime(480, t); // Dual tone simulation roughly

                    const env = ctx.createGain();
                    env.connect(mainGain);
                    osc.connect(env);

                    osc.start(t);
                    osc.stop(t + 2); // 2 seconds duration

                    // Envelope: Pulse
                    env.gain.setValueAtTime(0, t);
                    env.gain.linearRampToValueAtTime(0.5, t + 0.1);
                    env.gain.setValueAtTime(0.5, t + 1.8);
                    env.gain.linearRampToValueAtTime(0, t + 2);

                } else {
                    // Professional "Modern" Ringtone (Soft Arpeggio)
                    // Frequencies: E5, G#5, B5 (E Major)
                    const notes = [659.25, 830.61, 987.77];

                    notes.forEach((freq, i) => {
                        const osc = ctx.createOscillator();
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(freq, t);

                        const env = ctx.createGain();
                        env.connect(mainGain);
                        osc.connect(env);

                        // Staggered start
                        const start = t + (i * 0.15);
                        osc.start(start);
                        osc.stop(start + 0.6);

                        // Pluck envelope
                        env.gain.setValueAtTime(0, start);
                        env.gain.linearRampToValueAtTime(0.3, start + 0.05);
                        env.gain.exponentialRampToValueAtTime(0.01, start + 0.5);
                    });
                }
            };

            playCycle();
            this.ringInterval = setInterval(() => {
                if (this.audioContext?.state === 'suspended') this.audioContext.resume();
                playCycle();
            }, type === 'ringback' ? 3000 : 2500); // 3s for ringback, 2.5s for ringtone loop

        } catch (e) {
            console.error('AudioContext not supported or failed', e);
        }
    }

    stopRingSound(): void {
        if (this.ringInterval) {
            clearInterval(this.ringInterval);
            this.ringInterval = null;
        }
        if (this.audioContext) {
            this.audioContext.close().catch(() => { });
            this.audioContext = null;
        }
    }

    /**
     * Switch Camera (Front/Back) - Mobile First Feature
     */
    async switchCamera(peerConnection: RTCPeerConnection): Promise<MediaStream> {
        this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';

        if (this.localStream) {
            this.localStream.getVideoTracks().forEach(track => track.stop());
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: this.currentFacingMode },
                audio: true
            });
            this.localStream = stream;

            const videoTrack = stream.getVideoTracks()[0];
            const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
            if (sender) {
                sender.replaceTrack(videoTrack);
            }
            return stream;
        } catch (error) {
            console.error("Camera switch failed:", error);
            // Revert state if failed
            this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
            // Try to recover old stream
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: this.currentFacingMode },
                audio: true
            });
            this.localStream = stream;
            const videoTrack = stream.getVideoTracks()[0];
            const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
            if (sender) sender.replaceTrack(videoTrack);

            return stream;
        }
    }

    toggleAudio(enabled: boolean) {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = enabled;
            });
        }
    }

    toggleVideo(enabled: boolean) {
        if (this.localStream) {
            this.localStream.getVideoTracks().forEach(track => {
                track.enabled = enabled;
            });
        }
    }

    /**
     * Initialize peer connection with ICE servers
     */
    initializePeerConnection(): RTCPeerConnection {
        this.peerConnection = new RTCPeerConnection({
            iceServers: this.iceServers
        });
        return this.peerConnection;
    }

    /**
     * Get user media (camera and microphone)
     */
    async getUserMedia(): Promise<MediaStream> {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            return this.localStream;
        } catch (error) {
            console.error('Failed to get user media:', error);
            throw new Error('Camera/Microphone access denied');
        }
    }

    /**
     * Create WebRTC offer
     */
    async createOffer(peerConnection: RTCPeerConnection): Promise<RTCSessionDescriptionInit> {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        return offer;
    }

    /**
     * Create WebRTC answer
     */
    async createAnswer(peerConnection: RTCPeerConnection): Promise<RTCSessionDescriptionInit> {
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        return answer;
    }

    /**
     * Set remote description
     */
    async setRemoteDescription(peerConnection: RTCPeerConnection, description: RTCSessionDescriptionInit): Promise<void> {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(description));
    }

    /**
     * Add ICE candidate
     */
    async addIceCandidate(peerConnection: RTCPeerConnection, candidate: RTCIceCandidateInit): Promise<void> {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }

    /**
     * Add local stream to peer connection
     */
    addLocalStreamToPeer(peerConnection: RTCPeerConnection, stream: MediaStream): void {
        stream.getTracks().forEach(track => {
            peerConnection.addTrack(track, stream);
        });
    }

    /**
     * Stop all media tracks
     */
    stopMediaTracks(): void {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
    }

    /**
     * Close peer connection
     */
    closePeerConnection(): void {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
    }

    /**
     * Cleanup all resources
     */
    cleanup(): void {
        this.stopMediaTracks();
        this.closePeerConnection();
        this.remoteStream = null;
    }

    getLocalStream(): MediaStream | null {
        return this.localStream;
    }

    getRemoteStream(): MediaStream | null {
        return this.remoteStream;
    }

    setRemoteStream(stream: MediaStream): void {
        this.remoteStream = stream;
    }
}

export const webrtcService = new WebRTCService();
