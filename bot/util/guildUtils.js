const {"guilds": Guilds} = require("../schemas/guildsettings");
const NodeCache = require("node-cache");

const guildCache = new NodeCache({"stdTTL": 60 * 60});

/**
 * Gets Guild Doc (or creates one)
 * @param {snowflake} id
 * @returns {doc}
 */
async function getGuild (id) {

    if (guildCache.has(id)) {

        return guildCache.get(id);

    }
    let guild = await Guilds.findOne({"guild_id": id});

    if (!guild) {

        guild = new Guilds({
            "guild_id": id
        });

    }
    guildCache.set(id, guild);
    
    return guild;

}

/**
 *  Saves a guild doc
 * @param {guildDoc} guild
 * @returns {guildDoc}
 */
async function saveGuild (guild) {

    const guildSaved = await guild.save();

    guildCache.set(guildSaved.guild_id, guildSaved);
    
    return guildSaved;

}

module.exports = {
    getGuild,
    saveGuild
};
