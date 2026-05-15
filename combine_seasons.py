import pandas as pd
import glob

# find all csv files in the folder
files = glob.glob("*.csv")

# list to store datasets
df_list = []

for file in files:
    df = pd.read_csv(file)

    # add season column from filename
    season = file.replace(".csv","")
    df["Season"] = season

    df_list.append(df)

# combine all seasons
combined_df = pd.concat(df_list, ignore_index=True)

# save combined dataset
combined_df.to_csv("EPL_combined_dataset.csv", index=False)

print("All seasons combined successfully!")
print("Shape of dataset:", combined_df.shape)