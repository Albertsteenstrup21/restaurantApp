import { View, Text, StyleSheet, AppRegistry } from "react-native";
import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";

import { firebaseConfig } from "../config";

const FetchDatabase = () => {
  const [restaurantData, setRestaurantData] = useState([]);

  //Henter data fra firebase
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

  //Returnerer data fra firebase i en liste i react native
  return (
    <View style={styles.container}>
      <Text style={styles.header}> Fetched data from Firebase</Text>
      {restaurantData.map((item, index) => {
        return (
          <View key={index}>
            <Text style={styles.text}>{item.name}</Text>
            <Text>{item.address}</Text>
            <Text>{item.cuisine}</Text>
            <Text>{item.phone_number}</Text>
            <Text>{item.price_range}</Text>
            <Text>{item.rating}</Text>
            <Text>{item.menu}</Text>
            <Text>{item.photos}</Text>
            <Text>{item.videos}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default FetchDatabase;
