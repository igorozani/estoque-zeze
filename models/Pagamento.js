const mongoose = require('../database')

// Definindo o model
const ProdutoSchema = new mongoose.Schema({
    pk: {
        type: String,
        required: true
    },
    dataPaga: {
        type: Date,
        required: true
    },
    parcelaPaga: {
        type: Number,
        required: true
    }
})

// Definindo a collection
const Pagamento = mongoose.model('pagamento', ProdutoSchema)
module.exports = Pagamento