import pandas as pd
import numpy as np
from scipy.stats import poisson

# Load datasets
matches = pd.read_csv("EPL_cleaned_dataset.csv")
strengths = pd.read_csv("team_strengths.csv")

# League averages
league_home_goals = matches["FTHG"].mean()
league_away_goals = matches["FTAG"].mean()

# Latest season teams
latest_season = matches["Season"].max()
season_matches = matches[matches["Season"] == latest_season]

teams = pd.concat([season_matches["HomeTeam"], season_matches["AwayTeam"]]).dropna().unique()

print("\nTeams in League:\n")
print(teams)

# Convert strengths to dictionary for fast lookup
strength_dict = strengths.set_index("Team").to_dict("index")

# Generate full season schedule (380 matches)
schedule = []

for home in teams:
    for away in teams:
        if home != away:
            schedule.append((home, away))


# Expected goals function
def expected_goals(home_team, away_team):

    home_stats = strength_dict[home_team]
    away_stats = strength_dict[away_team]

    home_attack = home_stats["HomeAttack"]
    home_defense = home_stats["HomeDefense"]

    away_attack = away_stats["AwayAttack"]
    away_defense = away_stats["AwayDefense"]

    home_xg = home_attack * away_defense * league_home_goals
    away_xg = away_attack * home_defense * league_away_goals

    return home_xg, away_xg


# Simulate a single match
def simulate_match(home_team, away_team):

    home_xg, away_xg = expected_goals(home_team, away_team)

    home_goals = poisson.rvs(home_xg)
    away_goals = poisson.rvs(away_xg)

    if home_goals > away_goals:
        return 3, 0
    elif home_goals < away_goals:
        return 0, 3
    else:
        return 1, 1


# Simulate one full season
def simulate_season():

    points = {team: 0 for team in teams}

    for home, away in schedule:

        home_pts, away_pts = simulate_match(home, away)

        points[home] += home_pts
        points[away] += away_pts

    table = pd.DataFrame(list(points.items()), columns=["Team", "Points"])
    table = table.sort_values("Points", ascending=False)

    return table


# Number of simulations
simulations = 500   # increase later to 1000

champions = {team: 0 for team in teams}

print("\nRunning Monte Carlo simulations...\n")

for i in range(simulations):

    table = simulate_season()

    winner = table.iloc[0]["Team"]

    champions[winner] += 1


# Convert to probabilities
champion_probs = {team: count / simulations for team, count in champions.items()}

champion_table = pd.DataFrame(
    list(champion_probs.items()), columns=["Team", "ChampionProbability"]
)

champion_table = champion_table.sort_values("ChampionProbability", ascending=False)

print("\nChampion Probabilities\n")
print(champion_table)
champion_table.to_csv("champion_probabilities.csv", index=False)