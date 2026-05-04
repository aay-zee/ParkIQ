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
import { BarChart } from "react-native-gifted-charts";

const BACKEND_URL = "https://parkiq-backend.onrender.com";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM
const SCREEN_W = Dimensions.get("window").width;

const formatHour = (h: number) => {
  if (h === 0 || h === 24) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
};

const formatHourShort = (h: number) => {
  if (h === 12) return "12p";
  return h < 12 ? `${h}a` : `${h - 12}p`;
};

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

export default function InsightsScreen() {
  // Current prediction state
  const [currentPred, setCurrentPred] = useState<any>(null);
  const [currentLoading, setCurrentLoading] = useState(true);

  // Weekly pattern state
  const [weeklyHour, setWeeklyHour] = useState<number | null>(null);
  const [weeklyData, setWeeklyData] = useState<any[] | null>(null);
  const [weeklyLoading, setWeeklyLoading] = useState(false);

  // Hourly pattern state
  const [hourlyDay, setHourlyDay] = useState<number | null>(null);
  const [hourlyData, setHourlyData] = useState<any[] | null>(null);
  const [hourlyLoading, setHourlyLoading] = useState(false);

  const fetchCurrent = async () => {
    setCurrentLoading(true);
    try {
      const now = new Date();
      const hour = now.getHours();
      const day = (now.getDay() + 6) % 7; // JS Sunday=0 → Python Monday=0
      const r = await fetch(`${BACKEND_URL}/predict?hour=${hour}&day=${day}`);
      setCurrentPred(await r.json());
    } catch (e) {
      console.log("Error:", e);
    } finally {
      setCurrentLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrent();
  }, []);

  const fetchWeekly = async () => {
    if (weeklyHour === null) return;
    setWeeklyLoading(true);
    try {
      const data = await Promise.all(
        [0, 1, 2, 3, 4, 5, 6].map(async (day) => {
          const r = await fetch(
            `${BACKEND_URL}/predict?hour=${weeklyHour}&day=${day}`,
          );
          return r.json();
        }),
      );
      setWeeklyData(data);
    } catch (e) {
      console.log("Error:", e);
    } finally {
      setWeeklyLoading(false);
    }
  };

  const fetchHourly = async () => {
    if (hourlyDay === null) return;
    setHourlyLoading(true);
    try {
      const data = await Promise.all(
        HOURS.map(async (hour) => {
          const r = await fetch(
            `${BACKEND_URL}/predict?hour=${hour}&day=${hourlyDay}`,
          );
          return r.json();
        }),
      );
      setHourlyData(data);
    } catch (e) {
      console.log("Error:", e);
    } finally {
      setHourlyLoading(false);
    }
  };

  const weeklyBarData = weeklyData?.map((p, i) => ({
    value: p.occupancy_percent,
    label: DAYS[i],
    frontColor: getColor(p.occupancy_percent),
    sideColor: getColor(p.occupancy_percent),
    topLabelComponent: () => (
      <Text style={{ fontSize: 10, color: getColor(p.occupancy_percent), fontWeight: "700", marginBottom: 4 }}>
        {Math.round(p.occupancy_percent)}%
      </Text>
    ),
  }));

  const hourlyBarData = hourlyData?.map((p, i) => ({
    value: p.occupancy_percent,
    label: formatHourShort(HOURS[i]),
    frontColor: getColor(p.occupancy_percent),
    sideColor: getColor(p.occupancy_percent),
    topLabelComponent: () => (
      <Text style={{ fontSize: 8, color: getColor(p.occupancy_percent), fontWeight: "700", marginBottom: 2 }}>
        {Math.round(p.occupancy_percent)}%
      </Text>
    ),
  }));

  const chartWidth = SCREEN_W - 88;

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.wordmark}>AI Insights</Text>
          <Text style={s.headerSub}>Random Forest Occupancy Model</Text>
        </View>

        {/* Hero — Current Prediction */}
        {currentLoading && (
          <ActivityIndicator size="large" color="#4d7aff" style={{ marginBottom: 20 }} />
        )}

        {currentPred && !currentLoading && (
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
                ? "Nearly full. Consider arriving after 11 AM."
                : currentPred.occupancy_percent >= 45
                  ? "Moderate traffic. Arrive early to secure a spot."
                  : "Great time to arrive! Plenty of spots available."}
            </Text>
          </View>
        )}

        {/* ─── Weekly Pattern Section ─── */}
        <Text style={s.sectionLabel}>Weekly Pattern</Text>
        <View style={s.formCard}>
          <Text style={s.formLabel}>Select an hour to see occupancy across all days</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={s.chipRow}>
              {HOURS.map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[s.chip, weeklyHour === h && s.chipActive]}
                  onPress={() => setWeeklyHour(h)}
                >
                  <Text style={[s.chipText, weeklyHour === h && s.chipTextActive]}>
                    {formatHour(h)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <TouchableOpacity
            style={[s.generateBtn, weeklyHour === null && s.generateBtnDisabled]}
            onPress={fetchWeekly}
            disabled={weeklyHour === null}
          >
            <Text style={s.generateBtnText}>Generate Weekly Pattern</Text>
          </TouchableOpacity>
        </View>

        {weeklyLoading && (
          <ActivityIndicator size="large" color="#4d7aff" style={{ marginVertical: 20 }} />
        )}

        {weeklyBarData && !weeklyLoading && (
          <View style={s.chartCard}>
            <Text style={s.chartTitle}>
              All Days at {formatHour(weeklyHour!)}
            </Text>
            <BarChart
              data={weeklyBarData}
              width={chartWidth}
              height={180}
              barWidth={(chartWidth - 80) / 10}
              spacing={(chartWidth - 80) / 18}
              barBorderTopLeftRadius={6}
              barBorderTopRightRadius={6}
              noOfSections={4}
              maxValue={100}
              yAxisTextStyle={{ color: "#4a5578", fontSize: 10 }}
              xAxisLabelTextStyle={{ color: "#8a95b8", fontSize: 11, fontWeight: "600" }}
              yAxisSuffix="%"
              backgroundColor="#080f2e"
              xAxisColor="#1a3bff22"
              yAxisColor="#1a3bff22"
              rulesColor="#1a3bff15"
              isAnimated
              animationDuration={600}
              showGradient
            />
          </View>
        )}

        {/* ─── Hourly Pattern Section ─── */}
        <Text style={s.sectionLabel}>Hourly Pattern</Text>
        <View style={s.formCard}>
          <Text style={s.formLabel}>Select a day to see hourly occupancy (8 AM – 8 PM)</Text>
          <View style={s.chipRow}>
            {DAYS.map((d, i) => (
              <TouchableOpacity
                key={i}
                style={[s.chip, hourlyDay === i && s.chipActive]}
                onPress={() => setHourlyDay(i)}
              >
                <Text style={[s.chipText, hourlyDay === i && s.chipTextActive]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[s.generateBtn, hourlyDay === null && s.generateBtnDisabled]}
            onPress={fetchHourly}
            disabled={hourlyDay === null}
          >
            <Text style={s.generateBtnText}>Generate Hourly Pattern</Text>
          </TouchableOpacity>
        </View>

        {hourlyLoading && (
          <ActivityIndicator size="large" color="#4d7aff" style={{ marginVertical: 20 }} />
        )}

        {hourlyBarData && !hourlyLoading && (
          <>
            <View style={s.chartCard}>
              <Text style={s.chartTitle}>
                {DAYS[hourlyDay!]} — Hourly Breakdown
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={hourlyBarData}
                  width={Math.max(chartWidth, hourlyBarData.length * 36)}
                  height={180}
                  barWidth={22}
                  spacing={14}
                  barBorderTopLeftRadius={6}
                  barBorderTopRightRadius={6}
                  noOfSections={4}
                  maxValue={100}
                  yAxisTextStyle={{ color: "#4a5578", fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: "#8a95b8", fontSize: 9, fontWeight: "600" }}
                  yAxisSuffix="%"
                  backgroundColor="#080f2e"
                  xAxisColor="#1a3bff22"
                  yAxisColor="#1a3bff22"
                  rulesColor="#1a3bff15"
                  isAnimated
                  animationDuration={600}
                  disablePress
                />
              </ScrollView>
            </View>

            {/* Hourly Detail List */}
            {hourlyData!.map((p, i) => (
              <View key={i} style={s.predRow}>
                <View style={s.predLeft}>
                  <Text style={s.predTime}>{formatHour(HOURS[i])}</Text>
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
                  <Text style={[s.predPct, { color: getColor(p.occupancy_percent) }]}>
                    {p.occupancy_percent}%
                  </Text>
                  <Text style={[s.predStatus, { color: getColor(p.occupancy_percent) }]}>
                    {getLabel(p.occupancy_percent)}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Legend */}
        <View style={s.legend}>
          {[
            { color: "#00d68f", label: "Free  (0–44%)" },
            { color: "#ffa502", label: "Moderate  (45–74%)" },
            { color: "#ff4757", label: "Busy  (75%+)" },
          ].map((item) => (
            <View key={item.label} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: item.color }]} />
              <Text style={s.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>

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
  formCard: {
    backgroundColor: "#080f2e",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1a3bff22",
    padding: 20,
    marginBottom: 20,
    gap: 14,
  },
  formLabel: {
    fontSize: 13,
    color: "#4a5578",
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#0d1a3a",
    borderWidth: 1,
    borderColor: "#1a3bff22",
  },
  chipActive: {
    backgroundColor: "#1a3bff",
    borderColor: "#1a3bff",
  },
  chipText: {
    fontSize: 13,
    color: "#4a5578",
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#fff",
  },
  generateBtn: {
    backgroundColor: "#1a3bff",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  generateBtnDisabled: {
    backgroundColor: "#1a3bff44",
  },
  generateBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  chartCard: {
    backgroundColor: "#080f2e",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1a3bff22",
    padding: 20,
    marginBottom: 20,
    overflow: "hidden",
  },
  chartTitle: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
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
  predLeft: { width: 62 },
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
    marginTop: 12,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: "#4a5578", fontSize: 13 },
});
