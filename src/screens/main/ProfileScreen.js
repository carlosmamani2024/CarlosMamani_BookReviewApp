import React, { useEffect, useState } from 'react';
import {View,StyleSheet,ScrollView,ActivityIndicator,ImageBackground,RefreshControl,} from 'react-native';
import { Text, Button, Card } from '@rneui/themed';
import { auth, db } from '../../config/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Rating } from 'react-native-ratings';

export default function ProfileScreen({ navigation }) {
  const user = auth.currentUser;
  const [myBooks, setMyBooks] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserInfo = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserInfo(docSnap.data());
      } else {
        console.warn('No se encontró el perfil del usuario.');
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    }
  };

  const fetchMyBooks = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'userBooks'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyBooks(books);
    } catch (error) {
      console.error('Error al obtener libros:', error);
    }
  };

  const fetchMyReviews = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'reviews'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyReviews(reviews);
    } catch (error) {
      console.error('Error al obtener reseñas:', error);
    }
  };

  const getAverageRating = () => {
    if (myReviews.length === 0) return 0;
    const total = myReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    return total / myReviews.length;
  };

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    await Promise.all([fetchUserInfo(), fetchMyBooks(), fetchMyReviews()]);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;

    const unsubscribe = navigation.addListener('focus', loadData);

    loadData();

    return unsubscribe;
  }, [navigation, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>No has iniciado sesión.</Text>
        <Button title="Iniciar sesión" onPress={() => navigation.navigate('Login')} />
      </View>
    );
  }

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;
  }

  const averageRating = getAverageRating();
  const averageRatingDisplay = myReviews.length === 0 ? 'N/A' : averageRating.toFixed(1);
  const fullName = userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : user.email;

  return (
    <ImageBackground
      source={require('../../../assets/cuadricula.png')}
      style={{ flex: 1 }}
      resizeMode="repeat"
    >
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text h4>👤 Perfil de {fullName}</Text>

        <Text style={styles.quote}>
          "Un lector vive mil vidas antes de morir. El que nunca lee vive solo una."
        </Text>

        <Card containerStyle={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Estadísticas de Lectura</Text>
          <Text>Libros en biblioteca: {myBooks.length}</Text>
          <Text>Reseñas escritas: {myReviews.length}</Text>
          <Text>Promedio de rating: {averageRatingDisplay} ⭐️</Text>
        </Card>

        <Text h4 style={{ marginTop: 20 }}>
          Mi Biblioteca
        </Text>
        {myBooks.length === 0 ? (
          <Text>Aún no has agregado libros a tu biblioteca.</Text>
        ) : (
          myBooks.map((book) => (
            <Card key={book.id || book.title}>
              <Text style={{ fontWeight: 'bold' }}>Libro:</Text>
              <Text>{book.title}</Text>
            </Card>
          ))
        )}

        <Text h4 style={{ marginTop: 20 }}>
          Mis Reseñas
        </Text>
        {myReviews.length === 0 ? (
          <Text>Aún no has escrito reseñas.</Text>
        ) : (
          [...myReviews]
            .sort((a, b) => b.rating - a.rating)
            .map((review) => (
              <Card key={review.id}>
                <Text style={{ fontWeight: 'bold' }}>Libro:</Text>
                <Text>{review.bookTitle || 'Título no disponible'}</Text>

                <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Comentario:</Text>
                <Text>{review.comment}</Text>

                <Rating
                  count={5}
                  startingValue={Number(review.rating) || 0}
                  imageSize={20}
                  showRating={false}
                  readonly
                />

                <Text style={styles.reviewMeta}>
                  Fecha:{' '}
                  {review.createdAt?.toDate?.()?.toLocaleDateString() || 'Sin fecha'}
                </Text>
              </Card>
            ))
        )}

        <Button
          title="Cerrar sesión"
          containerStyle={{ marginTop: 30, alignSelf: 'center', width: '60%' }}
          onPress={() => auth.signOut().then(() => navigation.replace('Login'))}
          buttonStyle={{ backgroundColor: '#800000' }}
        />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewMeta: {
    marginTop: 5,
    fontSize: 12,
    color: 'gray',
  },
  quote: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
    color: '#555',
  },
  statsCard: {
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 10,
  },
  statsTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
});
