

export default {
    cleanAmount(text)
    {
        if (!text)
        {
            return "";
        }

        let negative = false;
        if (text.indexOf('(') !== -1 || text.indexOf(')') !== -1)
        {
            negative = true;
        }

        const cleanText = text.replace(/[^0-9.]/g, "");
        const number = Number(cleanText);
        if (negative)
        {
            return -number;
        }
        else
        {
            return number;
        }
    }
};

