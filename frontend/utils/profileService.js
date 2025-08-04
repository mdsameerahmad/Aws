import api from './api'; // Ensure it imports from the consolidated api.js

export const fetchProfile = async () => {
  try {
    const response = await api.get('/api/auth/me'); // Or whatever your profile endpoint is
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};


export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/api/auth/profile', profileData);
    return response.data; // Ensure your backend returns the updated user data
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const updateAvatar = async (avatarFile) => {
  const formData = new FormData();
  formData.append('avatar', avatarFile);
  
  try {
    const response = await api.post('/api/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating avatar:', error);
    throw error;
  }
};

export const deleteAvatar = async () => {
  try {
    const response = await api.delete('/api/user/avatar');
    return response.data;
  } catch (error) {
    console.error('Error deleting avatar:', error);
    throw error;
  }
};

export const changePassword = async (passwords) => {
  try {
    const response = await api.put('/api/auth/change-password', {
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
      confirmPassword: passwords.confirmPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};