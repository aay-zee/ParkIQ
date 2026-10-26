#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ESP32Servo.h>

#include "secrets.h"

const char *TOPIC_STATUS = "parking/status";
const char *TOPIC_BARRIER = "parking/barrier";

const int TRIG[] = {2, 16, 23, 14};
const int ECHO[] = {15, 17, 22, 12};
const int NUM_SPOTS = 4;
const int SERVO_PIN = 27;

// Override state
bool manualOverride = false;
unsigned long overrideUntil = 0;
const unsigned long OVERRIDE_DURATION = 30000; // 30 seconds

WiFiClientSecure espClient;
PubSubClient mqtt(espClient);
Servo barrier;

long getDistance(int trig, int echo)
{
  digitalWrite(trig, LOW);
  delayMicroseconds(4);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);
  long dur = pulseIn(echo, HIGH, 60000);
  if (dur == 0)
    return -1;
  return dur * 0.034 / 2;
}

void onMessage(char *topic, byte *payload, unsigned int len)
{
  String msg = "";
  for (int i = 0; i < len; i++)
    msg += (char)payload[i];
  Serial.print("Command received: ");
  Serial.println(msg);

  if (msg == "OPEN")
  {
    barrier.write(90);
    manualOverride = true;
    overrideUntil = millis() + OVERRIDE_DURATION;
    Serial.println("Manual override: OPEN (30s)");
  }
  else if (msg == "CLOSE")
  {
    barrier.write(0);
    manualOverride = true;
    overrideUntil = millis() + OVERRIDE_DURATION;
    Serial.println("Manual override: CLOSE (30s)");
  }
  else if (msg == "AUTO")
  {
    manualOverride = false;
    Serial.println("Returned to automatic mode");
  }
}

void connectMQTT()
{
  espClient.setInsecure();
  while (!mqtt.connected())
  {
    Serial.print("Connecting to HiveMQ...");
    if (mqtt.connect("ESP32_ParkIQ", MQTT_USER, MQTT_PASS))
    {
      Serial.println(" Connected!");
      mqtt.subscribe(TOPIC_BARRIER);
    }
    else
    {
      Serial.print(" Failed, rc=");
      Serial.print(mqtt.state());
      Serial.println(" ? retrying in 3s");
      delay(3000);
    }
  }
}

void setup()
{
  Serial.begin(115200);

  for (int i = 0; i < NUM_SPOTS; i++)
  {
    pinMode(TRIG[i], OUTPUT);
    pinMode(ECHO[i], INPUT);
    digitalWrite(TRIG[i], LOW);
  }

  barrier.attach(SERVO_PIN);
  barrier.write(90);

  Serial.print("Connecting to WiFi: ");
  Serial.print(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("WiFi connected! IP: ");
  Serial.println(WiFi.localIP());

  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setCallback(onMessage);
}

void loop()
{
  if (!mqtt.connected())
    connectMQTT();
  mqtt.loop();

  // Check if override has expired
  if (manualOverride && millis() > overrideUntil)
  {
    manualOverride = false;
    Serial.println("Override expired — returning to auto mode");
  }

  int occupiedCount = 0;
  String payload = "{\"spots\":[";

  for (int i = 0; i < NUM_SPOTS; i++)
  {
    long dist = getDistance(TRIG[i], ECHO[i]);
    int taken = (dist > 0 && dist < 20) ? 1 : 0;
    occupiedCount += taken;

    Serial.print("Spot ");
    Serial.print(i + 1);
    Serial.print(": ");
    if (dist == -1)
      Serial.println("No echo");
    else
    {
      Serial.print(dist);
      Serial.println(" cm");
    }

    payload += taken;
    if (i < NUM_SPOTS - 1)
      payload += ",";
  }
  payload += "]}";

  // Only run automatic barrier logic if not in manual override
  if (!manualOverride)
  {
    if (occupiedCount < NUM_SPOTS)
    {
      barrier.write(90);
      Serial.println("Barrier: OPEN (auto)");
    }
    else
    {
      barrier.write(0);
      Serial.println("Barrier: CLOSED (auto)");
    }
  }
  else
  {
    Serial.print("Barrier: MANUAL OVERRIDE — expires in ");
    Serial.print((overrideUntil - millis()) / 1000);
    Serial.println("s");
  }

  mqtt.publish(TOPIC_STATUS, payload.c_str());
  Serial.println("---");
  delay(2000);
}