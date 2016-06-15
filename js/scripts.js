var colorbank = ['#E90000','#F64F4F','#FF3434','#A50000','#AB0000','#E96900','#F69B4F','#FF9034','#A54B00','#AB4D00','#008C8C','#2F9494','#23A9A9','#006363','#006666','#00BA00','#3FC53F','#2CD42C','#008400','#008900'];
//vector object
function Vector(x, y) {
  this.x = x;
  this.y = y;
}

Vector.prototype.plus = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
};

///grid object
function Grid(width, height) {
  this.space = new Array(width * height);
  this.width = width;
  this.height = height;
}

Grid.prototype.isInside = function(vector) {
  return vector.x >= 0 && vector.x < this.width && vector.y >= 0 && vector.y < this.height;
};

Grid.prototype.get = function(vector) {
  return this.space[vector.x + this.width * vector.y];
};

Grid.prototype.set = function(vector, value) {
  this.space[vector.x + this.width * vector.y] = value;
};

Grid.prototype.forEach = function(f, context) {
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      var value = this.space[x + y * this.width];
      if (value != null)
        f.call(context, value, new Vector(x, y));
    }
  }
};



///legend contructors
var directionNames = "n ne e se s sw w nw".split(" ");


function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function Critter() {
  this.direction = randomElement(directionNames);
  this.color = randomColor = colorbank[Math.floor(Math.random() * colorbank.length)];
};

Critter.prototype.act = function(view) {
  if (view.look(this.direction) != " ") {
    this.direction = view.find(" ") || "s";
  }
  return {type: "move", direction: this.direction};
}

function Wall() {};

//// world object
/// !!! this is not a word object method but is closely related, hence the it's inclusion in this section

function elementFromChar(legend, ch) {
  if (ch == " ") {
    return null;
  }
  var element = new legend[ch]();
  element.originChar = ch;
  return element;
}


function charFromElement(element) {
  if (element === null) {
    return " ";
  } else {
    return "<span style='color:" + element.color + "'>" + element.originChar + "</span>";
  }
}

function World(map, legend) {

  var grid = new Grid(map[0].length, map.length);
  this.grid = grid;
  this.legend = legend;

  map.forEach(function(line, y) {
    for (var x = 0; x < line.length; x ++) {
      grid.set(new Vector(x, y), elementFromChar(legend, line[x]));
    }
  });
}

World.prototype.toString = function() {
  var output = "";
  for (var y = 0; y < this.grid.height; y++) {
    for (var x = 0; x < this.grid.width; x++) {
      var element = this.grid.get(new Vector(x, y));
      output += charFromElement(element);
    }
    output += "<br>";
  }
  return output;
};

World.prototype.turn = function() {
  var acted = [];
   this.grid.forEach(function(critter, vector) {
     if (critter.act && acted.indexOf(critter) == -1) {
       acted.push(critter);
       this.letAct(critter, vector);
     }
   }, this);
};


World.prototype.letAct = function(critter, vector) {
  var action = critter.act(new View(this, vector));
  if (action && action.type == "move") {
    var dest = this.checkDestination(action, vector);
    if (dest && this.grid.get(dest) == null) {
      this.grid.set(vector, null);
      this.grid.set(dest, critter);
    }
  }
};

World.prototype.checkDestination = function(action, vector) {
  if (directions.hasOwnProperty(action.direction)) {
    var dest = vector.plus(directions[action.direction]);
    if (this.grid.isInside(dest)) {
      return dest;
    }
  }
}


/// view object

function View(world, vector) {
  this.world = world;
  this.vector = vector;
}
View.prototype.look = function(dir) {
  var target = this.vector.plus(directions[dir]);
  if (this.world.grid.isInside(target)) {
    return charFromElement(this.world.grid.get(target));
  } else {
    return "#";
  }
};
View.prototype.findAll = function(ch) {
  var found = [];
  for (var dir in directions) {
    if (this.look(dir) == ch) {
      found.push(dir);
    }
  }
  return found;
};
View.prototype.find = function(ch) {
  var found = this.findAll(ch);
  if (found.length == 0) return null;
  return randomElement(found);
}



/////////////////

var directions = {
  "n":  new Vector( 0, -1),
  "ne": new Vector( 1, -1),
  "e":  new Vector( 1,  0),
  "se": new Vector( 1,  1),
  "s":  new Vector( 0,  1),
  "sw": new Vector(-1,  1),
  "w":  new Vector(-1,  0),
  "nw": new Vector(-1, -1)
};


/////// console calls
var plan = ["#########################################################",
            "#                          o                    o      ##",
            "#                        # o                    o      ##",
            "#    #         #           o        #           o      ##",
            "#                      #   o         #           o      ##",
            "#     #              #     o         #            o     #",
            "#             # # # #  #   o         #       #####      #",
            "#            #             o   #     #   # o #    ##    #",
            "#  #         #            #o   ##           ##     #    #",
            "#             #            o              ###      #    #",
            "#       #      # #         o       ####                 #",
            "#                #                                      #",
            "#     #        #  # #            o  #         o         #",
            "#                                 #                     #",
            "#########################################################"];

var world = new World(plan, {"#": Wall, "o": Critter });

// var runIt = function() {
//   world.turn();
//   var printThis = world.toString();
//   document.getElementById('world').innerHTML = printThis;
// }
// for (var i = 0; i < 15; i++ ) {
//   setTimeout(1000);
//   runIt();
// }



var j = 0;
function printSequence() {
  setTimeout(function() {
    if (true) {
    world.turn();
    var printThis = world.toString();
    document.getElementById('world').innerHTML = printThis;
    printSequence();
    j++;
  } else {
    console.log("finished");
  }
}, 34);
}

printSequence();
