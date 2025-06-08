import React, { useEffect, useState, useCallback } from 'react';
import {View,StyleSheet,FlatList,ActivityIndicator,Image,TouchableOpacity,Dimensions,ImageBackground,} from 'react-native';
import { Text, Card, Button } from '@rneui/themed';
import axios from 'axios';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = 'https://reactnd-books-api.udacity.com/books';
const TOKEN = 'your-custom-token';
export default function LibraryScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingBookId, setAddingBookId] = useState(null);
  const [userBooks, setUserBooks] = useState([]);

  const fetchBooks = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: TOKEN },
      });
      setBooks(res.data.books);
    } catch (err) {
      console.error('Error fetching books:', err.message);
      setError('No se pudieron cargar los libros.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBooks = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(collection(db, 'userBooks'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const books = snapshot.docs.map(doc => doc.data().bookId);
      setUserBooks(books);
    } catch (err) {
      console.error('Error fetching user books:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
    fetchUserBooks();
  }, [fetchUserBooks]);

  useFocusEffect(
    useCallback(() => {
      fetchUserBooks();
    }, [fetchUserBooks])
  );

  const addBookToUserLibrary = async (book) => {
    const user = auth.currentUser;
    if (!user) {
      alert('Debes iniciar sesión para agregar libros.');
      return;
    }

    setAddingBookId(book.id);
    try {
      await addDoc(collection(db, 'userBooks'), {
        userId: user.uid,
        bookId: book.id,
        title: book.title,
        authors: book.authors || [],
        description: book.description || '',
        imageLinks: book.imageLinks || {},
        addedAt: new Date(),
      });
      alert('Libro agregado a tu biblioteca');
      setUserBooks(prev => (prev.includes(book.id) ? prev : [...prev, book.id]));
    } catch (err) {
      console.error('Error adding book:', err.message);
      alert('No se pudo agregar el libro.');
    } finally {
      setAddingBookId(null);
    }
  };

  const renderItem = ({ item }) => {
    const isBookInLibrary = userBooks.includes(item.id);
    return (
      <View style={styles.gridItem}>
        <Card containerStyle={styles.card}>
          <TouchableOpacity
            onPress={() => navigation.navigate('BookDetail', { book: item })}
            style={styles.cardContent}
          >
            <Image
              source={{ uri: item.imageLinks?.thumbnail }}
              style={styles.image}
              resizeMode="cover"
            />

            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
              {item.title}
            </Text>
            <Text style={styles.author} numberOfLines={1} ellipsizeMode="tail">
              {item.authors?.join(', ')}
            </Text>

            {!isBookInLibrary && (
              <Button
                title={addingBookId === item.id ? 'Agregando...' : 'Añadir'}
                onPress={() => addBookToUserLibrary(item)}
                disabled={addingBookId === item.id}
                containerStyle={{ marginTop: 6 }}
                size="sm"
                buttonStyle={{ backgroundColor: '#800000' }}
              />
            )}
          </TouchableOpacity>
        </Card>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Cargando libros...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../../assets/cuadricula.png")}
      style={{ flex: 1 }}
      resizeMode="repeat"
    >
      <Text style={styles.notice}>
        Apreta <Text style={{ fontWeight: 'bold' }}>AÑADIR</Text> para integrar a tu biblioteca personal
      </Text>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </ImageBackground>
  );
}

const screenWidth = Dimensions.get('window').width;
const cardSize = (screenWidth - 60) / 2;

const styles = StyleSheet.create({
  gridItem: {
    flex: 1,
    margin: 4,
  },
  card: {
    width: cardSize,
    height: cardSize * 1.7,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
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
  notice: {
    textAlign: 'center',
    color: 'gray',
    fontSize: 12,
    marginBottom: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
