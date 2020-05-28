const express = require('express')
const router = express.Router()
const Produto = require('../models/Produto')
const TotalProdutos = require('../models/TotalProdutos')

router.get('/', (req, res) => { 
    sidebar_select = "produto"
    Produto.find().then(produtos => {
        res.render('produtos', {produtos: produtos})
    }).catch(erro => {
        req.flash("error_msg", "Ocorreu um erro: " + erro)
        res.redirect("/index")
    })
})

router.post('/receiver', (req, res) => {
    var erros = []

    if(Number(req.body.quantidade) <= 0) {
        erros.push({texto: "Quantidade deve ser maior que zero!"})
    }
    
    var preco = formata(req.body.preco)
    if(Number(preco) <= 0) {
        erros.push({texto: "Preço deve ser maior que zero!"})
    }

    if(erros.length > 0) {
        Produto.find().then(produtos => {
            sidebar_select = "produto"
            res.render('produtos', {produtos: produtos, erros: erros})
        }).catch( erro => {
            req.flash("error_msg", "Ocorreu um erro: " + erro)
            res.redirect("/produtos")
        })
    } else {
           
        let novoProduto
        novoProduto = {
            nome: req.body.nome.toUpperCase(),
            descricao: putLineBreaks(req.body.descricao),
            quantidade: Number(req.body.quantidade),
            preco: Number(preco),
            fornecedora: titleize(req.body.fornecedora)
        }

        new Produto(novoProduto).save().then(() => {
           

            TotalProdutos.findOne({senha: "paonachapa"}).then(totalProd => {
            
                TotalProdutos.findOneAndUpdate({senha: "paonachapa"}, {
                    quantidade: Number(totalProd.quantidade) + Number(novoProduto.quantidade),
                    precoEstoque: Number(totalProd.precoEstoque) + Number(novoProduto.preco) * Number(novoProduto.quantidade)
                }).then().catch(erro => {
                    console.log(erro)
                })
            
            }).catch(erro => {
                console.log(erro)
            })
          
            req.flash("success_msg", "Produto adicionado com sucesso!")
            res.redirect('/produtos')
        }).catch( erro => {
            req.flash("error_msg", "Houve erro ao tentar adicionar o produto: " + erro)
            res.redirect("/produtos")
        })
    }
})

router.get('/edit/:id', (req, res) => {
    Produto.find().then(produtos => {
        Produto.findOne({_id: req.params.id}).then(produto => {
            sidebar_select = "produto"

            var preco = produto.preco.toString()
            preco = preco.replace('.', ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")   
            putLineBreaks(produto.descricao)
            
            res.render('produtos', {produtos: produtos, produto: produto, preco: preco})
            
        }).catch( erro => {
            req.flash("error_msg", "Este produto não existe" + erro)
            res.redirect("/produtos")
        })
    }).catch( erro => {
        req.flash("error_msg", "Ocorreu um erro: " + erro)
        res.redirect("/produtos")
    })
})

router.post('/receiver/edit', (req, res) => {
    Produto.findOne({_id: req.body.id}).then(produto => {
        var erros = []
        var preco

        if(Number(req.body.quantidade) <= 0) {
            erros.push({texto: "Quantidade deve ser maior que zero!"})
        }

        if(req.body.preco != '') {
            preco = formata(req.body.preco)
            if(Number(preco) <= 0) {
                erros.push({texto: "Preço deve ser maior que zero!"})
            } 
        } else {
            preco = produto.preco
        }

        let quantidade = produto.quantidade
        let precoEstoque = produto.preco
        TotalProdutos.findOne({senha: "paonachapa"}).then(totalProd => {
            TotalProdutos.findOneAndUpdate({senha: "paonachapa"}, {
                precoEstoque: Number(totalProd.precoEstoque) - Number(precoEstoque) * Number(quantidade) + Number(preco) * Number(req.body.quantidade),
                quantidade: Number(totalProd.quantidade) - Number(quantidade) + Number(req.body.quantidade)
            }).then().catch(erro => {
                console.log(erro)
            })
        })
        
        produto.nome = req.body.nome.toUpperCase()
        produto.quantidade = Number(req.body.quantidade)
        produto.preco = Number(preco)
        produto.fornecedora = titleize(req.body.fornecedora)
        produto.descricao = putLineBreaks(req.body.descricao)
        produto.save().then(() => {
            req.flash("success_msg", "Dados do produto editados com sucesso!")
            res.redirect('/produtos')
        }).catch( erro => {
            req.flash("error_msg", "Houve erro ao tentar editar o produto: " + erro)
            res.redirect("/produtos")
        })
    }).catch( erro => {
        req.flash("error_msg", "Houve erro ao tentar editar o produto: " + erro)
        res.redirect("/produtos")
    })
})

/* router.post('/categorias/edit', (req, res) => {

    let filter = { _id: req.body.id }
    let update = { nome: req.body.nome, slug: req.body.slug }

    Categoria.findOneAndUpdate(filter, update).then(() => {
        req.flash("success_msg", "Categoria atualizada")
        res.redirect('/admin/categorias')
    }).catch(err => {
        req.flash("error_msg", "Erro ao atualizar categoria")
    })

}) */

router.get("/delete/:id", (req, res) => {
    Produto.findOneAndDelete({_id: req.params.id}).then((produto) => {
        let quantidade = produto.quantidade
        let precoEstoque = produto.preco
        TotalProdutos.findOne({senha: "paonachapa"}).then(totalProd => {
            TotalProdutos.findOneAndUpdate({senha: "paonachapa"}, {
                quantidade: Number(totalProd.quantidade) - Number(quantidade), 
                precoEstoque: Number(totalProd.precoEstoque) - Number(precoEstoque) * Number(quantidade)
            }).then().catch(erro => {
                console.log(erro)
            })
        
        })
        
        req.flash("success_msg", "Produto deletado com sucesso!")
        res.redirect('/produtos')
    }).catch( erro => {
        req.flash("error_msg", "Houve erro ao tentar deletar o produto => " + erro)
        res.redirect("/produtos")
    })
})

function titleize(text) {
    return text.toLowerCase().replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
}

function formata(n) {
    n = n.split('.').join('')
    n = n.split('R$').join('')
    n = n.replace(',', '.')
    return n
}

function putLineBreaks(str) { 
    return str.replace(/(?:\r\n|\r|\n)/g, '###');
}  

module.exports = router
