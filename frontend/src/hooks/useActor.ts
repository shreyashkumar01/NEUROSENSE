import { useState, useEffect } from 'react';
import { useInternetIdentity } from './useInternetIdentity';
import type { NeurosenseActor } from '../backend';

// Mock actor implementation for local development
class MockActor implements NeurosenseActor {
  private principal: string;

  constructor(principal: string) {
    this.principal = principal;
  }

  async saveCallerUserProfile(profile: any): Promise<void> {
    localStorage.setItem(`userProfile_${this.principal}`, JSON.stringify(profile));
  }

  async getCallerUserProfile(): Promise<any | null> {
    const stored = localStorage.getItem(`userProfile_${this.principal}`);
    return stored ? JSON.parse(stored) : null;
  }

  async getUserProfile(user: string): Promise<any | null> {
    const stored = localStorage.getItem(`userProfile_${user}`);
    return stored ? JSON.parse(stored) : null;
  }

  async savePatientProfile(profile: any): Promise<void> {
    localStorage.setItem(`patientProfile_${this.principal}`, JSON.stringify(profile));
  }

  async getPatientProfile(patient: string): Promise<any> {
    const stored = localStorage.getItem(`patientProfile_${patient}`);
    if (!stored) {
      throw new Error('Patient not found');
    }
    return JSON.parse(stored);
  }

  async saveDoctorProfile(profile: any): Promise<void> {
    localStorage.setItem(`doctorProfile_${this.principal}`, JSON.stringify(profile));
  }

  async getIsCallerDoctor(): Promise<boolean> {
    const profile = await this.getCallerUserProfile();
    return profile?.userType === 'doctor';
  }

  async recordDailyProgress(metrics: any): Promise<void> {
    const key = `progress_${this.principal}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push({
      date: Date.now(),
      metrics,
    });
    localStorage.setItem(key, JSON.stringify(existing));
  }

  async getPatientProgress(patient: string): Promise<any[]> {
    const key = `progress_${patient}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  async updateTherapyChecklist(checklist: any): Promise<void> {
    localStorage.setItem(`checklist_${this.principal}`, JSON.stringify(checklist));
  }

  async getTherapyChecklist(patient: string): Promise<any | null> {
    const stored = localStorage.getItem(`checklist_${patient}`);
    return stored ? JSON.parse(stored) : null;
  }

  async recordExerciseData(exercise: any): Promise<void> {
    const key = `exercises_${this.principal}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(exercise);
    localStorage.setItem(key, JSON.stringify(existing));
  }

  async getExerciseData(patient: string): Promise<any[]> {
    const key = `exercises_${patient}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  async addEmergencyContact(contact: string): Promise<void> {
    const key = `emergencyContacts_${this.principal}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    if (!existing.includes(contact)) {
      existing.push(contact);
      localStorage.setItem(key, JSON.stringify(existing));
    }
  }

  async getEmergencyContacts(patient: string): Promise<string[]> {
    const key = `emergencyContacts_${patient}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  async getAllPatientProfiles(): Promise<any[]> {
    // Mock implementation - in production, this would query the backend
    const profiles: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('patientProfile_')) {
        const profile = JSON.parse(localStorage.getItem(key) || '{}');
        profiles.push(profile);
      }
    }
    return profiles;
  }
}

export function useActor() {
  const { identity } = useInternetIdentity();
  const [actor, setActor] = useState<NeurosenseActor | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (identity) {
      setIsFetching(true);
      try {
        const principal = identity.getPrincipal?.()?.toText?.() || 'mock-principal';
        const mockActor = new MockActor(principal);
        setActor(mockActor);
      } catch (error) {
        console.error('Failed to create actor:', error);
        setActor(null);
      } finally {
        setIsFetching(false);
      }
    } else {
      setActor(null);
      setIsFetching(false);
    }
  }, [identity]);

  return { actor, isFetching };
}

