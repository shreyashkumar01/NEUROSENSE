import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Blob "mo:core/Blob";
import List "mo:core/List";
import Order "mo:core/Order";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor Neurosense {

  /* =========================================================
     =============== BASIC USER & MEDICAL TYPES ===============
     ========================================================= */

  type MedicalInfo = {
    diagnosis : Text;
    therapyPlan : Text;
  };

  type PatientProfile = {
    name : Text;
    birthDate : Text;
    medicalInfo : MedicalInfo;
  };

  module PatientProfileUtil {
    public func compare(a : PatientProfile, b : PatientProfile) : Order.Order {
      Text.compare(a.name, b.name);
    };
  };

  /* =========================================================
     ====================== USER ROLES ========================
     ========================================================= */

  public type UserProfile = {
    name : Text;
    userType : Text; // "patient" | "doctor"
  };

  let accessState = AccessControl.initState();
  let userProfiles = Map.empty<Principal, UserProfile>();

  /* =========================================================
     ===================== PATIENT DATA =======================
     ========================================================= */

  module Patient {

    public type ProgressMetrics = {
      movement : Nat;
      speech : Nat;
      cognitive : Nat;
      mood : Nat;
    };

    public type DailyRecord = {
      date : Int;
      metrics : ProgressMetrics;
    };

    public type TherapyChecklist = {
      tasksCompleted : Nat;
      totalTasks : Nat;
      incompleteTasks : [Text];
    };

    public type ExerciseData = {
      exerciseId : Text;
      completionTime : ?Int;
      repetitions : Nat;
      difficultyLevel : Nat;
      timestamp : Int;
    };

    public type TherapyTask = {
      exerciseId : Text;
      name : Text;
      difficultyLevel : Nat;
    };

    public type TherapyPlan = {
      plan : [TherapyTask];
      createdAt : Int;
    };

    public func calculateDailyDelta(a : DailyRecord, b : DailyRecord) : {
      movement : Int;
      speech : Int;
      cognitive : Int;
      mood : Int;
    } {
      {
        movement = (b.metrics.movement : Int) - (a.metrics.movement : Int);
        speech = (b.metrics.speech : Int) - (a.metrics.speech : Int);
        cognitive = (b.metrics.cognitive : Int) - (a.metrics.cognitive : Int);
        mood = (b.metrics.mood : Int) - (a.metrics.mood : Int);
      };
    };
  };

  let patientProfiles = Map.empty<Principal, PatientProfile>();
  let patientProgress = Map.empty<Principal, List.List<Patient.DailyRecord>>();
  let patientChecklists = Map.empty<Principal, Patient.TherapyChecklist>();
  let patientExercises = Map.empty<Principal, List.List<Patient.ExerciseData>>();
  let patientTherapyPlans = Map.empty<Principal, Patient.TherapyPlan>();
  let emergencyContacts = Map.empty<Principal, List.List<Text>>();

  /* =========================================================
     ===================== DOCTOR DATA ========================
     ========================================================= */

  module Doctor {

    public type DoctorProfile = {
      name : Text;
      medicalLicenseNumber : Text;
      specialization : Text;
    };

    public type TherapyPlanAnalysis = {
      planComplexity : Nat;
      patientSuitabilityScore : Nat;
      riskAssessmentScore : Nat;
      recommendations : Text;
      reviewSummary : Text;
    };

    public func analyze(params : TherapyPlanAnalysis) : TherapyPlanAnalysis {
      params;
    };
  };

  let doctorProfiles = Map.empty<Principal, Doctor.DoctorProfile>();

  /* =========================================================
     ===================== CHAT MODULE ========================
     ========================================================= */

  module Chat {
    public type Message = {
      sender : Principal;
      content : Text;
      timestamp : Int;
    };

    public type Conversation = {
      participants : [Principal];
      messages : List.List<Message>;
      lastUpdated : Int;
    };
  };

  let conversations = Map.empty<Text, Chat.Conversation>();

  /* =========================================================
     ==================== ACCESS HELPERS ======================
     ========================================================= */

  let doctorPatientMap = Map.empty<Principal, Set.Set<Principal>>();

  private func isAssignedDoctor(doctor : Principal, patient : Principal) : Bool {
    switch (doctorPatientMap.get(patient)) {
      case (?set) set.contains(doctor);
      case null false;
    };
  };

  private func canAccessPatient(caller : Principal, patient : Principal) : Bool {
    caller == patient
    or (AccessControl.isAdmin(accessState, caller) and isAssignedDoctor(caller, patient));
  };

  /* =========================================================
     ================= ACCESS CONTROL API =====================
     ========================================================= */

  include MixinStorage();

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessState, caller);
  };

  public shared ({ caller }) func assignUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessState, caller, user, role);
  };

  public query ({ caller }) func getCallerRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessState, caller);
  };

  /* =========================================================
     ================= USER PROFILE API =======================
     ========================================================= */

  public shared ({ caller }) func saveUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessState, caller)) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.get(user);
  };

  /* =========================================================
     ================= PATIENT PROFILE API ====================
     ========================================================= */

  public shared ({ caller }) func savePatientProfile(profile : PatientProfile) : async () {
    if (not AccessControl.hasPermission(accessState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    patientProfiles.add(caller, profile);
  };

  public query ({ caller }) func getPatientProfile(patient : Principal) : async PatientProfile {
    if (not canAccessPatient(caller, patient)) {
      Runtime.trap("Unauthorized");
    };
    switch (patientProfiles.get(patient)) {
      case (?p) p;
      case null Runtime.trap("Patient not found");
    };
  };

  /* =========================================================
     ================= PROGRESS & EXERCISE ====================
     ========================================================= */

  public shared ({ caller }) func recordDailyProgress(metrics : Patient.ProgressMetrics) : async () {
    let record = { date = Time.now(); metrics };
    let list = switch (patientProgress.get(caller)) {
      case (?l) l;
      case null List.empty();
    };
    list.add(record);
  };

  public query ({ caller }) func getProgress(patient : Principal) : async [Patient.DailyRecord] {
    if (not canAccessPatient(caller, patient)) Runtime.trap("Unauthorized");
    switch (patientProgress.get(patient)) {
      case (?l) l.values().toArray();
      case null [];
    };
  };

  /* =========================================================
     ================= EMERGENCY CONTACTS =====================
     ========================================================= */

  public shared ({ caller }) func addEmergencyContact(contact : Text) : async () {
    let list = switch (emergencyContacts.get(caller)) {
      case (?l) l;
      case null List.empty();
    };
    list.add(contact);
  };

  public query ({ caller }) func getEmergencyContacts(patient : Principal) : async [Text] {
    if (not canAccessPatient(caller, patient)) Runtime.trap("Unauthorized");
    switch (emergencyContacts.get(patient)) {
      case (?l) l.values().toArray();
      case null [];
    };
  };
};
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Blob "mo:core/Blob";
import List "mo:core/List";
import Order "mo:core/Order";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor Neurosense {

  /* =========================================================
     =============== BASIC USER & MEDICAL TYPES ===============
     ========================================================= */

  type MedicalInfo = {
    diagnosis : Text;
    therapyPlan : Text;
  };

  type PatientProfile = {
    name : Text;
    birthDate : Text;
    medicalInfo : MedicalInfo;
  };

  module PatientProfileUtil {
    public func compare(a : PatientProfile, b : PatientProfile) : Order.Order {
      Text.compare(a.name, b.name);
    };
  };

  /* =========================================================
     ====================== USER ROLES ========================
     ========================================================= */

  public type UserProfile = {
    name : Text;
    userType : Text; // "patient" | "doctor"
  };

  let accessState = AccessControl.initState();
  let userProfiles = Map.empty<Principal, UserProfile>();

  /* =========================================================
     ===================== PATIENT DATA =======================
     ========================================================= */

  module Patient {

    public type ProgressMetrics = {
      movement : Nat;
      speech : Nat;
      cognitive : Nat;
      mood : Nat;
    };

    public type DailyRecord = {
      date : Int;
      metrics : ProgressMetrics;
    };

    public type TherapyChecklist = {
      tasksCompleted : Nat;
      totalTasks : Nat;
      incompleteTasks : [Text];
    };

    public type ExerciseData = {
      exerciseId : Text;
      completionTime : ?Int;
      repetitions : Nat;
      difficultyLevel : Nat;
      timestamp : Int;
    };

    public type TherapyTask = {
      exerciseId : Text;
      name : Text;
      difficultyLevel : Nat;
    };

    public type TherapyPlan = {
      plan : [TherapyTask];
      createdAt : Int;
    };

    public func calculateDailyDelta(a : DailyRecord, b : DailyRecord) : {
      movement : Int;
      speech : Int;
      cognitive : Int;
      mood : Int;
    } {
      {
        movement = (b.metrics.movement : Int) - (a.metrics.movement : Int);
        speech = (b.metrics.speech : Int) - (a.metrics.speech : Int);
        cognitive = (b.metrics.cognitive : Int) - (a.metrics.cognitive : Int);
        mood = (b.metrics.mood : Int) - (a.metrics.mood : Int);
      };
    };
  };

  let patientProfiles = Map.empty<Principal, PatientProfile>();
  let patientProgress = Map.empty<Principal, List.List<Patient.DailyRecord>>();
  let patientChecklists = Map.empty<Principal, Patient.TherapyChecklist>();
  let patientExercises = Map.empty<Principal, List.List<Patient.ExerciseData>>();
  let patientTherapyPlans = Map.empty<Principal, Patient.TherapyPlan>();
  let emergencyContacts = Map.empty<Principal, List.List<Text>>();

  /* =========================================================
     ===================== DOCTOR DATA ========================
     ========================================================= */

  module Doctor {

    public type DoctorProfile = {
      name : Text;
      medicalLicenseNumber : Text;
      specialization : Text;
    };

    public type TherapyPlanAnalysis = {
      planComplexity : Nat;
      patientSuitabilityScore : Nat;
      riskAssessmentScore : Nat;
      recommendations : Text;
      reviewSummary : Text;
    };

    public func analyze(params : TherapyPlanAnalysis) : TherapyPlanAnalysis {
      params;
    };
  };

  let doctorProfiles = Map.empty<Principal, Doctor.DoctorProfile>();

  /* =========================================================
     ===================== CHAT MODULE ========================
     ========================================================= */

  module Chat {
    public type Message = {
      sender : Principal;
      content : Text;
      timestamp : Int;
    };

    public type Conversation = {
      participants : [Principal];
      messages : List.List<Message>;
      lastUpdated : Int;
    };
  };

  let conversations = Map.empty<Text, Chat.Conversation>();

  /* =========================================================
     ==================== ACCESS HELPERS ======================
     ========================================================= */

  let doctorPatientMap = Map.empty<Principal, Set.Set<Principal>>();

  private func isAssignedDoctor(doctor : Principal, patient : Principal) : Bool {
    switch (doctorPatientMap.get(patient)) {
      case (?set) set.contains(doctor);
      case null false;
    };
  };

  private func canAccessPatient(caller : Principal, patient : Principal) : Bool {
    caller == patient
    or (AccessControl.isAdmin(accessState, caller) and isAssignedDoctor(caller, patient));
  };

  /* =========================================================
     ================= ACCESS CONTROL API =====================
     ========================================================= */

  include MixinStorage();

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessState, caller);
  };

  public shared ({ caller }) func assignUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessState, caller, user, role);
  };

  public query ({ caller }) func getCallerRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessState, caller);
  };

  /* =========================================================
     ================= USER PROFILE API =======================
     ========================================================= */

  public shared ({ caller }) func saveUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessState, caller)) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.get(user);
  };

  /* =========================================================
     ================= PATIENT PROFILE API ====================
     ========================================================= */

  public shared ({ caller }) func savePatientProfile(profile : PatientProfile) : async () {
    if (not AccessControl.hasPermission(accessState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    patientProfiles.add(caller, profile);
  };

  public query ({ caller }) func getPatientProfile(patient : Principal) : async PatientProfile {
    if (not canAccessPatient(caller, patient)) {
      Runtime.trap("Unauthorized");
    };
    switch (patientProfiles.get(patient)) {
      case (?p) p;
      case null Runtime.trap("Patient not found");
    };
  };

  /* =========================================================
     ================= PROGRESS & EXERCISE ====================
     ========================================================= */

  public shared ({ caller }) func recordDailyProgress(metrics : Patient.ProgressMetrics) : async () {
    let record = { date = Time.now(); metrics };
    let list = switch (patientProgress.get(caller)) {
      case (?l) l;
      case null List.empty();
    };
    list.add(record);
  };

  public query ({ caller }) func getProgress(patient : Principal) : async [Patient.DailyRecord] {
    if (not canAccessPatient(caller, patient)) Runtime.trap("Unauthorized");
    switch (patientProgress.get(patient)) {
      case (?l) l.values().toArray();
      case null [];
    };
  };

  /* =========================================================
     ================= EMERGENCY CONTACTS =====================
     ========================================================= */

  public shared ({ caller }) func addEmergencyContact(contact : Text) : async () {
    let list = switch (emergencyContacts.get(caller)) {
      case (?l) l;
      case null List.empty();
    };
    list.add(contact);
  };

  public query ({ caller }) func getEmergencyContacts(patient : Principal) : async [Text] {
    if (not canAccessPatient(caller, patient)) Runtime.trap("Unauthorized");
    switch (emergencyContacts.get(patient)) {
      case (?l) l.values().toArray();
      case null [];
    };
  };
};
