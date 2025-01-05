
const signup = async (req, res) => {
    const userName = req.username;
    const email = req.email;
    const password = req.password;

    // add the user in db

    


    // send verification otp to the user email


    // store the otp in db


    // return 
    
}

const login = async (req, res) => {
    return true;
}

const verify = async (req, res) => {
    return true;
}

module.exports = {
    signup,
    verify,
    login
}