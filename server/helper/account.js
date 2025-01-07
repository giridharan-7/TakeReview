const api_key_generator = async () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 12; i++) {
        key += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return key;
}

module.exports = api_key_generator;