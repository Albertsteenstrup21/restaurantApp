// Import necessary modules and functions
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
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Import image asset
import tasteShareIcon from "../../assets/tasteShareIcon.png";

// Define LoginForm component
function LoginForm({ navigation }) {
  // Initialize Firebase auth
  const auth = getAuth();

  // Initialize state variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCompleted, setCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Initialize Animated.Value for logo animation
  const spinValue = useRef(new Animated.Value(0)).current;

  // Handle form submission
  const handleSubmit = async () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // If sign-in is successful, log the user object to the console
        const user = userCredential.user;
        console.log(user);
        // Direct user to profile screen
      })
      .catch((error) => {
        // If sign-in fails, set the error message state
        const errorCode = error.code;
        const errorMessage = error.message;
        setErrorMessage(errorMessage);
      });
  };

  // Start logo animation
  const startAnimation = () => {
    // Reset spinValue to 0 before starting the animation
    spinValue.setValue(0);

    Animated.timing(spinValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  // Define logo styling with rotation animation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Render login button
  const renderButton = () => {
    return (
      <Button
        onPress={() => {
          handleSubmit();
          startAnimation(); // Call startAnimation when the button is pressed
        }}
        title="Enter"
      />
    );
  };

  // Render LoginForm component
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => startAnimation()}>
        <Animated.Image
          source={tasteShareIcon}
          style={[styles.logo, { transform: [{ rotate: spin }] }]}
        />
      </TouchableOpacity>
      <Text style={styles.header}>Login</Text>
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
      <TouchableOpacity onPress={() => navigation.navigate("SignUpForm")}>
        <Text style={styles.loginText}>
          Don't have an account? Create one here
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Define local styling for LoginForm component
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

// Export LoginForm component for use in other components
export default LoginForm;
