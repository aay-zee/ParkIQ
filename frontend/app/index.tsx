import { useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useRouter } from "expo-router";

export default function SplashScreen() {
  const router = useRouter();
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.85);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace("/role");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={s.container}>
      <Animated.View style={[s.logoWrap, { opacity, transform: [{ scale }] }]}>
        <View style={s.iconBox}>
          <Text style={s.iconText}>P</Text>
        </View>
        <Text style={s.title}>ParkIQ</Text>
        <Text style={s.subtitle}>Smart Campus Parking</Text>
      </Animated.View>
      <Text style={s.university}>FAST-NUCES Lahore</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050814",
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: { alignItems: "center", gap: 12 },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#1a3bff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconText: { fontSize: 40, fontWeight: "bold", color: "#fff" },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 4,
  },
  subtitle: { fontSize: 14, color: "#4a5578", letterSpacing: 2 },
  university: {
    position: "absolute",
    bottom: 48,
    fontSize: 12,
    color: "#2a3050",
    letterSpacing: 1,
  },
});
