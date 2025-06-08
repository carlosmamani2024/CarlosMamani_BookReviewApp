import React, { useState } from 'react';
import { View, StyleSheet, Alert, ImageBackground } from 'react-native';
import { Text, Input, Button } from '@rneui/themed';
import { db } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Rating } from 'react-native-ratings';

export default function EditReviewScreen({ route, navigation }) {
  const { review } = route.params;
  const [comment, setComment] = useState(review.comment?.trim() || '');
  const [rating, setRating] = useState(review.rating || 3);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!comment.trim()) {
      Alert.alert('Campo vacío', 'Por favor escribe un comentario.');
      return;
    }

    if (!review.id) {
      Alert.alert('Error', 'No se encontró el identificador de la reseña.');
      return;
    }

    setLoading(true);
    try {
      const reviewRef = doc(db, 'reviews', review.id);
      await updateDoc(reviewRef, {
        comment: comment.trim(),
        rating,
      });
      Alert.alert('¡Listo!', 'Tu reseña ha sido actualizada.');
      navigation.goBack();
    } catch (error) {
      console.error('Error actualizando reseña:', error);
      Alert.alert('Error', 'No se pudo actualizar la reseña.');
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
        <Text h4 style={styles.title}>Editar reseña</Text>

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
          title="Actualizar Reseña"
          loading={loading}
          disabled={loading || !comment.trim()}
          onPress={handleUpdate}
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
