const mongoose = require('../database')

// Definindo o model
const ProdutoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    descricao: {
        type: String
    },
    quantidadeVend: {
        type: Number,
        required: true
    },
    preco: {
        type: Number,
        required: true
    },
    precoVend: {
        type: Number,
        required: true
    },
    valorPago: {
        type: Number,
        required: true
    },
    dataVend: {
        type: Date,
        required: true
    },
    lucro: {
        type: Number
    },
    fornecedora: {
        type: String,
        required: true
    },
    cliente: {
        type: String,
        required: true
    }
})

// Definindo a collection
const ProdutoVendido = mongoose.model('produtoVendido', ProdutoSchema)
module.exports = ProdutoVendido