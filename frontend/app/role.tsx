import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RoleScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>ParkIQ</Text>
        <Text style={s.heading}>Who are you?</Text>
        <Text style={s.sub}>Select your role to continue</Text>
      </View>

      <View style={s.cards}>
        {/* Student Card */}
        <TouchableOpacity
          style={[s.card, s.cardBlue]}
          onPress={() => router.replace("/(user)/home")}
          activeOpacity={0.85}
        >
          <View style={[s.cardIcon, { backgroundColor: "#1a3bff22" }]}>
            <Text style={s.cardIconText}>🎓</Text>
          </View>
          <Text style={s.cardTitle}>Student</Text>
          <Text style={s.cardDesc}>
            View live parking availability and AI-powered predictions
          </Text>
          <View style={[s.cardBadge, { backgroundColor: "#1a3bff22" }]}>
            <Text style={[s.cardBadgeText, { color: "#4d7aff" }]}>
              Normal Access
            </Text>
          </View>
        </TouchableOpacity>

        {/* Admin Card */}
        <TouchableOpacity
          style={[s.card, s.cardPurple]}
          onPress={() => router.push("/admin-login")}
          activeOpacity={0.85}
        >
          <View style={[s.cardIcon, { backgroundColor: "#7c3aed22" }]}>
            <Text style={s.cardIconText}>🛡️</Text>
          </View>
          <Text style={s.cardTitle}>Admin</Text>
          <Text style={s.cardDesc}>
            Full system access including barrier control and management
          </Text>
          <View style={[s.cardBadge, { backgroundColor: "#7c3aed22" }]}>
            <Text style={[s.cardBadgeText, { color: "#a78bfa" }]}>
              Requires Login
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050814",
    padding: 24,
  },
  header: { alignItems: "center", marginTop: 32, marginBottom: 48 },
  title: {
    fontSize: 16,
    color: "#4a5578",
    letterSpacing: 3,
    marginBottom: 24,
  },
  heading: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  sub: { fontSize: 14, color: "#4a5578" },
  cards: { gap: 16 },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    gap: 10,
  },
  cardBlue: {
    backgroundColor: "#080f2e",
    borderColor: "#1a3bff44",
  },
  cardPurple: {
    backgroundColor: "#0e0820",
    borderColor: "#7c3aed44",
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  cardIconText: { fontSize: 24 },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },
  cardDesc: {
    fontSize: 14,
    color: "#4a5578",
    lineHeight: 20,
  },
  cardBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },
  cardBadgeText: { fontSize: 12, fontWeight: "600" },
});
