const express = require('express')
const router = express.Router()
const ProdutoVendido = require('../models/ProdutoVendido')
const Pagamento = require('../models/Pagamento')
const Cliente = require('../models/Cliente')

router.get('/', (req, res) => { 
    sidebar_select = "clientes"
    Cliente.find().then(clientes => {
        res.render('clientes', {clientes: clientes})
    })
})

router.get('/cliente-detalhes', (req, res) => { 
    sidebar_select = "clientes"
    ProdutoVendido.find({cliente: req.query.cliente}).then(produtosDoClienteX => {
        Cliente.find().then((clientes) => {
            res.render('clientes', {produtosDoClienteX: produtosDoClienteX, clientes: clientes, nome: req.query.cliente})
        }).catch(erro => {
            req.flash("error_msg", "falha ao exibir detalhes do cliente =>" + erro)
            res.redirect("/clientes")
        })
    }).catch(erro => {
        req.flash("error_msg", "falha ao exibir detalhes do cliente =>" + erro)
        res.redirect("/clientes")
    })
})

router.get('/produto-detalhes/:id/:cliente', (req, res) => {
    sidebar_select = 'clientes'
    Pagamento.find({pk: req.params.id}).then(pagamentosDoProdutoX => {
        ProdutoVendido.find({cliente: req.params.cliente}).then(produtosDoClienteX => {
            Cliente.find().then((clientes) => {
                ProdutoVendido.findOne({_id: req.params.id}).then(produtoDoPagamento => {
                    res.render('clientes', {produtosDoClienteX: produtosDoClienteX, clientes: clientes, nome: req.params.cliente, pagamentosDoProdutoX: pagamentosDoProdutoX, nomeProduto: produtoDoPagamento.nome})
                }).catch(erro => {
                    req.flash("error_msg", "falha ao exibir detalhes do cliente =>" + erro)
                    res.redirect("/clientes")
                })
            }).catch(erro => {
                req.flash("error_msg", "falha ao exibir detalhes do cliente =>" + erro)
                res.redirect("/clientes")
            })
        }).catch(erro => {
            req.flash("error_msg", "falha ao exibir detalhes do cliente =>" + erro)
            res.redirect("/clientes")
        })
    })
})

//rota para renderizar modal com o cliente ja selecionado
router.get('/:id', (req, res) => {
    sidebar_select = "clientes"
    Cliente.find().then((clientes) => {
        Cliente.findById(req.params.id).then(clienteParams => {
            cliente_select = clienteParams.nome
            res.render('clientes', {clientes: clientes, clienteParams: clienteParams})
        })
    }).catch(erro => {
        req.flash("error_msg", "falha ao exibir detalhes do cliente =>" + erro)
        res.redirect("/clientes")
    })
})


module.exports = router