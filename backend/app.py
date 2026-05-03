from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pickle
import numpy as np

app = FastAPI()

app.add_middleware(CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"])

with open("model.pkl", "rb") as f:
    model = pickle.load(f)

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

@app.get("/")
def root():
    return {"status": "ParkIQ backend running"}

@app.get("/predict")
def predict(hour: int, day: int):
    occupancy = model.predict([[hour, day]])[0]
    percentage = round(float(occupancy) * 100, 1)
    return {
        "hour": hour,
        "day": day,
        "day_name": DAYS[day],
        "occupancy_percent": percentage,
        "label": f"{percentage}% expected occupancy on {DAYS[day]} at {hour}:00"
    }

@app.get("/predict/next-hours")
def predict_next_hours(hours: int = 6):
    from datetime import datetime, timedelta
    results = []
    now = datetime.now()
    for i in range(hours):
        future = now + timedelta(hours=i)
        hour = future.hour
        day = future.weekday()
        occupancy = model.predict([[hour, day]])[0]
        percentage = round(float(occupancy) * 100, 1)
        results.append({
            "hour": hour,
            "day": day,
            "day_name": DAYS[day],
            "time_label": future.strftime("%I:%M %p"),
            "occupancy_percent": percentage,
            "label": f"{percentage}% expected occupancy on {DAYS[day]} at {hour}:00"
        })
    return {"predictions": results}