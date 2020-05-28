const mongoose = require('../database')

// Definindo o model
const ProdutoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    valorTotal: {
        type: Number,
        required: true
    },
    valorRestante: {
        type: Number,
        required: true
    }
})

// Definindo a collection
const Cliente = mongoose.model('cliente', ProdutoSchema)
module.exports = Cliente