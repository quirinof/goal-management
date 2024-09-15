const { select, input, checkbox } = require('@inquirer/prompts') 
const fs = require("fs").promises

let mensagem = "Bem vindo ao App de Metas"

let metas

const carregarMetas = async () => {
	try {
		const dados = await fs.readFile("metas.json", "utf-8")
		metas = JSON.parse(dados)
	} catch (error) {
		metas = []
		mensagem = "Não foi possível carregar os dados."	
	}
}

const salvarMetas =  async () => {
	await fs.writeFile("metas.json", JSON.stringify(metas, null, 2))
}

const cadastrarMeta = async () => {
	const meta = await input({ message: "Digite a meta:"})

  	if(meta.length == 0) {
    	mensagem = "A meta nao pode ser vazia."
    	return
  	}

  	metas.push(
    	{value: meta, checked: false}
  	)

	mensagem = "Meta cadastrada com sucesso."
}

const listarMetas = async () => {
	const respostas = await checkbox({
		message: "Use as setas para mudar de meta, o Space para marcar ou desmarcar e o Enter para finalizar essa etapa",
		choices: [...metas],
		instructions: false,
	})

	metas.forEach((meta) => {
		meta.checked = false
	})

	if(respostas.length == 0) {
		mensagem = "Nenhuma meta selecionada!"
		return
	}

	respostas.forEach((resposta) => {
		const meta = metas.find((m) => {
			return m.value == resposta
		})

		meta.checked = true
	})

	mensagem = "Meta(s) revisada(s)."
}

const metasRealizadas = async () => {
	const realizadas = metas.filter((meta) => {
		return meta.checked
	})

	if(realizadas.length == 0) {
		mensagem = "Não existem metas realizadas"
		return
	}

	await select({
		message: "Metas Realizadas: " + realizadas.length,
		choices: [...realizadas]
	})
}

const metasAbertas = async () => {
	const abertas = metas.filter((meta) => {
		return meta.checked != true
	})

	if(abertas.length == 0) {
		mensagem = "Não existem metas abertas!"
		return
	}

	await select({
		message: "Metas Abertas: " + abertas.length,
		choices: [...abertas]
	})
}

const excluirMetas = async () => {
	const metasDesmarcadas = metas.map((meta) => {
		return { value: meta.value, checked: false }
	})

	const excluirItens = await checkbox({
		message: "Selecione uma meta para excluir.",
		choices: [...metasDesmarcadas],
		instructions: false
	})

	if(excluirItens.length == 0) {
		mensagem = "Nenhuma meta selecionada para excluir."
		return
	}

	excluirItens.forEach((item) => {
		metas = metas.filter((meta) => {
			return meta.value != item
		})
	})

	mensagem = "Meta(s) excluída(s)."
}

const mostrarMensagem = () => {
	console.clear();

	if(mensagem != "") {
		console.log(mensagem)
		console.log("")
		mensagem = ""
	}
}

const start = async () => {
    await carregarMetas()

    while(true){
        mostrarMensagem()
		await salvarMetas()

        const opcao = await select({
            message: "Menu >",
            choices: [
                {
                    name: "Cadastrar meta",
                    value: "cadastrar"
                },
                {
                  	name: "Listar metas",
                  	value: "listar"
                },
				{
					name: "Metas Realizadas",
                  	value: "realizadas"
				},
				{
					name: "Metas Abertas",
                  	value: "abertas"
				},
				{
					name: "Excluir Metas",
                  	value: "excluir"
				},
                {
                    name: "Sair",
                    value: "sair"
                }
            ]
        })

        switch(opcao) {
            case "cadastrar":
                await cadastrarMeta()
                break
            case "listar":
                await listarMetas()
                break
			case "realizadas":
				await metasRealizadas()
				break
			case "abertas":
				await metasAbertas()
				break
			case "excluir":
				await excluirMetas()
				break
            case "sair":
                console.log("Até logo...")
                return
        }       
    }
}

start()