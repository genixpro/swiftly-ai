

function getCity(address)
{
    const words = address.split(",");
    return words[words.length - 3];
}




function getStreetAddress(address)
{
    const words = address.split(",");
    return words.slice(0, words.length - 3);
}





export {getCity, getStreetAddress};