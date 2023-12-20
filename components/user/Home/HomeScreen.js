import React, { useState, useEffect } from "react";
import { Text, View, Button, Image, StyleSheet } from "react-native";
import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import image1 from "../../../assets/Animals/animal1.png";
import image2 from "../../../assets/Animals/animal2.png";
import image3 from "../../../assets/Animals/animal3.png";
import image4 from "../../../assets/Animals/animal4.png";
import image5 from "../../../assets/Animals/animal5.png";
import image6 from "../../../assets/Animals/animal6.png";

const images = [image1, image2, image3, image4, image5, image6];
const adjectives = [
  "Happy",
  "Quiet",
  "Bright",
  "Brave",
  "Calm",
  "Charming",
  "Clever",
];
const nouns = [
  "Panda",
  "Unicorn",
  "Tiger",
  "Eagle",
  "Dragon",
  "Phoenix",
  "Lion",
];
const generateRandomUsername = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective}${noun}`;
};

function HomeScreen({ navigation, route }) {
  const navController = (routeName) => {
    navigation.navigate(routeName);
  };
  const [randomImage, setRandomImage] = useState(null);
  const [randomUsername, setRandomUsername] = useState("");

  // Generate a random image from the array of images
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * images.length);
    setRandomImage(images[randomIndex]);
    setRandomUsername(generateRandomUsername());
  }, []);

  // Generate a random image from the array of images
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * images.length);
    setRandomImage(images[randomIndex]);
  }, []);

  // Initialize Firebase auth
  const auth = getAuth();
  const user = auth.currentUser;

  // Handle logout
  const handleLogOut = async () => {
    await signOut(auth)
      .then(() => {
        // Sign-out successful.
      })
      .catch((error) => {
        // An error happened.
      });
  };

  // If user is not logged in, display login form
  if (!auth.currentUser) {
    return (
      <View>
        <Text>You are not logged in</Text>
        <Button title="Login" onPress={() => navController("LoginForm")} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Display random animal image */}
      {randomImage && <Image source={randomImage} style={styles.image} />}
      <Text style={{ fontWeight: "bold", fontSize: 26, marginBottom:30 }}>
        User: {randomUsername}
      </Text>
      <Button onPress={() => handleLogOut()} title="Log out" />
      <Button
        title="Add your restaurant"
        onPress={() => navController("RestaurantSignUpForm")}
      />
      <Button title="My bookings" onPress={() => navController("BookingScreen")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
    marginTop: 20,
  },
});

export default HomeScreen;
