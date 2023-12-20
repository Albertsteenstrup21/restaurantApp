// components/home/HomeScreen.js

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Linking,
} from "react-native";
import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import axios from "axios";
import * as Location from "expo-location";
import { firebaseConfig } from "../../../config";
import YOUR_API_KEY from "../../../keys/keys";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker"; // Import Picker for dropdown
import StarRating from "react-native-star-rating";
import ExpertIcon from "../../../assets/Experts.png";
import UserIcon from "../../../assets/Users.png";
import PriceIcon from "../../../assets/PriceIcon.png";
import CusineIcon from "../../../assets/CuisineIcon.png";
import MapsIconSized from "../../../assets/MapsIconSized.png";

const ListScreen = ({ navigation }) => {
  const [restaurantData, setRestaurantData] = useState([]);
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [hasLocationPermission, setlocationPermission] = useState(false);
  const [ready, setReady] = useState(false);
  const [sortCriteria, setSortCriteria] = useState("name"); // State for sorting criteria
  const [showPicker, setShowPicker] = useState(false); // State to control visibility of picker
  const [sortedRestaurantData, setSortedRestaurantData] = useState([]); // State for sorted data
  const [distanceFetched, setDistanceFetched] = useState({}); // State to track fetched distances
  const [filterCriteria, setFilterCriteria] = useState("All");
  const [showFilterPicker, setShowFilterPicker] = useState(false); // State to control visibility of filter picker
  const [filteredRestaurantData, setFilteredRestaurantData] = useState([]);
  const [filterType, setFilterType] = useState("cuisine"); // This will store the type of filter (cuisine, name, etc.)
  const [searchQuery, setSearchQuery] = useState(""); // This will store the search query if the user is filtering by name

  useEffect(() => {
    // This function will sort the restaurant data based on the selected criteria
    const sortRestaurants = () => {
      const sortedData = [...restaurantData].sort((a, b) => {
        switch (sortCriteria) {
          case "name":
            return a.name.localeCompare(b.name);
          case "distance":
            // Compare the numeric part
            return parseFloat(a.distance) - parseFloat(b.distance);
          case "expertRating":
            return b.expertRating - a.expertRating;
          case "userRating":
            return b.userRating - a.userRating;
          case "price_range":
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

  const renderFilterOptions = () => {
    if (filterType === "cuisine") {
      return (
        // Render the picker for cuisine filter
        <Picker
          selectedValue={filterCriteria}
          onValueChange={(itemValue) => setFilterCriteria(itemValue)}
          style={styles.pickerContainer}
          itemStyle={styles.pickerItemStyle}
        >
          <Picker.Item label="All" value="All" />
          <Picker.Item label="American" value="American" />
          <Picker.Item label="Asian" value="Asian" />
          <Picker.Item label="French" value="French" />
          <Picker.Item label="Italian" value="Italian" />
          <Picker.Item label="Mediterranean" value="Mediterranean" />
          <Picker.Item label="Nordic" value="Nordic" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      );
    } else if (filterType === "name") {
      return (
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          placeholder="Search by name"
        />
      );
    }
  };

  // This function will apply the filter based on the selected criteria
  const applyFilter = () => {
    if (filterType === "cuisine") {
      return sortedRestaurantData.filter((item) => {
        return filterCriteria === "All" || item.cuisine === filterCriteria;
      });
    } else if (filterType === "name") {
      const lowercasedQuery = searchQuery.toLowerCase();
      return sortedRestaurantData.filter((item) => {
        return item.name.toLowerCase().includes(lowercasedQuery);
      });
    }
  };

  // This will update the filtered data whenever the filter criteria changes
  useEffect(() => {
    const filteredData = applyFilter();
    setFilteredRestaurantData(filteredData);
  }, [filterCriteria, sortedRestaurantData, searchQuery]);

  const toggleFilterPicker = () => {
    setShowFilterPicker(!showFilterPicker); // Toggle visibility of filter picker
  };

  // Fetch data from Firebase
  useEffect(() => {
    const db = getDatabase();
    const starCountRef = ref(db, "restaurants");
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

  // Fetch distance from Google Maps API
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

  // Fetch distance for each restaurant when user location changes
  useEffect(() => {
    if (userLocation.latitude && userLocation.longitude) {
      restaurantData.forEach((item) => {
        fetchAndSetDistance(item);
      });
    }
  }, [restaurantData, userLocation]);

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
            style={styles.pickerContainer}
            itemStyle={styles.pickerItemStyle}
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
        style={styles.filterIcon}
        onPress={toggleFilterPicker} // Use the new function to toggle filter picker
      >
        <Ionicons name="options" size={30} />
      </TouchableOpacity>

      {showFilterPicker && ( // Conditional rendering of filter picker
        <View>
          {/* Filter type picker */}
          <Picker
            selectedValue={filterType}
            onValueChange={(itemValue) => setFilterType(itemValue)}
            style={styles.pickerContainer}
            itemStyle={styles.pickerItemStyle}
          >
            <Picker.Item label="Filter by cuisine" value="cuisine" />
            <Picker.Item label="Search by name" value="name" />
          </Picker>

          {/* Second picker or text input based on filter type */}
          {renderFilterOptions()}
        </View>
      )}

      {ready ? (
        <View style={styles.listContainer}>
          <FlatList
            data={filteredRestaurantData}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => {
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
                      {item.distance ? item.distance : "Loading..."} {" - "}
                    </Text>
                    <Text style={styles.listItemText}>{item.address.address ? item.address.address : ""}</Text>
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
                      {item.userRatingCount  + "(" + item.friendsRatingCount + ")"}
                    </Text>
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
    marginTop: 10,
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

export default ListScreen;
