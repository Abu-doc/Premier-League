from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import pandas as pd
from engine.model import match_probabilities, simulate_season, monte_carlo

app = FastAPI()

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MatchRequest(BaseModel):
    home_team: str
    away_team: str
    home_lineup: list = []
    away_lineup: list = []
    current_home_score: int = 0
    current_away_score: int = 0
    minute: int = 0
    home_reds: int = 0
    away_reds: int = 0

@app.get("/")
def home():
    return {"message": "Neural Engine API Operational 🚀"}

@app.get("/get-squad")
def get_squad(team: str):
    # This ensures the script finds the JSON even if you run from a different directory
    base_path = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(base_path, "processed_players.json")
    
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # DEBUG LOGS - Check these in your terminal!
        print(f"--- SQUAD REQUEST ---")
        print(f"FRONTEND REQUEST: '{team}'")
        print(f"JSON KEYS DETECTED: {list(data.keys())[:5]}... (and more)")
        
        squad = data.get(team, [])
        
        if not squad:
            print(f"⚠️ MATCH FAIL: '{team}' does not match any key in JSON.")
        else:
            print(f"✅ MATCH SUCCESS: Found {len(squad)} players for {team}")
            
        return squad

    except FileNotFoundError:
        print(f"❌ ERROR: processed_players.json NOT FOUND at {json_path}")
        raise HTTPException(status_code=404, detail="JSON file not found")
    except Exception as e:
        print(f"❌ CRITICAL ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-match")
def predict(data: MatchRequest):
    return match_probabilities(
        data.home_team, data.away_team, 
        data.home_lineup, data.away_lineup,
        data.current_home_score, data.current_away_score,
        data.minute, data.home_reds, data.away_reds
    )

@app.get("/match-heatmap")
def heatmap(home_team: str, away_team: str, h_score: int = 0, a_score: int = 0, min: int = 0):
    from scipy.stats import poisson
    res = predict(MatchRequest(
        home_team=home_team, away_team=away_team, 
        current_home_score=h_score, current_away_score=a_score, minute=min
    ))
    hxg, axg = res["home_xg_remaining"], res["away_xg_remaining"]
    
    grid = []
    for i in range(5):
        for j in range(5):
            prob = poisson.pmf(i, hxg) * poisson.pmf(j, axg)
            grid.append({"x": i + h_score, "y": j + a_score, "prob": round(prob * 100, 2)})
    return grid

@app.get("/simulate-season")
def simulate():
    return simulate_season().to_dict(orient="records")

@app.get("/champion-probabilities")
def champions():
    return monte_carlo(100)

@app.get("/team-strengths")
def strengths():
    return pd.read_csv("team_strengths.csv").to_dict(orient="records")