import { API_BASE_URL } from '../../finan-backend/src/config/api';

export const registerUser = async (name: string, email: string, password: string) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Error al registrar');
    }

    return data;
  } catch (error) {
    throw error;
  }
};
