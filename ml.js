
// MIT License

// Copyright (c) 2024 Gercodex (Gerardo G.R.)

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE. 

// @uthor: Gercodex © 

class norimg {
    constructor(nrzx,syix){	
    this.nrz=[];
    this.syi=[];
    this.setnrz(nrzx, this.nrz);
    this.setnrz(syix, this.syi);
    }	
    setnrz(nsx, sxx){
        sxx.length = nsx.length;
        var i = 0;
        for(i = 0; i < nsx.length; i++){
            sxx[i] = nsx[i];
        }
    }	
};

var arrnrmz = []; //espacio para los objetos normalizados. img norm y valor sy.
var canvas; //espacio de dibujo
var ctx;
var ancho; //ancho del dibujo; multiplo de la red
var alto; //alto del dibujo; multiplo de la red
var total; //total de la red de los multiplos
var imgg; //valores de conversión de la imagen a 0.0-1.0
var h = []; //composición de las capas por numero de nodos.
var a = []; //número de nodos totales.
var b = []; //número de bias totales.
var w = []; //número de pesos totales.
var idx = [0,0,0]; //(ai, wi, bi). Arreglo de índices.
var xi = [0,0,0,0]; //(na, np, in, wn).
var datos = []; //volcado de datos imagen 0.0-1.0.
var sy = []; //datos esperados de salida tamaño h[última capa].
var rk = []; //datos resultado de la función coste.
var dk = []; //datos resultado de la  derivada de la función coste.
var rl = 0.2; //valor de aprendizaje. ~0.255 maximo para 3570.
var as = []; //valor paralelo de a[].
var ws = []; //valor paralelo de w[].
var bs = []; //valor paralelo de b[].
var special = [0.885,0.359,0.264,0.081,0.884,0.332,0.657,0.133,0.074,0.709,0.314,0.241,0.548,0.608,0.987,0.715,0.452,0.4,0.206,0.751,0.283,0.515,0.863,0.861];

//var mulw = 0.0001; //0.01, 0.0001 Aproximado para 3570, en resultado preliminar.
//var mulb = 0.001;
var mulw = 0.1; //0.01, 0.0001 Aproximado para 3570, en resultado preliminar.
var mulb = 0.1;


var ciclos = 10000;
var rkft = 100;
var rkf = 0;
var crear = g_("crear");
var st = false;
var muletilla = true;


function vlienzo(){
    muletilla = true;
    rl = 0.01; //valor por defecto para la opcion de lienzo.
    ciclos = 10000; //muy lento. requiere mayor cantidad a menos que se refactorice el algoritmo para reducir las iteraciones.
    g_("rlv").value = rl;
    g_("c_opciones").style.display="none";    
    g_("l_dimensiones").style.display="block";    
}

function vdatos(){
    muletilla = false;
    rl = 0.2; //valor por defecto para datos.
    ciclos = 300; //para valores binarios funciona bien
    g_("rlv").value = rl;
    g_("c_opciones").style.display="none";
    g_("sopboxa").style.display = "block"; //agregar datos
    g_("d_datos").style.display = "block"; //areatexto en cont.b 
    g_("l_dibb").style.display = "block"; //boton muestras ok    
}

function actualizarl(){
    rl = parseFloat(g_("rlv").value);
    alert(rl);
}

function actualizarlp(){
    ciclos = parseInt(g_("lps").value);
    alert(ciclos);
}

crear.onclick = function(){ //crea el lienzo con el tamaño personalizado.

    ancho = g_("ancho").value;
    alto = g_("alto").value;
    nds = g_("n_s").value;
    
    if(ancho==null | ancho=="" | alto==null | alto=="" | nds==null | nds==""){
        alert("campo vacío");
        return;
    }

    st = true;    
    g_("l_dib").style.display = "block";  
    g_("l_dimensiones").style.display="none";
    g_("respuesta").style.display="block";
    g_("l_dibb").style.display="block";    
    // console.log(nds);
    c_radio_bs(nds,"respuesta");
    total = ancho*alto;


    if(canvas!=null){
        return;
    }

    canvas = document.createElement("canvas");
    canvas.width=ancho;
    canvas.height=alto;
    canvas.style.background="black";
    canvas.id="canvx"
    var cont = g_("dibujo");
    cont.appendChild(canvas);
    ctx = g_ctx(canvas);
    canvas.onmousedown=function(e){ // Dentro de la creacion; Mientras este presionado, contrario borra el evento anidado.
        //console.log(e);
        canvas.onmousemove=function(x){
            //console.log(x);
            dibujarl(x);
        }
    };

    canvas.onmouseup=function(){
        canvas.onmousemove=null;
        dibujarn();
    };

    canvas.onmouseleave=function(){
        canvas.onmousemove=null;
        dibujarn();
    };
    //---------------------------- insertar otros modulos si se requiere para otros datos.

    var dr = g_("respuesta");
    dr.children[0].checked="true";
    dr.style.display="inline-block";
    dr.onclick=function(ex){
        if(ex.target.value == null){		
            return;
        }
        var tmp = dr.getElementsByTagName("input").length;
        var k = 0;
        for(k = 0; k < tmp; k++){
            if(ex.target.value == k){
                sy[k] = 1; //cambiar a 1
            }else{
                sy[k] = 0;
            }
        }
    };

    return;

}

function dibujarn(){ //permite iniciar un nuevo trazo sin que se dibuje desde el anterior.
    ctx.beginPath();
}

function dibujarl(e){ //permite dibujar conforme el mouse se mueva.
    ctx.strokeStyle="white";
    ctx.lineWidth=Math.random()*4; //tiene finalidad de cambiar el grueso de línea con poco efecto en el trazo.
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
}

function borrard(){	//borra o limpia la zona de dibujo.
    ctx.clearRect(0,0,ancho,alto);
}

function estado(){ //Botón deshabilitado en esta version, ejecutar en consola.
    alert("canvas "+canvas);
    alert("ctx "+ctx);
    alert("alto "+alto);
    alert("ancho "+ancho);
    alert("total "+total);
    alert("imgg "+imgg);
    alert("h "+h);
    alert("idx "+idx);
    alert("a "+a);
    alert("b "+b);
    alert("w "+w);
    alert("datos "+datos);
    alert("sy "+sy);
    alert("xi "+xi);
    alert("as "+as);
    alert("ws "+ws);
    alert("bs "+bs);
    alert("rk "+rk);
    alert("dk "+dk);
}

function tmptx(descr, datto){
    g_("d_datos").value += descr + "\n\n" + datto + "\n\n";
}

function estadoTx(){ //Botón deshabilitado en esta versión, ejecutar en consola.   
    tmptx("canvas ",canvas);
    tmptx("ctx ", ctx);    
    tmptx("alto ",alto);
    tmptx("ancho ",ancho);
    tmptx("total ",total);
    tmptx("imgg ",imgg);
    tmptx("h ",h);
    tmptx("idx ",idx);
    tmptx("a ",a);
    tmptx("b ",b);
    tmptx("w ",w);
    tmptx("datos ",datos);
    tmptx("sy ",sy);
    tmptx("xi ",xi);
    tmptx("as ",as);
    tmptx("ws ",ws);
    tmptx("bs ",bs);
    tmptx("rk ",rk);
    tmptx("dk ",dk);
}

function clasificar(){
    alert("clas");
    var i = 0;
    for(i = 0; i < ws.length; i++){
        if(ws[i] != 0 && i < 10415){  //resolver problema de maximo <---
            console.log(i + " : "+ws[i]);
        }
    }
}

function c_radio_bs(can, caja){ //crea los radiobutton en orden de salida de la red respectivamente.
    var eldib = g_(caja);
    var i = 0;
    var ndib = null;
    var ndil = null;
    for(i = 0; i < can; i++){
        ndib = document.createElement("input");
        ndib.setAttribute("type","radio");
        ndib.setAttribute("value",""+i+"");
        ndib.setAttribute("name","r_y");               
        ndil = document.createElement("label");
        ndil.innerText = i;
        eldib.appendChild(ndib);
        eldib.appendChild(ndil);
    }                
}

function dcol(){ //El valor de tr textContent se considera preliminar ya que los datos se encuentran sobre td y no sobre tr.        
    var i = 0;
    var numt = g_("tabla").getElementsByTagName("tr").length;
    datos.length = numt;

    for(i = 0; i < numt; i++){
        datos[i] = parseFloat(g_("tabla").getElementsByTagName("tr")[i].textContent);
    }

    var numts = g_("tablas").getElementsByTagName("tr").length;
    var numtse = g_("tablase").getElementsByTagName("tr").length;
    sy.length = numtse;    

    for(i = 0; i < numtse; i++){
        sy[i] = parseFloat(g_("tablase").getElementsByTagName("tr")[i].textContent);
    }
    if(datos.length == 0 | sy.length == 0){
        alert("No se ha agregado una entrada o salida para la red.");
        return
    }
    g_("a_tdbtn").style.display="none";
    //alert(num+" "+numt+" "+numts+" "+numtse);		
    arrnrmz.push(new norimg(datos, sy));    
    total = numt;
    st = true;    
    var prtdts = "Entrada: "+ datos + " >< " + sy + " Salida: \n";        
    g_("d_datos").value += prtdts;
}

function edatos(){
    st = false;
    var i = 0;
    var numt = g_("tabla").getElementsByTagName("tr").length;
    datos.length = numt;
    for(i = 0; i < numt; i++){
        datos[i] = parseFloat(g_("tabla").getElementsByTagName("tr")[i].textContent);
    }
    testNN();
    //alert(a);
}

function aurl(){         
    if(sy.length == 0){
        alert("presione nodo 0 de nuevo");
        return;
    }
    var eldib = g_("coleccionimg");
    var ndib = document.createElement("img");
    ndib.style.background="black";
    ndib.style.border="0.3px solid #01ffff";	
    ndib.style.marginLeft="5px";

    if(nul(canvas)){
        return;
    }

    var urli = canvas.toDataURL("image/png", 1.0);
    ndib.src=urli;
    eldib.appendChild(ndib);
    promedioImg();	
    g_("respuesta").click(); //permite simular el evento y extraer el dato sy.
    arrnrmz.push(new norimg(datos, sy)); //por cada muestra agregada se ingresa un nuevo objeto al arreglo.	
    borrard();
}

function promedioImg(){ //calcula el promedio para solo valores entre 0.0-1.0 que alimenta la RN.	
    if(nul(canvas)){
        return;
    }

    imgg = ctx.getImageData(0,0,ancho,alto);	
    var i = 0;
    var j = 0;

    for(i = 0; i < imgg.data.length; i += 4){		
        datos[j] = ((imgg.data[i]/255)+(imgg.data[i+1]/255)+(imgg.data[i+2]/255))/3;
        j++;
    }
}

function addNN(){ //crea el input no variable de la capa uno y la etiqueta de salida.    
    g_("rlv").value = rl; //** -->> inicia el entrenamiento **--->>
    g_("lps").value = ciclos;
    
    if(!st){ //condiciones para el tipo seleccionado.
        console.log("activado");
        if(nul(canvas)){
            return;
        }

        if(sy==null | sy=="" | sy==undefined){
            alert("Seleccione una opción antes de continuar");
            return;
        }

        if(g_("capauno")!=null){
            alert("Ya existe una red iniciada");
            return;
        }        
        
    }else{        
        if(sy.length == 0){
            alert("No hay muestras agregadas");
            return;
        }
        g_("b_l_dib").style.display="none";
        g_("respuesta").style.display="none";
        g_("agregarnn").style.display="none";
        g_("dibujo").style.display="none";// visibility>>>hidden?
        g_("sopboxa").style.display="none";
    }

    // g_("calcular").style.visibility="visible";
    g_("nodos").style.display="block";
    var entradas = document.createElement("input");
    entradas.id="capauno";
    entradas.size="7";
    entradas.setAttribute("maxlength", "7");
    entradas.value=total;
    entradas.setAttribute("readonly","");
    entradas.setAttribute("type", "number");
    g_("nodos").appendChild(entradas);
    var etiquetaout = document.createElement("label");
    etiquetaout.id="etout";
    // etiquetaout.innerText="Salida";
    etiquetaout.style.color="yellow";
    g_("nodos").appendChild(etiquetaout);	

}

function addLayer(){ //Crea un input y lo agrega para introducir los nodos por capa de la Red.
    if(!st){
        if(canvas==null | g_("capauno")==null){
            alert("Lienzo o capa 1 no creados")
            return;
        }
    }

    var capa = document.createElement("input");
    capa.className="capasRed";
    capa.size="3";
    capa.setAttribute("maxlength", "3");
    capa.setAttribute("type", "number");
    g_("nodos").appendChild(capa);	
    var tmp = g_("nodos");
    var ot = g_("etout");
    var len = tmp.children.length;
    tmp.insertBefore(ot, tmp.children[tmp.len-1]); //extrae y reasigna posición de etiqueta.

}

function borrarCapa(){ //Borra la última capa.
    var capas = gc_("capasRed");

    if(!st){
        if(canvas==null | g_("capauno")==null | capas.length==0){
            alert("No hay capas que borrar");
            return;
        }	
    }

    capas[capas.length-1].remove();
}

function calcularArreglo(){ //suma todos los posibles nodos.	
    var nodoa = g_("capauno").value;
    var nodosn = gc_("capasRed");
    var res = 0;
    var temp = 0;

    if(nodosn.length<=1){
        alert("agregar por lo menos dos capas");
        return;
    }

    var i = 0;

    for(i = 0; i < nodosn.length; i++){
        temp = parseInt(nodosn[i].value);
        res = res + temp;
    }

    temp = parseInt(g_("capauno").value);
    res = res + temp; //suma de nodos.
    h.length = nodosn.length + 1;		

    for(i = 0; i < (nodosn.length + 1); i++){
        if(i == 0){
            h[i] = parseInt(nodoa);
        }else{			
            h[i] = parseInt(nodosn[i-1].value); //se resta 1 para que comience de 0 tomando en cuenta capauno.
        }		
    }

    info(h, idx);
    a.length = idx[0];
    as.length = idx[0];
    w.length = idx[1];
    ws.length = idx[1];
    b.length = idx[2];
    bs.length = idx[2];
    rk.length = parseInt(h[h.length-1]);
    dk.length = parseInt(h[h.length-1]);
    iniw(w);
    iniaclr(as);
    iniwclr(ws);
    iniaclr(a);
    iniaclr(bs);
    //iniwesp(special,w); //prueba con valores o pesos determinados.
    //iniwp(1, w);	
    //promedioImg();//<--------------***************reemplazar o eliminar de esta sección.
    //****** Esta es reemplazada por arrnrmz que cuenta con todas las entradas normalizadas.
    //el uso de arrnrmz se dará con otra función y en otra sección.
    inibrand(b, idx);

    if(!st){
    
    }else{
        inia(datos, a, h);		
    }
    //inia(datos, a, h);	
    //iniap(1, a, h);
    //inib(1, b, idx, false); //verdadero si los datos son pasados individialmente o falso un bias para todo.
    
}

function info(hx, idxx){ 
    for(i = 0; i < hx.length; i++){ //Calcula los valores para idx(ai, wi, bi)) total arrays.
        idxx[0] = idxx[0] + hx[i];
        if(!(i+1 >= hx.length)){
            idxx[1] = idxx[1] + hx[i] * hx[i+1];
            idxx[2] = idxx[2] + hx[i+1];
        }
    }
}

function iniw(wx){ //inicializa los pesos aleatoriamente.
    var i = 0;
    for(i = 0; i < wx.length; i++){
        wx[i] = Math.random() * mulw;
    }
}

function iniwesp(datosesp, wx){
    var i = 0;
    for(i = 0; i < wx.length; i++){
        wx[i] = datosesp[i];
    }
}

function iniwp(dato, wx){
    var i = 0;
    for(i = 0; i < wx.length; i++){
        wx[i] = dato;
    }
}

function iniwclr(wx){ //inicializa los pesos aleatoriamente.
    var i = 0;
    for(i = 0; i < wx.length; i++){
        wx[i] = 0;
    }
}

function inia(datosx, ax, hx){ //inicializa los nodos con los datos de entrada a capa uno.
    var i = 0;
    for(i = 0; i < hx[0]; i++){
        ax[i] = datosx[i];
    }
}

function iniap(dato, ax, hx){ //inicializa los nodos con los datos de entrada a capa uno.
    var i = 0;
    for(i = 0; i < hx[0]; i++){
        ax[i] = dato;
    }
}

function iniaclr(ax){ //inicializa los nodos con los datos de entrada a capa uno.
    var i = 0;
    for(i = 0; i < ax.length; i++){
        ax[i] = 0;
    }
}

function inib(datosbx, bx, idxx, tipo){ //inicializa el bias individual o valor unico.
    var i = 0;
    if(tipo==true){
        for(i = 0; i < idxx[2]; i++){
            bx[i] =  datosbx[i];
        }
    }else{
        for(i = 0; i < idxx[2]; i++){
            bx[i] =  datosbx;
        }
    }
}

function inibrand(bx, idxx){
    var i = 0;
    for(i=0; i < idxx[2]; i++){
        bx[i] = Math.random() * mulb;
    }
}

function redneuronal(){ //inicia la secuencia de la red neuronal.	
    nnc(h,a,w,b,xi,as,idx);
    kf(h,a,sy,rk,dk,as);
    bkpr(h, a, w, xi, as, ws);		
}

function iniciarn(){	
    calcularArreglo(); //****crea red neuronal*****
    g_("rlv").value = rl; //** -->> inicia el entrenamiento **--->>
    g_("lps").value = ciclos;
    var z = 0;	
    var zs = 0;

    for(z = 0; z < ciclos; z++){				
        for(zs = 0; zs < arrnrmz.length; zs++){ //pretende recorrer cada una de los datos normalizados linealmente.
            recorreridata(datos, sy, arrnrmz[zs]);
            inia(datos, a, h);
            redneuronal();
            xi = [0,0,0,0];
        }

        if(rkft > rkf){ //rkft 100 inicial, permite detener cuando el coste comienza a subir.
            rkft = rkf;			
        }else{			
            console.log("ciclos: "+z);
            //break;
        }		

        console.log("ite: "+z)
    }

    alert("m2ucp");    
    if(muletilla){ //muletilla muestra unos u otros elementos para datos o lienzo solo aqui.
        g_("primg").style.display="none";
        g_("b_l_dib").style.display="block";
        g_("dibujo").style.display="block";
        g_("testnc").style.display="inline-block";
        g_("nodos").style.display="none";
    }else{
        g_("nodos").style.display="none";
        g_("sopboxa").style.display="block";
        g_("a_dbtn").style.display="none";    
        g_("e_datos").style.display="block";
        g_("tablase").style.display="none";
    }
}

function nnc(hx, ax, wx, bx, xxi, axx, idxx){ //secuencia de calculos para la red.
    var sig;
    var j;
    var i;
    var temp = 0;
    var h0 = hx[0];
    var lx = idxx[0] - hx[hx.length-1];
    while(xxi[3] < wx.length){
    temp = 0;	
    for(j = xxi[1]; j < hx[xxi[2]+1]+xxi[1]; j++){
        temp = temp + bx[j];
        for(i = xxi[0]; i < hx[xxi[2]]+xxi[0]; i++){
            temp = temp + (ax[i]*wx[xxi[3]++]);			
        }
        if((j+h0) >= lx){ //si se ha llegado a la ultima fila se usa sigmo si no se usara relu.
            sig = sigmoide(temp);
            ax[j+h0] = sig;//pruebas(temp);//sig;
            axx[j+h0] = dsigmoide(sig);//dpruebas(pruebas(temp));//dsigmoide(sig);
        }else{
            sig = reLu(temp);
            ax[j+h0] = sig;
            axx[j+h0] = dreLu(sig);
        }
        temp = 0;
    }	
    xxi[2]++;
    xxi[0] = i;
    xxi[1] = j;
    }
}

function sigmoide(zx){ //calcula la sigmoide. (nodos de salida -> valores entre 0 y 1 según coincidencia)
    return 1/(1+(1/(Math.pow(Math.E,zx))));
}

function dsigmoide(sigm){ //derivada de sigmoide
    return	sigm*(1-sigm);
}

function tanh(zx){ //tangente (futuras versiones)
    return (2/(1+(1/(Math.pow(Math.E,zx))))) - 1;
}

function reLu(zx){ // relu (nodos de capas internas)
    return Math.max(0,zx);
}

function dreLu(zx){ //pseudo-derivada de relu
    if(zx > 0){
        return 1;
    }else if(zx < 0){
        return 0;
    }else if(zx == 0){
        return 0.1; //original.
    //	return 0.5; //experimental.
    }
}

function pruebas(zx){
    return	zx+1;
}

function dpruebas(zx){
    return	zx-1;
}

function kf(hx,ax,syx,rkx,dkx,asx){ //calcula coste individual y derivada.	
    var al = ax.length;
    var hl = hx.length-1;
    var tk = 0;
    var il = 0;
    rkf = 0;
    var hxv = hx[hl];
    var ast = 0;
    var hz = hx[0];
    for(il = al-hxv; il < al; il++){
        rkx[tk] = costea(syx[tk],ax[il]);		
        dkx[tk]	= dcostea(syx[tk],ax[il]);
        ast = asx[il];
        asx[il] = ast * dkx[tk];		
        bs[il-hz] = asx[il] * 1; //parte 1 de derivada de bias última capa.
        b[il-hz] = b[il-hz] - (rl * bs[il-hz]); //actualización de los primeros bias de la ultima capa.
        rkf = rkf + rkx[tk];
        tk++;
    }	
    rkf = (rkf/tk); //promedio coste total.
    console.log("coste total: " + rkf);
    // g_("atx").value += rkf + '\n';
}

//cuando la red está "aprendiendo" se observa que el resultado del coste tiende a 0.000->0 en decimales de lo contrario no está aprendiendo (aún si esto sucede no garantiza el aprendizaje en algunos casos)
//los valores de inicialización de los pesos y bias influye al ser aleatorios si aprende o no aún con los mismos valores de configuración. Se puede utilizar alguna función seno delimitada entre 0 y 1
//para inicializar los pesos y bias de modo que se pueda ajustar un resultado más predecible en cuanto al éxito del aprendizaje (no implementado en esta versión).

function costea(yx, aax){ //devuelve el coste individual con el valor absoluto no negativo.
    var tmpc = (yx-aax);//Math.abs(yx - aax);
    return Math.pow(tmpc, 2);
}

function dcostea(yx, aax){ //derivada de funcion de coste
    var tmpc = (yx - aax)*-1;
    return	2 * tmpc;
}
//función de backpropagation, utiliza dos redes similares, la original y otra con los valores de las derivadas para actualizar la original. No es eficiente.
//el valor del resultado de sus derivadas en la función de coste se colocan en los nodos correspondientes y solo se multiplican en sentido inverso
//los valores resultantes con los valores de la red, simulando el producto de las derivadas parciales por cada sección para obtener el valor del cambio
//necesario para el acomodo de los nuevos pesos en la red original y el aprendizaje.
function bkpr(hx, ax, wx, xxi, asx, wsx){
    var ttmp = 0; //multiplicador para los saltos en w.
    var ttmpx = 0;
    var temp = 0;
    var i = 0;
    var j = 0;		
    while(xxi[2] > -1){
    ttmp = 0; //multiplicador para los saltos en w.
    ttmpx = 0;
    temp = 0;
    i = 0;
    j = 0;		
    for(j = xxi[0]-1; j > (xxi[0]-1-hx[xxi[2]-1]); j--){		
        ttmp = 0;
        ttmpx++;
        for(i = xxi[0]-1+hx[xxi[2]]; i > xxi[0]-1; i--){						
            temp = temp + (asx[i] * wx[xxi[3]-ttmpx-(hx[xxi[2]-1]*ttmp)]); //ttmpx incrementa el numero de negativos de w para recorrer todos.
            wsx[xxi[3]-ttmpx-(hx[xxi[2]-1]*ttmp)] = asx[i] * ax[j]; //asigna derivada de pesos.
            wx[xxi[3]-ttmpx-(hx[xxi[2]-1]*ttmp)] = wx[xxi[3]-ttmpx-(hx[xxi[2]-1]*ttmp)] - (rl * wsx[xxi[3]-ttmpx-(hx[xxi[2]-1]*ttmp)]); //actualiza pesos.						
            ttmp++;				
        }
    asx[j] = temp * asx[j];
    if((j-hx[0]) >= 0){
        bs[j-hx[0]] = asx[j] * 1; //segunda parte del calculo de la derivadad del bias. LE nuevo bias tambien es por partes.
        b[j-hx[0]] = b[j-hx[0]] - (rl * bs[j-hx[0]]); //actualización del bias segunda parte.
    }
    temp = 0;		
    }
    xxi[3] = xxi[3] - (hx[xxi[2]] * hx[xxi[2]-1]);
    xxi[2]--;
    xxi[0] = ++j;
    }	
}

function recorreridata(imdat, sydat, armx){
    var i = 0;
    for(i = 0; i < imdat.length; i++){
        imdat[i] = armx.nrz[i];
    }
    for(i = 0; i < sydat.length; i++){
        sydat[i] = armx.syi[i];
    }
}

function testNN(){ //inicializa el lienzo, se ingresa en la entrada a y se calcula la red neuronal.
    var resultados = [];
    resultados.length = h[h.length-1];

    if(!st){
        //alert("binario");
    }else{
        promedioImg();
    }

    inia(datos, a, h);
    xi = [0,0,0,0];
    nnc(h,a,w,b,xi,as,idx);
    var zh = (idx[0])-(h[h.length-1]); 
    var yxx = 0;
    var i = 0;

    for(i = 0; i < h[h.length-1]-1; i++){
        resultados[i] = a[zh+i];
        if(a[zh+i] > a[zh+i+1]){
            if(a[zh+yxx] > a[zh+i+1]){ //y=y				
            }else{
                yxx = i+1;
            }			
        }else{
            if(a[zh+yxx] < a[zh+i+1]){
                yxx = i+1;
            }else{ //y=y				
            }
        }
    }

    resultados[i] = a[zh+i];
    //console.log(a);
    // alert(resultados);
    var rstr = "\nnodos de salida : 0.0% baja coincidencia - 0.9% alta coincidencia \n\n";
    var jk;
    for(jk = 0; jk < resultados.length; jk++){
        rstr += "" + jk + " : "+ resultados[jk] + "\n" ;
    }
    document.getElementById("atx").value=rstr;
    // document.getElementById("atx").value=resultados.toString().replaceAll(',','\n');
    
}

function acampo(t){
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.innerText="0";
    td.style.background="white";
    td.style.color="black";
    td.setAttribute("contenteditable","true");
    tr.appendChild(td);
    g_(t).appendChild(tr);
    var num = g_(t).getElementsByTagName("tr").length;
    //alert(g_(t).getElementsByTagName("tr")[0].textContent)
}

function borrarc(t){
    var tnum = g_(t).getElementsByTagName("tr").length;
    if(tnum == 0){
        return;
    }
    g_(t).getElementsByTagName("tr")[tnum-1].remove();
}

function g_(el){
    return document.getElementById(el);
}

function gc_(el){
    return document.getElementsByClassName(el);
}

function gt_(el){
    return document.getElementsByTagName(el);
}

function gn_(el){
    return document.getElementsByName(el);
}

function g_ctx(cvs){
    return cvs.getContext("2d");
}

function nul(el){
    if(el==null){
        alert("lienzo o datos no creados");
        return 1;
    }else{
        return 0;
    }
}


