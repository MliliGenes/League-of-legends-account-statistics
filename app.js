const key = 'your key'
const id = 'your id'
const puuid = 'your puuid'

const colors = {
  lost: "#ff000026",
  win: "#0051ff26",
};
const spells = {
  21: "Barrier",
  1: "Boost",
  14: "Dot",
  13: "Mana",
  3: "Exhaust",
  4: "Flash",
  6: "Haste",
  7: "Heal",
  11: "Smite",
  12: "Teleport",
  32: "Snowball",
};
const container = document.querySelector(".container");
const template = document.querySelector("template");
let getData = {
  apicCall: function (id, key) {
    fetch(
      `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}?api_key=${key}`
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        let { summonerName, wins, losses, rank, tier } = data[0];
        document.title = summonerName + " Stats";
        easyselect(document, "name").textContent = summonerName;
        easyselect(document, "tier").textContent = tier;
        easyselect(document, "rank").textContent = rank;
        easyselect(document, "wins").textContent = wins;
        easyselect(document, "losses").textContent = losses;
        getData.iconCall(summonerName, key);
        getData.matchsCall(key);
      })
      .then(document.body.classList.remove("blurred"));
  },
  iconCall: function (username, key) {
    fetch(
      `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}?api_key=${key}`
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        let { profileIconId } = data;
        let accountIconUrl = `http://ddragon.leagueoflegends.com/cdn/13.5.1/img/profileicon/${profileIconId}.png`;
        document.querySelector("[data-favicon]").href = accountIconUrl;
        document.querySelector("[data-icon]").src = accountIconUrl;
      });
  },
  matchsCall: function (key) {
    fetch(
      `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${key}`
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        const firstTenMatches = data.slice(0, 10);
        container.innerHTML = "";
        firstTenMatches.forEach((matchId) => {
          fetch(
            "https://europe.api.riotgames.com/lol/match/v5/matches/" +
              matchId +
              "?api_key=RGAPI-bd1ba354-316b-4a10-b0d4-1a35b03434fb"
          )
            .then((res) => {
              return res.json();
            })
            .then((data) => {
              const { participants } = data.info;
              let me;
              participants.forEach((participant) => {
                if (
                  participant.summonerId ==
                  "fj0vDxptu9xkOvl1Ivh5_jFLFnFWXTS6z2y8zVM3dJlU5gz5Avx4BMTWUw"
                ) {
                  me = participant;
                }
              });
              if (me) {
                const {
                  championName,
                  totalDamageDealtToChampions,
                  totalDamageTaken,
                  champLevel,
                  role,
                  kills,
                  deaths,
                  assists,
                  totalMinionsKilled,
                  item0,
                  item1,
                  item2,
                  item3,
                  item4,
                  item5,
                  item6,
                  summoner1Id,
                  summoner2Id,
                  win,
                  teamEarlySurrendered,
                } = me;
                const clone = template.content.cloneNode(true);
                easyselect(
                  clone,
                  "champ-icon"
                ).src = `https://ddragon.leagueoflegends.com/cdn/11.9.1/img/champion/${championName}.png`;
                easyselect(clone, "champ-lvl").textContent = champLevel;
                easyselect(clone, "roll").textContent = role;
                easyselect(clone, "kills").textContent = kills;
                easyselect(clone, "deaths").textContent = deaths;
                easyselect(clone, "assits").textContent = assists;
                easyselect(clone, "cc").textContent = totalMinionsKilled;
                easyselect(clone, "dmg-dealt").textContent =
                  totalDamageDealtToChampions;
                easyselect(clone, "dmg-taken").textContent = totalDamageTaken;
                let itemsIcons = [
                  item0,
                  item1,
                  item2,
                  item3,
                  item4,
                  item5,
                  item6,
                ];
                clone.querySelectorAll(".item > img").forEach((img, index) => {
                  if (itemsIcons[index] != 0)
                    img.src = `https://ddragon.leagueoflegends.com/cdn/13.9.1/img/item/${itemsIcons[index]}.png`;
                  else {
                    img.src = "";
                  }
                });

                easyselect(
                  clone,
                  "spell1"
                ).src = `https://ddragon.leagueoflegends.com/cdn/11.9.1/img/spell/Summoner${spells[summoner1Id]}.png`;
                easyselect(
                  clone,
                  "spell2"
                ).src = `https://ddragon.leagueoflegends.com/cdn/11.9.1/img/spell/Summoner${spells[summoner2Id]}.png`;
                const block = clone.querySelector(".block");

                if (win) {
                  block.classList.add("win");
                } else if (!win) {
                  block.classList.add("lost");
                } else if (teamEarlySurrendered) {
                  block.classList.add("draw");
                }
                container.appendChild(clone);
              }
            });
        });
      });
  },
};
getData.apicCall(
  id,
  key
);
function easyselect(parent, child) {
  return parent.querySelector(`[data-${child}]`);
}
