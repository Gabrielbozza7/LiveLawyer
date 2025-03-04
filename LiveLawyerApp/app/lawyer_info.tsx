import React from "react";
import { Linking, Text, View, TouchableOpacity, StyleSheet } from "react-native";

export default function Lawyer_info() {
  const phnum = '212-255-1234';
  const handleCall = () =>{
    Linking.openURL('tel:${phnum}');
  };


  return (
    <View style={styles.container}>

      <Text style={styles.LawofficeName}>Doeman's Law Office</Text>
      
      <Text style={styles.nameText}>John Doeman sqr</Text>

      <TouchableOpacity onPress={handleCall}>
        <Text style={styles.phoneText}>{phnum}</Text>
      </TouchableOpacity>
    
    </View>
  );

};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dc143c',
  },
  LawofficeName: {
    color: 'blue',
    fontSize: 34,
    marginTop: 16,
  },
  nameText: {
    color: 'blue',
    fontSize: 24,
    marginBottom: 16,
  },
  phoneText: {
    fontSize: 18,
    color: 'blue',
    textDecorationLine: 'underline',
  },
});