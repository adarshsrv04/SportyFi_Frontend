// //////////////////////////////////////////////////////////////////////////////////////

// import React, { createContext, useContext, useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { toast } from "@/components/ui/use-toast";
// import { useGoogleLogin } from "@react-oauth/google";

// type User = {
//   id: string;
//   email: string;
//   userType: string;
//   lastLogin: string;
//   emailVerified: boolean;
//   createdAt: string;
// };

// type AuthContextType = {
//   user: User | null;
//   accessToken: string | null;
//   isLoading: boolean;
//   signUp: (email: string, password: string, userType: string) => Promise<void>;
//   signIn: (email: string, password: string) => Promise<void>;
//   signInWithGoogle: () => void;
//   signInWithApple: () => Promise<void>;
//   signInWithPhone: (phone: string) => Promise<void>;
//   verifyOtp: (phone: string, token: string) => Promise<void>;
//   signOut: () => void;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [accessToken, setAccessToken] = useState<string | null>(null);
//   const [refreshToken, setRefreshToken] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();

//   /**
//    * Load user from storage or refresh token
//    */
//   useEffect(() => {
//     const loadUserFromStorage = async () => {
//       const token = localStorage.getItem("accessToken");
//       const refreshToken = localStorage.getItem("refreshToken");

//       if (!token && refreshToken) {
//         try {
//           const res = await axios.post(`${API_BASE_URL}/sportyfi/auth/refresh`, {
//             refreshToken,
//           });

//           const { accessToken: newToken } = res.data;
//           localStorage.setItem("accessToken", newToken);

//           const userRes = await axios.get<User>(`${API_BASE_URL}/sportyfi/auth/me`, {
//             headers: { Authorization: `Bearer ${newToken}` },
//           });

//           setUser(userRes.data);
//           setAccessToken(res.data);
//           // setRefreshToken(refreshToken);
//         } catch (err) {
//           console.error("Refresh failed:", err);
//           localStorage.clear();
//         } finally {
//           setIsLoading(false);
//         }
//         return;
//       }

//       if (!token) {
//         setIsLoading(false);
//         return;
//       }

//       try {
//         const res = await axios.get<User>(`${API_BASE_URL}/sportyfi/auth/me`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUser(res.data);
//         setAccessToken(token);
//       } catch (err) {
//         console.error("Fetch user failed:", err);
//         localStorage.clear();
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadUserFromStorage();
//   }, []);

//   /**
//    * Sign up
//    */
//   const signUp = async (email: string, password: string, userType: string) => {
//     setIsLoading(true);
//     try {
//       await axios.post(`${API_BASE_URL}/sportyfi/auth/signup`, {
//         email,
//         password,
//         userType,
//       });

//       toast({
//         title: "Account created",
//         description: "Please check your email to verify your account.",
//       });

//       navigate("/auth");
//     } catch (error: any) {
//       toast({
//         title: "Sign Up Failed",
//         description: error?.response?.data?.message || "Something went wrong.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   /**
//    * Sign in
//    */
//   const signIn = async (email: string, password: string) => {
//     setIsLoading(true);
//     try {
//       const response = await axios.post(`${API_BASE_URL}/sportyfi/auth/signin`, {
//         email,
//         password,
//       });

//       const { accessToken, refreshToken, user } = response.data;

//       localStorage.setItem("accessToken", accessToken);
//       localStorage.setItem("refreshToken", refreshToken);

//       setUser(user);
//       setAccessToken(accessToken);
//       setRefreshToken(refreshToken);

//       toast({
//         title: "Welcome back!",
//         description: "You have been signed in successfully.",
//       });

//       navigate("/");
//     } catch (error: any) {
//       toast({
//         title: "Sign In Failed",
//         description: error?.response?.data?.error || "Invalid credentials",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   /**
//    * Google login
//    */
//   const googleLogin = useGoogleLogin({
//     flow: "auth-code",   // use authorization code flow
//     // prompt: "select_account",
//     onSuccess: async (codeResponse) => {
//       try {
//         // Send the code to your backend, not the access_token
//         const res = await axios.post(`${API_BASE_URL}/sportyfi/auth/google`, {
//           code: codeResponse.code,
//         });

//         const { accessToken, refreshToken, user } = res.data;

//         localStorage.setItem("accessToken", accessToken);
//         localStorage.setItem("refreshToken", refreshToken);

//         toast({
//           title: "Signed in with Google",
//           description: `Welcome ${user.email}`,
//         });

//         navigate("/");
//       } catch (err) {
//         console.error("Google login failed:", err);
//       }
//     },
//     onError: (err) => console.error("Google Login Error:", err),
//   });

//   // const googleLogin = useGoogleLogin({
//   //   onSuccess: async (tokenResponse) => {
//   //     try {
//   //       const res = await axios.post(`${API_BASE_URL}/sportyfi/auth/google`, {
//   //         idToken: tokenResponse.access_token,
//   //       });

//   //       const { accessToken, refreshToken, user } = res.data;
//   //       localStorage.setItem("accessToken", accessToken);
//   //       localStorage.setItem("refreshToken", refreshToken);
//   //       setUser(user);

//   //       toast({
//   //         title: "Signed in with Google",
//   //         description: `Welcome ${user.email}`,
//   //       });

//   //       navigate("/");
//   //     } catch (err) {
//   //       console.error("Google login failed:", err);
//   //     }
//   //   },
//   //   onError: (err) => console.error("Google Login Error:", err),
//   //   flow: "implicit",
//   // });

//   /**
//    * Apple login (stub — implement with Apple OAuth flow)
//    */
//   const signInWithApple = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/sportyfi/auth/apple`);
//       console.log(res.data);
//     } catch (err) {
//       console.error("Apple login not implemented yet", err);
//     }
//   };

//   /**
//    * Phone login + OTP (stub — implement with your backend/SMS service)
//    */
//   const signInWithPhone = async (phone: string) => {
//     try {
//       await axios.post(`${API_BASE_URL}/sportyfi/auth/phone`, { phone });
//       toast({
//         title: "OTP Sent",
//         description: "Check your phone for the verification code.",
//       });
//     } catch (err) {
//       console.error("Phone login failed", err);
//     }
//   };

//   const verifyOtp = async (phone: string, token: string) => {
//     try {
//       const res = await axios.post(`${API_BASE_URL}/sportyfi/auth/verify-otp`, {
//         phone,
//         token,
//       });
//       const { accessToken, refreshToken, user } = res.data;
//       localStorage.setItem("accessToken", accessToken);
//       localStorage.setItem("refreshToken", refreshToken);
//       setUser(user);
//       toast({
//         title: "Phone verified",
//         description: "You are now signed in.",
//       });
//     } catch (err) {
//       console.error("OTP verification failed", err);
//     }
//   };

//   /**
//    * Sign out
//    */
//   const signOut = () => {
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("refreshToken");
//     setUser(null);

//     toast({
//       title: "Signed out",
//       description: "You have been signed out.",
//     });

//     navigate("/");
//   };

//   useEffect(() => {
//     // Load session from localStorage on refresh
//     const savedUser = localStorage.getItem("user");
//     const savedAccessToken = localStorage.getItem("accessToken");
//     const savedRefreshToken = localStorage.getItem("refreshToken");

//     if (savedUser && savedAccessToken) {
//       setUser(JSON.parse(savedUser));
//       setAccessToken(savedAccessToken);
//       setRefreshToken(savedRefreshToken);
//     }
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         accessToken,
//         isLoading,
//         signUp,
//         signIn,
//         signInWithGoogle: googleLogin,
//         signInWithApple,
//         signInWithPhone,
//         verifyOtp,
//         signOut,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

/////////////////////////////////////////////////////////////////////////////

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useGoogleLogin } from "@react-oauth/google";

type User = {
  id: string;
  email: string;
  userType: string;
  lastLogin: string;
  emailVerified: boolean;
  createdAt: string;
};

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  signUp: (email: string, password: string, userType: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => void;
  signInWithApple: () => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, token: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * Load user from storage or refresh token
   */
  useEffect(() => {
    const loadUserFromStorage = async () => {
      const token = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!token && refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/sportyfi/auth/refresh`, {
            refreshToken,
          });

          const { accessToken: newToken } = res.data;
          localStorage.setItem("accessToken", newToken);

          const userRes = await axios.get<User>(`${API_BASE_URL}/sportyfi/auth/me`, {
            headers: { Authorization: `Bearer ${newToken}` },
          });

          setUser(userRes.data);
          localStorage.setItem("user", JSON.stringify(userRes.data)); // persist user
          setAccessToken(newToken);
        } catch (err) {
          console.error("Refresh failed:", err);
          localStorage.clear();
        } finally {
          setIsLoading(false);
        }
        return;
      }

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await axios.get<User>(`${API_BASE_URL}/sportyfi/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data)); // persist user
        setAccessToken(token);
      } catch (err) {
        console.error("Fetch user failed:", err);
        localStorage.clear();
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  /**
   * Sign up
   */
  const signUp = async (email: string, password: string, userType: string) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/sportyfi/auth/signup`, {
        email,
        password,
        userType,
      });

      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });

      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error?.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign in
   */
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/sportyfi/auth/signin`, {
        email,
        password,
      });

      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user)); // persist user

      setUser(user);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error?.response?.data?.error || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Google login
   */
  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      try {
        const res = await axios.post(`${API_BASE_URL}/sportyfi/auth/google`, {
          code: codeResponse.code,
        });

        const { accessToken, refreshToken, user } = res.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user)); // persist user

        setUser(user);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);

        toast({
          title: "Signed in with Google",
          description: `Welcome ${user.email}`,
        });

        navigate("/");
      } catch (err) {
        console.error("Google login failed:", err);
      }
    },
    onError: (err) => console.error("Google Login Error:", err),
  });

  /**
   * Apple login (stub)
   */
  const signInWithApple = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/sportyfi/auth/apple`);
      console.log(res.data);
    } catch (err) {
      console.error("Apple login not implemented yet", err);
    }
  };

  /**
   * Phone login + OTP (stub)
   */
  const signInWithPhone = async (phone: string) => {
    try {
      await axios.post(`${API_BASE_URL}/sportyfi/auth/phone`, { phone });
      toast({
        title: "OTP Sent",
        description: "Check your phone for the verification code.",
      });
    } catch (err) {
      console.error("Phone login failed", err);
    }
  };

  const verifyOtp = async (phone: string, token: string) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/sportyfi/auth/verify-otp`, {
        phone,
        token,
      });
      const { accessToken, refreshToken, user } = res.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user)); // persist user

      setUser(user);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);

      toast({
        title: "Phone verified",
        description: "You are now signed in.",
      });
    } catch (err) {
      console.error("OTP verification failed", err);
    }
  };

  /**
   * Sign out
   */
  const signOut = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);

    toast({
      title: "Signed out",
      description: "You have been signed out.",
    });

    navigate("/");
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedAccessToken = localStorage.getItem("accessToken");
    const savedRefreshToken = localStorage.getItem("refreshToken");

    if (savedUser && savedAccessToken) {
      setUser(JSON.parse(savedUser));
      setAccessToken(savedAccessToken);
      setRefreshToken(savedRefreshToken);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        signUp,
        signIn,
        signInWithGoogle: googleLogin,
        signInWithApple,
        signInWithPhone,
        verifyOtp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
