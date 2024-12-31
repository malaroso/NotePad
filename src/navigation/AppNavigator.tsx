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
import { TodoListScreen } from '../screens/TodoListScreen';
import { CategoryNotesScreen } from '../screens/CategoryNotesScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { FAQScreen } from '../screens/FAQScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { authState } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
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
            <Stack.Screen 
              name="TodoList" 
              component={TodoListScreen}
              options={{
                headerShown: false
              }}
            />
            <Stack.Screen name="CategoryNotes" component={CategoryNotesScreen} />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen} 
            />
            <Stack.Screen 
              name="ChangePassword" 
              component={ChangePasswordScreen} 
            />
            <Stack.Screen 
              name="FAQ" 
              component={FAQScreen} 
            />
            <Stack.Screen 
              name="About" 
              component={AboutScreen} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 