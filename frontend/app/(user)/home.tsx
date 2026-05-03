import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMQTT } from "@/hooks/useMQTT";
import { useRouter } from "expo-router";

export default function UserHome() {
  const { spots, connected } = useMQTT();
  const freeCount = spots.filter((s) => s === 0).length;
  const barrierOpen = freeCount > 0;
  const router = useRouter();

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.wordmark}>ParkIQ</Text>
          <View style={s.headerRight}>
            <View style={s.liveRow}>
              <View
                style={[
                  s.liveDot,
                  { backgroundColor: connected ? "#00d68f" : "#ff4757" },
                ]}
              />
              <Text
                style={[
                  s.liveText,
                  { color: connected ? "#00d68f" : "#ff4757" },
                ]}
              >
                {connected ? "Live" : "Connecting..."}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.replace("/role")}>
              <Text style={s.switchText}>Switch Role</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Card */}
        <View
          style={[
            s.heroCard,
            { borderColor: freeCount > 0 ? "#00d68f33" : "#ff475733" },
          ]}
        >
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
            s.barrierPill,
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
          <View>
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

        {/* Spots Grid */}
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
                  {
                    backgroundColor: taken ? "#ff475722" : "#00d68f22",
                  },
                ]}
              >
                <Text
                  style={[
                    s.spotBadgeText,
                    {
                      color: taken ? "#ff4757" : "#00d68f",
                    },
                  ]}
                >
                  {taken ? "Taken" : "Free"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={s.footer}>Updated every 2 seconds</Text>
        <View style={{ height: 20 }} />
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
    alignItems: "center",
    marginBottom: 28,
  },
  wordmark: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 2,
  },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  liveText: { fontSize: 12, fontWeight: "600" },
  heroCard: {
    backgroundColor: "#080f2e",
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 12,
    color: "#4a5578",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  heroNumber: { fontSize: 80, fontWeight: "800", lineHeight: 90 },
  heroSub: { fontSize: 14, color: "#4a5578", marginBottom: 20 },
  segBar: { flexDirection: "row", gap: 6, width: "100%" },
  segItem: { flex: 1, height: 6, borderRadius: 3 },
  barrierPill: {
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
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
  spotBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  spotBadgeText: { fontSize: 11, fontWeight: "600" },
  footer: {
    textAlign: "center",
    fontSize: 11,
    color: "#2a3050",
    marginTop: 24,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  switchText: {
    fontSize: 12,
    color: "#4a5578",
  },
});
