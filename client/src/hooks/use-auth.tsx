import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useToast } from "./use-toast";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  // Fetch current user if session exists
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
    gcTime: 0,
    throwOnError: false,
    enabled: !user,
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: 'include',
        });
        
        if (res.status === 401) {
          return null;
        }
        
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        
        return res.json();
      } catch (err) {
        console.error("Auth query error:", err);
        return null;
      }
    }
  });

  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const res = await apiRequest('POST', '/api/login', { username, password });
      return res.json();
    },
    onSuccess: (userData: User) => {
      setUser(userData);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً ${userData.name}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "فشل تسجيل الدخول",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/logout', {});
      return res.json();
    },
    onSuccess: () => {
      setUser(null);
      toast({
        title: "تم تسجيل الخروج بنجاح",
      });
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "فشل تسجيل الخروج",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync({ username, password });
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  };

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Protect admin routes
  useEffect(() => {
    // Skip if still loading
    if (isLoading) return;
    
    // If path starts with /admin and user is not admin, redirect to login
    if (location.startsWith('/admin')) {
      if (!user) {
        navigate('/login');
      } else if (!isAdmin) {
        toast({
          title: "غير مصرح بالدخول",
          description: "ليس لديك صلاحية للوصول إلى لوحة التحكم",
          variant: "destructive",
        });
        navigate('/');
      }
    }
  }, [location, user, isAdmin, isLoading, navigate, toast]);

  const value = {
    user,
    loading: isLoading,
    error: error as Error,
    login,
    logout,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}