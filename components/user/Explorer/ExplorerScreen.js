import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableHighlight,
  Linking,
} from "react-native";
import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import Carousel from "react-native-snap-carousel";
import { Video } from "expo-av";
import ListIcon from "../../../assets/ListIcon.png";
import axios from "axios";
import * as Location from "expo-location";
import { firebaseConfig } from "../../../config";
import YOUR_API_KEY from "../../../keys/keys";
import StarRating from "react-native-star-rating";
import ExpertIcon from "../../../assets/Experts.png";
import UserIcon from "../../../assets/Users.png";
import PriceIcon from "../../../assets/PriceIcon.png";
import CusineIcon from "../../../assets/CuisineIcon.png";
import MapsIconSized from "../../../assets/MapsIconSized.png";

const ExplorerScreen = ({ navigation }) => {
  // State declarations
  const [restaurantData, setRestaurantData] = useState([]);
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [hasLocationPermission, setlocationPermission] = useState(false);
  const [distances, setDistances] = useState({}); // Initialize state to store distances
  const [ready, setReady] = useState(false);

  // Fetch restaurant data from Firebase on component mount
  useEffect(() => {
    const db = getDatabase();
    const starCountRef = ref(db, "restaurants");

    // Process each restaurant data
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      const newRestaurants = Object.keys(data).map((key) => {
        // Generate ratings for each restaurant inside the map function
        const expertRating = Number((Math.random() * 4 + 1).toFixed(1));
        const userRating = Number((Math.random() * 4 + 1).toFixed(1));
        const userRatingCount = Math.floor(Math.random() * 1000) + 1;
        const expertRatingCount = Math.floor(Math.random() * 100) + 1;
        const friendsRatingCount = Math.floor(Math.random() * 9) + 1;
        return {
          id: key,
          expertRating,
          userRating,
          userRatingCount,
          expertRatingCount,
          friendsRatingCount,
          ...data[key],
        };
      });
      console.log(newRestaurants);
      setTimeout(() => {
        setRestaurantData(newRestaurants);
        setReady(true);
      }, 1500);
    });
  }, []);

  // Request location permissions
  useEffect(() => {
    const requestLocationPermission = async () => {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      setlocationPermission(granted);
      if (granted) updateLocation();
    };

    requestLocationPermission();
  }, []);

  // Update user's current location
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

  // Fetch and set distance data for each restaurant
  useEffect(() => {
    restaurantData.forEach((item, index) => {
      const fetchDistance = async () => {
        const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${userLocation.latitude},${userLocation.longitude}&destinations=${item.address.lat},${item.address.lng}&key=${YOUR_API_KEY}`;
        try {
          const { data } = await axios.get(apiUrl);
          if (data.rows[0].elements[0].status === "OK") {
            const distanceText = data.rows[0].elements[0].distance.text;
            setDistances((prevDistances) => ({
              ...prevDistances,
              [index]: distanceText,
            }));
          }
        } catch (error) {
          console.error("Error fetching distance:", error);
        }
      };

      fetchDistance();
    });
  }, [restaurantData, userLocation]);

  // Render the carousel with restaurant data
  return (
    <View>
      {ready ? (
        // When ready state is false, show loading text otherwise show the carousel
        <Carousel
          data={restaurantData}
          renderItem={({ item, index }) => {
            // Function to open the website in the browser
            const openWebsite = () => {
              Linking.canOpenURL(item.website).then((supported) => {
                if (supported) {
                  Linking.openURL(item.website);
                } else {
                  console.log("Don't know how to open URI: " + item.website);
                }
              });
            };
            const distance = distances[index]; // Get the distance from the state

            return (
              <View style={styles.slide}>
                {
                  // Check if the first media item exists and is a video
                  item.media && item.media.length > 0 && (
                    <Video
                      source={{ uri: item.media[0].downloadUrl }}
                      style={StyleSheet.absoluteFillObject}
                      resizeMode="cover"
                      shouldPlay
                      isLooping
                    />
                  )
                }
                <View style={styles.overlay}>
                  {/* Restaurant information display */}
                  <View style={styles.textContainer}>
                    <Text style={styles.headerText}>{item.name}</Text>

                    <View style={styles.imageAndTextContainer}>
                      <TouchableHighlight
                        onPress={() => navigation.navigate("MapScreen")}
                      >
                        <Image source={MapsIconSized} style={styles.sideIcon} />
                      </TouchableHighlight>

                      {/* Distance and Address */}
                      <Text style={styles.text}>
                        {distance ? distance : "Loading..."} {" - "}
                      </Text>
                      <Text style={styles.text}>{item.address.address}</Text>
                    </View>

                    {/* Other information like cuisine, price range, and ratings */}  
                    <View style={styles.imageAndTextContainer}>
                      <Image source={CusineIcon} style={styles.sideIcon} />
                      <Text style={styles.text}>{item.cuisine}</Text>
                    </View>

                    <View style={styles.imageAndTextContainer}>
                      <TouchableHighlight
                        onPress={() => navigation.navigate("MenuCardScreen")}
                      >
                        <Image source={PriceIcon} style={styles.sideIcon} />
                      </TouchableHighlight>
                      <Text style={styles.text}>{item.price_range}</Text>
                    </View>
                    <TouchableHighlight
                      onPress={() => navigation.navigate("ReviewScreen")}
                    >
                      <View>
                        <View style={styles.imageAndTextContainer}>
                          <Image source={ExpertIcon} style={styles.sideIcon} />
                          <Text style={styles.userRatingText}>
                            {item.expertRating}{" "}
                          </Text>
                          <StarRating
                            disabled={true}
                            maxStars={5}
                            rating={item.expertRating}
                            fullStarColor={"red"}
                            emptyStarColor={"red"}
                            starSize={20}
                          />
                          <Text style={styles.userRatingCountText}>
                            ({item.expertRatingCount})
                          </Text>
                        </View>

                        <View style={styles.imageAndTextContainer}>
                          <Image source={UserIcon} style={styles.sideIcon} />
                          <Text style={styles.userRatingText}>
                            {item.userRating}{" "}
                          </Text>
                          <StarRating
                            disabled={true}
                            maxStars={5}
                            rating={item.userRating}
                            fullStarColor={"gold"}
                            emptyStarColor={"gold"}
                            starSize={20}
                            // Additional optional properties
                          />
                          <Text style={styles.userRatingCountText}>
                            {item.userRatingCount +
                              "(" +
                              item.friendsRatingCount +
                              ")"}
                          </Text>
                        </View>
                      </View>
                    </TouchableHighlight>

                    <Text style={styles.text} onPress={openWebsite}>
                      {item.website}
                    </Text>
                  </View>
                </View>
                
                {/* Navigates to list on press */}
                <View style={styles.listContainer}>
                  <TouchableHighlight
                    onPress={() => navigation.navigate("ListScreen")}
                  >
                    <Image source={ListIcon} style={styles.list} />
                  </TouchableHighlight>
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
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

// Styles for the component
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
    marginBottom: 10,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
    color: "white",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "white",
  },
  iconContainer: {
    position: "relative",
    top: "-39%",
    right: "-38%",
    width: 35,
    height: 50,
  },
  icon: {
    width: "100%",
    height: "100%",
  },
  listContainer: {
    position: "relative",
    top: "-42%",
    left: "-38%",
    width: 47,
    height: 45,
  },
  list: {
    width: "100%",
    height: "100%",
  },
  distanceText: {
    fontSize: 12,
    color: "white",
    position: "absolute",
    top: "110%",
    left: 0,
    right: 0,
    textAlign: "center",
  },
  rating: {
    paddingVertical: 3, // Add some padding around the rating
  },
  imageAndTextContainer: {
    flexDirection: "row", // Align items in a row
    alignItems: "center", // Center items vertically
    justifyContent: "flex-start", // Start alignment
    marginBottom: 5, // Add some margin to the bottom
  },
  userRatingText: {
    marginRight: 6, // Add margin to the right of the text
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "white",
  },
  userRatingCountText: {
    marginLeft: 6, // Add margin to the left of the count
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "white",
  },
  sideIcon: {
    width: 29, // Set the width of the icon
    height: 29, // Set the height of the icon
    marginRight: 9, // Add some margin to the right of the icon
  },
});

export default ExplorerScreen;
