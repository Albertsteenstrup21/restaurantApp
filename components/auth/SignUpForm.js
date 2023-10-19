//components/auth/SignUpForm.js
import React, { useState, useRef } from "react";
import {
  Button,
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

import tasteShareIcon from "../../assets/tasteShareIcon.png";

function SignUpForm({ navigation }) {
  const auth = getAuth();

  //Instantiering af state-variabler, der skal benyttes i SignUpForm
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCompleted, setCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  //Instantiering af en Animated.Value, som skal benyttes til at animere logoet
  const spinValue = useRef(new Animated.Value(0)).current;

  const handleSubmit = async () => {
    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setErrorMessage(errorMessage);
        // ..
      });
  };

  //Funktionen startAnimation, som starter animationen af logoet
  const startAnimation = () => {
    //Reset spinValue to 0 before starting the animation
    spinValue.setValue(0);

    Animated.timing(spinValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  //Her defineres brugeroprettelsesknappen, som aktiverer handleSubmit igennem onPress
  const renderButton = () => {
    return <Button onPress={() => handleSubmit()} title="Create user" />;
  };

  //Her defineres stylingen for logoet, som inkluderer en rotation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => startAnimation()}>
        <Animated.Image
          source={tasteShareIcon}
          style={[styles.logo, { transform: [{ rotate: spin }] }]}
        />
      </TouchableOpacity>
      <Text style={styles.header}>Sign up</Text>
      <TextInput
        placeholder="email"
        value={email}
        onChangeText={(email) => setEmail(email)}
        style={styles.inputField}
      />
      <TextInput
        placeholder="password"
        value={password}
        onChangeText={(password) => setPassword(password)}
        secureTextEntry
        style={styles.inputField}
      />
      {errorMessage && <Text style={styles.error}>Error: {errorMessage}</Text>}
      {renderButton()}

      <TouchableOpacity onPress={() => navigation.navigate("LoginForm")}>
        <Text style={styles.loginText}>
          If you already have an account, login here
        </Text>
      </TouchableOpacity>
    </View>
  );
}

//Lokal styling til brug i SignUpForm
const styles = StyleSheet.create({
  error: {
    color: "red",
  },
  inputField: {
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    marginBottom: 10,
    paddingVertical: 5,
    width: 300,
  },
  header: {
    fontSize: 40,
    marginBottom: 20,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
});

//Eksport af Loginform, således denne kan importeres og benyttes i andre komponenter
export default SignUpForm;
