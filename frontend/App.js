import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from "react-native";
import Paho from "paho-mqtt";

const MQTT_HOST = "5b0e9d98abd142e4a81ce34960a46917.s1.eu.hivemq.cloud";
const MQTT_PORT = 8884;
const MQTT_USER = "parkiq_esp";
const MQTT_PASS = "Parkiq@2026";
const BACKEND_URL = "https://parkiq-backend.onrender.com";

export default function App() {
  const [spots, setSpots] = useState([0, 0, 0, 0]);
  const [connected, setConnected] = useState(false);
  const [client, setClient] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    const mqttClient = new Paho.Client(
      MQTT_HOST,
      MQTT_PORT,
      "parkiq_app_" + Math.random().toString(16).slice(2),
    );

    mqttClient.onConnectionLost = () => {
      setConnected(false);
    };

    mqttClient.onMessageArrived = (message) => {
      try {
        const data = JSON.parse(message.payloadString);
        setSpots(data.spots);
      } catch (e) {
        console.log("Parse error:", e);
      }
    };

    mqttClient.connect({
      useSSL: true,
      userName: MQTT_USER,
      password: MQTT_PASS,
      onSuccess: () => {
        setConnected(true);
        mqttClient.subscribe("parking/status");
      },
      onFailure: (err) => {
        console.log("MQTT failed:", err);
        setConnected(false);
      },
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient.isConnected()) mqttClient.disconnect();
    };
  }, []);

  const sendBarrier = (command) => {
    if (!client || !client.isConnected()) return;
    const msg = new Paho.Message(command);
    msg.destinationName = "parking/barrier";
    client.send(msg);
  };

  const checkPrediction = async () => {
    setPredicting(true);
    setPrediction(null);
    try {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      const res = await fetch(`${BACKEND_URL}/predict?hour=${hour}&day=${day}`);
      const data = await res.json();
      setPrediction(data);
    } catch (e) {
      console.log("Prediction error:", e);
    } finally {
      setPredicting(false);
    }
  };

  const freeCount = spots.filter((s) => s === 0).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      {/* Header */}
      <Text style={styles.title}>ParkIQ</Text>
      <Text style={styles.subtitle}>Campus Parking Monitor</Text>

      {/* Connection status */}
      <View style={styles.statusRow}>
        <View
          style={[
            styles.dot,
            { backgroundColor: connected ? "#2ecc71" : "#e74c3c" },
          ]}
        />
        <Text
          style={[
            styles.statusText,
            { color: connected ? "#2ecc71" : "#e74c3c" },
          ]}
        >
          {connected ? "Live" : "Connecting..."}
        </Text>
      </View>

      {/* Spot count */}
      <Text style={styles.countText}>
        {freeCount} of {spots.length} spots available
      </Text>

      {/* Parking spots grid */}
      <View style={styles.spotsRow}>
        {spots.map((taken, i) => (
          <View
            key={i}
            style={[
              styles.spot,
              { backgroundColor: taken ? "#e74c3c" : "#2ecc71" },
            ]}
          >
            <Text style={styles.spotLabel}>P{i + 1}</Text>
            <Text style={styles.spotStatus}>{taken ? "Taken" : "Free"}</Text>
          </View>
        ))}
      </View>

      {/* Barrier controls */}
      <Text style={styles.sectionLabel}>Barrier Control</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#2ecc71" }]}
          onPress={() => sendBarrier("OPEN")}
        >
          <Text style={styles.btnText}>Open Gate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#e74c3c" }]}
          onPress={() => sendBarrier("CLOSE")}
        >
          <Text style={styles.btnText}>Close Gate</Text>
        </TouchableOpacity>
      </View>

      {/* AI Prediction */}
      <Text style={styles.sectionLabel}>AI Prediction</Text>
      <TouchableOpacity
        style={[
          styles.btn,
          { backgroundColor: "#3498db", alignSelf: "stretch" },
        ]}
        onPress={checkPrediction}
        disabled={predicting}
      >
        <Text style={styles.btnText}>
          {predicting ? "Checking..." : "Predict Current Availability"}
        </Text>
      </TouchableOpacity>

      {prediction && (
        <View style={styles.predictionBox}>
          <Text style={styles.predictionText}>
            Parking is currently{" "}
            <Text
              style={{
                color: prediction.busy ? "#e74c3c" : "#2ecc71",
                fontWeight: "bold",
              }}
            >
              {prediction.busy ? "BUSY" : "FREE"}
            </Text>
          </Text>
          <Text style={styles.predictionSub}>
            Confidence: {prediction.confidence}%
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 13,
    color: "#888",
    marginBottom: 16,
    letterSpacing: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
  },
  countText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "600",
    marginVertical: 20,
  },
  spotsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  spot: {
    width: 74,
    height: 82,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  spotLabel: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  spotStatus: {
    color: "#fff",
    fontSize: 11,
    marginTop: 4,
    opacity: 0.9,
  },
  sectionLabel: {
    color: "#888",
    fontSize: 12,
    letterSpacing: 1,
    alignSelf: "flex-start",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  predictionBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#16213e",
    borderRadius: 12,
    alignItems: "center",
    alignSelf: "stretch",
  },
  predictionText: {
    color: "#fff",
    fontSize: 16,
  },
  predictionSub: {
    color: "#888",
    fontSize: 13,
    marginTop: 6,
  },
});
