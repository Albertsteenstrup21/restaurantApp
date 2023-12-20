// components/home/HomeScreen.js

import { View, Text, StyleSheet, FlatList, Image, Linking } from "react-native";
import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import axios from "axios";
import * as Location from "expo-location";
import { firebaseConfig } from "../../../config";
import YOUR_API_KEY from "../../../keys/keys";
import StarRating from "react-native-star-rating";
import PriceIcon from "../../../assets/PriceIcon.png";
import CusineIcon from "../../../assets/CuisineIcon.png";
import MapsIconSized from "../../../assets/MapsIconSized.png";

const BookingScreen = ({ navigation }) => {
  const [restaurantData, setRestaurantData] = useState([]);
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [hasLocationPermission, setlocationPermission] = useState(false);
  const [ready, setReady] = useState(false);
  const [distanceFetched, setDistanceFetched] = useState({}); // New state to track fetched distances
  const [userRatings, setUserRatings] = useState({}); // This will hold user ratings keyed by restaurant ID

  // Handles function when user submits a rating for a restaurant
  const onStarRatingPress = (rating, id) => {
    setUserRatings((prevRatings) => ({
      ...prevRatings,
      [id]: rating, // Set the rating for the restaurant by ID
    }));
  };

  // Fetch data from Firebase
  useEffect(() => {
    const db = getDatabase();
    const starCountRef = ref(db, "restaurants");
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      let newRestaurants = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));

      console.log(newRestaurants);
      setTimeout(() => {
        newRestaurants = newRestaurants.slice(0, newRestaurants.length / 2);
        setRestaurantData(newRestaurants);
        setReady(true);
      }, 1500);
    });
  }, []);

  // Get location permission and update location
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

  // Fetch distance from Google Distance Matrix API
  const fetchAndSetDistance = async (item, index) => {
    if (distanceFetched[item.id]) return; // Skip if already fetched

    console.log("Fetching distance for:", item.address.lat, item.address.lng);
    const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${userLocation.latitude},${userLocation.longitude}&destinations=${item.address.lat},${item.address.lng}&key=${YOUR_API_KEY}`;
    console.log("API Request URL:", apiUrl);

    try {
      const response = await axios.get(apiUrl);
      console.log("API Response:", response.data);

      // Check if the response status is OK and if the distance is available
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

  // Fetch distance for each restaurant when user location changes
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
      {ready ? (
        <View style={styles.listContainer}>
          <FlatList
            data={restaurantData}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => {
              // Access the user rating for the current restaurant or default to 0
              const currentRating = userRatings[item.id] || 0;
              const openWebsite = () => {
                Linking.canOpenURL(item.website).then((supported) => {
                  if (supported) {
                    Linking.openURL(item.website);
                  } else {
                    console.log("Don't know how to open URI: " + item.website);
                  }
                });
              };

              // Render each item
              return (
                <View style={styles.listItem}>
                  <Text style={styles.listItemTextHeader}>{item.name}</Text>
                  <View style={styles.imageAndTextContainer}>
                    <Image source={MapsIconSized} style={styles.sideIcon} />
                    <Text style={styles.listItemText}>
                      {item.distance ? item.distance : "Loading..."}
                      {" - "}
                    </Text>
                    <Text style={styles.listItemText}>
                      {item.address.address ? item.address.address : ""}
                    </Text>
                  </View>
                  <View style={styles.imageAndTextContainer}>
                    <Image source={CusineIcon} style={styles.sideIcon} />
                    <Text style={styles.listItemText}>{item.cuisine}</Text>
                  </View>
                  <View style={styles.imageAndTextContainer}>
                    <Image source={PriceIcon} style={styles.sideIcon} />
                    <Text style={styles.listItemText}>{item.price_range}</Text>
                  </View>
                  <View style={styles.imageAndTextContainer}>
                    <Text style={styles.userRatingText}>{currentRating}</Text>
                    <StarRating
                      disabled={false}
                      maxStars={5}
                      rating={currentRating}
                      selectedStar={(rating) =>
                        onStarRatingPress(rating, item.id)
                      }
                      fullStarColor={"gold"}
                      emptyStarColor={"#ccc"}
                      starSize={20}
                      halfStarEnabled={true}
                    />
                  </View>
                  <Text style={styles.listItemText} onPress={openWebsite}>
                    {item.website}
                  </Text>
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
  listContainer: {
    flex: 1,
    marginTop: 50, // Adjust this value to ensure list starts below the settings icon
  },
  listItem: {
    flexDirection: "column", // Change to 'column' for vertical stacking
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    alignItems: "center", // Center items horizontally
    elevation: 2, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderRadius: 5, // Rounded corners for cards
  },
  listItemTextHeader: {
    fontSize: 22,
    marginBottom: 5,
    fontWeight: "bold", // Make text bold
  },
  listItemText: {
    marginBottom: 5,
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  pickerContainer: {
    width: "50%", // Adjust the width as needed
    alignSelf: "center", // This will center the picker
  },

  pickerItemStyle: {
    height: 100, // Adjust the height as needed
    fontSize: 14, // Adjust font size as needed
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd", // Light grey border for the TextInput
    borderRadius: 5, // Rounded corners for the TextInput
    paddingLeft: 10, // Padding inside the TextInput
    margin: 10, // Margin around the TextInput
    backgroundColor: "#fff", // White background for the TextInput
  },
  rating: {
    paddingVertical: 3, // Add some padding around the rating
  },
  ratingContainer: {
    flexDirection: "row", // Align items in a row
    alignItems: "center", // Center items vertically
    justifyContent: "flex-start", // Start alignment
  },
  userRatingText: {
    fontWeight: "bold", // Make text bold
    marginRight: 6, // Add margin to the right of the text
  },
  userRatingCountText: {
    marginLeft: 6, // Add margin to the left of the count
  },
  sideIcon: {
    width: 26, // Set the width of the icon
    height: 26, // Set the height of the icon
    marginRight: 6, // Add some margin to the right of the icon
  },
  imageAndTextContainer: {
    flexDirection: "row", // Align items in a row
    alignItems: "center", // Center items vertically
    justifyContent: "flex-start", // Start alignment
  },
});

export default BookingScreen;
