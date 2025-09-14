// Simulated backend authentication
const USERS_KEY = 'shophub_users';
const TOKEN_KEY = 'shophub_token';
const CURRENT_USER_KEY = 'shophub_current_user';

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  password: string;
}

// Get stored users
const getStoredUsers = (): StoredUser[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// Save users to localStorage
const saveUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Generate JWT token (simplified for demo)
const generateToken = (userId: string): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    userId, 
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  }));
  const signature = btoa(`signature_${userId}_${Date.now()}`);
  return `${header}.${payload}.${signature}`;
};

// Verify token
export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp < Date.now()) return null;
    
    return { userId: payload.userId };
  } catch {
    return null;
  }
};

// Login user
export const loginUser = async (email: string, password: string): Promise<{ user: StoredUser; token: string } | null> => {
  const users = getStoredUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const token = generateToken(user.id);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name
    }));
    return { user, token };
  }
  
  return null;
};

// Register user
export const registerUser = async (name: string, email: string, password: string): Promise<{ user: StoredUser; token: string } | null> => {
  const users = getStoredUsers();
  
  if (users.some(u => u.email === email)) {
    return null; // User already exists
  }
  
  const newUser: StoredUser = {
    id: `user_${Date.now()}`,
    email,
    name,
    password
  };
  
  users.push(newUser);
  saveUsers(users);
  
  const token = generateToken(newUser.id);
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
    id: newUser.id,
    email: newUser.email,
    name: newUser.name
  }));
  
  return { user: newUser, token };
};

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  const token = localStorage.getItem(TOKEN_KEY);
  
  if (user && token && verifyToken(token)) {
    return { user: JSON.parse(user), token };
  }
  
  return null;
};

// Logout
export const logoutUser = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
};