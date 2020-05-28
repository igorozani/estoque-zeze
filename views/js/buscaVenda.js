let campoFiltro = document.querySelector("#search-input")
let cont = 0
let cont2 = 0
campoFiltro.addEventListener("input", () => {
    let tr = document.querySelectorAll("#tr-tabela")
    if(campoFiltro.value.length > 0){
        for(let i of tr){
            let semDados = document.querySelector('#semDados') 
            let tdNome = i.querySelector("#tdNome")
            let tdFornecedora = i.querySelector('#tdFornecedora')
            let fornecedora = tdFornecedora.textContent
            let nome = tdNome.textContent
            let tdCliente = i.querySelector('#tdCliente')
            let cliente = tdCliente.textContent
            let expressao = new RegExp(campoFiltro.value, "i")
            if(!expressao.test(nome) && !expressao.test(fornecedora) && !expressao.test(cliente)){
                i.classList.add("invisivel")
                if(cont == cont2){
                    semDados.classList.remove('invisivel')
                }
            } else {
                i.classList.remove("invisivel")
                semDados.classList.add('invisivel')
            }
            if(i.classList.contains("invisivel")){
                cont2 += 1
            }
            cont += 1
        }
        cont = 0
        cont2 = 0
    } else {
        for(let i of tr){
            i.classList.remove("invisivel")
        }
        semDados.classList.add('invisivel')
    }
})
