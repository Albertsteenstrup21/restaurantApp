import { View, Text, StyleSheet, Dimensions, Animated } from "react-native";
import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import Carousel from "react-native-snap-carousel";
import { Video } from "expo-av";

import { firebaseConfig } from "../config";

const FetchDatabase = () => {
  const [restaurantData, setRestaurantData] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(new Animated.Value(0));

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

  // Animate overlay when showOverlay changes
  useEffect(() => {
    if (showOverlay) {
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [showOverlay]);

  // Render data from Firebase in a carousel with video and overlay
  return (
    <View>
      <Carousel
        data={restaurantData}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Video
              source={{ uri: item.media[0] }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
              shouldPlay
              isLooping
              useNativeControls
              onPlaybackStatusUpdate={(status) => {
                // Show overlay when video has played for 7 seconds
                if (status.isPlaying && status.positionMillis > 7000) {
                  setShowOverlay(true);
                }
              }}
            />
            <Animated.View
              style={[styles.overlay, { opacity: overlayOpacity }]}
            >
              <Text style={styles.text}>{item.name}</Text>
              <Text style={styles.text}>{item.address}</Text>
              <Text style={styles.text}>{item.cuisine}</Text>
              <Text style={styles.text}>{item.phone_number}</Text>
              <Text style={styles.text}>{item.price_range}</Text>
              <Text style={styles.text}>{item.rating}</Text>
            </Animated.View>
          </View>
        )}
        sliderHeight={(Dimensions.get("window").width * 16) / 9}
        itemHeight={(Dimensions.get("window").width * 16) / 9}
        sliderWidth={Dimensions.get("window").width}
        itemWidth={Dimensions.get("window").width}
        vertical={true}
        enableSnap={true}
        activeSlideAlignment=""
        onSnapToItem={() => {
          setShowOverlay(false);
        }}
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
    ...StyleSheet.absoluteFillObject,
    position: "absolute",
    bottom: 0,
    left: 0,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "white",
  },
});

export default FetchDatabase;
