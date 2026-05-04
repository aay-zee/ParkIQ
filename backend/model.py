import pickle
import numpy as np
import csv
import random
from sklearn.ensemble import RandomForestRegressor

random.seed(42)

rows = []

for week in range(8):
    for day in range(7):
        for hour in range(24):
            if day < 5:  # Monday–Friday (8 AM – 8 PM)
                if hour < 8 or hour >= 20:
                    occupancy = 0.0
                elif 8 <= hour <= 10:
                    occupancy = random.uniform(0.75, 0.95)
                elif hour == 11:
                    occupancy = random.uniform(0.55, 0.75)
                elif 12 <= hour <= 13:
                    occupancy = random.uniform(0.60, 0.80)
                elif 14 <= hour <= 15:
                    occupancy = random.uniform(0.40, 0.60)
                elif 16 <= hour <= 18:
                    occupancy = random.uniform(0.70, 0.90)
                else:
                    occupancy = random.uniform(0.10, 0.25)

            elif day == 5:  # Saturday (8 AM – 8 PM)
                if hour < 8 or hour >= 20:
                    occupancy = 0.0
                elif 10 <= hour <= 14:
                    occupancy = random.uniform(0.15, 0.35)
                else:
                    occupancy = random.uniform(0.05, 0.15)

            else:  # Sunday — university closed
                occupancy = 0.0

            rows.append([day, hour, round(occupancy, 2)])

with open("parking_data.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["day", "hour", "occupancy"])
    writer.writerows(rows)

print(f"CSV created with {len(rows)} rows.")

X = []
y = []

with open("parking_data.csv", "r") as f:
    reader = csv.DictReader(f)
    for row in reader:
        X.append([int(row["hour"]), int(row["day"])])
        y.append(float(row["occupancy"]))

X = np.array(X)
y = np.array(y)

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

print("Model trained and saved.")