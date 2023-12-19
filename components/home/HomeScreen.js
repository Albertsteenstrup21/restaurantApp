// components/home/HomeScreen.js

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
import { Picker } from "@react-native-picker/picker"; // Import Picker for dropdown

const HomeScreen = ({ navigation }) => {
  const [restaurantData, setRestaurantData] = useState([]);
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [hasLocationPermission, setlocationPermission] = useState(false);
  //   const [distances, setDistances] = useState({}); // Initialize state to store distances
  const [ready, setReady] = useState(false);
  const [sortCriteria, setSortCriteria] = useState("name"); // State for sorting criteria
  const [showPicker, setShowPicker] = useState(false); // State to control visibility of picker
  const [sortedRestaurantData, setSortedRestaurantData] = useState([]); // State for sorted data
  const [distanceFetched, setDistanceFetched] = useState({}); // New state to track fetched distances

  useEffect(() => {
    // This function will sort the restaurant data based on the selected criteria
    const sortRestaurants = () => {
      const sortedData = [...restaurantData].sort((a, b) => {
        switch (sortCriteria) {
          case "name":
            return a.name.localeCompare(b.name);
          case "distance":
            // Assuming distance is a string like '23.4 km' and we compare by the numeric part
            return parseFloat(a.distance) - parseFloat(b.distance);
          case "expertRating":
            return b.expertRating - a.expertRating;
          case "userRating":
            return b.userRating - a.userRating;
          case "price_range":
            // Assuming price_range is a numeric value
            return a.price_range.localeCompare(b.price_range);
          default:
            return 0;
        }
      });

      return sortedData;
    };

    if (
      restaurantData.length > 0 &&
      Object.keys(distanceFetched).length === restaurantData.length
    ) {
      // Only sort and update the state if all distances have been fetched to prevent multiple updates
      const sortedData = sortRestaurants();
      setSortedRestaurantData(sortedData);
    }
  }, [sortCriteria, restaurantData, distanceFetched]); // Add distanceFetched to dependencies

  const togglePicker = () => {
    setShowPicker(!showPicker); // Toggle visibility of picker
  };

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
    if (distanceFetched[item.id]) return; // Skip if already fetched

    console.log("Fetching distance for:", item.address.lat, item.address.lng);
    const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${userLocation.latitude},${userLocation.longitude}&destinations=${item.address.lat},${item.address.lng}&key=${YOUR_API_KEY}`;
    console.log("API Request URL:", apiUrl);

    try {
      const response = await axios.get(apiUrl);
      console.log("API Response:", response.data);

      if (response.data.rows[0].elements[0].status === "OK") {
        if (response.data.rows[0].elements[0].distance) {
          const distance = response.data.rows[0].elements[0].distance.text;
          setDistanceFetched((prevState) => ({
            ...prevState,
            [item.id]: true,
          })); // Mark as fetched
          setRestaurantData((currentData) =>
            currentData.map((restaurant) => {
              if (restaurant.id === item.id) {
                return { ...restaurant, distance }; // Add distance to the restaurant object
              }
              return restaurant;
            })
          );
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
    if (userLocation.latitude && userLocation.longitude) {
      restaurantData.forEach((item) => {
        fetchAndSetDistance(item);
      });
    }
  }, [restaurantData, userLocation, distanceFetched]); // Add distanceFetched to dependencies

  // Render data from Firebase in a list
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.filterIcon}
        onPress={togglePicker} // Toggle picker visibility on icon press
      >
        <Ionicons name="filter" size={30} />
      </TouchableOpacity>

      {showPicker && ( // Conditional rendering of picker
        <View>
          <Picker
            selectedValue={sortCriteria}
            onValueChange={(itemValue) => setSortCriteria(itemValue)}
            style={styles.pickerStyle}
          >
            <Picker.Item label="Name" value="name" />
            <Picker.Item label="Distance" value="distance" />
            <Picker.Item label="Expert Rating" value="expertRating" />
            <Picker.Item label="User Rating" value="userRating" />
            <Picker.Item label="Price Range" value="price_range" />
          </Picker>
        </View>
      )}
      <TouchableOpacity
        style={styles.settingsIcon}
        onPress={() => navigation.navigate("ProfileScreen")}
      >
        <Ionicons name="settings-outline" size={30} />
      </TouchableOpacity>
      {ready ? (
        <View style={styles.listContainer}>
          <FlatList
            data={sortedRestaurantData}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => {
              // Render each item
              return (
                <View style={styles.listItem}>
                  <Text style={styles.listItemTextBold}>{item.name}</Text>
                  <Text style={styles.listItemText}>
                    {item.distance ? item.distance : "Loading..."}{" "}
                  </Text>
                  <Text style={styles.listItemText}>{item.cuisine}</Text>
                  <Text style={styles.listItemText}>{item.phone_number}</Text>
                  <Text style={styles.listItemText}>{item.price_range}</Text>
                  <Text style={styles.listItemText}>{item.expertRating}</Text>
                  <Text style={styles.listItemText}>{item.userRating}</Text>
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
    fontWeight: "bold", // Make text bold
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
