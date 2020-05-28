let campoFiltro = document.querySelector("#search-input")
let cont = 0
let cont2 = 0
campoFiltro.addEventListener("input", () => {
    let tr = document.querySelectorAll("#tr-tabela")
    if(campoFiltro.value.length > 0){
        for(let td of tr){
            let semDados = document.querySelector('#semDados') 
            let tdNome = td.querySelector("#tdNome")
            let nome = tdNome.textContent
            let expressao = new RegExp(campoFiltro.value, "i")
            if(!expressao.test(nome)){
                td.classList.add("invisivel")
                if(cont == cont2){
                    semDados.classList.remove('invisivel')
                }
            } else {
                td.classList.remove("invisivel")
                semDados.classList.add('invisivel')
            }  
            if(td.classList.contains("invisivel")){
                cont2 += 1
            }
            cont += 1
        }
        cont = 0
        cont2 = 0
    } else {
        for(let td of tr){
            td.classList.remove("invisivel")
        }
        semDados.classList.add('invisivel')
    }
})