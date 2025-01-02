
const signin = async (req, res) => {
    // username, email, password
    // if username already exists throw error
    // then store the email and hashed password into the db
    // send otp message to the 
    // redirect to the verification page 
}

const login = async (req, res) => {
    return true;
}

const verify = async (req, res) => {
    return true;
}

module.exports = {
    signin,
    verify,
    login
}