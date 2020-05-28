const mongoose = require('../database')

// Definindo o model
const ProdutoSchema = new mongoose.Schema({
    quantidade: {
        type: Number,
        required: true
    }, 
    clientes: {
        type: Number,
        required: true
    },
    senha: {
        type: String,
        required: true
    },
    precoEstoque: {
        type: Number,
        required: true
    }
})

// Definindo a collection
const TotalProdutos = mongoose.model('totalprodutos', ProdutoSchema)
module.exports = TotalProdutos