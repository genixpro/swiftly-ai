const readline = require('readline');

async function readJSONInput()
{
    return await new Promise((resolve, reject) =>
    {
        let text = "";

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });

        rl.on('line', (line) =>
        {
            text += line;
        });

        rl.on("close", () =>
        {
            resolve(JSON.parse(text));
        });

        rl.on("error", (err) =>
        {
            reject(err);
        });
    });
}

export default readJSONInput;