import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LibraryScreen from '../screens/main/LibraryScreen';
import BookDetailScreen from '../screens/main/BookDetailScreen';
import ReviewFormScreen from '../screens/main/ReviewFormScreen';
import EditReviewScreen from '../screens/main/EditReviewScreen';

const Stack = createNativeStackNavigator();

export default function LibraryNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="LibraryHome"
        component={LibraryScreen}
        options={{ title: 'Biblioteca' }}
      />
      <Stack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={{ title: 'Detalles del libro' }}
      />
      <Stack.Screen
        name="ReviewForm"
        component={ReviewFormScreen}
        options={{ title: 'Nueva Reseña' }}
      />
      <Stack.Screen
        name="EditReview"
        component={EditReviewScreen}
        options={{ title: 'Editar Reseña' }}
      />
    </Stack.Navigator>
  );
}
