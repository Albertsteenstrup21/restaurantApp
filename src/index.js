import { View, Text, StyleSheet, Dimensions, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import Carousel from "react-native-snap-carousel";
import { Video } from "expo-av";
import MapsIcon from "../assets/MapsIcon.png";

import { firebaseConfig } from "../config";

const FetchDatabase = () => {
  const [restaurantData, setRestaurantData] = useState([]);

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

  // Render data from Firebase in a carousel with video and overlay
  return (
    <View>
      <Carousel
        data={restaurantData}
        renderItem={({ item }) => {
       
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
                  <Image
                    source={MapsIcon}
                    style={styles.icon}
                  />
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
    position: "absolute",
    top: 20,
    right: 20,
    width: 35,
    height: 50,
  },
  icon: {
    width: "100%",
    height: "100%",
  },
});

export default FetchDatabase;
