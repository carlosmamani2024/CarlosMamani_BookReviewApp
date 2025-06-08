import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Image,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { Input, Button, Text, Icon } from 'react-native-elements';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateLoginForm = () => {
    const isEmailValid = /\S+@\S+\.\S+/.test(email);
    const isPasswordValid = password.length > 0;
    return isEmailValid && isPasswordValid;
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('Home');
    } catch (error) {
      setError('Error al iniciar sesión: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/cuadricula.png")}
      style={styles.background}
      resizeMode="repeat"
    >
      <View style={styles.container}>
        <Text h3 style={styles.title}>My books</Text>

        <Image
          source={require('../../../assets/Univalle.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Input
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          rightIcon={
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                type="feather"
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          }
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {isLoading ? (
          <ActivityIndicator size="large" color="#800000" />
        ) : (
          <>
            <Button
              title="Iniciar Sesión"
              onPress={handleLogin}
              containerStyle={styles.button}
              buttonStyle={styles.primaryButton}
              disabled={!validateLoginForm() || isLoading}
            />
            <Button
              title="Registrarse"
              type="outline"
              onPress={() => navigation.navigate('Register')}
              containerStyle={styles.button}
              buttonStyle={styles.plomoButton}
              titleStyle={{ color: '#ffffff' }}
              disabled={isLoading}
            />
            <Text style={styles.footerText}>Elaborado por: Carlos E. Mamani</Text>
          </>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
     marginHorizontal: 10,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#800000',
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20,
  },
  button: {
    marginVertical: 10,
  },
  plomoButton: {
    backgroundColor: '#A9A9A9',
  },
  primaryButton: {
    backgroundColor: '#800000',
  },
  outlineButton: {
    borderColor: '#800000',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    textAlign: "center",
    color: '#800000',
    marginTop: 40,
  },
});
