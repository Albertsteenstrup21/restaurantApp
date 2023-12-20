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
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// Import image asset
import tasteShareIcon from "../../assets/tasteShareIcon.png";
import FacebookLoginImage from "../../assets/FacebookLogin.png"; // Update the path as necessary

// Define SignUpForm component
function SignUpForm({ navigation }) {
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
    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // If user creation is successful, log the user object to the console
        const user = userCredential.user;
        console.log(user);
        // Direct user to profile screen
      })
      .catch((error) => {
        // If user creation fails, set the error message state
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

  // Render create user button
  const renderButton = () => {
    return (
      <Button
        onPress={() => {
          handleSubmit();
          startAnimation(); // Call startAnimation when the button is pressed
        }}
        title="Create user"
      />
    );
  };

  const handleFacebookLogin = () => {
    // Implement Facebook login logic here
    console.log("Facebook login pressed");
  };

  // Render SignUpForm component
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
      <TouchableOpacity onPress={handleFacebookLogin}>
        <Image source={FacebookLoginImage} style={styles.facebookLoginButton} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("LoginForm")}>
        <Text style={styles.loginText}>
          If you already have an account, login here
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Define local styling for SignUpForm component
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
  facebookLoginButton: {
    width: 200, // Adjust the width as needed
    height: 40, // Adjust the height as needed
    marginTop: 5, // Spacing from the previous element
    marginBottom: 10, // Spacing from the next element
  },
});

// Export SignUpForm component for use in other components
export default SignUpForm;
