Direction = {
	LEFT: "left",
	RIGHT: "right",
	UP: "up",
	DOWN: "dow"
};

Algorithm = {
	BFS: "BFS",
	AMisplaced: "A*: Misplaced tiles",
	AManhattan: "A*: Manhattan distance"
};

function Puzzle(dimension, solve_func) {
	this.board = [];
	this.path = [];
	this.dimension = dimension;
	this.solve_func = solve_func;
	this.lastMove = null;
	for (var i = 0; i < dimension; i++) {
		this.board.push([]);
		for (var j = 0; j < dimension; j++) {
			if (i == this.dimension - 1 && j == this.dimension - 1) {
				this.board[i].push(0);
			} else {
				this.board[i].push(dimension * i + j + 1);
			}
		}
	}
};

// Get the (x, y) position of the blank space
Puzzle.prototype.getBlankSpacePosition = function() {
	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			if (this.board[i][j] == 0) {
				return [i, j];
			}
		}
	}
};

// Swap two items on a bidimensional array
Puzzle.prototype.swap = function(i1, j1, i2, j2) {
	var temp = this.board[i1][j1];
	this.board[i1][j1] = this.board[i2][j2];
	this.board[i2][j2] = temp;
}

// Return the direction that a piece can be moved, if any
Puzzle.prototype.getMove = function(piece) {
	var blankSpacePosition = this.getBlankSpacePosition();
	var line = blankSpacePosition[0];
	var column = blankSpacePosition[1];
	if (line > 0 && piece == this.board[line-1][column]) {
		return Direction.DOWN;
	} else if (line < this.dimension - 1 && piece == this.board[line+1][column]) {
		return Direction.UP;
	} else if (column > 0 && piece == this.board[line][column-1]) {
		return Direction.RIGHT;
	} else if (column < this.dimension - 1 && piece == this.board[line][column+1]) {
		return Direction.LEFT;
	}
};

// Move a piece, if possible, and return the direction that it was moved
Puzzle.prototype.move = function(piece) {
	var move = this.getMove(piece);
	if (move != null) {
		var blankSpacePosition = this.getBlankSpacePosition();
		var line = blankSpacePosition[0];
		var column = blankSpacePosition[1];
		switch (move) {
		case Direction.LEFT:
			this.swap(line, column, line, column + 1);
			break;
		case Direction.RIGHT:
			this.swap(line, column, line, column - 1);
			break;
		case Direction.UP:
			this.swap(line, column, line + 1, column);
			break;
		case Direction.DOWN:
			this.swap(line, column, line - 1, column);
			break;
		}
		if (move != null) {
			this.lastMove = piece;
		}
		return move;
	}
};

Puzzle.prototype.isGoalState = function() {
	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			var piece = this.board[i][j];
			if (piece != 0) {
				var originalLine = Math.floor((piece - 1) / this.dimension);
				var originalColumn = (piece - 1) % this.dimension;
				if (i != originalLine || j != originalColumn) return false;
			}
		}
	}
	return true;
};

// Return a copy of current puzzle
Puzzle.prototype.getCopy = function() {
	var newPuzzle = new Puzzle(this.dimension);
	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			newPuzzle.board[i][j] = this.board[i][j];
		}
	}
	for (var i = 0; i < this.path.length; i++) {
		newPuzzle.path.push(this.path[i]);
	}
	return newPuzzle;
};

// Return all current allowed moves
Puzzle.prototype.getAllowedMoves = function() {
	var allowedMoves = [];
	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			var piece = this.board[i][j];
			if (this.getMove(piece) != null) {
				allowedMoves.push(piece);
			}
		}
	}
	return allowedMoves;
};

Puzzle.prototype.visit = function() {
	var children = [];
	var allowedMoves = this.getAllowedMoves();
	for (var i = 0; i < allowedMoves.length; i++)  {
		var move = allowedMoves[i];
		if (move != this.lastMove) {
			var newInstance = this.getCopy();
			newInstance.move(move);
			newInstance.path.push(move);
			children.push(newInstance);
		}
	}
	return children;
};

Puzzle.prototype.solveBFS = function() {
	var startingState = this.getCopy();
	startingState.path = [];
	var states = [startingState];
	while (states.length > 0) {
		var state = states[0];
		states.shift();
		if (state.isGoalState()) {
			return state.path;
		}
		states = states.concat(state.visit());
	}
};

Puzzle.prototype.g = function() {
	return this.path.length;
};

Puzzle.prototype.getManhattanDistance = function() {
	var distance = 0;
	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			var piece = this.board[i][j];
			if (piece != 0) {
				var originalLine = Math.floor((piece - 1) / this.dimension);
				var originalColumn = (piece - 1) % this.dimension;
				distance += Math.abs(i - originalLine) + Math.abs(j - originalColumn);
			}
		}
	}
	return distance;
};

Puzzle.prototype.countMisplaced = function() {
	var count = 0;
	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			var piece = this.board[i][j];
			if (piece != 0) {
				var originalLine = Math.floor((piece - 1) / this.dimension);
				var originalColumn = (piece - 1) % this.dimension;
				if (i != originalLine || j != originalColumn) count++;
			}
		}
	}	
	return count;
}

Puzzle.prototype.h = function() {
	if (this.solve_func == Algorithm.AMisplaced) {
		return this.countMisplaced();
	} else {
		return this.getManhattanDistance();
	}
};

Puzzle.prototype.solveA = function() {
	var states = new MinHeap(null, function(a, b) {
		return a.distance - b.distance;
	});
	this.path = [];
	states.push({puzzle: this, distance: 0});
	while (states.size() > 0) {
		var state = states.pop().puzzle;
		if (state.isGoalState()) {
			return state.path;
		}
		var children = state.visit();
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			var f = child.g() + child.h();
			states.push({puzzle : child, distance: f});
		}
	}
};

Puzzle.prototype.solve = function() {
	if (this.solve_func == Algorithm.BFS) {
		return this.solveBFS();
	} else {
		return this.solveA();
	}
};
