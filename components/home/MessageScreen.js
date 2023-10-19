//build standard template with text "hi world" 

import React from 'react';
import { Text, View } from 'react-native';

export default function MessageScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>På denne side skal man kunne skrive til restauranter og booke bord</Text>
        </View>
    );
}