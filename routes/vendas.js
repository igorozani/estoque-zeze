const express = require('express')
const router = express.Router()
const ProdutoVendido = require('../models/ProdutoVendido')
const Produto = require('../models/Produto')
const Pagamento = require('../models/Pagamento')
const Cliente = require('../models/Cliente')
const TotalProdutos = require('../models/TotalProdutos')



router.get('/', (req, res) => { 
    sidebar_select = "vendas"
    ProdutoVendido.find().then(produtosVendidos => {
        Produto.find().then(produtos => {
            res.render('vendas', {produtosVendidos: produtosVendidos, produtos: produtos})
        }).catch(erro => {
            req.flash("error_msg", "Ocorreu um erro => " + erro)
            res.redirect("/index")
        })
    }).catch(erro => {
        req.flash("error_msg", "Ocorreu um erro => " + erro)
        res.redirect("/index")
    })
})

//rota para salvar produto vendido no bd
router.post('/receiver', (req, res) => {
    Produto.findOne({nome: req.body.nome}).then(produtoVendido => {
        var erros = []
        var d1 = new Date(req.body.dataVend)
        var d2 = new Date()
       
        if(d2 < d1) {
            erros.push({texto: "A venda não pode ter uma data posterior à de hoje!"})
        }

        function convertDateToUTC(d1) { 
            return new Date(d1.getUTCFullYear(),
                d1.getUTCMonth(), d1.getUTCDate(),
                d1.getUTCHours(), d1.getUTCMinutes(), d1.getUTCSeconds()); 
        }

        let precoVend = formata(req.body.precoVend)
        let valorPago = formata(req.body.valorPago)

        if(Number(produtoVendido.quantidade) < Number(req.body.quantidadeVend)) {
            erros.push({texto: "Número de unidades indísponivel! Quantidade vendida deve ser menor que o estoque!"})
        }
    
        if(Number(produtoVendido.preco) > Number(precoVend)) {
            erros.push({texto: "Preço de venda deve ser maior que o preço de custo!"})
        }
    
        if(erros.length > 0) {
            ProdutoVendido.find().then(produtosVendidos => {
                Produto.find().then(produtos => {
                    sidebar_select = "vendas"
                    res.render('vendas', {produtosVendidos: produtosVendidos, erros: erros, produtos: produtos})
                }).catch(erro => {
                    req.flash("error_msg", "Ocorreu um erro => " + erro)
                    res.redirect("/vendas")
                })
            }).catch( erro => {
                req.flash("error_msg", "Ocorreu um erro => " + erro)
                res.redirect("/vendas")
            }) 
        } else {
            const novoProdutoVendido = {
                nome: req.body.nome,
                descricao: produtoVendido.descricao,
                quantidadeVend: Number(req.body.quantidadeVend),
                preco: Number(produtoVendido.preco),
                dataVend: convertDateToUTC(d1),
                precoVend: Number(precoVend),
                valorPago: Number(valorPago),
                lucro: Number(precoVend) * Number(req.body.quantidadeVend) - Number(produtoVendido.preco) * Number(req.body.quantidadeVend),
                fornecedora: titleize(produtoVendido.fornecedora),
                cliente: titleize(req.body.cliente)
            }
            const novoCliente = {
                nome: titleize(req.body.cliente),
                valorTotal: Number(novoProdutoVendido.precoVend) * Number(novoProdutoVendido.quantidadeVend),
                valorRestante: Number(precoVend) * Number(req.body.quantidadeVend) - Number(valorPago)
            }
            new ProdutoVendido(novoProdutoVendido).save().then((pVend) => {

                //salva pagamento de entrada
                const pagamentoEntrada = {
                    pk: pVend._id,
                    dataPaga: convertDateToUTC(d1),
                    parcelaPaga: pVend.valorPago
                }

                new Pagamento(pagamentoEntrada).save().then(() => {
                    console.log("Pagamento de entrada salvo com sucesso!")
                }).catch(erro => {
                    console.log(erro)
                })
                
                //procura cliente
                Cliente.findOne({nome: novoCliente.nome}).then((clienteAntigo) => {

                    //se encontrar atualiza
                    Cliente.findOneAndUpdate({nome: clienteAntigo.nome}, {
                        valorTotal: Number(clienteAntigo.valorTotal) + Number(novoCliente.valorTotal),
                        valorRestante: Number(clienteAntigo.valorRestante) + Number(novoCliente.valorRestante),
                    }).then(() => {
                        TotalProdutos.findOne({senha: "paonachapa"}).then(totalProd => {
                            TotalProdutos.findOneAndUpdate({senha: "paonachapa"}, {
                                clientes: Number(totalProd.clientes) + 1
                            }).then().catch(erro => {
                                console.log(erro)
                            })
                        
                        })
                        console.log("sucesso ao atualizar cliente")
                    }).catch(erro => {
                        console.log(erro)
                    })

                    //se nao encontrar cria um novo cliente
                }).catch(() => {
                    new Cliente(novoCliente).save().then(() => {
                        TotalProdutos.findOne({senha: "paonachapa"}).then(totalProd => {
                            TotalProdutos.findOneAndUpdate({senha: "paonachapa"}, {
                                clientes: Number(totalProd.clientes) + 1
                            }).then().catch(erro => {
                                console.log(erro)
                            })
                        
                        })
                        console.log("cliente salvo com sucesso")
                    }).catch(erro => {
                        console.log(erro)
                    })
                })

                if(produtoVendido.quantidade > novoProdutoVendido.quantidadeVend) {        
                    produtoVendido.quantidade = Number(produtoVendido.quantidade) - Number(novoProdutoVendido.quantidadeVend)
                    produtoVendido.save().then(() => {
                        let quantidade = novoProdutoVendido.quantidadeVend
                        TotalProdutos.findOne({senha: "paonachapa"}).then(totalProd => {
                            TotalProdutos.findOneAndUpdate({senha: "paonachapa"}, {
                                quantidade: Number(totalProd.quantidade) - Number(quantidade), 
                                precoEstoque: Number(totalProd.precoEstoque) - Number(novoProdutoVendido.preco) * Number(novoProdutoVendido.quantidadeVend)
                            }).then().catch(erro => {
                                console.log(erro)
                            })
                        
                        })
                        
                        req.flash("success_msg", "Produto marcado como vendido!")
                        res.redirect('/vendas')
                    }).catch( erro => {
                        req.flash("error_msg", "Houve erro ao tentar marcar o produto: " + erro)
                        res.redirect("/vendas")
                    })
                } else {
                    Produto.findOneAndDelete({_id: req.body.id}).then((produto) => {
                        let quantidade = produto.quantidadeVend
                        TotalProdutos.findOne({senha: "paonachapa"}).then(totalProd => {
                            TotalProdutos.findOneAndUpdate({senha: "paonachapa"}, {
                                quantidade: Number(totalProd.quantidade) - Number(quantidade),
                                precoEstoque: Number(totalProd.precoEstoque) - Number(novoProdutoVendido.preco) * Number(novoProdutoVendido.quantidadeVend)
                            }).then().catch(erro => {
                                console.log(erro)
                            })
                        
                        })
                    }).catch( erro => {
                        req.flash("error_msg", "Houve erro ao tentar deletar o produto => " + erro)
                        res.redirect("/vendas")
                    })
                }
            }).catch( erro => {
                    req.flash("error_msg", "Houve erro ao tentar marcar o produto 3 => " + erro)
                    res.redirect("/vendas")
            })
        }
    }).catch( erro => {
        req.flash("error_msg", "Houve erro ao tentar marcar o produto 4 => " + erro)
        res.redirect("/vendas")
    })
})

//rota para renderizar modal com o produto vendido ja selecionado
router.get('/vendido/:id', (req, res) => {
    ProdutoVendido.find().then(produtosVendidos => {
        Produto.findOne({_id: req.params.id}).then(produtoVendido => {
            sidebar_select = "vendas"
            res.render('vendas', {produtosVendidos: produtosVendidos, produtoVendido: produtoVendido})
        }).catch( erro => {
            req.flash("error_msg", "Este produto não existe =>" + erro)
            res.redirect("/vendas")
        })
    }).catch( erro => {
        req.flash("error_msg", "Ocorreu um erro => " + erro)
        res.redirect("/vendas")
    })
})

//rota para salvar no bd o produto vendido
router.post("/receiver/vendido", (req, res) => {
    var erros = []
    var data = new Date(req.body.dataVend)
    var d2 = new Date()
    if(d2 < data) {
        erros.push({texto: "A venda não pode ter uma data posterior à de hoje!"})
    }

    function convertDateToUTC(d1) { 
        return new Date(d1.getUTCFullYear(),
            d1.getUTCMonth(), d1.getUTCDate(),
            d1.getUTCHours(), d1.getUTCMinutes(), d1.getUTCSeconds()); 
    }

    if(Number(req.body.quantidade) < Number(req.body.quantidadeVend)) {
        erros.push({texto: "Número de unidades indísponiveis! Quantidade vendida deve ser menor que o estoque!"})
    }

    let precoVend = formata(req.body.precoVend)
    let valorPago = formata(req.body.valorPago)
        

    if(Number(req.body.preco) > Number(precoVend)) {
        erros.push({texto: "Preço de venda deve ser maior que o preço de custo!"})
    }

    if(erros.length > 0) {
        ProdutoVendido.find().then(produtosVendidos => {
            Produto.find().then(produtos => {
                sidebar_select = "vendas"
                res.render('vendas', {produtosVendidos: produtosVendidos, erros: erros, produtos: produtos})
            }).catch( erro => {
                req.flash("error_msg", "Ocorreu um erro => " + erro)
                res.redirect("/vendas")
            }) 
        }).catch( erro => {
            req.flash("error_msg", "Ocorreu um erro => " + erro)
            res.redirect("/vendas")
        }) 
    } else {
        const novoProdutoVendido = {
            nome: req.body.nome,
            descricao: req.body.descricao,
            quantidadeVend: Number(req.body.quantidadeVend),
            preco: Number(req.body.preco),
            dataVend: convertDateToUTC(data),
            precoVend: Number(precoVend),
            valorPago: Number(valorPago),
            lucro: Number(precoVend) * Number(req.body.quantidadeVend) - Number(req.body.preco) * Number(req.body.quantidadeVend),
            fornecedora: titleize(req.body.fornecedora),
            cliente: titleize(req.body.cliente)
        }
        const novoCliente = {
            nome: titleize(req.body.cliente),
            valorTotal: Number(novoProdutoVendido.precoVend) * Number(novoProdutoVendido.quantidadeVend),
            valorRestante: Number(novoProdutoVendido.precoVend) * Number(novoProdutoVendido.quantidadeVend) - Number(novoProdutoVendido.valorPago)
        }
        new ProdutoVendido(novoProdutoVendido).save().then((pVend) => {

            //salva pagamento de entrada
            const pagamentoEntrada = {
                pk: pVend._id,
                dataPaga: convertDateToUTC(data),
                parcelaPaga: pVend.valorPago
            }

            new Pagamento(pagamentoEntrada).save().then(() => {
                console.log("Pagamento de entrada salvo com sucesso!")
            }).catch(erro => {
                console.log(erro)
            })

             //procura cliente
             Cliente.findOne({nome: novoCliente.nome}).then((clienteAntigo) => {

                //se encontrar atualiza
                Cliente.findOneAndUpdate({nome: clienteAntigo.nome}, {
                    valorTotal: Number(clienteAntigo.valorTotal) + Number(novoCliente.valorTotal),
                    valorRestante: Number(clienteAntigo.valorRestante) + Number(novoCliente.valorRestante),
                }).then(() => {
                    TotalProdutos.findOne({senha: "paonachapa"}).then(totalProd => {
                        TotalProdutos.findOneAndUpdate({senha: "paonachapa"}, {
                            clientes: Number(totalProd.clientes) + 1
                        }).then().catch(erro => {
                            console.log(erro)
                        })
                    
                    })
                    console.log("sucesso ao atualizar cliente")
                }).catch(erro => {
                    console.log(erro)
                })

                //se nao encontrar cria um novo cliente
            }).catch(() => {
                new Cliente(novoCliente).save().then(() => {
                    TotalProdutos.findOne({senha: "paonachapa"}).then(totalProd => {
                        TotalProdutos.findOneAndUpdate({senha: "paonachapa"}, {
                            clientes: Number(totalProd.clientes) + 1
                        }).then().catch(erro => {
                            console.log(erro)
                        })
                    
                    })
                    console.log("cliente salvo com sucesso")
                }).catch(erro => {
                    console.log(erro)
                })
            })

           
            Produto.findOne({_id:req.body.id}).then((produto) => {
                if(produto.quantidade > novoProdutoVendido.quantidadeVend) {        
                    produto.quantidade = Number(produto.quantidade) - Number(novoProdutoVendido.quantidadeVend)
                    produto.save().then(() => {
                        let quantidade = novoProdutoVendido.quantidadeVend
                        TotalProdutos.findOne({senha: "paonachapa"}).then(totalProd => {
                            TotalProdutos.findOneAndUpdate({senha: "paonachapa"}, {
                                quantidade: Number(totalProd.quantidade) - Number(quantidade), 
                                precoEstoque: Number(totalProd.precoEstoque) - Number(novoProdutoVendido.preco) * Number(novoProdutoVendido.quantidadeVend)
                            }).then().catch(erro => {
                                console.log(erro)
                            })
                        
                        })
                        
                        req.flash("success_msg", "Produto marcado como vendido!")
                        res.redirect('/vendas')
                    }).catch( erro => {
                        req.flash("error_msg", "Houve erro ao tentar marcar o produto: " + erro)
                        res.redirect("/vendas")
                    })
                } else {
                    Produto.findOneAndDelete({_id: req.body.id}).then((produto) => {
                        let quantidade = produto.quantidadeVend
                        TotalProdutos.findOne({senha: "paonachapa"}).then(totalProd => {
                            TotalProdutos.findOneAndUpdate({senha: "paonachapa"}, {
                                quantidade: Number(totalProd.quantidade) - Number(quantidade),
                                precoEstoque: Number(totalProd.precoEstoque) - Number(novoProdutoVendido.preco) * Number(novoProdutoVendido.quantidadeVend)
                            }).then().catch(erro => {
                                console.log(erro)
                            })
                        
                        })
                    }).catch( erro => {
                        req.flash("error_msg", "Houve erro ao tentar deletar o produto => " + erro)
                        res.redirect("/vendas")
                    })
                }
            }).catch( erro => {
                req.flash("error_msg", "Houve erro ao tentar marcar o produto: " + erro)
                res.redirect("/vendas")
            })  
        }).catch( erro => {
                req.flash("error_msg", "Houve erro ao tentar marcar o produto: " + erro)
                res.redirect("/vendas")
        })
    }
})

//renderizar modal de pagamento
router.get('/pagamento/:id', (req, res) => {
    ProdutoVendido.findOne({_id: req.params.id}).then(pagamento => {
        ProdutoVendido.find().then(produtosVendidos => {
            Produto.find().then(produtos => {
                sidebar_select = "vendas"
                res.render('vendas', {produtosVendidos: produtosVendidos, produtos: produtos, pagamento: pagamento})
            }).catch( erro => {
                req.flash("error_msg", "Houve erro ao tentar realizar pagamento de parcela: " + erro)
                res.redirect("/vendas")
            }).catch( erro => {
                req.flash("error_msg", "Houve erro ao tentar realizar pagamento de parcela: " + erro)
                res.redirect("/vendas")
            })
        })
    }).catch( erro => {
        req.flash("error_msg", "Houve erro ao tentar realizar pagamento de parcela: " + erro)
        res.redirect("/vendas")
    })
})

//salvar no bd o pagamento feito
router.post('/receiver/pagamento', (req, res) => {
    var erros = []
    d1 = new Date(req.body.dataPaga)
    d2 = new Date(req.body.dataVend)
    

    function convertDateToUTC(d1) { 
        return new Date(d1.getUTCFullYear(),
         d1.getUTCMonth(), d1.getUTCDate()); 
    }

    if(convertDateToUTC(d1) < convertDateToUTC(d2)) {
        erros.push({texto: "Data do pagamento da parcela não pode ser anterior à data da venda!"})
    }

    if(Number(formata(req.body.parcelaPaga)) + Number(req.body.valorPago) > Number(req.body.precoVend) * Number(req.body.quantidadeVend)) {
        erros.push({texto: "Digite um valor para a parcela que não ultrapasse o valor total!"})
    }

    if(erros.length > 0) {
        ProdutoVendido.find().then(produtosVendidos => {
            Produto.find().then(produtos => {
                sidebar_select = "vendas"
                res.render('vendas', {produtosVendidos: produtosVendidos, erros: erros, produtos: produtos})
            }).catch( erro => {
                req.flash("error_msg", "Ocorreu um erro => " + erro)
                res.redirect("/vendas")
            }) 
        }).catch( erro => {
            req.flash("error_msg", "Ocorreu um erro => " + erro)
            res.redirect("/vendas")
        }) 
    } else {
        const novoPagamento = {
            pk: req.body.id,
            dataPaga: convertDateToUTC(d1),
            parcelaPaga: formata(req.body.parcelaPaga)
        }
        new Pagamento(novoPagamento).save().then(() => {
            ProdutoVendido.findOne({_id:req.body.id}).then((produtoVendido) => {
                produtoVendido.valorPago =  Number(novoPagamento.parcelaPaga) + Number(produtoVendido.valorPago)
                produtoVendido.save().then(() => {

                    //procura cliente
                    Cliente.findOne({nome: produtoVendido.cliente}).then((clienteAntigo) => {

                    //se encontrar atualiza
                    Cliente.findOneAndUpdate({nome: clienteAntigo.nome}, {
                    valorRestante: Number(clienteAntigo.valorRestante) - Number(novoPagamento.parcelaPaga),
                }).then(() => {
                    console.log("sucesso ao atualizar cliente")
                }).catch(erro => {
                    console.log(erro)
                })

                //se nao encontrar exibe erro
                }).catch((erro) => {
                    console.log(erro)
                })
                req.flash("success_msg", "Pagamento de parcela registrado com sucesso!")
                res.redirect('/vendas')
                }).catch( erro => {
                    req.flash("error_msg", "Houve erro ao realizar pagamento => " + erro)
                    res.redirect("/vendas")
                })
            }).catch( erro => {
                req.flash("error_msg", "Houve erro ao tentar encontrar produto vendido => " + erro)
                res.redirect("/vendas")
            })
        }).catch( erro => {
                req.flash("error_msg", "Houve erro ao tentar registrar pagamento => " + erro)
                res.redirect("/vendas")
        })
    }
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

module.exports = router

