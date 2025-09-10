// import { createContext, useContext, useEffect, useState } from 'react';
// // import { Session, User } from '@supabase/supabase-js';
// import { supabase } from '@/integrations/supabase/client';
// import { useNavigate } from 'react-router-dom';
// import { toast } from '@/hooks/use-toast';
// import axios from 'axios';

// export type User = {
//   id: string;
//   name: string;
//   email: string;
//   userType: string;
//   lastLogin: string;
//   emailVerified: boolean;
//   createdAt: string;
// };

// type AuthContextType = {
//   user: User | null;
//   // session: Session | null;
//   isLoading: boolean;
//   signUp: (email: string, password: string) => Promise<void>;
//   signIn: (email: string, password: string) => Promise<void>;
//   // signInWithGoogle: () => Promise<void>;
//   // signInWithApple: () => Promise<void>;
//   // signInWithPhone: (phone: string) => Promise<void>;
//   // verifyOtp: (phone: string, token: string) => Promise<void>;
//   signOut: () => Promise<void>;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   // const [session, setSession] = useState<Session | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   // useEffect(() => {
//   //   const getSession = async () => {
//   //     try {
//   //       const { data, error } = await supabase.auth.getSession();

//   //       if (error) {
//   //         console.error("Error getting session:", error);
//   //         toast({
//   //           title: "Authentication Error",
//   //           description: "There was a problem loading your session. Please try again.",
//   //           variant: "destructive",
//   //         });
//   //         setIsLoading(false);
//   //         return;
//   //       }

//   //       // console.log("Session data retrieved:", data.session ? "Session exists" : "No session");
//   //       setSession(data.session);
//   //       setUser(data.session?.user || null);
//   //     } catch (err) {
//   //       console.error("Unexpected error in getSession:", err);
//   //     } finally {
//   //       setIsLoading(false);
//   //     }
//   //   };

//   //   // getSession();

//   //   const { data: { subscription } } = supabase.auth.onAuthStateChange(
//   //     (event, currentSession) => {
//   //       // console.log("Auth state changed:", event, currentSession?.user?.email);
//   //       setSession(currentSession);
//   //       setUser(currentSession?.user || null);
//   //     }
//   //   );

//   //   return () => {
//   //     // subscription.unsubscribe();
//   //   };
//   // }, []);

//   useEffect(() => {
//     const token = localStorage.getItem('accessToken');
//     if (token) {
//       // You can fetch user info using token, or decode it
//       const savedUser = { email: 'user@example.com' }; // Replace with actual logic
//       setUser(savedUser);
//     }
//     setIsLoading(false);
//   }, []);

//   const signUp = async (email: string, password: string) => {
//     setIsLoading(true);

//     try {
//       const { data, error } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//           emailRedirectTo: `${window.location.origin}/auth/callback`,
//         }
//       });

//       if (error) {
//         console.error("Sign up error:", error);
//         toast({
//           title: "Sign Up Failed",
//           description: error.message,
//           variant: "destructive",
//         });
//         throw error;
//       }

//       console.log("Sign up successful:", data);

//       if (data.user && !data.session) {
//         toast({
//           title: "Account created successfully",
//           description: "Please check your email for confirmation.",
//         });
//       } else if (data.session) {
//         toast({
//           title: "Account created successfully",
//           description: "You have been signed in automatically.",
//         });
//         navigate('/');
//       }
//     } catch (error) {
//       console.error("Sign up error:", error);
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const signIn = async (email: string, password: string) => {
//     setIsLoading(true);

//     try {
//       // const { data, error } = await supabase.auth.signInWithPassword({
//       //   email,
//       //   password,
//       // });

//       // if (error) {
//       //   console.error("Sign in error:", error);
//       //   toast({
//       //     title: "Sign In Failed",
//       //     description: error.message,
//       //     variant: "destructive",
//       //   });
//       //   throw error;
//       // }

//       // try {
//         const response = await axios.post('http://localhost:8080/sportyfi/auth/signin', {
//           email,
//           password
//         });

//         const { accessToken, refreshToken, user } = response.data;

//         const data = response.data;
//         console.log(data);
//         // Store tokens if needed
//         localStorage.setItem('accessToken', accessToken);
//         localStorage.setItem('refreshToken', refreshToken);
//         // localStorage.setItem('userType', user.email);

//         // callback or redirect
//         // navigate('/food-order/');
//         // onLoginSuccess && onLoginSuccess(user);
//       // } catch (err) {
//       //   console.error(err);
//       //   setError('Invalid credentials. Please try again.');
//       // }

//       console.log("Sign in successful:", user?.email);

//       toast({
//         title: "Welcome back!",
//         description: "You've successfully signed in.",
//       });

//       navigate('/');
//     } catch (error) {
//       console.error("Sign in error:", error);
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // const signInWithGoogle = async () => {
//   //   setIsLoading(true);

//   //   try {
//   //     console.log("Starting Google sign in...");
//   //     const { data, error } = await supabase.auth.signInWithOAuth({
//   //       provider: 'google',
//   //       options: {
//   //         redirectTo: `${window.location.origin}/auth/callback`,
//   //         queryParams: {
//   //           access_type: 'offline',
//   //           prompt: 'consent',
//   //         }
//   //       },
//   //     });

//   //     if (error) {
//   //       console.error("Google sign in error:", error);
//   //       toast({
//   //         title: "Google Sign In Failed",
//   //         description: error.message,
//   //         variant: "destructive",
//   //       });
//   //       throw error;
//   //     }

//   //     console.log("Google sign in successful:", data);
//   //   } catch (error) {
//   //     console.error("Google sign in error:", error);
//   //     toast({
//   //       title: "Google Sign In Failed",
//   //       description: error instanceof Error ? error.message : "An unexpected error occurred",
//   //       variant: "destructive",
//   //     });
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   // const signInWithApple = async () => {
//   //   setIsLoading(true);

//   //   try {
//   //     const { error } = await supabase.auth.signInWithOAuth({
//   //       provider: 'apple',
//   //       options: {
//   //         redirectTo: `${window.location.origin}/auth/callback`,
//   //       },
//   //     });

//   //     if (error) {
//   //       toast({
//   //         title: "Apple Sign In Failed",
//   //         description: error.message,
//   //         variant: "destructive",
//   //       });
//   //       throw error;
//   //     }
//   //   } catch (error) {
//   //     console.error("Apple sign in error:", error);
//   //     throw error;
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   // const signInWithPhone = async (phone: string) => {
//   //   setIsLoading(true);

//   //   try {
//   //     const { error } = await supabase.auth.signInWithOtp({
//   //       phone,
//   //     });

//   //     if (error) {
//   //       toast({
//   //         title: "Phone Sign In Failed",
//   //         description: error.message,
//   //         variant: "destructive",
//   //       });
//   //       throw error;
//   //     }

//   //     toast({
//   //       title: "Verification code sent",
//   //       description: "Please check your phone for the verification code.",
//   //     });
//   //   } catch (error) {
//   //     console.error("Phone sign in error:", error);
//   //     throw error;
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   // const verifyOtp = async (phone: string, token: string) => {
//   //   setIsLoading(true);

//   //   try {
//   //     const { error } = await supabase.auth.verifyOtp({
//   //       phone,
//   //       token,
//   //       type: 'sms',
//   //     });

//   //     if (error) {
//   //       toast({
//   //         title: "Verification Failed",
//   //         description: error.message,
//   //         variant: "destructive",
//   //       });
//   //       throw error;
//   //     }

//   //     toast({
//   //       title: "Phone verified successfully",
//   //       description: "You've been signed in.",
//   //     });

//   //     navigate('/');
//   //   } catch (error) {
//   //     console.error("OTP verification error:", error);
//   //     throw error;
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   const signOut = async () => {
//     try {
//       setIsLoading(true);

//       const { error } = await supabase.auth.signOut();

//       if (error) {
//         console.error("Sign out error:", error);
//         toast({
//           title: "Sign Out Failed",
//           description: error.message,
//           variant: "destructive",
//         });
//         throw error;
//       }

//       console.log("Signed out successfully");

//       setUser(null);
//       setSession(null);

//       toast({
//         title: "Signed out",
//         description: "You've been successfully signed out.",
//       });

//       navigate('/');
//     } catch (error) {
//       console.error("Sign out error:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         session,
//         isLoading,
//         signUp,
//         signIn,
//         // signInWithGoogle,
//         // signInWithApple,
//         // signInWithPhone,
//         // verifyOtp,
//         signOut,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   console.log(context);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

///////////////////////////////////////////////////////////////////////////////////////////////
// -----------working ----------------

// import React, { createContext, useContext, useEffect, useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { toast } from '@/components/ui/use-toast'; // adjust this based on your project
// // import { Session, User } from '@supabase/supabase-js';
// import { supabase } from '@/integrations/supabase/client';
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
//   isLoading: boolean;
//   signUp: (email: string, password: string, userType: string) => Promise<void>;
//   signIn: (email: string, password: string) => Promise<void>;
//   signInWithGoogle: () => Promise<void>;
//   // signInWithApple: () => Promise<void>;
//   // signInWithPhone: (phone: string) => Promise<void>;
//   // verifyOtp: (phone: string, token: string) => Promise<void>;
//   signOut: () => void;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // const loadUserFromStorage = async () => {
//     //   const token = localStorage.getItem('accessToken');

//     //   if (!token) {
//     //     setIsLoading(false);
//     //     return;
//     //   }
//     //   try {
//     //     const response = await axios.get<User>('http://localhost:8080/sportyfi/auth/me', {
//     //       headers: {
//     //         Authorization: `Bearer ${token}`,
//     //       },
//     //     });

//     //     setUser(response.data);
//     //   } catch (error) {
//     //     console.error('Error fetching user:', error);
//     //     localStorage.removeItem('accessToken');
//     //     localStorage.removeItem('refreshToken');
//     //   } finally {
//     //     setIsLoading(false);
//     //   }
//     // };

//     // const loadUserFromStorage = async () => {
//     //   const token = localStorage.getItem('accessToken');
//     //   const refreshToken = localStorage.getItem('refreshToken');

//     //   if (!token) {
//     //     setIsLoading(false);
//     //     return;
//     //   }

//     //   try {
//     //     // Try to fetch user with current token
//     //     const response = await axios.get<User>('http://localhost:8080/sportyfi/auth/me', {
//     //       headers: {
//     //         Authorization: `Bearer ${token}`,
//     //       },
//     //     });
//     //     setUser(response.data);

//     //   } catch (error: any) {
//     //     // If token expired, try refreshing
//     //     if (error.response?.status === 401 && refreshToken) {
//     //       try {
//     //         const refreshResponse = await axios.post('http://localhost:8080/sportyfi/auth/refresh', {
//     //           refreshToken,
//     //         });

//     //         const { accessToken: newToken } = refreshResponse.data;
//     //         localStorage.setItem('accessToken', newToken);
//     //         console.log(newToken);
//     //         // Retry /auth/me with new token
//     //         const retry = await axios.get<User>('http://localhost:8080/sportyfi/auth/me', {
//     //           headers: {
//     //             Authorization: `Bearer ${newToken}`,
//     //           },
//     //         });

//     //         setUser(retry.data);
//     //       } catch (refreshError) {
//     //         console.error("Refresh token failed:", refreshError);
//     //         localStorage.clear();
//     //       }
//     //     } else {
//     //       console.error('Error fetching user:', error);
//     //       localStorage.clear();
//     //     }
//     //   } finally {
//     //     setIsLoading(false);
//     //   }
//     // };

//     const loadUserFromStorage = async () => {
//       const token = localStorage.getItem('accessToken');
//       const refreshToken = localStorage.getItem('refreshToken');

//       if (!token && refreshToken) {
//         console.log(refreshToken)
//         // try to refresh access token
//         try {
//           const res = await axios.post(`${API_BASE_URL}/sportyfi/auth/refresh`, {
//             refreshToken
//           });

//           const { accessToken: newToken } = res.data;
//           console.log(newToken)
//           localStorage.setItem('accessToken', newToken);

//           // Retry fetching user
//           const userRes = await axios.get<User>(`${API_BASE_URL}/sportyfi/auth/me`, {
//             headers: {
//               Authorization: `Bearer ${newToken}`,
//             },
//           });
//           setUser(userRes.data);
//         } catch (err) {
//           console.error("Refresh failed, logging out");
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

//       // normal flow
//       try {
//         const response = await axios.get<User>(`${API_BASE_URL}/sportyfi/auth/me`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setUser(response.data);
//       } catch (err) {
//         localStorage.clear();
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadUserFromStorage();
//   }, []);

//   const signUp = async (email: string, password: string, userType: string) => {
//     setIsLoading(true);
//     const formData = {
//       email,
//       password,
//       userType,
//     };

//     try {
//       // const response = await axios.post('http://localhost:8080/sportyfi/auth/signup', {
//       //   email,
//       //   password,
//       // });

//       const res = await axios.post(`${API_BASE_URL}/sportyfi/auth/signup`, formData);

//       toast({
//         title: 'Account created',
//         description: 'Please check your email to verify your account.',
//       });

//       navigate('/auth');
//     } catch (error: any) {
//       toast({
//         title: 'Sign Up Failed',
//         description: error?.response?.data?.message || 'Something went wrong.',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const signIn = async (email: string, password: string) => {
//     setIsLoading(true);
//     try {
//       const response = await axios.post(`${API_BASE_URL}/sportyfi/auth/signin`, {
//         email,
//         password,
//       });

//       const { accessToken, refreshToken, user } = response.data;

//       localStorage.setItem('accessToken', accessToken);
//       localStorage.setItem('refreshToken', refreshToken);

//       setUser(user);

//       toast({
//         title: 'Welcome back!',
//         description: 'You have been signed in successfully.',
//       });

//       navigate('/');
//     } catch (error: any) {
//       console.log(error)
//       toast({
//         title: 'Sign In Failed',
//         description: error?.response?.data?.error || 'Invalid credentials',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // const signInWithGoogle = async () => {
//   //   const login = useGoogleLogin({
//   //     onSuccess: async (tokenResponse) => {
//   //       try {
//   //         // Send token to backend
//   //         const res = await axios.post("http://localhost:8080/auth/google", {
//   //           idToken: tokenResponse.access_token, // or tokenResponse.access_token for userinfo API
//   //         });

//   //         const { accessToken, refreshToken, user } = res.data;

//   //         // Save to context/localStorage/etc.
//   //         localStorage.setItem("accessToken", accessToken);
//   //         localStorage.setItem("refreshToken", refreshToken);
//   //         setUser(user);

//   //       } catch (err) {
//   //         console.error("Login failed:", err);
//   //       }
//   //     },
//   //     onError: (error) => {
//   //       console.error("Google Login Error:", error);
//   //     },
//   //     flow: "implicit", // or "auth-code" (then you'll need a backend redirect handler)
//   //   });

//   //   login(); // call the login flow
//   // };

//   // const signInWithGoogle = async () => {
//   //   setIsLoading(true);

//   //   try {
//   //     console.log("Starting Google sign in...");
//   //     const { data, error } = await supabase.auth.signInWithOAuth({
//   //       provider: 'google',
//   //       options: {
//   //         redirectTo: `${window.location.origin}/auth/callback`,
//   //         queryParams: {
//   //           access_type: 'offline',
//   //           prompt: 'consent',
//   //         }
//   //       },
//   //     });

//   //     if (error) {
//   //       console.error("Google sign in error:", error);
//   //       toast({
//   //         title: "Google Sign In Failed",
//   //         description: error.message,
//   //         variant: "destructive",
//   //       });
//   //       throw error;
//   //     }
//   //     console.log("Google sign in successful:", data);
//   //   } catch (error) {
//   //     console.error("Google sign in error:", error);
//   //     toast({
//   //       title: "Google Sign In Failed",
//   //       description: error instanceof Error ? error.message : "An unexpected error occurred",
//   //       variant: "destructive",
//   //     });
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   const login = useGoogleLogin({
//     onSuccess: async (tokenResponse) => {
//       const res = await axios.post(`${API_BASE_URL}/auth/google`, {
//         idToken: tokenResponse.access_token,
//       });

//       const { accessToken, refreshToken, user } = res.data;
//       localStorage.setItem("accessToken", accessToken);
//       localStorage.setItem("refreshToken", refreshToken);
//       console.log("User:", user);
//     },
//     onError: (err) => console.error(err),
//     flow: "implicit",
//   });


//   const signOut = () => {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     setUser(null);

//     toast({
//       title: 'Signed out',
//       description: 'You have been signed out.',
//     });

//     navigate('/');
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isLoading,
//         signUp,
//         signIn,
//         login,
//         // signInWithGoogle: login, 
//         // signInWithApple, signInWithPhone, verifyOtp
//         signOut,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   // console.log(context);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };


//////////////////////////////////////////////////////////////////////////////////////

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
          setAccessToken(res.data);
          // setRefreshToken(refreshToken);
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
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.post(`${API_BASE_URL}/sportyfi/auth/google`, {
          idToken: tokenResponse.access_token,
        });

        const { accessToken, refreshToken, user } = res.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        setUser(user);

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
    flow: "implicit",
  });

  /**
   * Apple login (stub — implement with Apple OAuth flow)
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
   * Phone login + OTP (stub — implement with your backend/SMS service)
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
      setUser(user);
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
    setUser(null);

    toast({
      title: "Signed out",
      description: "You have been signed out.",
    });

    navigate("/");
  };

  useEffect(() => {
    // Load session from localStorage on refresh
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
