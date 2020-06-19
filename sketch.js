var grid = [];
var unit= 10;
var rows, columns;
var evolution = 0;

var predator = [];
var predator_count = 80;
var prey = [];
var prey_count = 128;
var human = [];
var human_count = 100;
var empty = [];

var slider_r;
var foodchain = 128;
var slider_g;
var procreation_r = 128;
var slider_b;
var mortality_r = 128;

function Grid(r, c) {
  this.r = 255;
  this.g = 255;
  this.b = 255;
  this.rindex = r;
  this.cindex = c;
  this.rpos = r * unit;
  this.cpos = c * unit;
  this.birth = 0;
  this.type = "";
  this.empty = true;
}

function setup() {
  var canvas = createCanvas(600, 400);
  canvas.parent("sandbox");
  canvas.mousePressed(activate);
  rows = height / unit;
  columns = width / unit;
  grid.length = rows;
  for (var i = 0; i < rows; i++){
    grid[i] = [];
    grid[i].length = columns;
    for (var j = 0; j < columns; j++){
      grid[i][j] = new Grid(i, j);
      empty.push(grid[i][j]);
    }
  }
  slider_r = createSlider(0, 100, 50, 1);
  slider_r.parent("slider_1");
  slider_g = createSlider(0, 100, 50, 1);
  slider_g.parent("slider_2");
  slider_b = createSlider(0, 100, 50, 1);
  slider_b.parent("slider_3");
}

function draw() {

  $("#hunting").click(function() {
    foodchain = floor(map(80, 0, 100, 0, 255));
    start();
  });
  $("#cooking").click(function() {
    foodchain = floor(map(100, 0, 100, 0, 255));
    mortality_r = floor(map(20, 0, 100, 255, 0));
    start();
  });
  $("#farming").click(function() {
    procreation_r = floor(map(80, 0, 100, 255, 0));
    mortality_r = floor(map(40, 0, 100, 255, 0));
    start();
  });

  slider_r.changed(function() {
    foodchain = floor(map(slider_r.value(), 0, 100, 0, 255));
    values();
  });
  slider_g.changed(function() {
    procreation_r = floor(map(slider_g.value(), 0, 100, 255, 0));
    values();
  });
  slider_b.changed(function() {
    mortality_r = floor(map(slider_b.value(), 0, 100, 255, 0));
    values();
  });

  $("#stop").click(function() {
    noLoop();
  });
  $("#run").click(function() {
    loop();
  });
  $("#refresh").click(function() {
    start();
  });

  if (evolution < predator_count) {
    birth("predator");
  }
  if (evolution < human_count) {
    birth("human");
  }
  if (evolution < prey_count) {
    birth("prey");
  }
  evolution++;
  for (var i = 0; i < grid.length; i++) {
    for (var j = 0; j < grid[i].length; j++) {
      var cell = grid[i][j];
      fill(cell.r, cell.g, cell.b);
      stroke(234, 234, 234);
      rect(cell.cpos, cell.rpos, unit, unit);
      if (cell.empty == false && (evolution - cell.birth) % (cell.g / 2) == 0 && empty.length > 0) {
        procreate(cell);
      }
      if (cell.empty == false && (evolution - cell.birth) % (cell.b) == 0) {
        die(cell);
      }
      if (empty.length == 0) {
        console.log("stopped!");
        noLoop();
      }
    }
  }
  var color_human = color(human[0].r, human[0].g, human[0].b);
  $("#human_sq").css("background-color", color_human);
  var color_predator = color(predator[0].r, predator[0].g, predator[0].b);
  $("#predator_sq").css("background-color", color_predator);
  var color_prey = color(prey[0].r, prey[0].g, prey[0].b);
  $("#prey_sq").css("background-color", color_prey);
  $("#generations").text(evolution);
}

function start() {
  noLoop();
  human = [];
  predator = [];
  prey = [];
  empty = [];
  evolution = 0;
  for (var i = 0; i < rows; i++){
    grid[i] = [];
    grid[i].length = columns;
    for (var j = 0; j < columns; j++){
      grid[i][j] = new Grid(i, j);
      empty.push(grid[i][j]);
    }
  }
  loop();
}

function values() {
  for (var i = 0; i < human.length; i++) {
    var cell = human[i];
    cell.r = foodchain;
    cell.g = procreation_r;
    cell.b = mortality_r;
  }
}

function activate() {
  var rindex = floor(mouseY / unit);
  var cindex = floor(mouseX / unit);
  var cell = grid[rindex][cindex];
  if (cell.empty == true) {
    cell.r = foodchain;
    cell.g = human[0].g;
    cell.b = human[0].b;
    cell.birth = evolution;
    cell.empty = false;
    human.push(cell);
  }
}

function birth(type) {
  var index = floor(random(empty.length));
  var cell = empty[index];
  if (type == "predator") {
    cell.r = 255;
    cell.g = 128;
    cell.b = 128;
    predator.push(cell);
  }
  else if (type == "human") {
    cell.r = foodchain;
    cell.g = procreation_r;
    cell.b = mortality_r;
    human.push(cell);
  }
  else {
    cell.r = 0;
    cell.g = 128;
    cell.b = 128;
    prey.push(cell);
  }
  cell.birth = evolution;
  cell.type = type;
  cell.empty = false;
  empty.splice(index, 1);
  if (cell.type != "prey")
    kill(cell);
}

function procreate(parent) {
  var index = floor(random(empty.length));
  var cell = empty[index];
  cell.r = parent.r;
  cell.g = parent.g;
  cell.b = parent.b;
  cell.birth = evolution;
  cell.type = parent.type;
  if (parent.type == "predator") {
    predator.push(cell);
  }
  else if (parent.type == "prey") {
    prey.push(cell);
  }
  else if (parent.type == "human") {
    human.push(cell);
  }
  cell.empty = false;
  empty.splice(index, 1);
  if (cell.type != "prey")
    kill(cell);
}

function die(cell) {
  cell.r = 255;
  cell.g = 255;
  cell.b = 255;
  if (cell.type == "predator") {
    for (var i = 0; i < predator.length; i++) {
      if (JSON.stringify(predator[i]) === JSON.stringify(cell)) {
        predator.splice(i, 1);
      }
    }
  }
  if (cell.type == "human") {
    for (var i = 0; i < human.length; i++) {
      if (JSON.stringify(human[i]) === JSON.stringify(cell)) {
        human.splice(i, 1);
      }
    }
  }
  else if (cell.type == "prey") {
    for (var i = 0; i < prey.length; i++) {
      if (JSON.stringify(prey[i]) === JSON.stringify(cell)) {
        prey.splice(i, 1);
      }
    }
  }
  cell.birth = 0;
  cell.type = "";
  cell.empty = true;
  empty.push(cell);
}

function kill(cell) {
  for (var i = -1; i <= 1; i++) {
    for (var j = -1; j <= 1; j++) {
      var r = cell.rindex + i;
      var c = cell.cindex + j;
      if (i == 0 && j == 0) {
        continue;
      }
      else if (r < 0 || r >= rows || c < 0 || c >= columns) {
        continue;
      }
      else if (grid[r][c].empty == false && grid[r][c].r <= cell.r) {
        var probability = cell.r - grid[r][c].r;
        probability = map(probability, 0, 255, 0, 100);
        var num = random(100);

        if (num < probability)
          die(grid[r][c]);
      }
    }
  }
}
