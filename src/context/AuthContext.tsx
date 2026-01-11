import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isAdmin?: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    size: string;
    color: string;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'userId' | 'createdAt'>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'atelier_users';
const CURRENT_USER_KEY = 'atelier_current_user';
const ORDERS_KEY = 'atelier_orders';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      loadOrders(parsedUser.id);
    }
    setIsLoading(false);
  }, []);

  const loadOrders = (userId: string) => {
    const allOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    setOrders(allOrders.filter((order: Order) => order.userId === userId));
  };

  const login = useCallback(async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      loadOrders(userWithoutPassword.id);
      return { success: true };
    }
    
    return { success: false, error: 'Invalid email or password' };
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.some((u: any) => u.email === email)) {
      return { success: false, error: 'Email already exists' };
    }
    
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      password,
      name,
      isAdmin: email === 'admin@atelier.com', // Admin account
    };
    
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setOrders([]);
    localStorage.removeItem(CURRENT_USER_KEY);
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    
    // Update in users list
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...data };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }, [user]);

  const addOrder = useCallback((orderData: Omit<Order, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    
    const newOrder: Order = {
      ...orderData,
      id: `order_${Date.now()}`,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    
    const allOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    allOrders.push(newOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(allOrders));
    setOrders((prev) => [...prev, newOrder]);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        orders,
        addOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
