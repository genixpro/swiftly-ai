import {renderToString} from "react-dom/server";
import readJSONInput from "./read_json_input";
import fs from "fs";

// Render a document
const renderDocument = (componentFunction) =>
{
    const timeout = setTimeout(function() { }, 3600000);

    (async () => {
        try
        {
            // Render the HTML
            const data = await readJSONInput();
            const html = renderToString(componentFunction(data));

            fs.writeFileSync(data.fileName, html);
            clearTimeout(timeout);
        }
        catch(err)
        {
            console.error(err);
            clearTimeout(timeout);
        }
    })();
};



export default renderDocument;