const mongoose = require('mongoose')
const db = require("../config/db")

// Conexão com o bd mongoDB
mongoose.connect(db.mongoUri , {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false 
}).then(() => {
    console.log("MongoDB conectado...")
}).catch(erro => {
    console.log("Houve um erro ao se conectar ao Mongo DB: " + erro)
})
mongoose.Promise = global.Promise;

module.exports = mongoose;