/*

Lista TODO
Versão 1.0 - 16/04/2012
Guilherme de Oliveira Souza
http://sitegui.com.br

*/

// Armazena todos os dados da aplicação
var	dados = localStorage.getItem("todoDados"), abas, txt, abaAtiva = null
if (dados == null)
	dados = {abaAtiva: 0, abas: [{titulo: "Nova aba", texto: "Olá"}], ajuda: 0}
else
	dados = JSON.parse(dados)

function salvarDados() {
	localStorage.setItem("todoDados", JSON.stringify(dados))
}

// Exibe (ou esconde) a ajuda
window.addEventListener("load", function () {
	if (dados.ajuda<1) {
		dados.ajuda = 1
		salvarDados()
		mostrarAjuda()
	}
})
function mostrarAjuda() {
	document.getElementById("ajuda").style.display = "block"
	document.getElementById("fecharAjuda").onclick = function () {
		document.getElementById("ajuda").style.display = "none"
	}
}

// Executa atalhos de teclado
onkeydown = function (evento) {
	if (evento.keyCode == 78 && evento.ctrlKey) {
		// Ctrl+N
		setTimeout(abas.divCriar.onclick, 10) // Bug do FF
		evento.preventDefault()
	} else if (evento.keyCode == 113 && abaAtiva) {
		// F2
		setTimeout(abaAtiva.div.ondblclick, 10) // Bug do FF
		evento.preventDefault()
	} else if (evento.keyCode == 46 && evento.shiftKey && abaAtiva) {
		// Shift+Del
		abas.remover(abaAtiva)
		if (abaAtiva.onremove)
			abaAtiva.onremove()
		evento.preventDefault()
	} else if (evento.keyCode == 83 && evento.ctrlKey) {
		// Ctrl+S
		salvarDados()
		evento.preventDefault()
	} else if (evento.keyCode == 69 && evento.ctrlKey) {
		// Ctrl+E
		setTimeout(function () {
			prompt("Dados exportados:", JSON.stringify(dados))
		}, 10) // Bug do FF
		evento.preventDefault()
	} else if (evento.keyCode == 73 && evento.ctrlKey) {
		// Ctrl+I
		setTimeout(function () {
			var novosDados
			if (novosDados = prompt("Cole os dados exportados anteriormente")) {
				dados = JSON.parse(novosDados)
				location.reload(false)
			}
		}, 10) // Bug do FF
		evento.preventDefault()
	} else if (evento.keyCode == 112) {
		// F1
		mostrarAjuda()
		evento.preventDefault()
	}
}

// Redimensiona as abas para caber na tela
;(function () {
	var intervalo
	onresize = function () {
		clearInterval(intervalo)
		intervalo = setTimeout(function () {
			abas.atualizar()
		}, .5e3)
	}
})()

// Inicia o aplicativo
onload = function () {
	var i, aba
	abas = new Abas(document.getElementById("abas"))
	txt = document.getElementById("textarea")
	abas.oncreate = function (aba) {
		if (!aba.dados) {
			aba.dados = {titulo: aba.titulo, texto: ""}
			dados.abaAtiva = dados.abas.length
			dados.abas.push(aba.dados)
			mostrar(aba)
		}
		aba.onclick = function () {
			mostrar(this)
		}
		aba.onrename = function (novo) {
			this.dados.titulo = novo
			salvarDados()
		}
		aba.onremove = function () {
			dados.abas.splice(dados.abas.indexOf(this.dados), 1)
			if (dados.abaAtiva == dados.abas.length)
				dados.abaAtiva--
			mostrar(abas.abas[dados.abaAtiva])
		}
		aba.onmove = function () {
			var i
			for (i=0; i<abas.abas.length; i++)
				dados.abas[i] = abas.abas[i].dados
			salvarDados()
		}
	}
	txt.onkeyup = function () {
		if (abaAtiva) {
			abaAtiva.dados.texto = txt.value
			salvarDados()
		}
	}
	txt.onkeydown = function (evento) {
		var pos, pos2
		if (evento.keyCode == 9) {
			pos = txt.selectionStart
			pos2 = txt.scrollTop
			evento.preventDefault()
			txt.value = txt.value.substr(0, pos)+"\t"+txt.value.substr(txt.selectionEnd)
			txt.setSelectionRange(pos+1, pos+1)
			txt.scrollTop = pos2
		}
	}
	for (i in dados.abas) {
		aba = new Aba(dados.abas[i].titulo)
		aba.dados = dados.abas[i]
		abas.adicionar(aba)
		abas.oncreate(aba)
	}
	mostrar(abas.abas[dados.abaAtiva])
}

// Mostra o texto de uma aba
function mostrar(aba) {
	if (abaAtiva)
		abaAtiva.div.classList.remove("ativa")
	if (aba) {
		abaAtiva = aba
		abaAtiva.div.classList.add("ativa")
		dados.abaAtiva = abas.abas.indexOf(aba)
		txt.value = aba.dados.texto
		txt.disabled = false
		txt.focus()
		document.title = aba.dados.titulo+" - Lista todo"
	} else {
		abaAtiva = null
		txt.value = "Comece criando uma nova aba"
		txt.disabled = true
		document.title = "Lista todo"
	}
	salvarDados()
}

// Representa uma aba
// Propriedades: div, titulo
// Eventos: onclick, onrename(novo), onremove, onmove
function Aba(titulo) {
	this.div = document.createElement("div")
	this.div.classList.add("aba")
	this.div.innerHTML = titulo
	this.onclick = null
	this.onrename = null
	this.onremove = null
	this.onmove = null
	Object.defineProperty(this, "titulo", {get: function () {
		return titulo
	}, set: function (novo) {
		titulo = novo
		this.div.innerHTML = novo
	}})
}

// Controlador das abas
// Propriedades: div, abas, width, padding, divDica, divCriar
// Eventos: oncreate(aba)
function Abas(div) {
	var that = this
	this.div = div
	this.abas = []
	this.width = 0
	this.padding = 0
	this.oncreate = null
	this.divDica = document.createElement("div")
	this.divDica.classList.add("dica")
	div.appendChild(this.divDica)
	this.divCriar = document.createElement("div")
	this.divCriar.classList.add("aba")
	this.divCriar.classList.add("criar")
	this.divCriar.innerHTML = "+"
	this.divCriar.onclick = function () {
		var titulo = prompt("Qual será o nome da nova aba?", "Nova aba"), aba
		if (titulo) {
			aba = new Aba(titulo)
			that.adicionar(aba)
			if (that.oncreate)
				that.oncreate(aba)
		}
	}
	div.appendChild(this.divCriar)
	div.classList.add("abas")
	this.atualizar()
}
Abas.prototype.adicionar = function (aba) {
	var arrastando = false, that = this
	this.div.appendChild(aba.div)
	this.abas.push(aba)
	aba.div.style.left = ((this.width+this.padding)*(this.abas.length-1))+"px"
	this.atualizar()
	aba.div.onmouseup = function () {
		if (!arrastando && aba.onclick)
			aba.onclick()
	}
	aba.div.ondblclick = function () {
		var novo = prompt("Digite o novo nome da aba (ou vazio para exclui-la)", aba.titulo)
		if (novo !== null)
			if (novo) {
				if (aba.onrename)
					aba.onrename(novo)
				aba.titulo = novo
			} else {
				that.remover(aba)
				if (aba.onremove)
					aba.onremove()
			}
	}
	aba.div.onmousedown = function (evento) {
		var iniMouse, iniDiv, pos2
		iniMouse = evento.pageX
		iniDiv = getComputedStyle(aba.div).left
		iniDiv = Number(iniDiv.substr(0, iniDiv.length-2))
		document.onmousemove = function (evento) {
			var pos
			if (!arrastando) {
				// Início do arrastamento
				arrastando = true
				aba.div.style.cursor = "ew-resize"
				aba.div.style.opacity = ".5"
				aba.div.style.zIndex = that.abas.length
				that.divDica.style.display = "block"
				document.onmouseup = function () {
					var novasAbas = [], i
					// Fim do arrastamento
					arrastando = false
					document.onmousemove = null
					aba.div.style.cursor = ""
					aba.div.style.opacity = ""
					that.divDica.style.display = ""
					if (aba.onmove)
						aba.onmove()
					if (pos2 == 0)
						novasAbas.push(aba)
					for (i=0; i<that.abas.length; i++) {
						if (that.abas[i] !== aba)
							novasAbas.push(that.abas[i])
						if (i+1 == pos2)
							novasAbas.push(aba)
					}
					that.abas = novasAbas
					that.atualizar()
				}
			}
			pos = iniDiv+evento.pageX-iniMouse
			aba.div.style.left = pos+"px"
			pos2 = (pos-that.padding+that.width/2)/(that.width+that.padding)
			pos2 = Math.min(Math.max(0, Math.round(pos2)), that.abas.length)
			that.divDica.style.left = (that.padding/2+pos2*(that.width+that.padding))+"px"
		}
		document.onmouseup = function () {
			document.onmousemove = null
		}
	}
}
Abas.prototype.remover = function (aba) {
	var i = this.abas.indexOf(aba), that = this
	if (i == -1)
		return;
	this.abas.splice(i, 1)
	aba.div.onmouseup = null
	aba.div.ondblclick = null
	aba.div.onmousedown = null
	aba.div.style.opacity = "0"
	setTimeout(function () {
		that.div.removeChild(aba.div)
	}, 1e3)
	this.atualizar()
}
Abas.prototype.atualizar = function () {
	var i, width
	width = getComputedStyle(this.div).width
	width = Number(width.substr(0, width.length-2))-35
	if (this.abas.length > 10)
		this.padding = 0
	else
		this.padding = 5
	this.width = (width-this.padding)/this.abas.length-this.padding
	if (this.width == Infinity)
		this.width = 0
	for (i=0; i<this.abas.length; i++) {
		this.abas[i].div.style.width = this.width+"px"
		this.abas[i].div.style.left = (i*(this.width+this.padding)+this.padding)+"px"
		this.abas[i].div.style.zIndex = i
	}
}
