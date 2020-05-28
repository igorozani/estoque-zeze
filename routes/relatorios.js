const express = require('express')
const router = express.Router()
const ProdutoVendido = require('../models/ProdutoVendido')
const Cliente = require('../models/Cliente')

router.get('/', (req, res) => { 
    sidebar_select = "relatorios"
    Cliente.find().then(clientes => {
        ProdutoVendido.find().then(produtosVendidos => {
            res.render('relatorios', {clientes: clientes, produtosVendidos: produtosVendidos})
            }).catch(erro => {
                req.flash("error_msg", "Ocorreu um erro => " + erro)
                res.redirect("/index")
            })
    }).catch(erro => {
        req.flash("error_msg", "Ocorreu um erro => " + erro)
        res.redirect("/index")
    })

})

module.exports = router