import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder

# Load dataset
df = pd.read_csv("EPL_cleaned_dataset.csv")

# Encode result
result_map = {"H": 0, "D": 1, "A": 2}
df["FTR"] = df["FTR"].map(result_map)

# Encode teams
team_encoder = LabelEncoder()
df["HomeTeam"] = team_encoder.fit_transform(df["HomeTeam"])
df["AwayTeam"] = team_encoder.transform(df["AwayTeam"])

# Remove missing values
df = df.dropna()

# Features and target
X = df.drop(columns=["FTR", "Date", "Season", "FTHG", "FTAG"])
y = df["FTR"]

# Train model
model = LogisticRegression(max_iter=1000)
model.fit(X, y)

print("\nModel trained successfully!")

# --------------------------------
# Match Prediction
# --------------------------------

home = input("Enter Home Team: ")
away = input("Enter Away Team: ")

home_encoded = team_encoder.transform([home])[0]
away_encoded = team_encoder.transform([away])[0]

# Use average match statistics
avg_stats = X.mean()

match_data = avg_stats.copy()
match_data["HomeTeam"] = home_encoded
match_data["AwayTeam"] = away_encoded

# Convert to dataframe
match_df = pd.DataFrame([match_data])

# Predict probabilities
probabilities = model.predict_proba(match_df)[0]

results = {
    0: "Home Win",
    1: "Draw",
    2: "Away Win"
}

print("\nPrediction Probabilities:")

for i, prob in enumerate(probabilities):
    print(f"{results[i]}: {prob*100:.2f}%")

# Final predicted result
prediction = model.predict(match_df)[0]

print("\nFinal Prediction:", results[prediction])