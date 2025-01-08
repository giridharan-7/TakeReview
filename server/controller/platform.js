const { Platform, Account } = require("../models/db");


const addPlatform = async (req, res) => {
    const { platformName, platformLink, instantCount } = req.body;

    const { api_key } = req.headers['api_key'];

    try {
        // if api key is valid then add the platform_name and platform_link to platform table
    
        const account = await Account.findOne({
            where: { api_key }
        })
    
        if(!account) {
            return res.json({ success: true, message: 'Not authorised user'});
        }

        const platform = await Platform.create(
            {
                account_id: account,
                platform_name: platformName,
                platform_link: platformLink,
                instant_count: instantCount,
            }
        )

        // add the platform as a job to the queue

        // return platform id

    } catch (error) {
        
    }

}

const getReviews = async (req, res) => {

    try {

        // first of all see the platfrom created time is <10sec

        // if it is <10sec -> check instant_ready -> if it is true -> return data from elastic 

        // if it is >10sec -> hit the postgres local db and get the data

        
    } catch (error) {
        
    }
}

module.exports = {
    addPlatform,
    getReviews
}