import { Text, View, Button, Alert } from "react-native";
import {FlatList, StyleSheet, StatusBar} from "react-native";
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';


const DATA = [
  {
    id: '1',
    name: 'Mom',
    phone: '(012) 345 - 6789'
  },
  {
    id: '2',
    name: 'Dad',
    phone: '(111) 111 - 1111',
  },
  {
    id: '3',
    name: 'Contact Three',
    phone: '(222) 222 - 2222',
  },
];

type ItemProps = {name: string, phone: string};

const Item = ({name, phone}: ItemProps) => (
  <View style={styles.item}>
    <Text style={styles.name}>{name}</Text>
    <Text style={styles.phone}>{phone}</Text>
  </View>
);

export default function Index() {
  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.container}>
      <FlatList
        data={DATA}
        renderItem={({item}) => <Item name={item.name} phone={item.phone}/>}
        keyExtractor={item => item.id}
      />
    </SafeAreaView>
    <SafeAreaView style={styles.container}>
    <Button
          onPress={() => {Alert.alert("Contact button pressed.")}}
          title="Add Contact"
          color="#0000ff"
          accessibilityLabel="Add a contact to the contact list."
        />
    </SafeAreaView>
  </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: '#ff0000'
  },
  item: {
    backgroundColor: '#0000ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  name: {
    fontSize: 32,
    color: '#ffffff'
  },
  phone: {
    fontSize: 16,
    color: '#808080'
  },
});