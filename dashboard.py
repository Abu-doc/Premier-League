import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.stats import poisson
from itertools import combinations

# -----------------------------
# Load Data
# -----------------------------

matches = pd.read_csv("EPL_cleaned_dataset.csv")
strengths = pd.read_csv("team_strengths.csv")
champions = pd.read_csv("champion_probabilities.csv")

league_home_goals = matches["FTHG"].mean()
league_away_goals = matches["FTAG"].mean()

strength_dict = strengths.set_index("Team").to_dict("index")

# Use only latest season teams
latest_season = matches["Season"].max()
season_matches = matches[matches["Season"] == latest_season]

teams = sorted(
    pd.concat([season_matches["HomeTeam"], season_matches["AwayTeam"]])
    .dropna()
    .unique()
)

# -----------------------------
# Dashboard Title
# -----------------------------

st.title("⚽ Premier League Analytics Dashboard")

st.write("Match Prediction • Team Analysis • Season Simulation")

# -----------------------------
# Champion Probability
# -----------------------------

st.subheader("🏆 Champion Probability (Monte Carlo Simulation)")
st.bar_chart(champions.set_index("Team"))

# -----------------------------
# Team Strength Charts
# -----------------------------

st.subheader("📊 Team Strength Analysis")

col1, col2 = st.columns(2)

with col1:

    st.write("Attack Strength")
    attack_chart = strengths.sort_values("HomeAttack", ascending=False)
    st.bar_chart(attack_chart.set_index("Team")["HomeAttack"])

with col2:

    st.write("Defense Strength (Lower = Better)")
    defense_chart = strengths.sort_values("HomeDefense")
    st.bar_chart(defense_chart.set_index("Team")["HomeDefense"])

# -----------------------------
# Attack vs Defense Line Graph
# -----------------------------

st.subheader("📈 Attack vs Defense Comparison")

top_teams = strengths.sort_values("HomeAttack", ascending=False).head(6)

fig, ax = plt.subplots()

ax.plot(top_teams["Team"], top_teams["HomeAttack"], marker="o", label="Attack")
ax.plot(top_teams["Team"], top_teams["HomeDefense"], marker="o", label="Defense")

ax.set_ylabel("Strength")
ax.set_title("Top Teams Comparison")
ax.legend()

st.pyplot(fig)

# -----------------------------
# Last 5 Match Form
# -----------------------------

st.subheader("🔥 Last 5 Match Form")

team_form = st.selectbox("Select Team for Form", teams)

team_matches = matches[
    (matches["HomeTeam"] == team_form) |
    (matches["AwayTeam"] == team_form)
]

team_matches = team_matches.sort_values("Date", ascending=False).head(5)

form_results = []

for _, row in team_matches.iterrows():

    if row["HomeTeam"] == team_form:

        if row["FTHG"] > row["FTAG"]:
            form_results.append("W")
        elif row["FTHG"] < row["FTAG"]:
            form_results.append("L")
        else:
            form_results.append("D")

    else:

        if row["FTAG"] > row["FTHG"]:
            form_results.append("W")
        elif row["FTAG"] < row["FTHG"]:
            form_results.append("L")
        else:
            form_results.append("D")

st.write("Last 5 Results:", " ".join(form_results))

# -----------------------------
# Match Prediction
# -----------------------------

st.subheader("🔮 Match Prediction")

home_team = st.selectbox("Home Team", teams)
away_team = st.selectbox("Away Team", teams)

def expected_goals(home_team, away_team):

    home_stats = strength_dict[home_team]
    away_stats = strength_dict[away_team]

    home_attack = home_stats["HomeAttack"]
    home_defense = home_stats["HomeDefense"]

    away_attack = away_stats["AwayAttack"]
    away_defense = away_stats["AwayDefense"]

    home_xg = home_attack * away_defense * league_home_goals
    away_xg = away_attack * home_defense * league_away_goals

    return home_xg, away_xg

if st.button("Predict Match"):

    home_xg, away_xg = expected_goals(home_team, away_team)

    st.write("### Expected Goals")
    st.write(home_team, "xG:", round(home_xg,2))
    st.write(away_team, "xG:", round(away_xg,2))

    # -----------------------------
    # Score Probability Heatmap
    # -----------------------------

    st.write("### Score Probability Heatmap")

    max_goals = 5
    heatmap = np.zeros((max_goals, max_goals))

    for i in range(max_goals):
        for j in range(max_goals):

            heatmap[i,j] = poisson.pmf(i, home_xg) * poisson.pmf(j, away_xg)

    fig2, ax2 = plt.subplots()

    sns.heatmap(
        heatmap,
        annot=True,
        fmt=".2%",
        cmap="coolwarm",
        xticklabels=range(max_goals),
        yticklabels=range(max_goals),
        ax=ax2
    )

    ax2.set_xlabel(f"{away_team} Goals")
    ax2.set_ylabel(f"{home_team} Goals")

    st.pyplot(fig2)

# -----------------------------
# Radar Chart
# -----------------------------

st.subheader("📡 Team Radar Chart")

team_choice = st.selectbox("Select Team", strengths["Team"])

team_data = matches[
    (matches["HomeTeam"] == team_choice) |
    (matches["AwayTeam"] == team_choice)
]

attack = strengths[strengths["Team"] == team_choice]["HomeAttack"].values[0]
defense = strengths[strengths["Team"] == team_choice]["HomeDefense"].values[0]

shots = team_data["HS"].mean()
shots_target = team_data["HST"].mean()
corners = team_data["HC"].mean()
cards = team_data["HY"].mean()

attack_norm = attack / strengths["HomeAttack"].max()
defense_norm = (1/defense) / (1/strengths["HomeDefense"]).max()

shots_norm = shots / matches["HS"].max()
shots_target_norm = shots_target / matches["HST"].max()
corners_norm = corners / matches["HC"].max()
cards_norm = cards / matches["HY"].max()

metrics = [
    attack_norm,
    defense_norm,
    shots_norm,
    shots_target_norm,
    corners_norm,
    cards_norm
]

labels = [
    "Attack",
    "Defense",
    "Shots",
    "Shots Target",
    "Corners",
    "Cards"
]

angles = np.linspace(0, 2*np.pi, len(metrics), endpoint=False)

metrics = np.concatenate((metrics,[metrics[0]]))
angles = np.concatenate((angles,[angles[0]]))

fig3 = plt.figure()
ax = fig3.add_subplot(111, polar=True)

ax.plot(angles, metrics)
ax.fill(angles, metrics, alpha=0.3)

ax.set_thetagrids(angles[:-1] * 180/np.pi, labels)
ax.set_ylim(0,1)

st.pyplot(fig3)

# -----------------------------
# League Table Simulator
# -----------------------------

st.subheader("📋 Simulated League Table")

if st.button("Simulate Season"):

    points = {team:0 for team in teams}

    fixtures = []

    for team1, team2 in combinations(teams,2):

        fixtures.append((team1,team2))
        fixtures.append((team2,team1))

    for home,away in fixtures:

        home_xg, away_xg = expected_goals(home,away)

        home_goals = poisson.rvs(home_xg)
        away_goals = poisson.rvs(away_xg)

        if home_goals > away_goals:
            points[home] += 3

        elif away_goals > home_goals:
            points[away] += 3

        else:
            points[home] += 1
            points[away] += 1

    table = pd.DataFrame(points.items(),columns=["Team","Points"])

    table = table.sort_values("Points",ascending=False)

    table.reset_index(drop=True,inplace=True)

    table.index = table.index + 1
    table.index.name = "Position"

    st.table(table)