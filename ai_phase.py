import pandas as pd

# -----------------------------
# 1️⃣ Load Dataset
# -----------------------------
df = pd.read_csv("E0.csv")

print("✅ Dataset Loaded Successfully!\n")

# -----------------------------
# 2️⃣ Basic Dataset Information
# -----------------------------
print("📊 Dataset Info:")
print(df.info())

print("\n📐 Dataset Shape (rows, columns):")
print(df.shape)

print("\n🧾 First 10 Column Names:")
print(df.columns[:10])

# -----------------------------
# 3️⃣ Check Missing Values
# -----------------------------
print("\n❓ Missing Values (first 20 columns):")
print(df.isnull().sum().head(20))

# -----------------------------
# 4️⃣ Select Important Columns
# -----------------------------
important_columns = [
    "Date",
    "HomeTeam",
    "AwayTeam",
    "FTHG",   # Full Time Home Goals
    "FTAG",   # Full Time Away Goals
    "FTR"     # Full Time Result
]

df_small = df[important_columns]

print("\n⚽ Match-Level Data (First 5 Rows):")
print(df_small.head())

# -----------------------------
# 5️⃣ Count Match Results
# -----------------------------
print("\n📈 Match Results Count:")
print(df["FTR"].value_counts())

# -----------------------------
# 6️⃣ Basic Goal Statistics
# -----------------------------
print("\n🥅 Average Home Goals:")
print(df["FTHG"].mean())

print("\n🥅 Average Away Goals:")
print(df["FTAG"].mean())

# -----------------------------
# 7️⃣ Total Goals Scored in Season
# -----------------------------
total_goals = df["FTHG"].sum() + df["FTAG"].sum()

print("\n🔥 Total Goals in This Season:")
print(total_goals)