import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { supabase } from './lib/supabase'

export default function Profile() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUserInfo = async () => {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();
  
      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('User')
          .select('*')
          .eq('id', user.id)
          .single();
  
        if (userData) {
          setUserInfo(userData);
        }
  
        if (userError) console.error('User table error:', userError);
      }
  
      setLoading(false);
    };
  
    getUserInfo();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!userInfo) {
    return (
      <View style={styles.centered}>
        <Text>No user found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      <Text style={styles.item}>Email: {userInfo.email}</Text>
      <Text style={styles.item}>User ID: {userInfo.id}</Text>
      <Text style={styles.item}>Name: {userInfo.firstName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  item: { fontSize: 16, marginBottom: 8 },
});
