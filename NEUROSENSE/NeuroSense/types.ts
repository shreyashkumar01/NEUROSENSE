
export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR'
}

export enum TherapyType {
  BODY = 'BODY',
  BRAIN = 'BRAIN',
  SPEECH = 'SPEECH',
  MENTAL = 'MENTAL'
}

export enum ConnectionStatus {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  CONNECTED = 'CONNECTED'
}

export interface Connection {
  id: string;
  patientId: string;
  doctorId: string;
  status: ConnectionStatus;
  timestamp: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone: string;
  password?: string;
  role: UserRole;
  // Patient specific
  diagnosis?: string;
  caseId?: string;
  // Doctor specific
  licenseId?: string;
  specialty?: string;
  experienceYears?: number;
  bio?: string;
  isVerified?: boolean;
  startDate: string;
}

export interface PatientProfile extends UserAccount {
  // Specific fields guaranteed for patient
  caseId?: string;
}

export interface DoctorProfile extends UserAccount {
  // Specific fields guaranteed for doctor
  licenseId?: string;
  specialty?: string;
  experienceYears?: number;
  bio?: string;
  isVerified?: boolean;
}

export interface SessionResult {
  patientId: string;
  timestamp: string;
  type: TherapyType;
  exerciseName?: string;
  score: number;
  metadata?: Record<string, any>;
  feedback: string;
}

export interface DailyTaskStatus {
  type: TherapyType;
  completed: boolean;
  score?: number;
}


export interface PatientStats {
  recoveryScore: number;
  sessionsCompleted: number;
  activeStreak: number;
}

// --- AZURE AI & SCORING TYPES ---

export interface BodyLandmark {
  name: string;
  x: number;
  y: number;
  z?: number;
}

export interface PoseAnalysisResult {
  landmarks: BodyLandmark[];
  stability: number;
  tremor: number;
  balance: number;
  confidence: number;
}

export interface SpeechAnalysisResult {
  transcription: string;
  pronunciationScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  clarityScore: number;
}

export interface MentalHealthAssessment {
  type: 'STRESS' | 'MOOD' | 'ANXIETY' | 'DEPRESSION';
  score: number;
  severity: 'LOW' | 'MODERATE' | 'HIGH';
  timestamp: string;
  responses: Record<string, any>;
}

export interface RecoveryPrediction {
  currentScore: number;
  predictedScore: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  confidence: number;
}

export interface RiskLevel {
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  factors: string[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isEdited?: boolean;
}

export type CallStatus = 'MISSED' | 'COMPLETED' | 'REJECTED' | 'BUSY';

export interface Call {
  id: string;
  callerId: string;
  receiverId: string;
  startedAt: string;
  endedAt?: string;
  status: CallStatus;
  type: 'VIDEO' | 'AUDIO';
}
