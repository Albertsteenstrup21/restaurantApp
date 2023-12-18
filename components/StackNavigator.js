//components/StackNavigator.js
//Importere react og diverse komponenter
import React from "react";
import { Text, View, Button, TouchableOpacity } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import ResetPassword from "./home/stackComponents/ResetPassword";
import Membership from "./home/stackComponents/Membership";
import ProfileScreen from "./home/ProfileScreen";
import RestaurantSignUpForm from "./home/stackComponents/RestaurantSignUpForm";
import SignUpForm from "./auth/SignUpForm";
import LoginForm from "./auth/LoginForm";
import MapScreen from "./home/mapsComponents/MapScreen";
import IndexScreen from "./home/ExplorerScreen";
import HomeScreen from "./home/HomeScreen";
import Ionicons from "react-native-vector-icons/Ionicons";

const Stack = createStackNavigator();

//Laver stack navigation
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

      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="Membership" component={Membership} />
      <Stack.Screen name="RestaurantSignUpForm" component={RestaurantSignUpForm}/>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="SignUpForm" component={SignUpForm} />
      <Stack.Screen name="LoginForm" component={LoginForm} />
      <Stack.Screen name="IndexScreen" component={IndexScreen} />
      <Stack.Screen name="MapScreen" component={MapScreen} />
    </Stack.Navigator>
  );
}
