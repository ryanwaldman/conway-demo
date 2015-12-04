var lifeArray;
var runningTimer;
var livingPercent;
var timestep;
var states = { PAUSED:0, RUNNING:1};
var state = states.PAUSED;
var gridWidth;
var gridHeight;
//canvas variables
var canvas;
var context;
var xres;
var yres;

function pageInit(){
	console.log("Init");
	canvas = document.getElementById('lifegrid');
	if (canvas.getContext){
		context = canvas.getContext('2d');
		canvas.addEventListener("click",updateCell, false);
	}
	updatePercentText();
	resetLife();
}
function runLife() {
	console.log("Running!");
	runningTimer = window.setInterval(stepLife,500);
	state=states.RUNNING;
	document.getElementById("width").disabled=true;
	document.getElementById("height").disabled=true;
	document.getElementById("play").disabled=true;
	document.getElementById("pause").disabled=false;
	document.getElementById("step").disabled=true;
}

function stepLife() {
	var newArray = createArray(lifeArray.length,lifeArray[0].length)
	for (i=0;i<newArray.length;i++){
		for (j=0;j<newArray[i].length;j++){
			if (document.getElementById("wrap").value="true"){
				neighbors = countNeighborsWrap(lifeArray,i,j)
			}
			else{
				neighbors = countNeighborsNoWrap(lifeArray,i,j)
			}
			if (neighbors<3 || neighbors>4){//too few or too many neighbors, so dead no matter the previous state
				newArray[i][j]=0
			}
			else if(neighbors==3){//dead and just spawned (3 neighbors exactly), or alive and still alive (2 neighbors is OK)
				newArray[i][j]=1;
			}
			else if(neighbors==4){//dead and still dead, or alive and still alive (3 neighbors is OK)
				newArray[i][j]=lifeArray[i][j];
			}
		}
	}
	lifeArray=newArray;
	timestep=timestep+1;
	drawLife();
	document.getElementById("timestep").value=timestep
}

function countNeighborsWrap(array,x,y){
	var neighborCount=0;
	var width = array.length;
	var height=array[0].length;
	neighborCount=neighborCount+array[mod((x-1),width)][mod((y-1),height)];
	neighborCount=neighborCount+array[mod((x-1),width)][y];
	neighborCount=neighborCount+array[mod((x-1),width)][mod((y+1),height)];
	neighborCount=neighborCount+array[x][mod((y-1),height)];
	neighborCount=neighborCount+array[x][y];
	neighborCount=neighborCount+array[x][mod((y+1),height)];
	neighborCount=neighborCount+array[mod((x+1),width)][mod((y-1),height)];
	neighborCount=neighborCount+array[mod((x+1),width)][y];
	neighborCount=neighborCount+array[mod((x+1),width)][mod((y+1),height)];
	return neighborCount;
}

function countNeighborsNoWrap(array,x,y){
	var neighborCount=0;
	var width = array.length;
	var height=array[0].length;
	if (x>0){
		if (y>0){
			neighborCount=neighborCount+array[(x-1)][(y-1)];
		}
		if (y<height-2){
			neighborCount=neighborCount+array[(x-1)][(y+1)];
		}
		neighborCount=neighborCount+array[(x-1)][y];
	}
	if (x<width-2){
		if (y>0){
			neighborCount=neighborCount+array[(x+1)][(y-1)];
		}
		if (y<height-2){
			neighborCount=neighborCount+array[(x+1)][(y+1)];
		}
		neighborCount=neighborCount+array[(x+1)][y];
	}
	if (y>0){
		neighborCount=neighborCount+array[x][(y-1)];
	}
	if (y<height-2){
		neighborCount=neighborCount+array[x][(y+1)];
	}
	neighborCount=neighborCount+array[x][y];
	return neighborCount;
}

function resetLife() {
	console.log("Resetting!");
	pauseLife();
	resetLifeArray();
	if (canvas.getContext){
		xres = ~~((canvas.width)/gridWidth)   //~~ truncates to int
		yres = ~~((canvas.height)/gridHeight) //5 extra pixels to deal with borders
	}
	drawLife();
}

function resetLifeArray(){
	gridWidth = parseInt(document.getElementById("width").value)
	gridHeight = parseInt(document.getElementById("height").value)
	console.log("Width: "+gridWidth+", height: "+gridHeight)
	lifeArray = createArray(gridWidth,gridHeight)
	console.log("Array width: "+lifeArray.length+", height: "+lifeArray[0].length)
	for (i=0;i<lifeArray.length;i++){
		for (j=0;j<lifeArray[i].length;j++){
			lifeArray[i][j] = (Math.random() < (livingPercent/100.0)) ? 1 : 0;
		}
		//console.log(lifeArray[i]);
	}
	timestep=0;
	document.getElementById("timestep").value=timestep
}

function drawLife(){
	drawLifeArray();
	if (canvas.getContext){
		drawLifeCanvas();
	}
}

function drawLifeArray(){
	var table = document.getElementById("lifeTable");
	var tableContents=""
	for (i=0;i<lifeArray.length;i++){
		tableContents = tableContents + "<tr>"
		for (j=0;j<lifeArray[i].length;j++){
			tableContents = tableContents +"<td>" + ((lifeArray[i][j]==1) ? "O" : "&nbsp;") + "</td>"
		}
		tableContents = tableContents + "</tr>"
	}
	table.innerHTML=tableContents
}

function drawLifeCanvas(){
		context.clearRect(0,0, canvas.width, canvas.height);
		context.fillStyle="#aaaaff";
		var width = lifeArray.length
		var height = lifeArray[0].length
		var rad = ~~(Math.min(xres,yres)/3)
		console.log("canvas width: "+canvas.width+"canvas height: "+canvas.height+", x resolution: "+xres+", y resolution: "+yres+", radius: "+rad)
		for (i=0;i<width;i++){
			for (j=0;j<height;j++){
				//draw the grid box
				context.strokeRect(i*xres+0.5,j*yres+0.5,xres,yres)
				if (lifeArray[i][j]==1){
					//draw the cell
					context.beginPath();
					context.arc((i+0.5)*xres,(j+0.5)*yres,rad,0,Math.PI*2);
					context.fill();
					context.stroke();
				}
			}
		}
}

function pauseLife() {
	clearInterval(runningTimer)
	state=states.PAUSED;
	document.getElementById("width").disabled=false;
	document.getElementById("height").disabled=false;
	document.getElementById("pause").disabled=true;
	document.getElementById("play").disabled=false;
	document.getElementById("step").disabled=false;
}

//user clicked on a grid square within the canvas - toggle between living and dead cell if paused
function updateCell(event){
	if(state==states.PAUSED){
		var rect = event.target.getBoundingClientRect();
		var xclick = event.clientX-rect.left;
		var yclick = event.clientY-rect.top;
		var gridX=~~(xclick/xres)
		var gridY=~~(yclick/yres)
		if (gridX<gridWidth && gridY<gridHeight){
			lifeArray[gridX][gridY] = 1-lifeArray[gridX][gridY];
			drawLife();
		}
		console.log("("+xclick+","+yclick+") translates to grid position ("+gridX+","+gridY+")")
	}
}

function updatePercentSlider(){
	livingPercent = parseInt(document.getElementById("livepercentslider").value);
	document.getElementById("livepercenttext").value=livingPercent;
}
function updatePercentText(){
	livingPercent = parseInt(document.getElementById("livepercenttext").value);
	document.getElementById("livepercentslider").value=livingPercent;
}

function createArray(width, height){
	var array = new Array(width)
	for (i=0; i < width; i++){
		array[i] = new Array(height)
	}
	return array
}

//modulo function that handles negative numbers
//taken from StackOverflow answer by user StuR at https://stackoverflow.com/questions/4467539/javascript-modulo-not-behaving
//accessed 12/02/2015
function mod(n,m){
	return ((n % m) + m) % m;
}