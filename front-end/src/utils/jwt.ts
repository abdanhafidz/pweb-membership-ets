import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  role: string;
  sub: string;
  user_id: number;
}

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch (error) {
    console.error('Invalid token', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

export const isAdmin = (token: string): boolean => {
  const decoded = decodeToken(token);
  return decoded?.role === 'admin';
};