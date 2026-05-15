import pandas as pd

df = pd.read_csv("EPL_combined_dataset.csv")

columns_needed = [
    "Season",
    "Date",
    "HomeTeam",
    "AwayTeam",
    "FTHG",
    "FTAG",
    "FTR",
    "HS",
    "AS",
    "HST",
    "AST",
    "HC",
    "AC",
    "HY",
    "AY",
    "HR",
    "AR"
]

df_clean = df[columns_needed]

print("Clean dataset shape:", df_clean.shape)

df_clean.to_csv("EPL_cleaned_dataset.csv", index=False)

print("Clean dataset saved!")