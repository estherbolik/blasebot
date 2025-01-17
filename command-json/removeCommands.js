/* eslint-disable no-undefined */
const fetch = require("node-fetch");

/*
 * Const fs = require("fs");
 * const commandFiles = fs.readdirSync("./command-json/").filter(file => file.endsWith(".json"));
 */

if (process.argv[2] === "global") {

    process.argv[2] = null;

} else if (process.argv[2] === undefined) {

    console.log("Use either \"global\" or a guild ID as an argument to delete commands");
    // eslint-disable-next-line no-process-exit
    process.exit();

}

const options = {
    "method": "get",
    "headers": {
        "Content-Type": "application/json",
        "Authorization": `Bot ${require("../config.json").discordToken}`
    }
};


(async () => {

    const ids = await fetch(`https://discord.com/api/v8/applications/${
        require("../config.json").applicationID}${process.argv[2]
        ? `/guilds/${process.argv[2]}`
        : ""}/commands`, options).then((res) => res.json())
        .then((res) => res.map((command) => command.id));

    // eslint-disable-next-line require-atomic-updates
    options.method = "delete";

    ids.forEach((id) => {

        fetch(`https://discord.com/api/v8/applications/${require("../config.json").applicationID}${
            process.argv[2]
                ? `/guilds/${process.argv[2]}`
                : ""}/commands/${id}`, options).then((res) => console.log(res.status, id));
    
    });

})();


