import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@jiffylaundry/shared';

const ORANGE = '#ff6b35';
const BG = '#f9fafb';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Animate logo fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Show splash for 2 seconds
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          router.replace('/(app)/home');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (err) {
        router.replace('/(auth)/login');
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
        <Image
          source={require('./assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      
      <View style={styles.bottom}>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 150,
    marginBottom: 40,
  },
  bottom: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d1d5db',
  },
  dotActive: {
    backgroundColor: ORANGE,
  },
});
