// Backend types matching the Motoko actor interface

export type MedicalInfo = {
  diagnosis: string;
  therapyPlan: string;
};

export type PatientProfile = {
  name: string;
  birthDate: string;
  medicalInfo: MedicalInfo;
};

export type UserProfile = {
  name: string;
  userType: string; // "patient" | "doctor"
};

export type ProgressMetrics = {
  movement: number;
  speech: number;
  cognitive: number;
  mood: number;
};

export type DailyRecord = {
  date: number;
  metrics: ProgressMetrics;
};

export type TherapyChecklist = {
  tasksCompleted: number;
  totalTasks: number;
  incompleteTasks: string[];
};

export type ExerciseData = {
  exerciseId: string;
  completionTime?: number;
  repetitions: number;
  difficultyLevel: number;
  timestamp: number;
};

export type TherapyTask = {
  exerciseId: string;
  name: string;
  difficultyLevel: number;
};

export type TherapyPlan = {
  plan: TherapyTask[];
  createdAt: number;
};

export type DoctorProfile = {
  name: string;
  medicalLicenseNumber: string;
  specialization: string;
};

// Actor interface (simplified for now - will be generated from Motoko)
export interface NeurosenseActor {
  // User Profile
  saveCallerUserProfile(profile: UserProfile): Promise<void>;
  getCallerUserProfile(): Promise<UserProfile | null>;
  getUserProfile(user: string): Promise<UserProfile | null>;
  
  // Patient Profile
  savePatientProfile(profile: PatientProfile): Promise<void>;
  getPatientProfile(patient: string): Promise<PatientProfile>;
  
  // Doctor Profile
  saveDoctorProfile(profile: DoctorProfile): Promise<void>;
  
  // Role checks
  getIsCallerDoctor(): Promise<boolean>;
  
  // Progress
  recordDailyProgress(metrics: ProgressMetrics): Promise<void>;
  getPatientProgress(patient: string): Promise<DailyRecord[]>;
  
  // Therapy Checklist
  updateTherapyChecklist(checklist: TherapyChecklist): Promise<void>;
  getTherapyChecklist(patient: string): Promise<TherapyChecklist | null>;
  
  // Exercise Data
  recordExerciseData(exercise: ExerciseData): Promise<void>;
  getExerciseData(patient: string): Promise<ExerciseData[]>;
  
  // Emergency Contacts
  addEmergencyContact(contact: string): Promise<void>;
  getEmergencyContacts(patient: string): Promise<string[]>;
  
  // Doctor queries
  getAllPatientProfiles(): Promise<PatientProfile[]>;
}


