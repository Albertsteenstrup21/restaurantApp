import React from "react";
import { Text, View, Button, TouchableOpacity } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import ListScreen from "./ListScreen";
import MapScreen from "../Map/MapScreen";
import ExplorerScreen from "./ExplorerScreen";
import MenuCardScreen from "./MenuCardScreen";
import ReviewScreen from "./ReviewScreen";

const Stack = createStackNavigator();

// Create stack navigation
export default function StackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Back"
        component={ExplorerScreen}
        options={({ navigation }) => ({
          headerShown: false,
        })}
      />
      <Stack.Screen name="ListScreen" component={ListScreen} />
      <Stack.Screen name="MapScreen" component={MapScreen} />
      <Stack.Screen name="MenuCardScreen" component={MenuCardScreen} />
      <Stack.Screen name="ReviewScreen" component={ReviewScreen} />
    </Stack.Navigator>
  );
}
