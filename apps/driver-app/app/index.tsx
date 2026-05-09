import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@jiffylaundry/shared';

const ORANGE = '#ff6b35';
const BG = '#f9fafb';

export default function DriverSplashScreen() {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);

  useEffect(() => {
    // Animate logo fade in and scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Check if driver is authenticated
    const checkAuth = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Show splash for 2 seconds
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Verify user is a driver
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (profile?.role === 'driver') {
            router.replace('/(app)/go-online');
          } else {
            router.replace('/login');
          }
        } else {
          router.replace('/login');
        }
      } catch (err) {
        router.replace('/login');
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.logoContainer, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Image
          source={require('./assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <View style={[styles.badgeDot, styles.badgeDotActive]} />
            <View style={styles.badgeDot} />
          </View>
        </View>
      </Animated.View>
      
      <View style={styles.bottom}>
        <View style={styles.loadingBar}>
          <Animated.View 
            style={[
              styles.loadingBarFill,
              { 
                width: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 150,
    marginBottom: 20,
  },
  badgeContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  badge: {
    flexDirection: 'row',
    gap: 6,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1e293b',
  },
  badgeDotActive: {
    backgroundColor: ORANGE,
  },
  bottom: {
    position: 'absolute',
    bottom: 60,
    width: '70%',
    alignItems: 'center',
  },
  loadingBar: {
    height: 3,
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  loadingBarFill: {
    height: '100%',
    backgroundColor: ORANGE,
  },
});
