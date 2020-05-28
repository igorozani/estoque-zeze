const mongoose = require('mongoose')

// Conexão com o bd mongoDB
mongoose.connect('mongodb://localhost/estoque', {
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