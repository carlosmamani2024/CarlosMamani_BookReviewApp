import React, { useEffect, useState } from 'react';
import {View,StyleSheet,Image,ScrollView,ActivityIndicator,Alert,ImageBackground,} from 'react-native';
import { Text, Button, Card } from '@rneui/themed';
import { db, auth } from '../../config/firebase';
import {collection,query,where,getDocs,orderBy,addDoc,deleteDoc,doc} from 'firebase/firestore';
import { Rating } from 'react-native-ratings';

export default function BookDetailScreen({ route, navigation }) {
  const { book, fromMyBooks } = route.params;
  const currentUser = auth.currentUser;
  const realBookId = fromMyBooks ? book.bookId : book.id;

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [adding, setAdding] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchReviews();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const q = query(
        collection(db, 'reviews'),
        where('bookId', '==', realBookId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(data);

      if (data.length > 0) {
        const total = data.reduce((sum, r) => sum + (r.rating || 0), 0);
        setAverageRating(parseFloat((total / data.length).toFixed(1)));
      } else {
        setAverageRating(0);
      }
    } catch (error) {
      console.error('Error al obtener reseñas:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleAddToMyBooks = async () => {
    if (!currentUser) {
      Alert.alert('No autenticado', 'Debes iniciar sesión para agregar libros a tu biblioteca.');
      return;
    }

    setAdding(true);
    try {
      const q = query(
        collection(db, 'userBooks'),
        where('userId', '==', currentUser.uid),
        where('bookId', '==', realBookId)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        Alert.alert('Ya agregado', 'Este libro ya está en tu biblioteca.');
        setAdding(false);
        return;
      }

      await addDoc(collection(db, 'userBooks'), {
        userId: currentUser.uid,
        bookId: realBookId,
        bookTitle: book.title,
        authors: book.authors || [],
        imageLinks: book.imageLinks || {},
        description: book.description || '',
        categories: book.categories || [],
        publisher: book.publisher || '',
        publishedDate: book.publishedDate || '',
        addedAt: new Date()
      });

      Alert.alert('¡Listo!', 'Libro agregado a tu biblioteca.');
    } catch (error) {
      console.error('Error agregando libro:', error);
      Alert.alert('Error', 'No se pudo agregar el libro. Inténtalo más tarde.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteReview = (reviewId) => {
    Alert.alert(
      'Eliminar Reseña',
      '¿Estás seguro que deseas eliminar esta reseña?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'reviews', reviewId));
              Alert.alert('¡Listo!', 'Reseña eliminada.');
              fetchReviews();
            } catch (error) {
              console.error('Error eliminando reseña:', error);
              Alert.alert('Error', 'No se pudo eliminar la reseña.');
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <ImageBackground
      source={require("../../../assets/cuadricula2.png")}
      style={{ flex: 1 }}
      resizeMode="repeat"
    >
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.container}>
          <Image source={{ uri: book.imageLinks?.thumbnail }} style={styles.image} />
          <Text h4 style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>{book.authors?.join(', ')}</Text>
          <Text style={styles.description}>{book.description || 'Sin descripción.'}</Text>

          {!loadingReviews && (
          <View style={{ alignItems: 'center', backgroundColor: 'white', padding: 10, borderRadius: 5 }}>
            <Text style={styles.labelBlack}>Calificación promedio:</Text>
            <Rating readonly startingValue={Math.round(averageRating)} imageSize={20} />
            <Text style={styles.labelBlack}>{Math.round(averageRating)} estrellas</Text>
          </View>
          )}

          <Button
            title="Escribir Reseña"
            onPress={() =>
              navigation.navigate('ReviewForm', {
                bookId: realBookId,
                bookTitle: book.title,
              })
            }
            buttonStyle={{ backgroundColor: '#800000' }}
            containerStyle={{ marginTop: 20 }}
            disabled={adding}
          />

            {fromMyBooks && (
              <Button
                title="Volver a Mi Biblioteca"
                type="outline"
                containerStyle={{ marginTop: 15 }}
                onPress={() => navigation.navigate('MyBooks')}
                buttonStyle={{ borderColor: '#800000', backgroundColor: '#FFFFFF' }}
                titleStyle={{ color: '#800000' }}
              />
            )}


          <Text h4 style={[styles.title, { marginTop: 30, alignSelf: 'flex-start' }]}>Reseñas</Text>

          {loadingReviews ? (
            <ActivityIndicator size="large" style={{ marginTop: 20 }} />
          ) : reviews.length === 0 ? (
            <Text style={styles.label}>Aún no hay reseñas para este libro.</Text>
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <Rating readonly startingValue={review.rating} imageSize={20} />
                <Text style={{ fontSize: 16, marginTop: 10 }}>{review.comment}</Text>
                <Text style={styles.reviewMeta}>
                  Fecha: {review.createdAt && review.createdAt.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Sin fecha'}
                </Text>
                {currentUser && review.userId === currentUser.uid && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                    <Button
                      title="Editar"
                      type="outline"
                      onPress={() => navigation.navigate('EditReview', { review })}
                      containerStyle={{ flex: 1, marginRight: 10 }}
                      buttonStyle={{ borderColor: '#008015FF', backgroundColor: '#CEFFD6FF' }}
                      titleStyle={{ color: '#008015FF' }}
                    />
                    <Button
                      title="Eliminar"
                      type="outline"
                      buttonStyle={{ borderColor: '#FF0202FF', backgroundColor: '#FFBCBCFF' }}
                      titleStyle={{ color: '#FF0000FF' }}
                      onPress={() => handleDeleteReview(review.id)}
                      containerStyle={{ flex: 1 }}

                    />
                  </View>
                )}
              </Card>
            ))
          )}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  
  container: {
    padding: 20
  },
  image: {
    width: 140,
    height: 200,
    alignSelf: 'center',
    borderRadius: 6,
    marginBottom: 20
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 4
  },
  author: {
    fontStyle: 'italic',
    marginBottom: 15,
    color: '#ddd',
    textAlign: 'center'
  },
  description: {
    textAlign: 'justify',
    color: 'white'
  },
  reviewMeta: {
    marginTop: 5,
    fontSize: 12,
    color: 'gray'
  },
  label: {
    color: '#eee',
    textAlign: 'center'
  }
});
