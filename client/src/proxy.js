const dotenv=require("dotenv");

function proxyURL(url)
{
    let valuateEnv;
    if (process.env.VALUATE_ENVIRONMENT)
    {
        valuateEnv = process.env.VALUATE_ENVIRONMENT;
    }
    else
    {
        valuateEnv=dotenv.config({path: '.env.' + (process.env.VALUATE_ENV || 'development')}).parsed;
    }

    return valuateEnv.REACT_APP_SERVER_URL+`proxy?url=${encodeURIComponent(url)}`;
}


export default proxyURL;

