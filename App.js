//App.js

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

//Usikker på om det skal bruges senere hen
import { onAuthStateChanged, getAuth } from "firebase/auth";

//Importerer Ionicons til tab navigation
import Ionicons from "react-native-vector-icons/Ionicons";

import ExplorerScreen from "./components/user/Explorer/ExplorerScreen";
import MapScreen from "./components/user/Map/MapScreen";
import StackNavigatorHome from "./components/user/Home/StackNavigator";
import StackNavigatorExplorer from "./components/user/Explorer/StackNavigator";
import SignUpForm from "./components/auth/SignUpForm";
import LoginForm from "./components/auth/LoginForm";

import { LogBox } from "react-native";
LogBox.ignoreLogs(["Warning: ..."]); // Ignore log notification by Map
LogBox.ignoreAllLogs(); //Ignore all log notifications

const AuthStack = createNativeStackNavigator(); // Stack for authentication flow
const Tab = createBottomTabNavigator(); // Main app navigation

export default function App() {
  const [user, setUser] = useState({ loggedIn: false });
  const auth = getAuth();

  // Function to check if user is logged in
  function onAuthStateChange(callback) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        //wait for 0,5 second
        setTimeout(() => {
          callback({ loggedIn: true, user: user });
        }, 450);
        console.log("You are logged in!");
        // ...
      } else {
        // User is signed out
        // ...
        callback({ loggedIn: false });
      }
    });
  }

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChange(setUser);
    return () => {
      unsubscribe();
    };
  }, []);

  const isLoggedIn = user.loggedIn;

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === "Explorer") {
                iconName = focused
                  ? "ios-restaurant"
                  : "ios-restaurant-outline";
              } else if (route.name === "Map") {
                iconName = focused ? "ios-map" : "ios-map-outline";
              } else if (route.name === "Home") {
                iconName = focused ? "ios-home" : "ios-home-outline";
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: "black",
            tabBarInactiveTintColor: "gray",
          })}
        >
          <Tab.Screen name="Home" component={StackNavigatorHome} />
          <Tab.Screen name="Explorer" component={StackNavigatorExplorer} />
          <Tab.Screen name="Map" component={MapScreen} />
        </Tab.Navigator>
      ) : (
        <AuthStack.Navigator>
          <AuthStack.Screen
            name="LoginForm"
            component={LoginForm}
            options={{ headerShown: false }}
          />
          <AuthStack.Screen
            name="SignUpForm"
            component={SignUpForm}
            options={{ headerShown: false }}
          />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
