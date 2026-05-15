import pandas as pd
import numpy as np
from scipy.stats import poisson
from itertools import combinations
import json
import os

# -----------------------------
# LOAD DATA ONCE
# -----------------------------
# Ensure these paths are correct relative to your backend folder
matches = pd.read_csv("EPL_cleaned_dataset.csv")
strengths = pd.read_csv("team_strengths.csv")

league_home_goals = matches["FTHG"].mean()
league_away_goals = matches["FTAG"].mean()

strength_dict = strengths.set_index("Team").to_dict("index")

with open("processed_players.json", "r", encoding="utf-8") as f:
    squad_data = json.load(f)

# Latest season teams logic
latest_season = matches["Season"].max()
season_matches = matches[matches["Season"] == latest_season]
teams = pd.concat([season_matches["HomeTeam"], season_matches["AwayTeam"]]).dropna().unique()

# -----------------------------
# INTELLIGENT HELPERS
# -----------------------------

def get_h2h_modifier(home_team, away_team):
    """Calculates modifier based on last 5 meetings."""
    h2h = matches[((matches['HomeTeam'] == home_team) & (matches['AwayTeam'] == away_team)) |
                  ((matches['HomeTeam'] == away_team) & (matches['AwayTeam'] == home_team))].tail(5)
    
    if h2h.empty: return 1.0
    
    home_wins = 0
    for _, row in h2h.iterrows():
        if row['HomeTeam'] == home_team and row['FTR'] == 'H': home_wins += 1
        elif row['AwayTeam'] == home_team and row['FTR'] == 'A': home_wins += 1
    
    # If home team won majority of last 5, give a small 5% boost
    return 1.05 if home_wins >= 3 else 0.95 if home_wins <= 1 else 1.0

def get_lineup_strength(team_name, selected_player_names):
    squad = squad_data.get(team_name, [])
    if not squad or not selected_player_names: return 1.0
    
    selected_ratings = [p['Rating'] for p in squad if p['Name'] in selected_player_names]
    all_ratings = sorted([p['Rating'] for p in squad], reverse=True)
    
    best_11_sum = sum(all_ratings[:11]) if all_ratings else 1
    current_sum = sum(selected_ratings)
    
    multiplier = current_sum / best_11_sum
    return max(0.6, min(1.15, multiplier))

# -----------------------------
# CORE ENGINE
# -----------------------------

def expected_goals(home_team, away_team, home_lineup=[], away_lineup=[], minute=0, home_reds=0, away_reds=0):
    home_base = strength_dict.get(home_team, {"HomeAttack": 1, "AwayDefense": 1})
    away_base = strength_dict.get(away_team, {"AwayAttack": 1, "HomeDefense": 1})

    h_mod = get_lineup_strength(home_team, home_lineup)
    a_mod = get_lineup_strength(away_team, away_lineup)
    h2h_mod = get_h2h_modifier(home_team, away_team)

    # Base xG adjusted by players and history
    home_xg = (home_base["HomeAttack"] * h_mod * h2h_mod) * (away_base["AwayDefense"]) * league_home_goals
    away_xg = (away_base["AwayAttack"] * a_mod * (1/h2h_mod)) * (home_base["HomeDefense"]) * league_away_goals

    time_remaining_ratio = max(0, (90 - minute) / 90)
    
    # Red Card Impact
    h_red_atk, h_red_def = 0.8 ** home_reds, 1.25 ** home_reds
    a_red_atk, a_red_def = 0.8 ** away_reds, 1.25 ** away_reds

    return (home_xg * time_remaining_ratio * h_red_atk * a_red_def, 
            away_xg * time_remaining_ratio * a_red_atk * h_red_def)

def match_probabilities(home_team, away_team, home_lineup=[], away_lineup=[], current_home_score=0, current_away_score=0, minute=0, home_reds=0, away_reds=0):
    h_xg, a_xg = expected_goals(home_team, away_team, home_lineup, away_lineup, minute, home_reds, away_reds)

    max_goals = 6
    h_win, draw, a_win = 0, 0, 0

    for i in range(max_goals):
        for j in range(max_goals):
            prob = poisson.pmf(i, h_xg) * poisson.pmf(j, a_xg)
            if (current_home_score + i) > (current_away_score + j): h_win += prob
            elif (current_home_score + i) == (current_away_score + j): draw += prob
            else: a_win += prob

    return {
        "home_xg_remaining": round(h_xg, 2),
        "away_xg_remaining": round(a_xg, 2),
        "home_win": round(h_win, 3),
        "draw": round(draw, 3),
        "away_win": round(a_win, 3)
    }

# Season simulation functions kept for API compatibility
def simulate_match(home, away):
    h_xg, a_xg = expected_goals(home, away)
    h_g, a_g = poisson.rvs(max(0, h_xg)), poisson.rvs(max(0, a_xg))
    return (3, 0) if h_g > a_g else (0, 3) if a_g > h_g else (1, 1)

def simulate_season():
    points = {team: 0 for team in teams}
    for t1, t2 in combinations(teams, 2):
        for h, a in [(t1, t2), (t2, t1)]:
            res_h, res_a = simulate_match(h, a)
            points[h] += res_h
            points[a] += res_a
    return pd.DataFrame(list(points.items()), columns=["Team", "Points"]).sort_values("Points", ascending=False)

def monte_carlo(n=100):
    champs = {team: 0 for team in teams}
    for _ in range(n):
        table = simulate_season()
        if not table.empty: champs[table.iloc[0]["Team"]] += 1
    return {t: round(c/n, 3) for t, c in champs.items()}