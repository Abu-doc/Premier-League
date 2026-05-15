import pandas as pd

# Load cleaned dataset
df = pd.read_csv("EPL_cleaned_dataset.csv")

# Calculate league averages
league_home_goals = df["FTHG"].mean()
league_away_goals = df["FTAG"].mean()

print("League Avg Home Goals:", league_home_goals)
print("League Avg Away Goals:", league_away_goals)

# Get all teams
teams = pd.concat([df["HomeTeam"], df["AwayTeam"]]).dropna().unique()

team_stats = []

for team in teams:

    # Home matches
    home_games = df[df["HomeTeam"] == team]
    
    home_goals_scored = home_games["FTHG"].mean()
    home_goals_conceded = home_games["FTAG"].mean()

    # Away matches
    away_games = df[df["AwayTeam"] == team]
    
    away_goals_scored = away_games["FTAG"].mean()
    away_goals_conceded = away_games["FTHG"].mean()

    # Attack strengths
    home_attack = home_goals_scored / league_home_goals
    away_attack = away_goals_scored / league_away_goals

    # Defense strengths
    home_defense = home_goals_conceded / league_away_goals
    away_defense = away_goals_conceded / league_home_goals

    team_stats.append([
        team,
        home_attack,
        away_attack,
        home_defense,
        away_defense
    ])

# Create dataframe
strength_df = pd.DataFrame(team_stats, columns=[
    "Team",
    "HomeAttack",
    "AwayAttack",
    "HomeDefense",
    "AwayDefense"
])

print("\nTeam Strength Table\n")
print(strength_df.sort_values("HomeAttack", ascending=False))

# Save results
strength_df.to_csv("team_strengths.csv", index=False)