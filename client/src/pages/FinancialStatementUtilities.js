export default {
    cleanAmount(text)
    {
        if (!text)
        {
            return "";
        }

        const negative = text.indexOf('(') !== -1 || text.indexOf(')') !== -1;
        const number = Number(text.replace(/[^0-9.]/g, ""));
        return negative ? -number : number;
    }
};
