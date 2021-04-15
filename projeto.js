// variáveis globais
var cPoints = []
var evaluationPoints = []
var amount = -1
var count = 0
var movPointId = 0
var mPos
var globalEvaluationPoints

var newControlPoint = false
var removeControlPoint = false
var movingControlPoint = false
var foundMouse = false

var curves = document.getElementById("curves")
var polygons = document.getElementById("polygons")
var controlPoints = document.getElementById("controlPoints")

var canvas = document.getElementById("myCanvas")

// Funções

const getPoint = (point,t)=>{
    // console.log("getPoint")
    let pArray = []
    // let len = point.length
    // console.log(len)
    // console.log(point)

    for(var u = 0; u < point.length;u++){
        pArray.push([point[u][0],point[u][1]])
    }

    //algoritmo de De Casteljau
    for(var s = point.length-1; s>0 ; s--){
        for(u = 0; u<s; u++){
            pArray[u][0] = (pArray[u+1][0] * t) + (pArray[u][0] * (1-t))
            pArray[u][1] = (pArray[u+1][1] * t) + (pArray[u][1] * (1-t))
        }
    }

    return pArray[0]
}

// Funções para desenhar no canvas

const drawLine = (point1, point2, color, width)=>{
    console.log("drawLine")
    var myCanvas = document.getElementById("myCanvas")
    var myContext = myCanvas.getContext("2d")
    myContext.beginPath();
    myContext.moveTo(point1[0], point1[1]);
    myContext.lineTo(point2[0], point2[1]);
    myContext.lineWidth = width;
    myContext.strokeStyle = color;
    myContext.stroke();
}

const drawCicle = (x,y,r,color) => {
    console.log("drawCicle")
    var myCanvas = document.getElementById("myCanvas")
    var myContext = myCanvas.getContext("2d")
    myContext.beginPath();
    myContext.arc(x, y, r, 0, 2*Math.PI, false);
    myContext.strokeStyle = color;
    myContext.stroke();
    myContext.fillStyle = color;
    myContext.fill(); 
}

const draw = ()=>{
    // console.log("draw")
    var myCanvas = document.getElementById("myCanvas")
    var myContext = myCanvas.getContext("2d")
    
    // Limpar o canvas
    myContext.clearRect(0, 0, canvas.width, canvas.height)

    for(var i = 0; i < cPoints.length; i++){
        var color = 'pink' // pink

        if(i == amount){
            color = '#000000' // black
        }

        // exibir curvas
        if(curves.checked){
            
            var t = []
            var points = []

            for(var j = 0; j <= evaluationPoints[i]; j++){
                t.push(j/evaluationPoints[i])
            }

            for(var k = 0; k <  t.length; k++){
                var point = cPoints[i]
                points.push(getPoint(point, t[k]))
            }

            for(var l = 1; l < t.length; l++){
                if(i == amount){
                    var colorAux = 'red' // black
                }
                else{
                    var colorAux = 'pink'
                }
                drawLine(points[l-1], points[l], colorAux, 3)
            }
        }

        // exibir poligonos
        if(polygons.checked){
            
            for(var m = 1; m < cPoints[i].length; m++){
                drawLine(cPoints[i][m-1], cPoints[i][m], color, 2)
            }
        }

        // exibir pontos de controle

        if(controlPoints.checked){

            for(var m = 0; m < cPoints[i].length; m++){
                drawCicle(cPoints[i][m][0], cPoints[i][m][1], 6, color)
            }
        }
    }
}

curves.onclick = draw
polygons.onclick = draw
controlPoints.onclick = draw

// curvas
const newCurve = () =>{
    // console.log("newCurve")
    cPoints.push([[100,200],[300,100],[500,250]])
    // cPoints.push([[600,150],[650,110],[620,140]])
    if(amount>-1){
        evaluationPoints.push(globalEvaluationPoints)
    }
    else{
        evaluationPoints.push(5)
    }
    amount = count
    count +=1
    draw()
}

const deleteCurve = () =>{
    // console.log("deleteCurve")
    cPoints.splice(amount,1)
    evaluationPoints.splice(amount,1)
    if(count >= 0){
        count -= 1
        amount = count - 1
        evaluationPoints[amount] = globalEvaluationPoints;
    }
    
    draw()
}

const nextCurve = () => {
    // console.log("nextCurve")
    if(amount < count-1){
        amount += 1
    }
    draw()
}

const previousCurve = () => {
    // console.log("previousCurve")
    if(amount > 0){
        amount -= 1
    }
    draw()
}

// pontos
const newPoint = () => {
    // console.log("newPoint")
    newControlPoint = true
}
const removePoint = () => {
    // console.log("removePoint")
    removeControlPoint = true
}

// mouse

const dist = (x1,x2,y1,y2)=>{
    return Math.sqrt(Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2))
}

canvas.addEventListener('mousemove', event=>{
    mPos = move(canvas, event)
}, false)

const move = (c, event) => {
    // console.log("move")
    // mapeando a pos do mouse
    var rect = c.getBoundingClientRect()
    var posX = event.clientX - rect.left
    var posY = event.clientY - rect.top
    movingControlPoint = true
    
    // mover o ponto
    if(foundMouse){
        cPoints[amount][movPointId] = [posX,posY]
        draw()
    }

    return {
        x: posX,
        y: posY
    }
}

canvas.addEventListener('click', ()=>{
    mouseClick(mPos.x, mPos.y)
})

const mouseClick = (x,y) => {
    // console.log("mouseClick")
    if(newControlPoint){
        newControlPoint = false
        if(x <= canvas.width && y <= canvas.height){
            cPoints[amount].push([x,y])
            draw()
        }
    }
    else if(removeControlPoint){

        for(var i = 0; i <=cPoints[amount].length; i++){
            const distP = dist(cPoints[amount][i][0], x, cPoints[amount][i][1], y)
            // distp <= raio
            if( distP <= 10){
                removeControlPoint = false
                cPoints[amount].splice(i,1)
                draw()
            }
        }
    }
}

canvas.addEventListener('mouseup', ()=>{
    mouseRelease(mPos.x, mPos.y)
})

const mouseRelease = (x,y) => {
    // console.log("mouseRelease")
    if(!newControlPoint && !removeControlPoint){
        if(foundMouse && movingControlPoint){
            cPoints[amount][movPointId] = [x,y]
            // console.log(cPoints[amount][movPointId])
            draw()
        }
        foundMouse = false
        movPointId = -1
    }
}

canvas.addEventListener('mousedown', ()=>{
    mousePress(mPos.x, mPos.y)
})

const mousePress = (x,y) => {
    // console.log("mousePress")
    // console.log(cPoints[amount])
    // console.log(x,y)
    
    if(!newControlPoint && !removeControlPoint){
        for(var i = 0; i <= cPoints[amount].length && !(foundMouse); i++){
            // console.log(i)
            // console.log(cPoints[amount][i][0])
            const distP = dist(cPoints[amount][i][0], x, cPoints[amount][i][1], y)
            // console.log("distP ",distP)
            if(distP <= 10){
                cPoints[amount][i] = [x,y]
                movPointId = i
                foundMouse = true
                movingControlPoint = false
                draw()
            }
        }
    }
}

// input de solucao
const resolutionPoints = (value) =>{
    // console.log(value)
    if(value != null){
        globalEvaluationPoints = parseInt(value,10)
        evaluationPoints[amount] = parseInt(value,10)
        // console.log(value)
    }
    if(value == ''){
        evaluationPoints[amount] = 5
    }
    draw()
}
