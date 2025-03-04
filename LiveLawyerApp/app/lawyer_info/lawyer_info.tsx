import React from "react";
import { Linking, Text, View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Styles } from '@/constants/Styles'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'


export default function Lawyer_info() {
  const phnum = '123-789-1234';
  const handleCall = () =>{
    Linking.openURL('tel:${phnum}');
  };


  return (
    <SafeAreaProvider>
          <SafeAreaView style={Styles.LawyerInfoContainer}>
      
      <Image
        source={require('/workspace/LiveLawyerApp/assets/images/react-logo.png')}
        style={Styles.lawyerlogo}
      />

      <Text style={Styles.LawofficeName}>Doeman's Law Office</Text>
      
      <Text style={Styles.nameText}>John Doeman sqr</Text>

      <TouchableOpacity onPress={handleCall}>
        <Text style={Styles.phoneText}>{phnum}</Text>
      </TouchableOpacity>
    
      </SafeAreaView>
      </SafeAreaProvider>
  );

};
