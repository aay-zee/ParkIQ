# ParkIQ

ParkIQ is a smart campus parking prototype built for **IO4041 - Introduction to Internet of Things**, FAST-NUCES Lahore, Spring 2026. It combines an ESP32 and four ultrasonic sensors with an Expo mobile app, MQTT messaging, Firestore logging, and a FastAPI occupancy prediction service.

## App features

- **Role selection:** enter the student dashboard or the administrator login.
- **Student dashboard:** view four parking spaces, occupied/available counts, and MQTT connection status.
- **Insights:** view a current occupancy prediction, compare predictions across the week for a selected hour, and view hourly predictions for a selected day.
- **Administrator dashboard:** monitor occupancy and send `OPEN`, `CLOSE`, or `AUTO` barrier commands.
- **Logging:** the mobile MQTT hook records received occupancy updates in Firestore.

This is a course prototype. Predictions use synthetic training data and do not represent validated campus occupancy forecasts.

## How the system works

```text
4 ultrasonic sensors --> ESP32 --> HiveMQ Cloud --> Expo app --> Firestore
                         |              ^              |
                         v              |              |
                     Servo barrier <----+-- commands --+

Expo insights screen --> FastAPI --> Random Forest model
```

The ESP32 publishes occupancy over MQTT. The app subscribes directly to the broker and writes status messages to Firestore; FastAPI does not receive sensor readings or write those logs. The prediction model reads the local training CSV rather than Firestore history.

## Folder structure

```text
ParkIQ/
|-- README.md
|-- .gitignore
|-- backend/
|   |-- app.py                  # FastAPI application and prediction endpoints
|   |-- model.py                # Train and save the Random Forest model
|   |-- model.pkl               # Saved model loaded by app.py
|   |-- parking_data.csv        # Synthetic training data
|   `-- requirements.txt
|-- firmware/
|   `-- parkiq_esp32/
|       |-- parkiq_esp32.ino    # ESP32 sensors, MQTT, and servo logic
|       |-- secrets.example.h  # Committed configuration template
|       `-- secrets.h          # Local credentials; ignored by Git
`-- frontend/
    |-- app/
    |   |-- _layout.tsx
    |   |-- index.tsx          # Startup screen
    |   |-- role.tsx           # Role selection
    |   |-- admin-login.tsx
    |   |-- (user)/            # Student home and insights tabs
    |   `-- (admin)/           # Administrator dashboard
    |-- hooks/
    |   `-- useMQTT.ts         # MQTT connection, commands, and Firestore logging
    |-- lib/
    |   `-- firebase.ts        # Firebase initialization
    |-- scripts/
    |-- app.json
    |-- .env.example        # Public configuration template
    |-- package.json
    |-- package-lock.json
    |-- tsconfig.json
    `-- eslint.config.js
```

The tree shows the main application files. Local dependency folders, caches, and ZIP archives are omitted.

## Technology

| Part | Technology |
|---|---|
| Hardware | ESP32, four HC-SR04 sensors, SG90 servo |
| Firmware | Arduino C++, PubSubClient, ESP32Servo |
| Mobile app | Expo SDK 54, React Native, TypeScript, Expo Router |
| Messaging | HiveMQ Cloud MQTT; Paho over secure WebSockets in the app |
| Logging | Firebase Cloud Firestore |
| Predictions | FastAPI, NumPy, scikit-learn RandomForestRegressor |

## Run the backend

Run these commands from the repository root in PowerShell:

```powershell
cd backend
python -m venv venv
.env\Scripts\Activate.ps1
pip install -r requirements.txt
# Train if model.pkl is absent or you want to regenerate it:
python model.py
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Run training and the API from `backend/`: both scripts use relative paths for their data/model files. Only load trusted pickle files. The training script fits a 100-tree Random Forest using `hour` and `day` to predict occupancy as a fraction.

Open `http://localhost:8000/docs` for the API interface.

| Endpoint | Purpose |
|---|---|
| `GET /` | Health response |
| `GET /predict?hour=9&day=0` | Predicted occupancy percentage for one hour/day |
| `GET /predict/next-hours?hours=6` | Predictions starting at the current hour in Pakistan time |

Use hours `0-23` and days `0-6` (Monday through Sunday). The current insights screen calls `/predict` for its current, weekly, and hourly views. Its current-hour calculation uses device time; `/predict/next-hours` uses UTC+5.

## Run the mobile app

From the repository root:

```powershell
cd frontend
npm install
```

Copy the environment template and fill in your local administrator and MQTT settings:

```powershell
Copy-Item .env.example .env
```

Skip the copy if `.env` is already configured. Set `EXPO_PUBLIC_ADMIN_USER`, `EXPO_PUBLIC_ADMIN_PASS`, `EXPO_PUBLIC_MQTT_HOST`, `EXPO_PUBLIC_MQTT_PORT`, `EXPO_PUBLIC_MQTT_USER`, and `EXPO_PUBLIC_MQTT_PASS`.

These values are bundled into the app and provide only a demonstration login, not secure server-side authorization.

Review the configuration locations before starting:

| File | Configuration |
|---|---|
| `frontend/.env` | MQTT broker host, WebSocket port, credentials, and demo administrator login |
| `frontend/lib/firebase.ts` | Firebase project configuration |
| `frontend/app/(user)/insights.tsx` | `BACKEND_URL`, currently pointing to a Render endpoint |

For a local backend, set `BACKEND_URL` to an address reachable from the device, such as `http://<computer-LAN-IP>:8000`. A physical phone cannot reach your computer through `localhost`. Configure Firestore access rules for the intended users and the `occupancy_logs` collection.

```powershell
npx expo start
```

Open the app through Expo Go or use the development options appropriate to your environment. `npm run web` starts the web target and `npm run lint` runs Expo ESLint. Restart Expo after changing `.env` values.

## Configure and upload the ESP32

1. Install Arduino IDE with ESP32 board support and the **PubSubClient** and **ESP32Servo** libraries.
2. Copy the configuration template from the repository root:

   ```powershell
   Copy-Item firmware/parkiq_esp32/secrets.example.h firmware/parkiq_esp32/secrets.h
   ```

   Skip this copy if you already have a configured `secrets.h`; copying again overwrites it.
3. Edit `secrets.h` with your Wi-Fi SSID/password and MQTT host, port, username, and password. The sketch already includes this header.
4. Open `firmware/parkiq_esp32/parkiq_esp32.ino`, select the correct ESP32 board and serial port, then compile and upload.
5. Open Serial Monitor at **115200 baud** to inspect connection and sensor output.

### Why two secrets files?

- **`secrets.h`** contains actual local credentials. It is ignored by Git and must stay private.
- **`secrets.example.h`** contains placeholders so collaborators know which settings are required. Commit this template; it is not ignored.

Only `secrets.h` belongs in `.gitignore`. Never put real credentials in the example file. The Arduino header configures only the firmware; it does not change the frontend's MQTT settings.

### Wiring and firmware behavior

| Component | ESP32 GPIO |
|---|---|
| Sensor 1 TRIG / ECHO | 2 / 15 |
| Sensor 2 TRIG / ECHO | 16 / 17 |
| Sensor 3 TRIG / ECHO | 23 / 22 |
| Sensor 4 TRIG / ECHO | 14 / 12 |
| Servo signal | 27 |

Use suitable level shifting or a voltage divider for HC-SR04 ECHO outputs before connecting to 3.3 V GPIO, and provide appropriate servo power with a common ground.

The existing firmware marks a spot occupied when its measured distance is greater than zero and less than 20 cm. Timeouts/no echo are reported as vacant. It publishes roughly every two seconds, plus sensor and network delays. Automatic mode opens the barrier when at least one spot is vacant and closes it when all four are occupied. The servo starts open; `OPEN` and `CLOSE` override automatic control for 30 seconds, and `AUTO` clears the override.

## MQTT and stored data

The device connects on port **8883** using WiFiClientSecure. The app connects on port **8884** using secure WebSockets.

| Topic | Direction | Payload |
|---|---|---|
| `parking/status` | ESP32 to app | `{"spots":[0,1,0,1]}` |
| `parking/barrier` | App to ESP32 | `OPEN`, `CLOSE`, or `AUTO` |

`0` means vacant and `1` means occupied. Each received occupancy update is written by the mobile hook to Firestore's `occupancy_logs` collection with `spots`, `occupiedCount`, and a server `timestamp`. Multiple connected clients can create duplicate log entries.

## Current limitations

- The firmware retains its original behavior, including blocking network reconnects, timeout-as-vacant sensor handling, and `setInsecure()`, which disables broker certificate verification.
- Frontend MQTT credentials now come from the ignored `.env`; `.env.example` contains placeholders. Expo bundles `EXPO_PUBLIC_*` values into the client, so this keeps credentials out of source control but does not hide them from app users. Rotate previously exposed credentials in HiveMQ, update both `.env` and firmware `secrets.h`, and restrict broker permissions. Existing Git history may still contain old credentials.
- The administrator login is a client-side comparison; it does not enforce permission to publish barrier commands at the broker.
- The app infers barrier state from occupancy rather than receiving servo position acknowledgments.
- The MQTT hook has no explicit reconnect/backoff logic or payload schema validation.
- Predictions are based on synthetic CSV data, with no reported held-out accuracy evaluation or online training from Firestore.
- No end-to-end setup or hardware verification is claimed by this documentation.

## Team

Aneeq Zafar, Usama Walayat, and Ayaz Kahloon. Instructor: Dr. Ammar Haider.

No license file is currently included.
