
// Function to remove an element from an array
function removeFromArray(arr, elt) {
	for (var i = arr.length - 1; i >= 0; i--) {
		if (arr[i] == elt) {
			arr.splice(i, 1);
		}
	}
}

// Heuristic function
function heuristic(a, b) {
	// Measuring the distance between the two points
	var d = dist(a.i, a.j, b.i, b.j);

	return d;
}

// Globals
var cols = 50;
var rows = 50;
var grid = new Array(cols);
var path = [];

// Create the lists
var openSet = [];
var closedSet = [];

// Start and end points
var start;
var end;

// Screen width and height
var w;
var h;

// Create the Spot object
function Spot(i, j) {
	this.i = i;
	this.j = j;
	this.f = 0;
	this.g = 0;
	this.h = 0;
	this.neighbors = [];
	this.previous = undefined;
	this.wall = false;

	// Randomly make certain spots walls
	if (random(1) < 0.3) {
		this.wall = true;
	}

	this.show = function(cols) {
		if (this.wall) {
			fill(0);
			noStroke();
			ellipse(this.i * w + w / 2, this.j * h + h / 2, w / 2, h / 2);
		}
	}

	this.addNeighbors = function(grid) {
		var i = this.i;
		var j = this.j;

		if (i < cols - 1) {
			this.neighbors.push(grid[i + 1][j]);
		}
		if (i > 0) {
			this.neighbors.push(grid[i - 1][j]);
		}
		if (j < rows - 1) {
			this.neighbors.push(grid[i][j + 1]);
		}
		if (j > 0) {
			this.neighbors.push(grid[i][j - 1]);
		}
		if (i > 0 && j > 0) {
			this.neighbors.push(grid[i - 1][j - 1]);
		}
		if (i < cols - 1 && j > 0) {
			this.neighbors.push(grid[i + 1][j - 1]);
		}
		if (i > 0 && j < rows - 1) {
			this.neighbors.push(grid[i - 1][j + 1]);
		}
		if (i < cols - 1 && j < rows - 1) {
			this.neighbors.push(grid[i + 1][j + 1]);
		}
	}
}

function setup() {
	createCanvas(600, 600);

	// Initialize the width and height
	w = width / cols;
	h = height / rows;

	// Making a 2D array
	for (var i = 0; i < cols; i++) {
		grid[i] = new Array(rows);
	}

	// Initialize each Spot in the grid array
	for (var i = 0; i < cols; i++) {
		for (var j = 0; j < rows; j++) {
			grid[i][j] = new Spot(i, j);
		}
	}

	// Add the neighbors
	for (var i = 0; i < cols; i++) {
		for (var j = 0; j < rows; j++) {
			grid[i][j].addNeighbors(grid);
		}
	}

	// Initialize start and end
	start = grid[0][0];
	end = grid[cols - 1][rows - 1];

	// Make sure start and end are never walls
	start.wall = false;
	end.wall = false;

	// We're starting with the openSet on the start variable
	openSet.push(start);

	console.log(grid);
}

function draw() {

	if (openSet.length > 0) {
		// Assume the first node in the grid is the "winner"
		var winner = 0;

		// Loop through the openSet and find which one is the real winner
		for (var i = 0; i < openSet.length; i++) {
			if (openSet[i].f < openSet[winner].f) {
				winner = i;
			}
		}

		// Get the current winner
		var current = openSet[winner];

		// Check if the current winner is also the end
		if (current === end) {
			noLoop();
			console.log("DONE!");
		}

		// Remove the current winner from the open set
		removeFromArray(openSet, current);

		// Push the current winner to the closed set
		closedSet.push(current);

		// Get the current winner's neighbors and check them
		var neighbors = current.neighbors;
		for (var i = 0; i < neighbors.length; i++) {
			var neighbor = neighbors[i];

			// Make sure neighbor isn't in the closed set or isn't a wall
			if (!closedSet.includes(neighbor) && !neighbor.wall) {
				var tempG = current.g + 1;

				// Assume we haven't found a better path
				var newPath = false;

				// If we've evalutated this node before, is this current path more efficient
				// than the last time?
				if (openSet.includes(neighbor)) {
					// If it's more efficient, update the g
					if (tempG < neighbor.g) {
						neighbor.g = tempG;
						newPath = true;
					}
				} else {
					// We haven't evaluated this node yet, so add it to the open set to be
					// evaluated
					neighbor.g = tempG;
					newPath = true;
					openSet.push(neighbor);
				}

				// Recalculate F if the newPath is better
				if (newPath) {
					// Calculate the f of this node
					neighbor.h = heuristic(neighbor, end);
					neighbor.f = neighbor.g + neighbor.h;

					// Set the previous node in the path
					neighbor.previous = current;
				}
			}
		}
	} else {
		// No solution
		console.log('No solution');
		noLoop();
		return;
	}

	background(255);

	// Show the grid
	for (var i = 0; i < cols; i++) {
		for (var j = 0; j < rows; j++) {
			grid[i][j].show(color(255));
		}
	}

	// Initialize the path
	path = [];
	var temp = current;
	path.push(temp);

	// While there is a previous node, put that node into the path
	while (temp.previous) {
		path.push(temp.previous);
		temp = temp.previous;
	}

	// Begin drawing out the path
	noFill();
	stroke(255, 0, 255);
	strokeWeight(w / 2);
	beginShape();

	// Draw the path line
	for (var i = 0; i < path.length; i++) {
		vertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
	}

	// End drawing out the path
	endShape();
}