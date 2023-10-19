// components/home/ProfileScreen.js

//importere react
import React from "react";
import { Text, View, Button } from "react-native";
import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";

//navigerer til de ResetPassword og Membership
export default function ProfileScreen({ navigation, route }) {
  const navController = (routeName) => {
    navigation.navigate(routeName);
  };

  const auth = getAuth();
  const user = auth.currentUser
  //handleLogout håndterer log ud af en aktiv bruger.
  //Metoden er en prædefineret metode, som firebase stiller tilrådighed  https://firebase.google.com/docs/auth/web/password-auth#next_steps
  //Metoden er et asynkrontkald.
  const handleLogOut = async () => {
      await signOut(auth).then(() => {
          // Sign-out successful.
        }).catch((error) => {
          // An error happened.
        });
  };

  if (!auth.currentUser) {
    //make a button that navigates to the login screen
    return (
      <View>
        <Text>You are not logged in</Text>
        <Button title="Login" onPress={() => navController("LoginForm")} />
      </View>
    );
  }

  return (

    <View >
    <Text>Current user: {user.email}</Text>
    <Button onPress={() => handleLogOut()} title="Log out" />

      <Button
        title="Reset password"
        onPress={() => navController("ResetPassword")}
      />
      <Button
        title="Change Membership"
        onPress={() => navController("Membership")}
      />
      <Button
        title="Add your restaurant"
        onPress={() => navController("RestaurantSignUpForm")}
      />
    </View>
  );
}
