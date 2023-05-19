function easyselect(parent, child) {
  return parent.querySelector(`[data-${child}]`);
}
const apiKey = "RGAPI-bd1ba354-316b-4a10-b0d4-1a35b03434fb";

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
  apicCall: function (puuid, id, key) {
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
        getData.matchsCall(puuid, key);
      })
      .then(() => {
        document.body.classList.remove("blurred");
      })
      .catch((error) => {
        alert(error);
      });
  },
  iconCall: function (username, key) {
    fetch(
      `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}?api_key=${key}`
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        let { profileIconId, summonerLevel } = data;
        let accountIconUrl = `http://ddragon.leagueoflegends.com/cdn/13.5.1/img/profileicon/${profileIconId}.png`;
        easyselect(document, "favicon").href = accountIconUrl;
        easyselect(document, "icon").src = accountIconUrl;
        easyselect(document, "account-lvl").textContent = summonerLevel;
      })
      .catch((error) => {
        alert(error);
      });
  },
  matchsCall: function (puuid, key) {
    fetch(
      `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${key}`
    )
      .then((res) => res.json())
      .then((data) => {
        const firstTenMatches = data.slice(0, 10);
        container.innerHTML = "";
        const matchPromises = firstTenMatches.map((matchId) => {
          return fetch(
            "https://europe.api.riotgames.com/lol/match/v5/matches/" +
              matchId +
              "?api_key=" +
              key
          ).then((res) => res.json());
        });
        return Promise.all(matchPromises);
      })
      .then((matchDataArray) => {
        matchDataArray.forEach((matchData) => {
          const { participants } = matchData.info;
          let me;
          participants.forEach((participant) => {
            if (participant.puuid == puuid) {
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
            ).src = `https://ddragon.leagueoflegends.com/cdn/13.9.1/img/champion/${championName}.png`;
            easyselect(clone, "champ-lvl").textContent = champLevel;
            easyselect(clone, "roll").textContent = role;
            easyselect(clone, "kills").textContent = kills;
            easyselect(clone, "deaths").textContent = deaths;
            easyselect(clone, "assits").textContent = assists;
            easyselect(clone, "cc").textContent = totalMinionsKilled;
            easyselect(clone, "dmg-dealt").textContent =
              totalDamageDealtToChampions;
            easyselect(clone, "dmg-taken").textContent = totalDamageTaken;
            let itemsIcons = [item0, item1, item2, item3, item4, item5, item6];
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
            ).src = `https://ddragon.leagueoflegends.com/cdn/13.9.1/img/spell/Summoner${spells[summoner1Id]}.png`;
            easyselect(
              clone,
              "spell2"
            ).src = `https://ddragon.leagueoflegends.com/cdn/13.9.1/img/spell/Summoner${spells[summoner2Id]}.png`;
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
      })
      .catch((error) => {
        alert(error);
      });
  },
};
easyselect(document, "form").addEventListener("submit", search);
window.addEventListener("load", search);
function search(e) {
  e.preventDefault();
  const value = easyselect(document, "search-value");
  if (value.value) {
    fetch(
      `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${value.value.trim()}?api_key=${apiKey}`
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        let { id, puuid } = data;
        return [id, puuid];
      })
      .then((userData) => {
        getData.apicCall(userData[1], userData[0], apiKey);
      })
      .catch((error) => {
        alert(error);
      });
  }
}
