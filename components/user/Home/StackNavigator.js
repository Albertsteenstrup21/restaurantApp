import React from "react";
import { Text, View, Button, TouchableOpacity } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./HomeScreen";
import RestaurantSignUpForm from "./RestaurantSignUpForm";
import SignUpForm from "../../auth/SignUpForm";
import LoginForm from "../../auth/LoginForm";
import BookingScreen from "./BookingScreen"

const Stack = createStackNavigator();

// Create stack navigation
export default function StackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={({ navigation }) => ({
          headerShown: false,
        })}
      />

      <Stack.Screen
        name="RestaurantSignUpForm"
        component={RestaurantSignUpForm}
      />
      <Stack.Screen name="SignUpForm" component={SignUpForm} />
      <Stack.Screen name="LoginForm" component={LoginForm} />
      <Stack.Screen name="BookingScreen" component={BookingScreen} />
    </Stack.Navigator>
  );
}
