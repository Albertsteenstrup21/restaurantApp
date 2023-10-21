//components/StackNavigator.js
//Importere react og diverse komponenter
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ResetPassword from "./home/stackComponents/ResetPassword";
import Membership from "./home/stackComponents/Membership";
import ProfileScreen from "./home/ProfileScreen";
import RestaurantSignUpForm from "./home/stackComponents/RestaurantSignUpForm";
import SignUpForm from "./auth/SignUpForm";
import LoginForm from "./auth/LoginForm";

const Stack = createStackNavigator();

//Laver stack navigation
export default function StackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Profile"
    >
      <Stack.Screen
        name="Back"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="Membership" component={Membership} />
      <Stack.Screen
        name="RestaurantSignUpForm"
        component={RestaurantSignUpForm}
      />
      <Stack.Screen name="SignUpForm" component={SignUpForm} />
      <Stack.Screen name="LoginForm" component={LoginForm} />
    </Stack.Navigator>
  );
}
