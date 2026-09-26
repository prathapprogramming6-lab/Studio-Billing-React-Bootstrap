import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

const AuthContext = createContext(null);

const API_URL = "http://localhost:5000/api";

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    try {
      const savedUser =
        localStorage.getItem("studioUser");

      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("studioToken") || ""
  );

  const [loading, setLoading] = useState(false);


  // =====================================================
  // SAVE USER + TOKEN
  // =====================================================

  useEffect(() => {

    if (user) {
      localStorage.setItem(
        "studioUser",
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem("studioUser");
    }

    if (token) {
      localStorage.setItem(
        "studioToken",
        token
      );
    } else {
      localStorage.removeItem("studioToken");
    }

  }, [user, token]);


  // =====================================================
  // LOGIN
  // =====================================================

  const login = async (email, password) => {

    setLoading(true);

    try {

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        return {
          success: false,
          message:
            data.message ||
            "Login failed"
        };
      }


      // Save token
      setToken(data.token);


      // Save user
      setUser(data.user);


      return {
        success: true,
        user: data.user,
        token: data.token,

        requiresActivation:
          data.user?.isActivated !== true
      };

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      return {
        success: false,
        message:
          "Unable to connect to server"
      };

    } finally {

      setLoading(false);
    }
  };


  // =====================================================
  // REGISTER
  // =====================================================

  const register = async (
    name,
    email,
    phone,
    password
  ) => {

    setLoading(true);

    try {

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            name,
            email,
            phone,
            password
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        return {
          success: false,
          message:
            data.message ||
            "Registration failed"
        };
      }


      return {
        success: true,

        message:
          data.message ||
          "Account created successfully",

        user: data.user
      };

    } catch (error) {

      console.error(
        "Registration error:",
        error
      );

      return {
        success: false,
        message:
          "Unable to connect to server"
      };

    } finally {

      setLoading(false);
    }
  };


  // =====================================================
  // ACTIVATE
  // =====================================================

  const activate = async (
    email,
    activationKey
  ) => {

    setLoading(true);

    try {

      const response = await fetch(
        `${API_URL}/auth/activate`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email,
            activationKey
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        return {
          success: false,
          message:
            data.message ||
            "Activation failed"
        };
      }


      const activatedUser =
        data.user;


      setUser(currentUser => {

        const updatedUser = {
          ...(currentUser || {}),
          ...(activatedUser || {}),

          isActivated: true
        };


        localStorage.setItem(
          "studioUser",
          JSON.stringify(updatedUser)
        );


        return updatedUser;
      });


      return {
        success: true,

        message:
          data.message ||
          "Software activated successfully",

        user: activatedUser
      };

    } catch (error) {

      console.error(
        "Activation error:",
        error
      );

      return {
        success: false,
        message:
          "Unable to connect to server"
      };

    } finally {

      setLoading(false);
    }
  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {

    setUser(null);

    setToken("");

    localStorage.removeItem(
      "studioUser"
    );

    localStorage.removeItem(
      "studioToken"
    );
  };


  // =====================================================
  // AUTH STATUS
  // =====================================================

  const isAuthenticated =
    Boolean(token && user);

  const isActivated =
    user?.isActivated === true;

  const isAdmin =
    user?.isAdmin === true;


  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const value = {

    user,

    token,

    loading,

    isAuthenticated,

    isActivated,

    isAdmin,

    login,

    register,

    activate,

    logout
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


// =====================================================
// USE AUTH
// =====================================================

export function useAuth() {

  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}