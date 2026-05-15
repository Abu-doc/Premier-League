import pandas as pd
import math

# Load dataset
df = pd.read_csv("EPL_cleaned_dataset.csv")

# Remove rows with missing team names
df = df.dropna(subset=["HomeTeam", "AwayTeam"])

# Convert Date to datetime
df["Date"] = pd.to_datetime(df["Date"], dayfirst=True)

# Sort matches chronologically
df = df.sort_values(by=["Date"])

# Elo parameters
INITIAL_RATING = 1500
K = 30
HOME_ADVANTAGE = 65

# Create rating dictionary
teams = pd.concat([df["HomeTeam"], df["AwayTeam"]]).unique()

ratings = {team: INITIAL_RATING for team in teams}

# Function to calculate expected result
def expected_score(rating_a, rating_b):
    return 1 / (1 + 10 ** ((rating_b - rating_a) / 400))

# Process matches
for _, row in df.iterrows():

    home = row["HomeTeam"]
    away = row["AwayTeam"]

    home_rating = ratings[home] + HOME_ADVANTAGE
    away_rating = ratings[away]

    expected_home = expected_score(home_rating, away_rating)
    expected_away = expected_score(away_rating, home_rating)

    # Actual results
    if row["FTR"] == "H":
        actual_home = 1
        actual_away = 0
    elif row["FTR"] == "A":
        actual_home = 0
        actual_away = 1
    else:
        actual_home = 0.5
        actual_away = 0.5

    # Update ratings
    ratings[home] += K * (actual_home - expected_home)
    ratings[away] += K * (actual_away - expected_away)

# Convert to dataframe
elo_table = pd.DataFrame(list(ratings.items()), columns=["Team", "Elo"])

elo_table = elo_table.sort_values(by="Elo", ascending=False)

print("\nTop 20 Teams by Elo Rating\n")
print(elo_table.head(20))