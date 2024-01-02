const mongoose = require('mongoose');


const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        mongoose.connect(process.env.MONGO_URI)
            .then(() => console.log('Connexion à MongoDB réussie !'))
    } catch (error) { console.log(error) } {
        console.log('Connexion à MongoDB échouée !');

    }
};


module.exports = connectDB;