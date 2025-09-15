import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthGuard from '../components/AuthGuard';
import ProfileScreen from './ProfileScreen';

const ProfileWrapper = ({ navigation }) => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Navigate to login when not authenticated and not loading
    if (!isLoading && !isAuthenticated) {
      navigation.navigate('Login', { fromProfile: true });
    }
  }, [isAuthenticated, isLoading, navigation]);

  return (
    <AuthGuard>
      <ProfileScreen navigation={navigation} />
    </AuthGuard>
  );
};

export default ProfileWrapper;