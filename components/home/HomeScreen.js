//components/home/HomeScreen.js

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import axios from "axios";
import * as Location from "expo-location";
import { firebaseConfig } from "../../config";
import YOUR_API_KEY from "../../keys/keys";
import Ionicons from "react-native-vector-icons/Ionicons";

const HomeScreen = ({ navigation }) => {
  const [restaurantData, setRestaurantData] = useState([]);
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [hasLocationPermission, setlocationPermission] = useState(false);
  const [distances, setDistances] = useState({}); // Initialize state to store distances
  const [ready, setReady] = useState(false);
  

  // Fetch data from Firebase
  useEffect(() => {
    const db = getDatabase();
    const starCountRef = ref(db, "restaurants");
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      const newRestaurants = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      console.log(newRestaurants);
      setTimeout(() => {
        setRestaurantData(newRestaurants);
        setReady(true);
      }, 1500);
    });
  }, []);

  const getLocationPermission = async () => {
    await Location.requestForegroundPermissionsAsync().then((item) => {
      setlocationPermission(item.granted);
    });
  };

  useEffect(() => {
    getLocationPermission();
    updateLocation();
  }, []);

  const updateLocation = async () => {
    let { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low,
      maximumAge: 10000,
      timeout: 5000,
    });
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  const fetchAndSetDistance = async (item, index) => {
    console.log("Fetching distance for:", item.address.lat, item.address.lng);
    const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${userLocation.latitude},${userLocation.longitude}&destinations=${item.address.lat},${item.address.lng}&key=${YOUR_API_KEY}`;
    console.log("API Request URL:", apiUrl);

    try {
      const response = await axios.get(apiUrl);
      console.log("API Response:", response.data);

      if (response.data.rows[0].elements[0].status === "OK") {
        if (response.data.rows[0].elements[0].distance) {
          setDistances((prevDistances) => ({
            ...prevDistances,
            [index]: response.data.rows[0].elements[0].distance.text,
          }));
        } else {
          console.log(
            "Distance data not found for this location:",
            item.address
          );
        }
      } else {
        console.log(
          "Error calculating distance for this location:",
          item.address
        );
      }
    } catch (error) {
      console.error("Error fetching distance:", error);
    }
  };

  useEffect(() => {
    restaurantData.forEach((item, index) => {
      fetchAndSetDistance(item, index);
    });
  }, [restaurantData, userLocation]);

  // Render data from Firebase in a list
  return (
    <View style={styles.container}>
        
      <TouchableOpacity
        style={styles.settingsIcon}
        onPress={() => navigation.navigate("ProfileScreen")}
      >
        <Ionicons name="settings-outline" size={30} />
      </TouchableOpacity>
      {ready ? (
      <View style={styles.listContainer}>
        <FlatList
          data={restaurantData}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            const distance = distances[index]; // Get the distance from the state
            // Render each item
            return (
              <View style={styles.listItem}>
                <Text style={styles.listItemTextBold}>{item.name}</Text>
                <Text style={styles.listItemText}>
                  {distance ? distance : "Loading..."}
                </Text>
                <Text style={styles.listItemText}>{item.cuisine}</Text>
                <Text style={styles.listItemText}>{item.phone_number}</Text>
                <Text style={styles.listItemText}>{item.price_range}</Text>
                <Text style={styles.listItemText}>{item.rating}</Text>
              </View>
            );
          }}
        />
      </View>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  settingsIcon: {
    position: "absolute",
    top: 10, // Adjust top and right as needed
    right: 10,
    zIndex: 1, // Ensures the icon stays above other components
  },
  listContainer: {
    flex: 1,
    marginTop: 50, // Adjust this value to ensure list starts below the settings icon
  },
  listItem: {
    flexDirection: "column", // Change to 'column' for vertical stacking
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 5,
    alignItems: "center", // Center items horizontally
  },
  listItemTextBold: {
    textAlign: "center", // Center-align text
    marginBottom: 5,
    fontWeight: 'bold', // Make text bold
  },
  listItemText: {
    textAlign: "center", // Center-align text
    marginBottom: 5,
  },
  textContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "black",
  },
});

export default HomeScreen;
