import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BACKEND_URL = "https://parkiq-backend.onrender.com";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const W = Dimensions.get("window").width - 48;

export default function InsightsScreen() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [weekly, setWeekly] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/predict/next-hours?hours=8`);
      const data = await res.json();
      setPredictions(data.predictions);

      // Fetch weekly pattern (all 7 days at peak hour 9am)
      const weeklyData = await Promise.all(
        [0, 1, 2, 3, 4, 5, 6].map(async (day) => {
          const r = await fetch(`${BACKEND_URL}/predict?hour=9&day=${day}`);
          return r.json();
        }),
      );
      setWeekly(weeklyData);
    } catch (e) {
      console.log("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const getColor = (pct: number) => {
    if (pct >= 75) return "#ff4757";
    if (pct >= 45) return "#ffa502";
    return "#00d68f";
  };

  const getLabel = (pct: number) => {
    if (pct >= 75) return "Busy";
    if (pct >= 45) return "Moderate";
    return "Free";
  };

  const now = new Date();
  const currentPred = predictions[0];

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.wordmark}>AI Insights</Text>
          <Text style={s.headerSub}>Random Forest Occupancy Model</Text>
        </View>

        {loading && (
          <ActivityIndicator
            size="large"
            color="#4d7aff"
            style={{ marginTop: 60 }}
          />
        )}

        {!loading && currentPred && (
          <>
            {/* Current Prediction Hero */}
            <View
              style={[
                s.heroCard,
                { borderColor: getColor(currentPred.occupancy_percent) + "44" },
              ]}
            >
              <Text style={s.heroLabel}>Right Now</Text>
              <Text
                style={[
                  s.heroPct,
                  { color: getColor(currentPred.occupancy_percent) },
                ]}
              >
                {currentPred.occupancy_percent}%
              </Text>
              <Text style={s.heroSub}>Expected Occupancy</Text>
              <View
                style={[
                  s.statusBadge,
                  {
                    backgroundColor:
                      getColor(currentPred.occupancy_percent) + "22",
                  },
                ]}
              >
                <Text
                  style={[
                    s.statusBadgeText,
                    { color: getColor(currentPred.occupancy_percent) },
                  ]}
                >
                  {getLabel(currentPred.occupancy_percent)}
                </Text>
              </View>
              <Text style={s.heroTip}>
                {currentPred.occupancy_percent >= 75
                  ? "🚗 Nearly full. Consider arriving after 11 AM."
                  : currentPred.occupancy_percent >= 45
                    ? "⚡ Moderate traffic. Arrive early to secure a spot."
                    : "✅ Great time to arrive! Plenty of spots available."}
              </Text>
            </View>

            {/* Bar Chart — Next 8 Hours */}
            <Text style={s.sectionLabel}>Next 8 Hours Forecast</Text>
            <View style={s.chartCard}>
              <View style={s.barChart}>
                {predictions.map((p, i) => {
                  const barH = (p.occupancy_percent / 100) * 120;
                  return (
                    <View key={i} style={s.barCol}>
                      <Text
                        style={[
                          s.barPct,
                          { color: getColor(p.occupancy_percent) },
                        ]}
                      >
                        {Math.round(p.occupancy_percent)}%
                      </Text>
                      <View style={s.barTrack}>
                        <View
                          style={[
                            s.barFill,
                            {
                              height: barH,
                              backgroundColor: getColor(p.occupancy_percent),
                            },
                          ]}
                        />
                      </View>
                      <Text style={s.barLabel}>
                        {p.time_label.split(":")[0]}
                        {p.time_label.includes("AM") ? "a" : "p"}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Weekly Pattern Chart */}
            <Text style={s.sectionLabel}>Weekly Pattern (9 AM)</Text>
            <View style={s.chartCard}>
              <View style={s.barChart}>
                {weekly.map((p, i) => {
                  const barH = (p.occupancy_percent / 100) * 120;
                  return (
                    <View key={i} style={s.barCol}>
                      <Text
                        style={[
                          s.barPct,
                          { color: getColor(p.occupancy_percent) },
                        ]}
                      >
                        {Math.round(p.occupancy_percent)}%
                      </Text>
                      <View style={s.barTrack}>
                        <View
                          style={[
                            s.barFill,
                            {
                              height: barH,
                              backgroundColor: getColor(p.occupancy_percent),
                            },
                          ]}
                        />
                      </View>
                      <Text style={s.barLabel}>{DAYS[i]}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Hourly Breakdown List */}
            <Text style={s.sectionLabel}>Hourly Breakdown</Text>
            {predictions.map((p, i) => (
              <View key={i} style={s.predRow}>
                <View style={s.predLeft}>
                  <Text style={s.predTime}>{p.time_label}</Text>
                  <Text style={s.predDay}>{p.day_name}</Text>
                </View>
                <View style={s.predBarWrap}>
                  <View
                    style={[
                      s.predFill,
                      {
                        width: `${p.occupancy_percent}%` as any,
                        backgroundColor: getColor(p.occupancy_percent),
                      },
                    ]}
                  />
                </View>
                <View style={s.predRight}>
                  <Text
                    style={[
                      s.predPct,
                      { color: getColor(p.occupancy_percent) },
                    ]}
                  >
                    {p.occupancy_percent}%
                  </Text>
                  <Text
                    style={[
                      s.predStatus,
                      { color: getColor(p.occupancy_percent) },
                    ]}
                  >
                    {getLabel(p.occupancy_percent)}
                  </Text>
                </View>
              </View>
            ))}

            {/* Legend */}
            <View style={s.legend}>
              {[
                { color: "#00d68f", label: "Free  (0–44%)" },
                { color: "#ffa502", label: "Moderate  (45–74%)" },
                { color: "#ff4757", label: "Busy  (75%+)" },
              ].map((item) => (
                <View key={item.label} style={s.legendItem}>
                  <View
                    style={[s.legendDot, { backgroundColor: item.color }]}
                  />
                  <Text style={s.legendText}>{item.label}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={s.refreshBtn} onPress={fetchAll}>
              <Text style={s.refreshText}>Refresh Predictions</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050814" },
  scroll: { padding: 24 },
  header: { marginBottom: 24 },
  wordmark: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
  },
  headerSub: { fontSize: 12, color: "#2a3050", marginTop: 4, letterSpacing: 1 },
  heroCard: {
    backgroundColor: "#080f2e",
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    marginBottom: 28,
    gap: 8,
  },
  heroLabel: { fontSize: 11, color: "#4a5578", letterSpacing: 2 },
  heroPct: { fontSize: 72, fontWeight: "800", lineHeight: 80 },
  heroSub: { fontSize: 13, color: "#4a5578" },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  statusBadgeText: { fontSize: 13, fontWeight: "700" },
  heroTip: {
    fontSize: 13,
    color: "#4a5578",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 11,
    color: "#2a3050",
    letterSpacing: 2,
    marginBottom: 12,
  },
  chartCard: {
    backgroundColor: "#080f2e",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1a3bff22",
    padding: 20,
    marginBottom: 28,
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 160,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  barPct: { fontSize: 9, fontWeight: "600" },
  barTrack: {
    width: "60%",
    height: 120,
    backgroundColor: "#0d1a3a",
    borderRadius: 6,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: { width: "100%", borderRadius: 6 },
  barLabel: { fontSize: 10, color: "#2a3050", fontWeight: "600" },
  predRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#080f2e",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1a3bff15",
    padding: 14,
    marginBottom: 8,
    gap: 10,
  },
  predLeft: { width: 72 },
  predTime: { color: "#fff", fontSize: 13, fontWeight: "700" },
  predDay: { color: "#2a3050", fontSize: 10, marginTop: 2 },
  predBarWrap: {
    flex: 1,
    height: 6,
    backgroundColor: "#0d1a3a",
    borderRadius: 3,
    overflow: "hidden",
  },
  predFill: { height: "100%", borderRadius: 3 },
  predRight: { width: 60, alignItems: "flex-end" },
  predPct: { fontSize: 13, fontWeight: "700" },
  predStatus: { fontSize: 10, marginTop: 2 },
  legend: {
    backgroundColor: "#080f2e",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1a3bff15",
    padding: 16,
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: "#4a5578", fontSize: 13 },
  refreshBtn: {
    backgroundColor: "#1a3bff",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  refreshText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
