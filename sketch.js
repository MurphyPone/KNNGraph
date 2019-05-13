//config variables
let scale = 10;

//Globals
let dataset = { "red":[ [8, -8],
                        [8, -10],
                        [4, -10]],
              "green":[ [-6, 6],
                        [-4, 6],
                        [-6, 2]],
              "blue": [ [5, 5],
                        [5, 10],
                        [5, 15]]
              }
let np = [15, 10]; //is np red or green?
let runGradient = true; //only want to run it once //TODO refactor
let gradientResult; // stores the color values for all the gradient boxes
let label;

function setup() {
  let size = 40;
  createCanvas(scale * size, scale * size);
  background(255);
  frameRate(30);
  gradientResult = prepareGradient();
  label = createP(knn(dataset, np, 3)["result"])
}

function draw() {
  background(255)
  translate(width/2, height/2);
  np = [(mouseX - width/2)/scale, (mouseY- height/2)/scale];
  let current = knn(dataset, np, 3);
  showKNN(current["k-nearest"]);
  showGradient();
  showGrid();
  showPoints(dataset);
  label.elt.innerText = np + ", " + current["result"];
  label.style('color', current["result"])
}

function showPoint(p) {
  strokeWeight(3);
  strokeWeight(scale)
  var x1 = p[0] * scale;
  var y1 = p[1] * scale;
  point(x1, y1);
}

function showPoints(points) {
  for(var f in points) {
    stroke(f);
    for(var p of points[f]) {
      showPoint(p);
    }
  }
}

function showGrid() {
  //Draw grid
  stroke(0, 0, 0, 100);
  strokeWeight(1);
  for(var i = -width/2; i < width; i+=scale) {
    line(-width/2, i, width/2, i); //horizontal
    line(i, -height/2, i, height/2); //vertical
  }

  stroke(0);
  strokeWeight(2);
  line(-width, 0, width, 0 )
  line(0, -height, 0, height )
}

function showKNN(nearest) {
  for(p in nearest) {
    stroke(nearest[p][1]);
    strokeWeight(3);
    let x = nearest[p][2][0];
    let y = nearest[p][2][1];
    line((mouseX - width/2), (mouseY- height/2), x*scale, y*scale);
    showPoint(np)
  }
}

function prepareGradient() {
  let results = [];
  for(var i = -width/2; i < width/2; i+=scale) {
    for(var j = -width/2; j < height/2; j+=scale) {
      let result = [knn(dataset, [i, j], 3), [i, j]];
      console.log(result)
      results.push(result);
    }
  }
  return results;
}

function showGradient() {
  for(var i = 0; i < gradientResult.length; i++) {
    var clr = color(gradientResult[i][0]["result"]);
    var x = gradientResult[i][1][0];
    var y = gradientResult[i][1][1];
    clr.setAlpha(2);
    strokeWeight(scale)
    stroke(clr);
    fill(clr);
    rect(x, y, x + scale, y + scale );
  }
}







// ALGO stuff
function knn(data, predict, k) {
  if(Object.keys(data).length > k) {
    alert("stupid k value");
  }

  //optimizing this algorithm to use a radius constraint on the distance calculations is left as an exercize for the reader >:)

  //calculate the distance from the predict point to every other point
  let distances = [];
  for(var p in data) {
    for(var f of data[p]){
      //calculate the euclidean distance
      x1 = f[0];
      x2 = predict[0];
      y1 = f[1]
      y2 = predict[1];
      e_dist = dist(x1, y1, x2, y2); //p5.js dist() only works for 2D vectors, which is fine for our simple graph, but inadequate for n-dimensional data; n > 2
      distances.push([e_dist, p, f]) //push the distances and it's group (points)
    }
  }

  let sorted = distances.sort(Comparator); //sort by distance, hopefully?
  sorted.splice(k); //we only care about the top k distances
  //console.log(sorted)
  let votes = [];
  //this is fucky
  for(var i = 0; i < sorted.length; i++) {
    votes[i] = sorted[i][1];
  }

  let results = {
      "result": getMode(votes),
      "k-nearest": sorted,
  }
  return results;
}

// implement a nice little comparator to sort our twople of distance, feature
function Comparator(a, b) {
  if (a[0] < b[0]) return -1;
  if (a[0] > b[0]) return 1;
  return 0;
}

// Mode code from StackOverflow
function getMode(array) {
    if(array.length == 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for(var i = 0; i < array.length; i++) {
        var el = array[i];
        if(modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;
        if(modeMap[el] > maxCount) {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    if(maxCount == 1) {
      return array[0];
    }
    return maxEl;
}
