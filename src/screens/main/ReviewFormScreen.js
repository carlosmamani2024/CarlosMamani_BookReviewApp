import React, { useState } from 'react';
import { View, StyleSheet, Alert, ImageBackground } from 'react-native';
import { Text, Input, Button } from '@rneui/themed';
import { db, auth } from '../../config/firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { Rating } from 'react-native-ratings';

export default function ReviewFormScreen({ route, navigation }) {
  const { bookId, bookTitle } = route.params;
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('No autenticado', 'Debes iniciar sesión para enviar una reseña.');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Campo vacío', 'Por favor escribe un comentario.');
      return;
    }

    if (rating < 1) {
      Alert.alert('Calificación requerida', 'Por favor elige una calificación con estrellas.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        bookId,
        bookTitle,
        userId: user.uid,
        comment: comment.trim(),
        rating,
        createdAt: Timestamp.now(),
      });
      Alert.alert('¡Gracias!', 'Tu reseña ha sido enviada.');
      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar reseña:', error);
      Alert.alert('Error', 'No se pudo enviar tu reseña. Inténtalo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/cuadricula2.png")}
      style={{ flex: 1 }}
      resizeMode="repeat"
    >
      <View style={styles.container}>
        <Text h4 style={styles.title}>Escribe tu reseña</Text>
        <Rating
          count={5}
          startingValue={rating}
          size={30}
          showRating={false}
          onFinishRating={value => setRating(Math.round(value))}
        />
        <Text style={{ textAlign: 'center', marginBottom: 15 }}>
          {rating > 0 ? `Calificación: ${rating} estrella${rating > 1 ? 's' : ''}` : 'Selecciona tu calificación'}
        </Text>
        <Input
          placeholder="¿Qué opinas del libro?"
          multiline
          value={comment}
          onChangeText={setComment}
          autoCorrect={true}
          keyboardType="default"
        />
        <Button
          title="Enviar Reseña"
          loading={loading}
          disabled={loading || !comment.trim() || rating < 1}
          onPress={handleSubmit}
          buttonStyle={{ backgroundColor: '#800000' }}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
});
