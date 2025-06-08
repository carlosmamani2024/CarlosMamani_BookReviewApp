import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MyBooksScreen from '../screens/main/MybooksScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import LibraryNavigator from './LibraryNavigator';
import { Icon } from '@rneui/themed';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconMap = {
            Library: 'book',
            MyBooks: 'bookmark',
            Profile: 'person',
          };
          const iconName = iconMap[route.name] || 'help-outline';

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#800000',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff0f5',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Library"
        component={LibraryNavigator}
        options={{ title: 'Biblioteca', headerShown: false }}
      />
      <Tab.Screen
        name="MyBooks"
        component={MyBooksScreen}
        options={{ title: 'Mi Biblioteca', headerShown: true }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Perfil', headerShown: true }}
      />
    </Tab.Navigator>
  );
}
