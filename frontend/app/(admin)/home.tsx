import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useMQTT } from "@/hooks/useMQTT";

export default function AdminHome() {
  const router = useRouter();
  const { spots, connected, sendBarrier } = useMQTT();
  const freeCount = spots.filter((s) => s === 0).length;
  const barrierOpen = freeCount > 0;

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.wordmark}>Admin Panel</Text>
            <Text style={s.headerSub}>ParkIQ Management</Text>
          </View>
          <View style={s.headerRight}>
            <View
              style={[
                s.liveDot,
                { backgroundColor: connected ? "#00d68f" : "#ff4757" },
              ]}
            />
            <TouchableOpacity onPress={() => router.replace("/role")}>
              <Text style={s.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Card — purple tint for admin */}
        <View style={s.heroCard}>
          <Text style={s.heroLabel}>Available Spots</Text>
          <Text
            style={[
              s.heroNumber,
              { color: freeCount > 0 ? "#00d68f" : "#ff4757" },
            ]}
          >
            {freeCount}
          </Text>
          <Text style={s.heroSub}>of {spots.length} total spots</Text>
          <View style={s.segBar}>
            {spots.map((taken, i) => (
              <View
                key={i}
                style={[
                  s.segItem,
                  { backgroundColor: taken ? "#ff4757" : "#00d68f" },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Barrier Status */}
        <View
          style={[
            s.barrierStatus,
            {
              backgroundColor: barrierOpen ? "#00d68f15" : "#ff475715",
              borderColor: barrierOpen ? "#00d68f44" : "#ff475744",
            },
          ]}
        >
          <View
            style={[
              s.barrierDot,
              { backgroundColor: barrierOpen ? "#00d68f" : "#ff4757" },
            ]}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[
                s.barrierTitle,
                { color: barrierOpen ? "#00d68f" : "#ff4757" },
              ]}
            >
              Barrier {barrierOpen ? "Open" : "Closed"}
            </Text>
            <Text style={s.barrierSub}>
              {barrierOpen ? "Entry permitted" : "Lot full — no entry"}
            </Text>
          </View>
        </View>

        {/* Barrier Control — Admin Only */}
        <Text style={s.sectionLabel}>Barrier Control</Text>
        <View style={s.controlCard}>
          <Text style={s.controlNote}>Manual override — use with caution</Text>
          <View style={s.controlRow}>
            <TouchableOpacity
              style={[s.controlBtn, { backgroundColor: "#00d68f" }]}
              onPress={() => sendBarrier("OPEN")}
            >
              <Text style={s.controlBtnIcon}>↑</Text>
              <Text style={s.controlBtnText}>Open Gate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.controlBtn, { backgroundColor: "#ff4757" }]}
              onPress={() => sendBarrier("CLOSE")}
            >
              <Text style={s.controlBtnIcon}>↓</Text>
              <Text style={s.controlBtnText}>Close Gate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Parking Grid */}
        <Text style={s.sectionLabel}>Parking Map</Text>
        <View style={s.grid}>
          {spots.map((taken, i) => (
            <View
              key={i}
              style={[
                s.spotCard,
                {
                  backgroundColor: taken ? "#1a0810" : "#081a10",
                  borderColor: taken ? "#ff475744" : "#00d68f44",
                },
              ]}
            >
              <Text
                style={[s.spotNum, { color: taken ? "#ff4757" : "#00d68f" }]}
              >
                P{i + 1}
              </Text>
              <Text style={s.spotIcon}>{taken ? "🚗" : "  "}</Text>
              <View
                style={[
                  s.spotBadge,
                  { backgroundColor: taken ? "#ff475722" : "#00d68f22" },
                ]}
              >
                <Text
                  style={[
                    s.spotBadgeText,
                    { color: taken ? "#ff4757" : "#00d68f" },
                  ]}
                >
                  {taken ? "Taken" : "Free"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={s.footer}>Updated every 2 seconds</Text>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050814" },
  scroll: { padding: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  wordmark: { fontSize: 22, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 12, color: "#4a5578", marginTop: 2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  logoutText: { fontSize: 13, color: "#a78bfa" },
  heroCard: {
    backgroundColor: "#0e0820",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#7c3aed44",
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 11,
    color: "#4a5578",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  heroNumber: { fontSize: 80, fontWeight: "800", lineHeight: 90 },
  heroSub: { fontSize: 14, color: "#4a5578", marginBottom: 20 },
  segBar: { flexDirection: "row", gap: 6, width: "100%" },
  segItem: { flex: 1, height: 6, borderRadius: 3 },
  barrierStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 28,
  },
  barrierDot: { width: 10, height: 10, borderRadius: 5 },
  barrierTitle: { fontSize: 15, fontWeight: "700" },
  barrierSub: { fontSize: 12, color: "#4a5578", marginTop: 2 },
  sectionLabel: {
    fontSize: 11,
    color: "#2a3050",
    letterSpacing: 2,
    marginBottom: 12,
  },
  controlCard: {
    backgroundColor: "#0e0820",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#7c3aed44",
    padding: 20,
    marginBottom: 28,
  },
  controlNote: {
    fontSize: 12,
    color: "#4a5578",
    textAlign: "center",
    marginBottom: 16,
  },
  controlRow: { flexDirection: "row", gap: 12 },
  controlBtn: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  controlBtnIcon: { fontSize: 20, color: "#fff", fontWeight: "800" },
  controlBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  spotCard: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  spotNum: { fontSize: 24, fontWeight: "800" },
  spotIcon: { fontSize: 20 },
  spotBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  spotBadgeText: { fontSize: 11, fontWeight: "600" },
  footer: {
    textAlign: "center",
    fontSize: 11,
    color: "#2a3050",
    marginTop: 24,
  },
});
