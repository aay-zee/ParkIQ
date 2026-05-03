import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Paho from "paho-mqtt";

const MQTT_HOST = "5b0e9d98abd142e4a81ce34960a46917.s1.eu.hivemq.cloud";
const MQTT_PORT = 8884;
const MQTT_USER = "parkiq_esp";
const MQTT_PASS = "Parkiq@2026";

export function useMQTT() {
  const [spots, setSpots] = useState<number[]>([0, 0, 0, 0]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<any>(null);

  useEffect(() => {
    const mqttClient = new Paho.Client(
      MQTT_HOST,
      MQTT_PORT,
      "parkiq_" + Math.random().toString(16).slice(2),
    );

    mqttClient.onConnectionLost = () => setConnected(false);

    mqttClient.onMessageArrived = async (msg: any) => {
      try {
        const data = JSON.parse(msg.payloadString);
        setSpots(data.spots);

        await addDoc(collection(db, "occupancy_logs"), {
          spots: data.spots,
          occupiedCount: data.spots.filter((s: number) => s === 1).length,
          timestamp: serverTimestamp(),
        });
      } catch (e) {
        console.log("Error:", e);
      }
    };

    mqttClient.connect({
      useSSL: true,
      userName: MQTT_USER,
      password: MQTT_PASS,
      onSuccess: () => {
        setConnected(true);
        mqttClient.subscribe("parking/status");
        clientRef.current = mqttClient;
      },
      onFailure: () => setConnected(false),
    });

    return () => {
      if (mqttClient.isConnected()) mqttClient.disconnect();
    };
  }, []);

  const sendBarrier = (command: string) => {
    const client = clientRef.current;
    if (!client || !client.isConnected()) return;
    const msg = new Paho.Message(command);
    msg.destinationName = "parking/barrier";
    client.send(msg);
  };

  return { spots, connected, sendBarrier };
}
