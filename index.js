// Carregando módulos
const express = require('express');
const app = express();
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const bodyParser = require('body-parser')
const moment = require('moment')
const routeAdmin = require('./routes/admin')
const routeProdutos = require('./routes/produtos')
const routeVendas = require('./routes/vendas')
const routeClientes = require('./routes/clientes')
const routeRelatorios = require('./routes/relatorios')
const session = require('express-session')
const flash = require('connect-flash')
global.sidebar_select = ""
global.cliente_select = ""
const TotalProdutos = require('./models/TotalProdutos')
const ProdutoVendido = require('./models/ProdutoVendido')

// Config 

    // Sessão
        app.use(session({
            secret: "paonachapa",
            resave: true,
            saveUninitialized: true
        }))

    //Flash
        app.use(flash())

    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            next()
        })
 
    // Handlebars
        const hbs = expressHandlebars.create({
            defaultLayout: 'main',
            helpers: {
                formatDate: (date) => {
                    return moment(date).format('DD/MM/YYYY')
                }, ifEquals: (arg2, options) => {
                    return (sidebar_select == arg2) ? options.fn(this) : options.inverse(this);
                }, isEqual: (valor, options) => {
                    return (cliente_select == valor) ? options.fn(this) : options.inverse(this);
                }
            },
            handlebars: allowInsecurePrototypeAccess(Handlebars)
        })


        app.engine('handlebars', hbs.engine)
        app.set('view engine', 'handlebars')
    
    // Body-parser
        app.use(bodyParser.urlencoded({ extended: false }))
        app.use(bodyParser.json())    

    // Instaciar Total de Produtos (estatisticas)
        const totalProdutos = {
            quantidade: 0,
            clientes: 0,
            senha: "paonachapa",
            precoEstoque: 0,
        }

        new TotalProdutos(totalProdutos).save().then().catch(erro => {
            console.log(erro)
        })

// Public
    app.use(express.static('views'));       

// Rotas
    app.get('/', (req, res) => {
        sidebar_select = "home"
        TotalProdutos.findOne({senha: "paonachapa"}).then(total_produtos => {
            ProdutoVendido.find().then(produtosVendidos => {
                res.render('index', {total_produtos: total_produtos.quantidade, total_clientes: total_produtos.clientes, total_preco: total_produtos.precoEstoque, produtosVendidos: produtosVendidos})
                // res.render('index', {produtosVendidos: produtosVendidos})
            })
        }).catch(erro => {
            console.log(erro)
        })
    })

    // Grupo de rotas
        app.use('/admin', routeAdmin)
        app.use('/produtos', routeProdutos)
        app.use('/vendas', routeVendas)
        app.use('/relatorios', routeRelatorios)
        app.use('/clientes', routeClientes)

// Outros
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () =>{
        console.log('Servidor rodando na porta ' + PORT);
    })

