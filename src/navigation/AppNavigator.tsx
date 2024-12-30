import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AllNotesScreen } from '../screens/AllNotesScreen';
import { NoteDetailScreen } from '../screens/NoteDetailScreen';
import { AddNoteScreen } from '../screens/AddNoteScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { authState } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!authState?.authenticated ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen 
              name="AllNotes" 
              component={AllNotesScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="NoteDetail" 
              component={NoteDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AddNote" 
              component={AddNoteScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 