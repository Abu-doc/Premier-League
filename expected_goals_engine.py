import pandas as pd

# Load datasets
matches = pd.read_csv("EPL_cleaned_dataset.csv")
strengths = pd.read_csv("team_strengths.csv")

# League averages
league_home_goals = matches["FTHG"].mean()
league_away_goals = matches["FTAG"].mean()

print("League Home Goals Avg:", league_home_goals)
print("League Away Goals Avg:", league_away_goals)


def calculate_expected_goals(home_team, away_team):

    home_stats = strengths[strengths["Team"] == home_team].iloc[0]
    away_stats = strengths[strengths["Team"] == away_team].iloc[0]

    home_attack = home_stats["HomeAttack"]
    home_defense = home_stats["HomeDefense"]

    away_attack = away_stats["AwayAttack"]
    away_defense = away_stats["AwayDefense"]

    home_xg = home_attack * away_defense * league_home_goals
    away_xg = away_attack * home_defense * league_away_goals

    return home_xg, away_xg


# USER INPUT
home_team = input("Enter Home Team: ")
away_team = input("Enter Away Team: ")

home_xg, away_xg = calculate_expected_goals(home_team, away_team)

print("\nExpected Goals Prediction")
print(home_team, "xG:", round(home_xg, 2))
print(away_team, "xG:", round(away_xg, 2))