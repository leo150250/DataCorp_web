//Constantes
const cena=document.getElementById("cena");
const detalhamento=document.getElementById("detalhamento");
const setaDetalhamento=document.getElementById("setaDetalhamento");
const inputDetalhamento=document.getElementById("inputDetalhamento");

const botaoExecutar=document.getElementById("botaoExecutar");
const inputFrequenciaExecucao=document.getElementById("inputFrequenciaExecucao");
const spanVelocidade=document.getElementById("spanVelocidade");
const spanUpdates=document.getElementById("spanUpdates");
const spanTempo=document.getElementById("spanTempo");
const divPaleta=document.getElementById("divPaleta");

const barraConstruir=document.getElementById("barraConstruir");
const barraProgramar=document.getElementById("barraProgramar");

//Variáveis globais
var objetos=[];
var objetoDetalhado=null;
var emExecucao=false;
var emPausa=false;
var execucaoSimulacao=null;
var duracaoUpdates=500;
var qtdUpdates=0;
var tempoDecorrido=0.0;

//Paletas
paletaFuncionarios=[
    ["Funcionário","funcionario.svg","Ágeis e independentes, os FUNCIONÁRIOS são capazes de manipular DADOS e EQUIPAMENTOS, realizando sequências de instruções programáveis.</p><p>Os FUNCIONÁRIOS ainda possuem a vantagem de ler toda a sala em que são inseridos como uma grande memória, podendo cada espaço ser referenciado de acordo.</p><p>Ainda, o FUNCIONÁRIO pode trabalhar em conjunto com outros FUNCIONÁRIOS, cada um com suas próprias instruções.","descFuncionario.svg",criarFuncionario],
    ["Gerente","funcionario_gerente.svg","Os GERENTES podem delegar FUNCIONÁRIOS e COORDENADORES para trabalhar e também manipular DADOS das salas de forma direta, sem cálculos, logo ao iniciar a execução.</p><p>Todo GERENTE, no entanto, aguarda por uma resposta a ser entregue para ele como um DADO, a qual é devidamente avaliada.</p><p>Também, a sala em que o GERENTE se encontra pode ser lida como uma memória.","descGerente.svg",criarGerente],
    ["Coordenador","funcionario_coordenador.svg","COORDENADORES atuam como FUNCIONÁRIOS mas que não executam as instruções, e sim delegam-nas a OPERÁRIOS, que as manipulam de forma especial e paralela.</p><p>O COORDENADOR ainda é encarregado de, ao final da execução, empacotar todos os DADOS da sala e devolvê-los na porta. Por isto, é recomendado que haja apenas um COORDENADOR nas salas","descFuncionario.svg",criarCoordenador],
    ["Operário","funcionario_operario.svg","Atuando de forma paralela a outros OPERÁRIOS, estes recebem comandos de um COORDENADOR, que envia um conjunto de instruções para estes executarem.</p><p>Os OPERÁRIOS requerem ainda que suas tarefas sejam devidamente finalizadas para permitir que o COORDENADOR da sala possa empacotar os DADOS manipulados.","descFuncionario.svg",criarOperario]
];
paletaEquips=[
    ["Dado","dado.svg","Cada DADO possui um valor que pode ser verificado e manipulado para permitir que os FUNCIONÁRIOS possam executar suas instruções.</p><p>No caso de valores do tipo numérico, estes podem ser matematicamente operados e também ser utilizados como referências à posições na sala, para uso como memória.</p><p>Para os valores do tipo caracter, estes seguem o padrão ASCII para suas referências.","descDado.svg",criarDado],
    ["Impressora","impressora.svg","DESC IMPRESSORA","descImpressora.svg",criarImpressora],
    ["Triturador","triturador.svg","DESC TRITURADOR","descTriturador.svg",criarTriturador],
    ["Esteira","esteira_N.svg","DESC ESTEIRA","descEsteira.svg",criarEsteira]
];
paletaConstrucao=[
    ["Sala","parede.svg","Descrição salas","descSalas.svg",null],
    ["Porta","porta.svg","Descrição portas","descPortas.svg",null]
];
paletaDecoracao=[
    ["Planta","planta.svg","Descrição planta","descPlantas.svg",null],
    ["Mesa","mesa.svg","Descrição mesa","descMesas.svg",null]
];
paletaSelecionada=paletaFuncionarios;
function exibirPaleta(argPaleta) {
    barraConstruir.style.display="flex";
    barraProgramar.style.display="none";
    divPaleta.innerHTML="";
    argPaleta.forEach(botao => {
        let novoBotao=document.createElement("button");
        novoBotao.title=botao[0];
        let imagemBotao=document.createElement("img");
        imagemBotao.src="imagens/"+botao[1];
        novoBotao.onclick=()=>{
            abrirConstrutor(botao);
        };
        novoBotao.appendChild(imagemBotao);
        divPaleta.appendChild(novoBotao);
    });
    paletaSelecionada=argPaleta;
}
function abrirConstrutor(argItem) {
    detalhamento.innerHTML="";
    ativarDetalhamento();
    let titulo=document.createElement("h1");
    let imagemTitulo=document.createElement("img");
    imagemTitulo.src="imagens/"+argItem[1];
    imagemTitulo.style.width="64px";
    titulo.appendChild(imagemTitulo);
    titulo.innerHTML+=argItem[0];
    let descricaoImagem=document.createElement("img");
    descricaoImagem.src="imagens/"+argItem[3];
    descricaoImagem.classList.add("descricao");
    let descricaoConstrutor=document.createElement("p");
    descricaoConstrutor.innerHTML=argItem[2];
    detalhamento.appendChild(titulo);
    detalhamento.appendChild(descricaoImagem);
    detalhamento.appendChild(descricaoConstrutor);
}
function exibirProgramacoes() {
    barraConstruir.style.display="none";
    barraProgramar.style.display="flex";
    desativarEspacoCards();
}
paletaProgramacoes=[
    ["mover","mover"],
    ["pegar","pegar"],
    ["soltar","pegar"],
    ["pular","ordem"],
]
paletaProgramacoes.forEach(cardProgramacao => {
    let novoCard=criarCardProgramacao(cardProgramacao,null,true);
    barraProgramar.appendChild(novoCard[0]);
});

//Classes
class Objeto {
    constructor(argPosX,argPosY) {
        this.posX=argPosX;
        this.posY=argPosY;
        this.posXInicial=argPosX;
        this.posYInicial=argPosY;
        this.geradoEmExecucao=false;
        if (emExecucao || emPausa) {
            this.geradoEmExecucao=true;
        }
        this.superficie=false;
        this.objetoAcima=null;
        this.objetoAbaixo=null;
        this.elevado=false;
        this.pegavel=false;
        this.imagem=null;
        this.elemento=document.createElement("object");
        this.elemento.width="32px";
        this.elemento.height="32px";
        this.elemento.classList.add("objeto");
        this.atualizado=false;
        this.elementoClicavel=document.createElement("div");
        this.elementoClicavel.classList.add("clicavel");
        this.tipoClicavel="";
        this.executando=false;
        this.movimentacao="ease";
    }
    destruir() {
        if (this.elementoClicavel.parentElement==cena) {
            cena.removeChild(this.elementoClicavel);
        }
        cena.removeChild(this.elemento);
        if (this.geradoEmExecucao) {
            let novoArrayObjetos=[];
            objetos.forEach(objeto=>{
                if (objeto!=this) {
                    novoArrayObjetos.push(objeto);
                }
            });
            objetos=novoArrayObjetos;
        }
        if (this.objetoAbaixo!=null) {
            this.objetoAbaixo.objetoAcima=null;
        }
    }
    ping() {
        //console.log(this);
        this.softDraw();
        this.atualizado=false;
    }
    update() {
        //Faz nada;
    }
    reset() {
        if (this.geradoEmExecucao) {
            this.destruir();
        } else {
            this.posX=this.posXInicial;
            this.posY=this.posYInicial;
            this.objetoAcima=null;
            this.objetoAbaixo=null;
            this.elevado=false;
            this.draw();
        }
    }
    softDraw() {
        this.elemento.style.left=(this.posX*32)+"px";
        if (this.elevado) {
            this.elemento.style.top=((this.posY*32)-8)+"px";
        } else {
            this.elemento.style.top=(this.posY*32)+"px";
        }
        this.elementoClicavel.style.left=this.elemento.style.left;
        this.elementoClicavel.style.top=this.elemento.style.top;
    }
    draw() {
        cena.appendChild(this.elemento);
        this.elemento.data="imagens/"+this.imagem;
        this.elementoClicavel.style.width=this.elemento.width;
        this.elementoClicavel.style.height=this.elemento.height;
        this.softDraw();
    }
    mover(argPosX,argPosY) {
        this.atualizarMovimentacao();
        this.posX=argPosX;
        this.posY=argPosY;
        if (this.objetoAcima!=null) {
            this.objetoAcima.mover(argPosX,argPosY);
        }
        return true;
    }
    pegarObjeto(argObjetoPegar) {
        let retorno=false;
        if (this.superficie) {
            if (this.objetoAcima==null) {
                if (argObjetoPegar.pegavel) {
                    if (!argObjetoPegar.atualizado) {
                        argObjetoPegar.atualizarMovimentacao();
                        if (argObjetoPegar.objetoAbaixo!=null) {
                            if (argObjetoPegar.objetoAbaixo.movimentacao=="linear" && this.movimentacao=="linear") {
                                argObjetoPegar.atualizarMovimentacao("linear");
                            }
                            argObjetoPegar.objetoAbaixo.objetoAcima=null;
                        }
                        argObjetoPegar.elevado=true;
                        argObjetoPegar.objetoAbaixo=this;
                        argObjetoPegar.posX=this.posX;
                        argObjetoPegar.posY=this.posY;
                        argObjetoPegar.atualizado=true;
                        argObjetoPegar.softDraw();
                        this.objetoAcima=argObjetoPegar;
                        retorno=true;
                    }
                }
            }
        }
        return retorno;
    }
    soltarObjeto(argPosX,argPosY) {
        let retorno=false;
        if (this.objetoAcima!=null) {
            if (!this.objetoAcima.atualizado) {
                let superficiesAlvo=obterObjetos(argPosX,argPosY);
                if (superficiesAlvo.length==0) {
                    this.objetoAcima.atualizarMovimentacao();
                    this.objetoAcima.elevado=false;
                    this.objetoAcima.objetoAbaixo=null;
                    this.objetoAcima.posX=argPosX;
                    this.objetoAcima.posY=argPosY;
                    this.objetoAcima.atualizado=true;
                    this.objetoAcima.softDraw();
                    this.objetoAcima=null;
                    retorno=true;
                } else {
                    let resultado=false;
                    superficiesAlvo.forEach(superficie => {
                        if (superficie===this) {
                            this.objetoAcima.atualizarMovimentacao();
                            this.objetoAcima.elevado=false;
                            this.objetoAcima.objetoAbaixo=null;
                            this.objetoAcima.posX=argPosX;
                            this.objetoAcima.posY=argPosY;
                            this.objetoAcima.atualizado=true;
                            this.objetoAcima.softDraw();
                            this.objetoAcima=null;
                            resultado=true;
                        } else {
                            if (superficie.pegarObjeto(this.objetoAcima)) {
                                resultado=true;
                            };
                        }
                    });
                    retorno=resultado;
                }
            }
        }
        return retorno;
    }
    atualizarMovimentacao(argTipo="ease") {
        this.elemento.style.transitionTimingFunction=argTipo;
        this.elemento.style.transitionDuration=duracaoUpdates+"ms";
    }
}
class Dado extends Objeto {
    constructor(argPosX,argPosY,argValor=null) {
        super(argPosX,argPosY);
        this.pegavel=true;
        this.imagem="dado.svg";
        this.elementoValor=document.createElement("div");
        this.elementoValor.classList.add("valorDado");
        this.definirValor(argValor);
    }
    definirValor(argValor=null) {
        this.valor=argValor;
        this.elementoValor.innerHTML=this.valor;
        this.draw();
    }
    softDraw() {
        super.softDraw();
        this.elementoValor.style.left=this.elemento.style.left;
        this.elementoValor.style.top=this.elemento.style.top;
    }
    draw() {
        cena.appendChild(this.elementoValor);
        super.draw();
    }
    destruir() {
        cena.removeChild(this.elementoValor);
        super.destruir();
    }
    atualizarMovimentacao(argTipo="ease") {
        super.atualizarMovimentacao(argTipo);
        this.elementoValor.style.transitionTimingFunction=this.elemento.style.transitionTimingFunction;
        this.elementoValor.style.transitionDuration=this.elemento.style.transitionDuration;
    }
}
class Impressora extends Objeto {
    constructor(argPosX,argPosY) {
        super(argPosX,argPosY);
        this.superficie=true;
        this.tipoImpressora="rand";
        this.imagem="impressora.svg";
        this.executando=true;
    }
    update() {
        if (this.executando) {
            if (this.objetoAcima==null) {
                let novoDado=criarDado(this.posX,this.posY,this.obterProximoValor());
                novoDado.geradoEmExecucao=true;
                super.pegarObjeto(novoDado);
            }
        }
    }
    obterProximoValor() {
        let proximoValor;
        switch (this.tipoImpressora) {
            case "rand": {
                proximoValor=Math.floor(Math.random()*99);
            } break;
        }
        return proximoValor;
    }
}
class Triturador extends Objeto {
    constructor(argPosX,argPosY) {
        super(argPosX,argPosY);
        this.superficie=true;
        this.imagem="triturador.svg";
        this.executando=true;
    }
    update() {
        if (this.executando) {
            if (this.objetoAcima!=null) {
                if (!this.objetoAcima.atualizado) {
                    this.objetoAcima.destruir();
                }
            }
        }
    }
}
class Funcionario extends Objeto {
    constructor(argPosX,argPosY) {
        super(argPosX,argPosY);
        this.superficie=true;
        this.imagem="funcionario.svg";
        this.acoes=[];
        this.acaoCounter=0;
        this.elementoClicavel.onclick=(e)=>{
            detalharObjeto(this);
        }
        this.elementoClicavel.style.cursor="pointer";
        this.tipoClicavel="programa";
        this.executando=true;
        this.suspenderExecucao=0;
        this.timerSuspensao=2;
        this.balaoFala=document.createElement("div");
        this.balaoFala.classList.add("balaoFala");
        this.balaoFala.style.opacity="0";
        this.balaoFalaTimer=null;
    }
    update() {
        if (this.executando) {
            if (this.acaoCounter<this.acoes.length) {
                let acaoAgora=this.acoes[this.acaoCounter];
                switch (acaoAgora.tipo) {
                    case "mover": {
                        let alvoX=0;
                        let alvoY=0;
                        switch (acaoAgora.argumento) {
                            case "_N": alvoY=-1; break;
                            case "_S": alvoY=1; break;
                            case "_L": alvoX=1; break;
                            case "_O": alvoX=-1; break;
                            case "_NE": alvoY=-1; alvoX=1; break;
                            case "_SE": alvoY=1; alvoX=1; break;
                            case "_SO": alvoY=1; alvoX=-1; break;
                            case "_NO": alvoY=-1; alvoX=-1; break;
                        }
                        if (!super.mover(this.posX+alvoX,this.posY+alvoY)) {
                            this.exibirBalao("Não consigo mover pra lá!");
                            this.executando=false;
                            this.suspenderExecucao=this.timerSuspensao;
                        }
                    } break;
                    case "pegar": {
                        if (this.objetoAcima==null) {
                            let alvoX=0;
                            let alvoY=0;
                            switch (acaoAgora.argumento) {
                                case "_N": alvoY=-1; break;
                                case "_S": alvoY=1; break;
                                case "_L": alvoX=1; break;
                                case "_O": alvoX=-1; break;
                                case "_NE": alvoY=-1; alvoX=1; break;
                                case "_SE": alvoY=1; alvoX=1; break;
                                case "_SO": alvoY=1; alvoX=-1; break;
                                case "_NO": alvoY=-1; alvoX=-1; break;
                            }
                            let objetosPegaveis=obterObjetosPegaveis(this.posX+alvoX,this.posY+alvoY);
                            if (objetosPegaveis.length==0) {
                                this.exibirBalao("Nada a pegar!");
                                this.executando=false;
                                this.suspenderExecucao=this.timerSuspensao;
                            } else {
                                let resultado=false;
                                objetosPegaveis.forEach(objeto => {
                                    if (super.pegarObjeto(objeto)) {
                                        resultado=true;
                                    }
                                });
                                if (!resultado) {
                                    this.exibirBalao("Nada a pegar!");
                                    this.executando=false;
                                    this.suspenderExecucao=this.timerSuspensao;
                                }
                            }
                        } else {
                            this.exibirBalao("Já estou segurando algo!");
                            this.executando=false;
                            this.suspenderExecucao=this.timerSuspensao;
                        }
                    } break;
                    case "soltar": {
                        if (this.objetoAcima!=null) {
                            let alvoX=0;
                            let alvoY=0;
                            switch (acaoAgora.argumento) {
                                case "_N": alvoY=-1; break;
                                case "_S": alvoY=1; break;
                                case "_L": alvoX=1; break;
                                case "_O": alvoX=-1; break;
                                case "_NE": alvoY=-1; alvoX=1; break;
                                case "_SE": alvoY=1; alvoX=1; break;
                                case "_SO": alvoY=1; alvoX=-1; break;
                                case "_NO": alvoY=-1; alvoX=-1; break;
                            }
                            if (!super.soltarObjeto(this.posX+alvoX,this.posY+alvoY)) {
                                this.exibirBalao("Não consigo soltar isso!");
                                this.executando=false;
                                this.suspenderExecucao=this.timerSuspensao;
                            }
                        } else {
                            this.exibirBalao("Não estou segurando nada!");
                            this.executando=false;
                            this.suspenderExecucao=this.timerSuspensao;
                        }
                    } break;
                    case "pular": {
                        this.acaoCounter=acaoAgora.argumento-1;
                    } break;
                }
                this.acaoCounter++;
            }
            if (objetoDetalhado===this) {
                atualizarProgramCounter(this.acaoCounter);
            }
        } else {
            if (this.suspenderExecucao>0) {
                this.suspenderExecucao--;
            } else if (this.suspenderExecucao==0) {
                this.sumirBalao();
                this.executando=true;
            }
        }
        this.softDraw();
    }
    softDraw() {
        super.softDraw();
        this.atualizarBalao();
    }
    draw() {
        cena.appendChild(this.elementoClicavel);
        cena.appendChild(this.balaoFala);
        super.draw();
    }
    reset() {
        super.reset();
        if (!this.geradoEmExecucao) {
            this.sumirBalao();
            this.acaoCounter=0;
            this.suspenderExecucao=0;
            this.executando=true;
        }
    }
    adicionarAcao(argAcao) {
        let novaAcao=new AcaoProgramada(argAcao[0],this.acoes.length,argAcao[1]);
        this.acoes.push(novaAcao);
        return novaAcao;
    }
    inserirAcao(argAcao,argCounter) {
        let retornoAcao=null;
        if (argCounter==this.acoes.length) {
            retornoAcao=this.adicionarAcao(argAcao);
        } else {
            let updateAcoes=[];
            let contador=0;
            for (let i=0; i<this.acoes.length; i++) {
                if (argCounter==i) {
                    retornoAcao=new AcaoProgramada(argAcao[0],contador,argAcao[1]);
                    updateAcoes.push(retornoAcao);
                    contador++;
                }
                let acaoInserir=this.acoes[i];
                if (contador!=i) {
                    acaoInserir.atualizarCounter(contador);
                }
                updateAcoes.push(acaoInserir);
                contador++;
            }
            this.acoes=updateAcoes;
        }
        this.gerarCards();
        retornoAcao.exibirInput();
        return retornoAcao;
    }
    moverAcao(argCounterOrigem,argCounterDestino) {
        let acaoMover=this.acoes[argCounterOrigem];
        if (argCounterOrigem<argCounterDestino) {
            for (let i=argCounterOrigem; i<argCounterDestino-1; i++) {
                this.acoes[i]=this.acoes[i+1];
                this.acoes[i].atualizarCounter(i);
            }
            this.acoes[argCounterDestino-1]=acaoMover;
            this.acoes[argCounterDestino-1].atualizarCounter(argCounterDestino-1);
        } else if (argCounterOrigem>argCounterDestino) {
            //console.log("MOVE PRA CIMA");
            for (let i=argCounterOrigem; i>argCounterDestino; i--) {
                this.acoes[i]=this.acoes[i-1];
                this.acoes[i].atualizarCounter(i);
            }
            this.acoes[argCounterDestino]=acaoMover;
            this.acoes[argCounterDestino].atualizarCounter(argCounterDestino);
        }
        this.gerarCards();
    }
    swapAcao(argCounterOrigem,argCounterDestino) {
        this.acoes[argCounterDestino].atualizarCounter(argCounterOrigem);
        this.acoes[argCounterOrigem].atualizarCounter(argCounterDestino);
        let acaoAux=this.acoes[argCounterDestino];
        this.acoes[argCounterDestino]=this.acoes[argCounterOrigem];
        this.acoes[argCounterOrigem]=acaoAux;
        this.gerarCards();
    }
    deletarAcao(argCounter) {
        console.log("Deleta o "+argCounter);
        let updateAcoes=[];
        let contador=0;
        for (let i=0; i<this.acoes.length; i++) {
            if (argCounter!=i) {
                let acaoInserir=this.acoes[i];
                if (contador!=i) {
                    acaoInserir.atualizarCounter(contador);
                }
                updateAcoes.push(acaoInserir);
                contador++;
            }
        }
        this.acoes=updateAcoes;
        this.gerarCards();
    }
    gerarCards() {
        detalhamento.innerHTML="";
        cardsEspacamentoProgramacao=[];
        detalhamento.appendChild(criarEspacoCard());
        let ultimoEspacoCard=null;
        this.acoes.forEach((acao,counter)=>{
            detalhamento.appendChild(acao.card);
            ultimoEspacoCard=criarEspacoCard(counter+1);
            detalhamento.appendChild(ultimoEspacoCard);
        });
    }
    exibirBalao(argTexto) {
        this.balaoFala.style.opacity="1";
        this.balaoFala.innerHTML=argTexto;
        this.atualizarBalao();
        //this.balaoFalaTimer=setTimeout(this.sumirBalao,3000);
    }
    sumirBalao() {
        this.balaoFala.style.opacity="0";
    }
    atualizarBalao() {
        this.balaoFala.style.transform="rotate("+(-5+(Math.random()*10))+"deg)";
        this.balaoFala.style.top=this.elemento.offsetTop-this.balaoFala.offsetHeight;
        this.balaoFala.style.left=this.elemento.offsetLeft-(this.balaoFala.offsetWidth/2)+16;
    }
}
class Esteira extends Objeto {
    constructor(argPosX,argPosY) {
        super(argPosX,argPosY);
        this.superficie=true;
        this.direcao="_N";
        this.imagem="esteira"+this.direcao+".svg";
        this.movimentacao="linear";
    }
    update() {
        if (this.objetoAcima!=null) {
            let alvoX=0;
            let alvoY=0;
            switch (this.direcao) {
                case "_N": alvoY=-1; break;
                case "_S": alvoY=1; break;
                case "_L": alvoX=1; break;
                case "_O": alvoX=-1; break;
                case "_NE": alvoY=-1; alvoX=1; break;
                case "_SE": alvoY=1; alvoX=1; break;
                case "_SO": alvoY=1; alvoX=-1; break;
                case "_NO": alvoY=-1; alvoX=-1; break;
            }
            super.soltarObjeto(this.posX+alvoX,this.posY+alvoY);
        } else {
            //console.log("Não estou segurando nada!");
        }
    }
    draw() {
        this.imagem="esteira"+this.direcao+".svg";
        super.draw();
    }
}
class AcaoProgramada {
    constructor(argTipo,argCounter,argArgumento) {
        this.tipo=argTipo;
        this.counter=argCounter;
        this.argumento=argArgumento;
        switch (this.tipo) {
            case "mover":
            case "pegar":
            case "soltar": {
                if (this.argumento=="") {
                    this.argumento="_C";
                }
            } break;
            case "pular": {
                if (this.argumento=="") {
                    this.argumento=this.counter;
                }
            } break;
        }
        let novoCard=criarCardProgramacao([this.tipo,this.argumento],this.counter,null,this);
        this.card=novoCard[0];
        this.cardCounter=novoCard[1];
        this.cardInput=novoCard[2];
    }
    atualizarCounter(argNovoCounter) {
        this.counter=argNovoCounter;
        this.cardCounter.innerHTML=this.counter;
        console.log("Atualizei para "+argNovoCounter);
    }
    exibirInput() {
        //console.log("Exibir input");
        desativarInputDetalhamento();
        inputDetalhamento.style.display="block";
        inputDetalhamento.style.backgroundColor=window.getComputedStyle(this.card).backgroundColor;
        let inputDetalhamentoControle=null;
        let inputComFoco=null;
        switch (this.tipo) {
            case "mover":
            case "pegar":
            case "soltar": {
                let novoInput=criarInputDirecao(this.argumento);
                inputDetalhamentoControle=novoInput[0];
                for(let i=1; i<10; i++) {
                    let novoComandoNoInput="";
                    switch (i) {
                        case 1: novoComandoNoInput="_NO"; break;
                        case 2: novoComandoNoInput="_N"; break;
                        case 3: novoComandoNoInput="_NE"; break;
                        case 4: novoComandoNoInput="_O"; break;
                        case 5: novoComandoNoInput="_C"; break;
                        case 6: novoComandoNoInput="_L"; break;
                        case 7: novoComandoNoInput="_SO"; break;
                        case 8: novoComandoNoInput="_S"; break;
                        case 9: novoComandoNoInput="_SE"; break;
                    }
                    novoInput[i].onclick=(e,argAcao=this)=>{
                        argAcao.atualizarInput(novoComandoNoInput);
                        desativarInputDetalhamento();
                    }
                }
            } break;
            case "pular": {
                let novoInput=criarInputTexto(this.argumento,"number");
                inputDetalhamentoControle=novoInput[0];
                novoInput[1].onchange=(e,argAcao=this)=>{
                    argAcao.atualizarInput(novoInput[1].value);
                }
                inputComFoco=novoInput[1];
            } break;
        }
        inputDetalhamento.appendChild(inputDetalhamentoControle);
        inputDetalhamento.style.top=this.cardInput.offsetTop-detalhamento.scrollTop-(inputDetalhamento.offsetHeight/2-(this.cardInput.offsetHeight/2));
        inputDetalhamento.style.left=detalhamento.offsetLeft+this.cardInput.offsetLeft-(inputDetalhamento.offsetWidth/2-(this.cardInput.offsetWidth/2));
        ajustarInputDetalhamento();
        if (inputComFoco!=null) {
            inputComFoco.focus();
        }
    }
    atualizarInput(argNovoArgumento) {
        console.log("Atualiza para "+argNovoArgumento);
        switch (this.tipo) {
            case "mover":
            case "pegar":
            case "soltar": {
                this.argumento=argNovoArgumento;
                this.cardInput.src="imagens/seta"+this.argumento+".svg";
            } break;
            case "pular": {
                this.argumento=parseInt(argNovoArgumento);
                this.cardInput.innerHTML=argNovoArgumento;
            }
        }
    }
}

//Criação de objetos
function criarObjeto(argObjeto,argPosX,argPosY) {
    let novoObjeto=new argObjeto(argPosX,argPosY);
    objetos.push(novoObjeto);
    return novoObjeto;
}
function criarFuncionario(argPosX,argPosY,argAcoes=[]) {
    let novoFuncionario=criarObjeto(Funcionario,argPosX,argPosY);
    argAcoes.forEach((acao)=>{
        novoFuncionario.adicionarAcao(acao);
    });
    novoFuncionario.draw();
    return novoFuncionario;
}
function criarGerente(argPosX,argPosY) {
    let novoFuncionario=criarObjeto(Funcionario,argPosX,argPosY);
    novoFuncionario.draw();
    return novoFuncionario;
}
function criarCoordenador(argPosX,argPosY) {
    let novoFuncionario=criarObjeto(Funcionario,argPosX,argPosY);
    novoFuncionario.draw();
    return novoFuncionario;
}
function criarOperario(argPosX,argPosY) {
    let novoFuncionario=criarObjeto(Funcionario,argPosX,argPosY);
    novoFuncionario.draw();
    return novoFuncionario;
}
function criarDado(argPosX,argPosY,argValor=null) {
    let novoDado=criarObjeto(Dado,argPosX,argPosY);
    novoDado.definirValor(argValor);
    novoDado.draw();
    return novoDado;
}
function criarImpressora(argPosX,argPosY) {
    let novaImpressora=criarObjeto(Impressora,argPosX,argPosY);
    novaImpressora.draw();
    return novaImpressora;
}
function criarTriturador(argPosX,argPosY) {
    let novoTriturador=criarObjeto(Triturador,argPosX,argPosY);
    novoTriturador.draw();
    return novoTriturador;
}
function criarEsteira(argPosX,argPosY,argDirecao="_N") {
    let novaEsteira=criarObjeto(Esteira,argPosX,argPosY);
    novaEsteira.direcao=argDirecao;
    novaEsteira.draw();
    return novaEsteira;
}

//Checagem de objetos
function obterObjetos(argPosX,argPosY,argObjeto=null) {
    let objetosRetorno=[];
    objetos.forEach((objeto)=>{
        if (objeto.posX==argPosX && objeto.posY==argPosY) {
            if (argObjeto==null) {
                objetosRetorno.push(objeto);
            } else {
                if (objeto===argObjeto) {
                    objetosRetorno.push(objeto);
                }
            }
        }
    });
    return objetosRetorno;
}
function obterObjetosPegaveis(argPosX,argPosY) {
    let objetosIdentificaveis=obterObjetos(argPosX,argPosY);
    let objetosRetorno=[];
    objetosIdentificaveis.forEach((objeto)=>{
        if (objeto.pegavel) {
            objetosRetorno.push(objeto);
        }
    });
    return objetosRetorno;
}

//GUI
var cardsEspacamentoProgramacao=[];
function detalharObjeto(argObjeto) {
    detalhamento.innerHTML="";
    ativarDetalhamento();
    objetoDetalhado=argObjeto;
    objetoDetalhado.elemento.classList.add("selecionado");
    //console.log(objetoDetalhado);
    setaDetalhamento.style.display="block";
    if (objetoDetalhado.tipoClicavel=="programa") {
        objetoDetalhado.gerarCards();
        atualizarProgramCounter(objetoDetalhado.acaoCounter);
        detalhamento.onscroll=()=>{
            atualizarSetaProgramCounter(objetoDetalhado.acaoCounter);
        }
        exibirProgramacoes();
    }
}
function ativarDetalhamento() {
    if (objetoDetalhado!=null) {
        objetoDetalhado.elemento.classList.remove("selecionado");
    }
    detalhamento.onscroll=null;
    detalhamento.style.display="flex";
    cena.style.width="calc(100% - "+detalhamento.offsetWidth+"px)";
    setaDetalhamento.style.display="none";
}
function desativarDetalhamento() {
    if (objetoDetalhado!=null) {
        objetoDetalhado.elemento.classList.remove("selecionado");
        if (objetoDetalhado.tipoClicavel=="programa") {
            exibirPaleta(paletaSelecionada);
        }
    }
    desativarInputDetalhamento();
    detalhamento.style.display="none";
    setaDetalhamento.style.display="none";
    cena.onclick=null;
    cena.style.width="100%";
}

function atualizarProgramCounter(argContador) {
    if (objetoDetalhado.acoes[argContador]!=null) {
        objetoDetalhado.acoes[argContador].card.scrollIntoView({behavior:"smooth",block:"center",inline:"center"});
        atualizarSetaProgramCounter(argContador);
    }
}
function atualizarSetaProgramCounter(argContador) {
    //let numeroCounter=1+(argContador*2);
    setaDetalhamento.style.top=objetoDetalhado.acoes[argContador].card.offsetTop-detalhamento.scrollTop;
    setaDetalhamento.style.left=detalhamento.offsetLeft-20;
}

var programacaoAcaoMovendo=null;
function criarEspacoCard(argCounter=0) {
    let novoEspaco=document.createElement("div");
    novoEspaco.classList.add("espacoCard");
    novoEspaco.setAttribute("counter",argCounter);
    novoEspaco.ondragenter=(e)=>{
        novoEspaco.style.opacity="1";
        novoEspaco.style.height="70px";
    }
    novoEspaco.ondragleave=(e)=>{
        novoEspaco.style.opacity=null;
        novoEspaco.style.height=null;
    }
    novoEspaco.ondragover=(e)=>{
        e.preventDefault();
    }
    novoEspaco.ondrop=(e)=>{
        console.log("Soltei!");
        if (programacaoAcaoMovendo.constructor===Array) {
            objetoDetalhado.inserirAcao(programacaoAcaoMovendo,argCounter);
        } else {
            objetoDetalhado.moverAcao(programacaoAcaoMovendo.counter,argCounter);
        }
        novoEspaco.style.opacity=null;
        novoEspaco.style.height=null;
    }
    cardsEspacamentoProgramacao.push(novoEspaco);
    return novoEspaco;
}
function ativarEspacoCards() {
    cardsEspacamentoProgramacao.forEach(card => {
        card.style.pointerEvents=null;
        card.style.zIndex=1;
    });
    //console.log("Espaços ativados");
}
function desativarEspacoCards() {
    cardsEspacamentoProgramacao.forEach(card => {
        card.style.pointerEvents="none";
        card.style.zIndex=-1;
    });
    //console.log("Espaços desativados");
}
function criarCardProgramacao(argAcao,argCounter,argFerramenta=null,argAcaoObjeto=null) {
    let retorno=[];
    let novoCard=document.createElement("div");
    retorno[0]=novoCard;
    novoCard.classList.add("card");
    if (argFerramenta===null) {
        let pCounter=document.createElement("p");
        pCounter.classList.add("counter");
        pCounter.innerHTML=argCounter;
        retorno[1]=pCounter;
        novoCard.appendChild(pCounter);
    }
    novoCard.draggable=true;
    novoCard.ondragstart=(e)=>{
        novoCard.style.opacity="0.5";
        ativarEspacoCards();
        if (argFerramenta===null) {
            programacaoAcaoMovendo=argAcaoObjeto;
            cena.ondrop=(e)=>{
                objetoDetalhado.deletarAcao(argAcaoObjeto.counter);
                cena.ondrop=null;
            }
        } else {
            programacaoAcaoMovendo=[argAcao[0],""];
        }
    }
    novoCard.ondragend=(e)=>{
        novoCard.style.opacity="1";
        desativarEspacoCards();
        cena.ondrop=null;
        //console.log(e);
        programacaoAcaoMovendo=null;
    }
    switch (argAcao[0]) {
        case "mover": {
            let pComando=document.createElement("p");
            pComando.innerHTML="Mover";
            novoCard.appendChild(pComando);
            novoCard.classList.add("mover");
            if (argFerramenta===null) {
                //let divDirecao=criarInputDirecao(argAcao[1]);
                let imgDirecao=document.createElement("img");
                imgDirecao.classList.add("input");
                imgDirecao.src="imagens/seta"+argAcao[1]+".svg";
                imgDirecao.onclick=(e)=>{
                    argAcaoObjeto.exibirInput();
                }
                novoCard.appendChild(imgDirecao);
                retorno[2]=imgDirecao;
            }
        } break;
        case "pegar": {
            let pComando=document.createElement("p");
            pComando.innerHTML="Pegar de";
            novoCard.appendChild(pComando);
            novoCard.classList.add("pegar");
            if (argFerramenta===null) {
                let imgDirecao=document.createElement("img");
                imgDirecao.classList.add("input");
                imgDirecao.src="imagens/seta"+argAcao[1]+".svg";
                imgDirecao.onclick=(e)=>{
                    argAcaoObjeto.exibirInput();
                }
                novoCard.appendChild(imgDirecao);
                retorno[2]=imgDirecao;
            }
        } break;
        case "soltar": {
            let pComando=document.createElement("p");
            pComando.innerHTML="Soltar em";
            novoCard.appendChild(pComando);
            novoCard.classList.add("pegar");
            if (argFerramenta===null) {
                let imgDirecao=document.createElement("img");
                imgDirecao.classList.add("input");
                imgDirecao.src="imagens/seta"+argAcao[1]+".svg";
                imgDirecao.onclick=(e)=>{
                    argAcaoObjeto.exibirInput();
                }
                novoCard.appendChild(imgDirecao);
                retorno[2]=imgDirecao;
            }
        } break;
        case "pular": {
            let pComando=document.createElement("p");
            pComando.innerHTML="Pular para";
            novoCard.appendChild(pComando);
            novoCard.classList.add("ordem");
            if (argFerramenta===null) {
                let pOrdem=document.createElement("p");
                pOrdem.classList.add("input");
                pOrdem.innerHTML=argAcao[1];
                pOrdem.onclick=(e)=>{
                    argAcaoObjeto.exibirInput();
                }
                novoCard.appendChild(pOrdem);
                retorno[2]=pOrdem;
            }
        } break;
    }
    return retorno;
}

function desativarInputDetalhamento() {
    inputDetalhamento.innerHTML="";
    inputDetalhamento.style.display="none";
}
function ajustarInputDetalhamento() {
    if (inputDetalhamento.offsetTop<0) {
        let calculoAjuste=inputDetalhamento.offsetTop*-1;
        console.log("AJUSTA AÍ PÔ - "+calculoAjuste);
        inputDetalhamento.style.top=inputDetalhamento.offsetTop+calculoAjuste;
    }
}
function criarInputDirecao(argDirecaoSelecionada=null) {
    let retorno=[];
    let novoInputDirecao=document.createElement("div");
    novoInputDirecao.classList.add("inputDirecao");
    retorno[0]=novoInputDirecao;
    for (let i=0; i<9; i++) {
        let novaDirecao=document.createElement("img");
        let argDirecao="_C";
        switch (i) {
            case 0: argDirecao="_NO"; break;
            case 1: argDirecao="_N"; break;
            case 2: argDirecao="_NE"; break;
            case 3: argDirecao="_O"; break;
            case 4: argDirecao="_C"; break;
            case 5: argDirecao="_L"; break;
            case 6: argDirecao="_SO"; break;
            case 7: argDirecao="_S"; break;
            case 8: argDirecao="_SE"; break;
        }
        novaDirecao.src="imagens/seta"+argDirecao+".svg";
        novaDirecao.classList.add("input");
        if (argDirecao==argDirecaoSelecionada) {
            novaDirecao.classList.add("selecionado");
        }
        retorno.push(novaDirecao);
        novoInputDirecao.appendChild(novaDirecao);
    }
    return retorno;
}
function criarInputTexto(argTexto,argTipo="text") {
    let retorno=[];
    let novoInputTexto=document.createElement("div");
    //novoInputTexto.classList.add("inputDirecao");
    retorno[0]=novoInputTexto;
    let novoInput=document.createElement("input");
    novoInput.classList.add("input");
    novoInput.type=argTipo;
    novoInput.value=argTexto;
    retorno[1]=novoInput;
    novoInputTexto.appendChild(novoInput);
    return retorno;
}

cena.addEventListener("click",(e)=>{
    if (e.target==cena) {
        desativarDetalhamento();
    }
});
cena.ondragover=(e)=>{
    e.preventDefault();
}
detalhamento.addEventListener("mouseup",(e)=>{
    if (e.target!=inputDetalhamento) {
        desativarInputDetalhamento();
    }
},true);

//Game logic
function ping() {
    //console.log("Ping!");
    objetos.forEach(objeto => {
        objeto.ping();
    });
}
function update() {
    qtdUpdates++;
    spanUpdates.innerHTML=qtdUpdates;
    tempoDecorrido+=0.5;
    spanTempo.innerHTML=Math.floor(tempoDecorrido/60).toString().padStart(2,'0')+":"+Math.floor(tempoDecorrido%60).toString().padStart(2,'0');
    objetos.forEach(objeto => {
        objeto.update();
    });
    ping();
}
function reset() {
    objetos.forEach(objeto => {
        objeto.reset();
    });
    if (objetoDetalhado!=null) {
        if (objetoDetalhado.tipoClicavel=="programa") {
            atualizarProgramCounter(objetoDetalhado.acaoCounter);
        }
    }
}
function iniciarSimulacao() {
    emExecucao=true;
    emPausa=false;
    clearInterval(execucaoSimulacao);
    execucaoSimulacao=setInterval(update,duracaoUpdates);
    update();
    botaoExecutar.src="imagens/controle_pausar.svg";
}
function pararSimulacao() {
    emExecucao=false;
    emPausa=false;
    clearInterval(execucaoSimulacao);
    botaoExecutar.src="imagens/controle_executar.svg";
    qtdUpdates=0;
    spanUpdates.innerHTML=qtdUpdates;
    tempoDecorrido=0.0;
    spanTempo.innerHTML=Math.floor(tempoDecorrido/60).toString().padStart(2,'0')+":"+Math.floor(tempoDecorrido%60).toString().padStart(2,'0');
    reset();
}
function pausarSimulacao() {
    emExecucao=false;
    emPausa=true;
    clearInterval(execucaoSimulacao);
    botaoExecutar.src="imagens/controle_executar.svg";
}
function alternarSimulacao() {
    if (emExecucao) {
        pausarSimulacao();
    } else {
        iniciarSimulacao();
    }
}
function passoSimulacao() {
    pausarSimulacao();
    update();
}
function atualizarFrequenciaExecucao() {
    duracaoUpdates=parseInt(500/(parseFloat(inputFrequenciaExecucao.value)));
    spanVelocidade.innerHTML=inputFrequenciaExecucao.value+"x";
    if (emExecucao) {
        clearInterval(execucaoSimulacao);
        execucaoSimulacao=setInterval(update,duracaoUpdates);
    }
}

//Iniciar
desativarDetalhamento();
criarImpressora(1,6);
criarDado(2,6,50);
criarEsteira(3,5,"_N");
criarEsteira(3,4,"_N");
criarEsteira(3,3,"_L");
criarEsteira(4,3,"_L");
criarEsteira(5,3,"_L");
criarEsteira(6,3,"_S");
criarEsteira(6,4,"_S");
criarEsteira(6,5,"_S");
criarEsteira(6,6,"_O");
criarEsteira(5,6,"_S");
criarFuncionario(1,1,[
    ["mover","_L"],
    ["mover","_S"],
    ["mover","_SO"],
    ["mover","_S"],
    ["mover","_S"],
    ["pegar","_S"],
    ["mover","_L"],
    ["soltar","_L"],
    ["pegar","_SO"],
    ["pular",7]
]);
criarFuncionario(10,2,[
    ["mover","_S"],
    ["mover","_S"],
    ["mover","_S"],
    ["mover","_S"],
    ["mover","_S"],
    ["mover","_O"],
    ["mover","_O"],
    ["mover","_O"],
    ["mover","_O"],
    ["pegar","_O"],
    ["mover","_L"],
    ["mover","_L"],
    ["mover","_L"],
    ["mover","_L"],
    ["soltar","_L"],
    ["pular",5]
]);
criarFuncionario(2,9,[
    ["mover","_L"],
    ["mover","_L"],
    ["mover","_L"],
    ["mover","_NE"],
    ["pegar","_NO"],
    ["mover","_L"],
    ["mover","_L"],
    ["mover","_L"],
    ["mover","_L"],
    ["soltar","_NE"],
    ["mover","_O"],
    ["mover","_O"],
    ["mover","_O"],
    ["mover","_O"],
    ["pular",4]
]);
criarFuncionario(6,11);
criarTriturador(11,7);
ping();
exibirPaleta(paletaFuncionarios);