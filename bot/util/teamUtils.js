const {TeamCache} = require("../blaseball-api/teams");
const {PlayerCache} = require("../blaseball-api/players");
const {games} = require("blaseball");
const {MessageEmbed} = require("discord.js");

const nullTeam = {
    "emoji": 10067,
    "mainColor": "#999999",
    "fullName": "Null Team",
    "slogan": "I AM ERROR"
};

const tarotCards = {
    "-1": "Fool",
    "0": "I The Magician",
    "1": "II The High Priestess",
    "2": "III The Empress",
    "3": "IIII The Emperor",
    "4": "V The Hierophant",
    "5": "VI The Lover",
    "6": "VII The Chariot",
    "7": "VIII Justice",
    "8": "VIIII The Hermit",
    "9": "X The Wheel of Fortune",
    "10": "XI Strength",
    "11": "XII The Hanged Man",
    "12": "XIII",
    "13": "XIIII Temperance",
    "14": "XV The Devil",
    "15": "XVI The Tower",
    "16": "XVII The Star",
    "17": "XVIII The Moon",
    "18": "XVIIII The Sun",
    "19": "XX Judgment"
};

const creditLevels = {
    "0": "❌ 0D ❌",
    "1": "❌ 1D ❌",
    "2": "❌ 2D ❌",
    "3": "❌ 3D ❌",
    "4": "🟦 C 🟦",
    "5": "⭐ Low A ⭐",
    "6": "⭐ High A ⭐",
    "7": "⭐ AA ⭐",
    "8": "⭐ AAA ⭐",
    "9": "⭐ AAAA ⭐",
    "10": "⭐ AAAAA ⭐"
};


/**
 * Get team
 * @param {teamName} id
 * @returns {json} team
 */
async function getTeam (id) {

    if (!id) {

        return nullTeam;

    }

    return id ? TeamCache.get(id) : nullTeam;

}

/**
 * Generate a team card embed
 * @param {json} team
 * @param {boolean} forbidden
 * @returns {embed}
 */
async function generateTeamCard (team, forbidden) {

    const {standings} = games();
    const wins = standings.wins[team.id] ?? 0;
    const losses = standings.losses[team.id] ?? 0;
    const gamesPlayed = standings.gamesPlayed[team.id] ?? 0;
    const runs = standings.runs[team.id] ?? 0;

    const teamCard = new MessageEmbed()
        .setTitle(`${
            emojiString(team.emoji)
        } ${team.fullName}${
            team.level > 4 ? " 🔴" : ""}${
            team.seasAttr.includes("PARTY_TIME") ? " 🎉" : ""}${
            team.deceased ? " 💀" : ""}`)
        .setColor(team.mainColor)
        .addField(`Lineup (${team.lineup?.length ?? 0})`, team.lineup?.length
            ? playerList(team.lineup)
            : "*Empty*", true)
        .addField(`Rotation (${team.rotation?.length ?? 0})`, team.rotation?.length
            ? playerList(team.rotation)
            : "*Empty*", true);

    if (forbidden) {

        teamCard.addField(`Shadows (${team.shadows?.length ?? 0})`, team.shadows?.length
            ? `||${playerList(team.shadows)}||`
            : "*Empty*", true);

    }
    teamCard.addField("Modifications", await attributes(team) || "None", true)
        .addField("Championships", "🟡".repeat(team.championships) || "** **", true)
        .addField(
            "Underchampionships",
            "🟣".repeat(team.underchampionships) || "** **", true
        )
        .addField("Level", creditLevels[team.level] || "-", true);
    if (team.imPosition) {

        const imPosX = team.imPosition[0].toFixed(3);
        const imPosY = (1 - team.imPosition[1]).toFixed(3);

        teamCard.addField("imPosition", `X: ${imPosX}\nY: ${imPosY}`, true);

    }
    teamCard.addField("eDensity", `${team.eDensity.toFixed(5)} bl/m³`, true)
        .addField("Tarot Card", tarotCards[team.card] || "---- -----", true)
        .addField("Times Evolved", team.evolution, true)
        .addField("Been Shamed", team.totalShames, true)
        .addField("Shamed Others", team.totalShamings, true)
        .addField("Been Shamed This Season", team.seasonShames, true)
        .addField("Shamed Others This Season", team.seasonShamings, true)
        .addField("Runs This Season", runs, true)
        .addField("Season Record", `${wins} Wins (${gamesPlayed - losses}-${losses})`, true)
        .setFooter(`${team.slogan} | ${team.shorthand} | ID: ${team.id}`)
        .setURL(`https://www.blaseball.com/team/${team.id}`);

    return teamCard;

}


const {modCache} = require("blaseball");

/**
 * Generate formatted list of a team's attributes by type
 * @param {json} team
 * @returns {string}
 */
async function attributes (team) {

    const teamData = Object.create(team);
    let attrString = "";

    for (const attribute of teamData.permAttr) {

        const attr = await modCache.fetch(attribute);

        attrString += `:yellow_square: ${attr.title}\n`;

    }
    for (const attribute of teamData.seasAttr) {

        const attr = await modCache.fetch(attribute);

        attrString += `:red_square: ${attr.title}\n`;

    }
    for (const attribute of teamData.weekAttr) {

        const attr = await modCache.fetch(attribute);

        attrString += `:blue_square: ${attr.title}\n`;

    }
    for (const attribute of teamData.gameAttr) {

        const attr = await modCache.fetch(attribute);

        attrString += `:green_square: ${attr.title}\n`;

    }

    return attrString || "None";

}

/**
 *
 * @param {Array<uuid>} players
 * @returns {string}
 */
function playerList (players) {

    const playerlist = PlayerCache.mget(players);
    let list = "";

    for (const player in playerlist) {

        if (Object.prototype.hasOwnProperty.call(playerlist, player)) {

            const playerinfo = playerlist[player];
            const playername = playerinfo.name;

            list += `${playername}\n`;

        }

    }

    return list;

}

/**
 * Normalizes emoji
 * @param {string} emoji
 * @returns {string}
 */
function emojiString (emoji) {

    return Number(emoji) ? String.fromCodePoint(emoji) : emoji;

}


module.exports = {
    getTeam,
    generateTeamCard,
    nullTeam,
    tarotCards,
    creditLevels,
    emojiString
};
