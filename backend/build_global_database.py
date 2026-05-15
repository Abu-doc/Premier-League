import pandas as pd
import json
import numpy as np

# 1. Load the dataset
print("Loading EA FC 26 dataset...")
df = pd.read_csv('ea_fc26_players.csv', low_memory=False)

# 2. Filter for the Big 4 European Leagues 
# Using str.contains catches variations like "LaLiga EA SPORTS" or "Serie A Enilive"
target_leagues = ['LaLiga', 'Serie A', 'Bundesliga', 'Ligue 1']
df = df[df['leagueName'].str.contains('|'.join(target_leagues), na=False, case=False)]

print(f"Filtered down to {len(df)} players from the Global Network.")

# Smart Name Formatter
def get_clean_name(row):
    if pd.notna(row['commonName']) and str(row['commonName']).strip() != "":
        return str(row['commonName'])
    
    first = str(row['firstName']) if pd.notna(row['firstName']) else ""
    last = str(row['lastName']) if pd.notna(row['lastName']) else ""
    return f"{first} {last}".strip()

# 3. Clean and map data
def assign_archetype(pos, pac, sho, pas, dri, def_stat, phy):
    pos = str(pos).upper()
    if pos in ['ST', 'CF']:
        if phy >= 82: return "Target Man"
        if pac >= 85 and sho >= 80: return "Poacher"
        return "Advanced Forward"
    elif pos in ['LW', 'RW', 'LM', 'RM']:
        if sho >= 78: return "Inside Forward"
        return "Winger"
    elif pos in ['CAM', 'CM']:
        if pas >= 83 and dri >= 80: return "Advanced Playmaker"
        if def_stat >= 70 and phy >= 75 and pas >= 75: return "Box-to-Box"
        return "Central Midfielder"
    elif pos in ['CDM']:
        if def_stat >= 80 and phy >= 80: return "Anchor/Destroyer"
        return "Deep-Lying Playmaker"
    elif pos in ['CB']:
        if pas >= 70: return "Ball-Playing Defender"
        return "Traditional Stopper"
    elif pos in ['LB', 'RB', 'LWB', 'RWB']:
        if pac >= 82 and pas >= 75: return "Attacking Fullback"
        return "Defensive Fullback"
    elif pos == 'GK':
        if pas >= 75: return "Sweeper Keeper"
        return "Shot Stopper"
    
    return "Utility Player"

print("Assigning neural archetypes...")

global_db = {}

for index, row in df.iterrows():
    club = str(row['team'])
    
    # Initialize club array if it doesn't exist
    if club not in global_db:
        global_db[club] = []
        
    # Extract stats safely
    pac = int(row['pac']) if pd.notna(row['pac']) else 50
    sho = int(row['sho']) if pd.notna(row['sho']) else 50
    pas = int(row['pas']) if pd.notna(row['pas']) else 50
    dri = int(row['dri']) if pd.notna(row['dri']) else 50
    def_stat = int(row['def']) if pd.notna(row['def']) else 50
    phy = int(row['phy']) if pd.notna(row['phy']) else 50

    player_data = {
        "id": int(row['id']) if pd.notna(row['id']) else np.random.randint(100000, 999999),
        "Name": get_clean_name(row),
        "Position": str(row['position']),
        "Rating": int(row['overallRating']) if pd.notna(row['overallRating']) else 50,
        "archetype": assign_archetype(row['position'], pac, sho, pas, dri, def_stat, phy),
        "stats": {
            "PAC": pac,
            "SHO": sho,
            "PAS": pas,
            "DRI": dri,
            "DEF": def_stat,
            "PHY": phy
        }
    }
    global_db[club].append(player_data)

# 4. Save to JSON
output_file = 'global_players.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(global_db, f, ensure_ascii=False, indent=2)

print(f"Global Database successfully compiled into '{output_file}'!")
print(f"Total clubs processed: {len(global_db)}")