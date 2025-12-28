import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

module AccessControl {

  /* =====================================================
     ================= USER ROLES ========================
     ===================================================== */

  public type UserRole = {
    #admin;
    #user;
    #guest;
  };

  /* =====================================================
     ============== ACCESS CONTROL STATE =================
     ===================================================== */

  public type State = {
    var adminInitialized : Bool;
    roles : Map.Map<Principal, UserRole>;
  };

  /* =====================================================
     ================ STATE INITIALIZER ==================
     ===================================================== */

  public func initState() : State {
    {
      var adminInitialized = false;
      roles = Map.empty<Principal, UserRole>();
    };
  };

  /* =====================================================
     ================= INITIAL BOOTSTRAP =================
     ===================================================== */
  // First non-anonymous caller becomes admin
  // All subsequent callers become users

  public func initialize(state : State, caller : Principal) {
    if (caller.isAnonymous()) return;

    switch (state.roles.get(caller)) {

      // User already registered → do nothing
      case (?_) {};

      // New user
      case null {
        if (not state.adminInitialized) {
          state.roles.add(caller, #admin);
          state.adminInitialized := true;
        } else {
          state.roles.add(caller, #user);
        };
      };
    };
  };

  /* =====================================================
     ================= GET USER ROLE =====================
     ===================================================== */

  public func getUserRole(state : State, caller : Principal) : UserRole {
    if (caller.isAnonymous()) {
      return #guest;
    };

    switch (state.roles.get(caller)) {
      case (?role) role;
      case null Runtime.trap("User is not registered");
    };
  };

  /* =====================================================
     ================= ROLE ASSIGNMENT ===================
     ===================================================== */

  public func assignRole(
    state : State,
    caller : Principal,
    target : Principal,
    role : UserRole
  ) {
    if (not isAdmin(state, caller)) {
      Runtime.trap("Unauthorized: Admin access required");
    };

    state.roles.add(target, role);
  };

  /* =====================================================
     ================= PERMISSION CHECK ==================
     ===================================================== */

  public func hasPermission(
    state : State,
    caller : Principal,
    required : UserRole
  ) : Bool {

    let current = getUserRole(state, caller);

    switch (current) {

      // Admin has all permissions
      case (#admin) true;

      // Non-admin permission logic
      case (_) {
        switch (required) {
          case (#admin) false;
          case (#user) current == #user;
          case (#guest) true;
        };
      };
    };
  };

  /* =====================================================
     ================= ADMIN CHECK =======================
     ===================================================== */

  public func isAdmin(state : State, caller : Principal) : Bool {
    getUserRole(state, caller) == #admin;
  };

};
