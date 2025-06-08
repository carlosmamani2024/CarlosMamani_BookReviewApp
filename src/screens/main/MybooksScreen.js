import React, { useEffect, useState, useCallback } from 'react';
import {View,StyleSheet,FlatList,ActivityIndicator,TouchableOpacity,Image,Alert,Dimensions,ImageBackground,} from 'react-native';
import { Text, Card, Button } from '@rneui/themed';
import { auth, db } from '../../config/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const cardSize = (screenWidth - 60) / 2;

export default function MyBooksScreen({ navigation }) {
  const user = auth.currentUser;
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteId, setShowDeleteId] = useState(null);

  const fetchMyBooks = async () => {
    setLoading(true);
    try {
      if (!user) return;
      const q = query(collection(db, 'userBooks'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyBooks(books);
    } catch (error) {
      console.error('Error obteniendo libros:', error);
      Alert.alert('Error', 'No se pudieron cargar tus libros.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchMyBooks();
      }
      return () => setMyBooks([]);
    }, [user])
  );

  const handleRemoveBook = async (bookId) => {
    Alert.alert(
      "Eliminar libro",
      "¿Estás seguro que quieres eliminar este libro de tu biblioteca?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(bookId);
              await deleteDoc(doc(db, 'userBooks', bookId));
              setMyBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
              setShowDeleteId(null);
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el libro.');
              console.error(error);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>No has iniciado sesión.</Text>
        <Button
          title="Iniciar Sesión"
          containerStyle={{ marginTop: 10 }}
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    );
  }

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;
  }

  if (myBooks.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No has agregado libros a tu biblioteca.</Text>
      </View>
    );
  }

  const renderBookItem = ({ item: book }) => {
    const isDeleteVisible = showDeleteId === book.id;

    return (
      <View style={styles.gridItem}>
        <Card containerStyle={styles.card}>
          {isDeleteVisible && (
            <TouchableOpacity
              style={styles.deleteIcon}
              onPress={() => handleRemoveBook(book.id)}
              disabled={deletingId === book.id}
            >
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => {
              setShowDeleteId(null);
              navigation.navigate('Library', {
                screen: 'BookDetail',
                params: { book, fromMyBooks: true },
              });
            }}
            onLongPress={() => setShowDeleteId(book.id)}
            style={styles.cardContent}
          >
            {book.imageLinks?.thumbnail && (
              <Image
                source={{ uri: book.imageLinks.thumbnail }}
                style={styles.image}
                resizeMode="cover"
              />
            )}
            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
              {book.title}
            </Text>
            <Text style={styles.author} numberOfLines={1} ellipsizeMode="tail">
              {book.authors?.join(', ')}
            </Text>
          </TouchableOpacity>
        </Card>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require("../../../assets/cuadricula.png")}
      style={{ flex: 1 }}
      resizeMode="repeat"
    >
      {showDeleteId === null && (
        <Text style={styles.notice}>
          Mantén presionado un libro para<Text style={{ fontWeight: 'bold' }}> Eliminar de tu Biblioteca</Text>
        </Text>
      )}

      <FlatList
        data={myBooks}
        keyExtractor={(item) => item.id}
        renderItem={renderBookItem}
        numColumns={2}
        extraData={myBooks}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gridItem: {
    flex: 1,
    margin: 4,
  },
  notice: {
    textAlign: 'center',
    color: 'gray',
    fontSize: 12,
    marginBottom: 8,
  },
  card: {
    width: cardSize,
    height: cardSize * 1.4,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },
  image: {
    width: 100,
    height: 140,
    borderRadius: 5,
    marginBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
    maxWidth: '100%',
  },
  author: {
    fontStyle: 'italic',
    textAlign: 'center',
    color: 'gray',
    fontSize: 11,
    maxWidth: '100%',
  },
  deleteIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
    backgroundColor: '#eee',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  deleteText: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
  },
});
