import { View, Text, StyleSheet, Dimensions, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import Carousel from "react-native-snap-carousel";
import { Video } from "expo-av";
import MapsIcon from "../assets/MapsIcon.png";
import axios from "axios";
import * as Location from "expo-location";

import { firebaseConfig } from "../config";
import YOUR_API_KEY from "../keys";

const FetchDatabase = () => {
  const [restaurantData, setRestaurantData] = useState([]);
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [hasLocationPermission, setlocationPermission] = useState(false);
  const [distances, setDistances] = useState({}); // Initialize state to store distances

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
      setRestaurantData(newRestaurants);
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

  // Render data from Firebase in a carousel with video and overlay
  return (
    <View>
      <Carousel
        data={restaurantData}
        renderItem={({ item, index }) => {
          const distance = distances[index]; // Get the distance from the state

          return (
            <View style={styles.slide}>
              <Video
                source={{ uri: item.media[0].downloadUrl }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                shouldPlay
                isLooping
              />
              <View style={styles.overlay}>
                <View style={styles.textContainer}>
                  <Text style={styles.text}>{item.name}</Text>
                  <Text style={styles.text}>{item.cuisine}</Text>
                  <Text style={styles.text}>{item.phone_number}</Text>
                  <Text style={styles.text}>{item.price_range}</Text>
                  <Text style={styles.text}>{item.rating}</Text>
                </View>
              </View>
              <View style={styles.iconContainer}>
                <Image source={MapsIcon} style={styles.icon} />
                <Text style={styles.distanceText}>
                    {distance ? distance : "Loading..."}
                </Text>
              </View>
            </View>
          );
        }}
        sliderHeight={(Dimensions.get("window").width * 16) / 9}
        itemHeight={(Dimensions.get("window").width * 16) / 9}
        sliderWidth={Dimensions.get("window").width}
        itemWidth={Dimensions.get("window").width}
        vertical={true}
        enableSnap={true}
        activeSlideAlignment=""
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 10,
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
    color: "white",
  },
  iconContainer: {
    position: "relative",
    top: '-42%',
    right: '-38%',
    width: 35,
    height: 50,
  },
  icon: {
    width: "100%",
    height: "100%",
  },
  distanceText: {
    // Add these styles specifically for the distance text under the icon
    fontSize: 12, // Adjust the font size as needed
    color: "white",
    position: 'absolute', // Position absolutely to overlay on top of the iconContainer
    top: '110%', // Position right below the icon
    left: 0,
    right: 0,
    textAlign: 'center', // Center the text horizontally
    overflow: 'hidden', // Hide overflow
    whiteSpace: 'nowrap', // Keep text on the same line
    textOverflow: 'ellipsis', // Use ellipsis for overflow
  },
});

export default FetchDatabase;
