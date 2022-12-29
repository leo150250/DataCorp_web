//Constantes
const cena=document.getElementById("cena");
const detalhamento=document.getElementById("detalhamento");
const setaDetalhamento=document.getElementById("setaDetalhamento");

const botaoExecutar=document.getElementById("botaoExecutar");
const inputFrequenciaExecucao=document.getElementById("inputFrequenciaExecucao");

//Variáveis globais
var objetos=[];
var objetoDetalhado=null;
var emExecucao=false;
var emPausa=false;
var execucaoSimulacao=null;
var duracaoUpdates=500;
var qtdUpdates=0;
var tempoDecorrido=0.0;

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
        let novoArrayObjetos=[];
        objetos.forEach(objeto=>{
            if (objeto!=this) {
                novoArrayObjetos.push(objeto);
            }
        });
        objetos=novoArrayObjetos;
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
        cena.appendChild(this.elementoValor);
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
                switch (acaoAgora[0]) {
                    case "mover": {
                        let alvoX=0;
                        let alvoY=0;
                        switch (acaoAgora[1]) {
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
                            switch (acaoAgora[1]) {
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
                            switch (acaoAgora[1]) {
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
                        this.acaoCounter=acaoAgora[1]-1;
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
        }
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

//Criação de objetos
function criarObjeto(argObjeto,argPosX,argPosY) {
    let novoObjeto=new argObjeto(argPosX,argPosY);
    objetos.push(novoObjeto);
    return novoObjeto;
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
function criarFuncionario(argPosX,argPosY) {
    let novoFuncionario=criarObjeto(Funcionario,argPosX,argPosY);
    novoFuncionario.draw();
    return novoFuncionario;
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
function detalharObjeto(argObjeto) {
    if (objetoDetalhado!=null) {
        objetoDetalhado.elemento.classList.remove("selecionado");
    }
    objetoDetalhado=argObjeto;
    objetoDetalhado.elemento.classList.add("selecionado");
    console.log(objetoDetalhado);
    detalhamento.innerHTML="";
    detalhamento.onscroll=null;
    detalhamento.style.display="block";
    setaDetalhamento.style.display="block";
    if (objetoDetalhado.tipoClicavel=="programa") {
        objetoDetalhado.acoes.forEach((acao,counter)=>{
            detalhamento.appendChild(criarCardProgramacao(acao,counter));
        });
        atualizarProgramCounter(objetoDetalhado.acaoCounter);
        detalhamento.onscroll=()=>{
            atualizarSetaProgramCounter(objetoDetalhado.acaoCounter);
        }
    }
}
function desativarDetalhamento() {
    if (objetoDetalhado!=null) {
        objetoDetalhado.elemento.classList.remove("selecionado");
    }
    detalhamento.style.display="none";
    setaDetalhamento.style.display="none";
    cena.onclick=null;
}
function criarCardProgramacao(argAcao,argCounter) {
    let novoCard=document.createElement("div");
    novoCard.classList.add("card");
    let pCounter=document.createElement("p");
    pCounter.classList.add("counter");
    pCounter.innerHTML=argCounter;
    novoCard.appendChild(pCounter);
    switch (argAcao[0]) {
        case "mover": {
            let pComando=document.createElement("p");
            pComando.innerHTML="Mover";
            let divDirecao=criarInputDirecao(argAcao[1]);
            novoCard.appendChild(pComando);
            novoCard.appendChild(divDirecao);
            novoCard.classList.add("mover");
        } break;
        case "pegar": {
            let pComando=document.createElement("p");
            pComando.innerHTML="Pegar de";
            let divDirecao=criarInputDirecao(argAcao[1]);
            novoCard.appendChild(pComando);
            novoCard.appendChild(divDirecao);
            novoCard.classList.add("pegar");
        } break;
        case "soltar": {
            let pComando=document.createElement("p");
            pComando.innerHTML="Soltar em";
            let divDirecao=criarInputDirecao(argAcao[1]);
            novoCard.appendChild(pComando);
            novoCard.appendChild(divDirecao);
            novoCard.classList.add("pegar");
        } break;
        case "pular": {
            let pComando=document.createElement("p");
            pComando.innerHTML="Pular para "+argAcao[1];
            novoCard.appendChild(pComando);
            novoCard.classList.add("ordem");
        } break;
    }
    return novoCard;
}
function criarInputDirecao(argDirecaoSelecionada=null) {
    let novoInputDirecao=document.createElement("div");
    novoInputDirecao.classList.add("inputDirecao");
    for (let i=0; i<9; i++) {
        let novaDirecao=document.createElement("div");
        switch (i) {
            case 0: if (argDirecaoSelecionada=="_NO") {novaDirecao.classList.add("selecionado");} break;
            case 1: if (argDirecaoSelecionada=="_N") {novaDirecao.classList.add("selecionado");} break;
            case 2: if (argDirecaoSelecionada=="_NE") {novaDirecao.classList.add("selecionado");} break;
            case 3: if (argDirecaoSelecionada=="_O") {novaDirecao.classList.add("selecionado");} break;
            case 4: if (argDirecaoSelecionada=="") {novaDirecao.classList.add("selecionado");} break;
            case 5: if (argDirecaoSelecionada=="_L") {novaDirecao.classList.add("selecionado");} break;
            case 6: if (argDirecaoSelecionada=="_SO") {novaDirecao.classList.add("selecionado");} break;
            case 7: if (argDirecaoSelecionada=="_S") {novaDirecao.classList.add("selecionado");} break;
            case 8: if (argDirecaoSelecionada=="_SE") {novaDirecao.classList.add("selecionado");} break;
        }
        novoInputDirecao.appendChild(novaDirecao);
    }
    return novoInputDirecao;
}
function atualizarProgramCounter(argContador) {
    detalhamento.children[argContador].scrollIntoView({behavior:"smooth",block:"center",inline:"center"});
    atualizarSetaProgramCounter(argContador);
}
function atualizarSetaProgramCounter(argContador) {
    setaDetalhamento.style.top=detalhamento.children[argContador].offsetTop+20-detalhamento.scrollTop;
    setaDetalhamento.style.left=detalhamento.offsetLeft-20;
}
cena.addEventListener("click",(e)=>{
    if (e.target==cena) {
        desativarDetalhamento();
    }
});

//Game logic
function ping() {
    //console.log("Ping!");
    objetos.forEach(objeto => {
        objeto.ping();
    });
}
function update() {
    qtdUpdates++;
    tempoDecorrido+=0.5;
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
    botaoExecutar.src="imagens/controle_pausar.svg";
}
function pararSimulacao() {
    emExecucao=false;
    emPausa=false;
    clearInterval(execucaoSimulacao);
    botaoExecutar.src="imagens/controle_executar.svg";
    qtdUpdates=0;
    tempoDecorrido=0.0;
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
var tempFuncionario=criarFuncionario(1,1);
tempFuncionario.acoes=[
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
];
var tempFuncionario=criarFuncionario(10,2);
tempFuncionario.acoes=[
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
];
var tempFuncionario=criarFuncionario(2,9);
tempFuncionario.acoes=[
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
];
criarTriturador(11,7);
ping();