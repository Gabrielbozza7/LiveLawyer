import React from "react";
import { Linking, Text, View, TouchableOpacity, StyleSheet, Image } from "react-native";

export default function Lawyer_info() {
  const phnum = '123-789-1234';
  const handleCall = () =>{
    Linking.openURL('tel:${phnum}');
  };


  return (
    <View style={styles.container}>
      
      <Image
        source={require('/workspace/LiveLawyerApp/assets/images/react-logo.png')}
        style={styles.logo}
      />

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
  logo:{
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  LawofficeName: {
    color: 'blue',
    fontSize: 34,
    marginBottom: 20,
  },
  nameText: {
    color: 'blue',
    fontSize: 24,
    marginBottom: 20,
  },
  phoneText: {
    fontSize: 18,
    color: 'blue',
    textDecorationLine: 'underline',
  },
});