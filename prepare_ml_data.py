import pandas as pd
from sklearn.preprocessing import LabelEncoder

df = pd.read_csv("EPL_cleaned_dataset.csv")

# convert match result to numbers
result_map = {"H": 0, "D": 1, "A": 2}
df["FTR"] = df["FTR"].map(result_map)

# encode team names
team_encoder = LabelEncoder()

df["HomeTeam"] = team_encoder.fit_transform(df["HomeTeam"])
df["AwayTeam"] = team_encoder.transform(df["AwayTeam"])

# save ML ready dataset
df.to_csv("EPL_ML_ready_dataset.csv", index=False)

print("ML dataset prepared!")
print(df.head())