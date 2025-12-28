import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { 
  UserProfile, 
  PatientProfile, 
  DoctorProfile, 
  ProgressMetrics, 
  DailyRecord,
  TherapyChecklist,
  ExerciseData
} from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetIsCallerDoctor() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerDoctor'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.getIsCallerDoctor();
    },
    enabled: !!actor && !isFetching,
  });
}

// Patient Profile Queries
export function useGetPatientProfile(patientPrincipal?: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PatientProfile>({
    queryKey: ['patientProfile', patientPrincipal],
    queryFn: async () => {
      if (!actor || !patientPrincipal) throw new Error('Actor or patient principal not available');
      return actor.getPatientProfile(patientPrincipal);
    },
    enabled: !!actor && !isFetching && !!patientPrincipal,
  });
}

export function useSavePatientProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: PatientProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.savePatientProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientProfile'] });
    },
  });
}

export function useGetAllPatientProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<PatientProfile[]>({
    queryKey: ['allPatientProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPatientProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

// Doctor Profile Queries
export function useSaveDoctorProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: DoctorProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveDoctorProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorProfile'] });
    },
  });
}

// Progress Tracking Queries
export function useRecordDailyProgress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metrics: ProgressMetrics) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordDailyProgress(metrics);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientProgress'] });
    },
  });
}

export function useGetPatientProgress(patientPrincipal?: string) {
  const { actor, isFetching } = useActor();

  return useQuery<DailyRecord[]>({
    queryKey: ['patientProgress', patientPrincipal],
    queryFn: async () => {
      if (!actor || !patientPrincipal) return [];
      return actor.getPatientProgress(patientPrincipal);
    },
    enabled: !!actor && !isFetching && !!patientPrincipal,
  });
}

// Therapy Checklist Queries
export function useUpdateTherapyChecklist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (checklist: TherapyChecklist) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTherapyChecklist(checklist);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapyChecklist'] });
    },
  });
}

export function useGetTherapyChecklist(patientPrincipal?: string) {
  const { actor, isFetching } = useActor();

  return useQuery<TherapyChecklist | null>({
    queryKey: ['therapyChecklist', patientPrincipal],
    queryFn: async () => {
      if (!actor || !patientPrincipal) return null;
      return actor.getTherapyChecklist(patientPrincipal);
    },
    enabled: !!actor && !isFetching && !!patientPrincipal,
  });
}

// Exercise Data Queries
export function useRecordExerciseData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exercise: ExerciseData) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordExerciseData(exercise);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exerciseData'] });
    },
  });
}

export function useGetExerciseData(patientPrincipal?: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ExerciseData[]>({
    queryKey: ['exerciseData', patientPrincipal],
    queryFn: async () => {
      if (!actor || !patientPrincipal) return [];
      return actor.getExerciseData(patientPrincipal);
    },
    enabled: !!actor && !isFetching && !!patientPrincipal,
  });
}

// Emergency Contacts
export function useAddEmergencyContact() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contact: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addEmergencyContact(contact);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyContacts'] });
    },
  });
}

export function useGetEmergencyContacts(patientPrincipal?: string) {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['emergencyContacts', patientPrincipal],
    queryFn: async () => {
      if (!actor || !patientPrincipal) return [];
      return actor.getEmergencyContacts(patientPrincipal);
    },
    enabled: !!actor && !isFetching && !!patientPrincipal,
  });
}