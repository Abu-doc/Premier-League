import pandas as pd
from scipy.stats import poisson

# Load datasets
matches = pd.read_csv("EPL_cleaned_dataset.csv")
strengths = pd.read_csv("team_strengths.csv")

# League averages
league_home_goals = matches["FTHG"].mean()
league_away_goals = matches["FTAG"].mean()


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


def simulate_match(home_xg, away_xg):

    max_goals = 5

    home_probs = [poisson.pmf(i, home_xg) for i in range(max_goals)]
    away_probs = [poisson.pmf(i, away_xg) for i in range(max_goals)]

    home_win = 0
    draw = 0
    away_win = 0

    print("\nScoreline Probabilities:\n")

    for i in range(max_goals):
        for j in range(max_goals):

            prob = home_probs[i] * away_probs[j]

            if prob > 0.01:  # show only meaningful scores
                print(f"{i}-{j} : {round(prob*100,2)}%")

            if i > j:
                home_win += prob
            elif i == j:
                draw += prob
            else:
                away_win += prob

    return home_win, draw, away_win


# USER INPUT
home_team = input("Enter Home Team: ")
away_team = input("Enter Away Team: ")

home_xg, away_xg = calculate_expected_goals(home_team, away_team)

print("\nExpected Goals")
print(home_team, "xG:", round(home_xg,2))
print(away_team, "xG:", round(away_xg,2))

home_win, draw, away_win = simulate_match(home_xg, away_xg)

print("\nMatch Result Probabilities:\n")

print(home_team, "Win:", round(home_win*100,2), "%")
print("Draw:", round(draw*100,2), "%")
print(away_team, "Win:", round(away_win*100,2), "%")