const mongoose = require('../database')

// Definindo o model
const ProdutoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
    },
    quantidade: {
        type: Number,
        required: true
    },
    preco: {
        type: Number,
        required: true
    },
    fornecedora: {
        type: String,
        required: true
    }
})

// Definindo a collection
const Produto = mongoose.model('produto', ProdutoSchema)
module.exports = Produto