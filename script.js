const $ = (id) => document.getElementById(id);
const create = (type) => document.createElement(type);
const int = (str) => parseInt(str);
const letter = (str) => String.fromCharCode(65 + int(str));
const addClass = (element, className) => element.classList.add(className);
const hasPiece = (square) => square.getElementsByTagName('PIECE').length > 0;

const letterOp = (x, op) => String.fromCharCode(x.charCodeAt(0) + op); // letterOp("A", 1) // B

const createPiece = (piece, type, color) => {
    // createPiece("A1", "pawn", "white")
    let square = $(piece);
    let obj = create("piece");
    addClass(obj, type);
    addClass(obj, color);

    obj.id = type + "_" + color + "_" + piece;
     
    console.log("Placing " + type + " at " + piece);

    square.appendChild(obj);

    return obj;
}

const populateBoard = () => {
    // makes columns a-h with items 1-8
    let board = $("board");
    
    for (let i = 0; i < 8; i++) {
        let column = create("div");
        addClass(column, "column");
        column.id = letter(i);
        board.appendChild(column);
        
        for (let j = 0; j < 8; j++) {
            let square = create("div");
            addClass(square, "square");
            // from 8 to 1
            square.id = letter(i) + (8 - j);
            // alternate btween dark and light
            if (i % 2 != 0) {
                if (j % 2 == 0) {
                    addClass(square, "dark");
                }
            } else {
                if (j % 2 != 0) {
                    addClass(square, "dark");
                }
            }

            column.appendChild(square);
        }
    }
}

const setPieces = () => {
    // white pawns on on every square in the second row and black in the seventh
    for (let i = 0; i < 16; i++) {
        let piece = createPiece(
            letter(i % 8) + (i < 8 ? 2 : 7),
            "pawn", 
            i < 8 ? "white" : "black"
        );
    }

    // white rooks on A1 and H1, black on A8 and H8
    for (let i = 0; i < 4; i++) {
        let piece = createPiece(
            (i < 2 ? "A" : "H") + (i % 2 == 0 ? 1 : 8),
            "rook",
            i % 2 == 0 ? "white" : "black"
            
        );
    }

    // white knights on B1 and G1, black on B8 and G8
    for (let i = 0; i < 4; i++) {
        let piece = createPiece(
            (i < 2 ? "B" : "G") + (i % 2 == 0 ? 1 : 8),
            "knight",
            i % 2 == 0 ? "white" : "black"
        );
    }

    // white bishops on C1 and F1, black on C8 and F8
    for (let i = 0; i < 4; i++) {
        let piece = createPiece(
            (i < 2 ? "C" : "F") + (i % 2 == 0 ? 1 : 8),
            "bishop",
            i % 2 == 0 ? "white" : "black"
        );
    }

    // white queen on D1, black on D8
    for (let i = 0; i < 2; i++) {
        let piece = createPiece(
            "D" + (i % 2 == 0 ? 1 : 8),
            "queen",
            i % 2 == 0 ? "white" : "black"
        );
    }

    // white king on E1, black on E8
    for (let i = 0; i < 2; i++) {
        let piece = createPiece(
            "E" + (i % 2 == 0 ? 1 : 8),
            "king",
            i % 2 == 0 ? "white" : "black"
        );
    }
}

// Utility function to highlight a square
const highlight = (square) => {
    let highlight = create("div");
    addClass(highlight, "available");
    square.appendChild(highlight);
}

// Utility function to highlight a possible capture
const highlightCapture = (square) => {
    let highlight = create("div");
    addClass(highlight, "capture");
    square.appendChild(highlight);
}

// object to store every piece, their position, their color, and if they've moved out of their starting position
const getPieceData = () => {
// Generate this object dynamically
    let types = ["pawn", "rook", "knight", "bishop", "queen", "king"];
    let colors = ["white", "black"];
    let obj = {};

    for (let i = 0; i < colors.length; i++) {
        obj[colors[i]] = {};
        for (let j = 0; j < types.length; j++) {
            obj[colors[i]][types[j]] = {};
        }

        // Add pawns
        for (let j = 0; j < 8; j++) {
            obj[colors[i]]["pawn"][letter(j) + (i == 0 ? 2 : 7)] = {
                pos: letter(j) + (i == 0 ? 2 : 7),  // will be the same on start
                moved: false,
                taken: false
            };
        }

        // Add rooks
        for (let j = 0; j < 2; j++) {
            obj[colors[i]]["rook"][(j == 0 ? "A" : "H") + (i == 0 ? 1 : 8)] = {
                pos: (j == 0 ? "A" : "H") + (i == 0 ? 1 : 8),
                moved: false,
                taken: false,
                special: false // If they were spawned in by a pawn reaching the end of the board
            };
        }

        // Add knights
        for (let j = 0; j < 2; j++) {
            obj[colors[i]]["knight"][(j == 0 ? "B" : "G") + (i == 0 ? 1 : 8)] = {
                pos: (j == 0 ? "B" : "G") + (i == 0 ? 1 : 8),
                moved: false,
                taken: false,
                special: false
            };
        }

        // Add bishops
        for (let j = 0; j < 2; j++) {
            obj[colors[i]]["bishop"][(j == 0 ? "C" : "F") + (i == 0 ? 1 : 8)] = {
                pos: (j == 0 ? "C" : "F") + (i == 0 ? 1 : 8),
                moved: false,
                taken: false,
                special: false
            };
        }

        // Add queens
        obj[colors[i]]["queen"]["D" + (i == 0 ? 1 : 8)] = {
            pos: "D" + (i == 0 ? 1 : 8),
            moved: false,
            taken: false,
            special: false
        };

        // Add kings
        obj[colors[i]]["king"]["E" + (i == 0 ? 1 : 8)] = {
            pos: "E" + (i == 0 ? 1 : 8),
            moved: false // this and rook's moved will be used to check for castling :)
        };
    }

    return obj;
}

let pieces = getPieceData();

window.onload = () => {
    populateBoard();
    setPieces();

    console.log(pieces);

    // CODE BELOW IS USED FOR TESTING ONLY

    // rook A1 to A3
    let rook = $("A1").childNodes[0];
    let clone = rook.cloneNode(true);
    $("A3").appendChild(clone);
    rook.remove();
    pieces["white"]["rook"]["A1"].pos = "A3";
    pieces["white"]["rook"]["A1"].moved = true;

    // knight B1 to C4 
    let knight = $("B1").childNodes[0];
    let clone2 = knight.cloneNode(true);
    $("C4").appendChild(clone2);
    knight.remove();
    pieces["white"]["knight"]["B1"].pos = "C4";
    pieces["white"]["knight"]["B1"].moved = true;

    // pawn D7 to D6,
    let pawn = $("D7").childNodes[0];
    let clone3 = pawn.cloneNode(true);
    $("D6").appendChild(clone3);
    pawn.remove();
    pieces["black"]["pawn"]["D7"].pos = "D6";
    pieces["black"]["pawn"]["D7"].moved = true;

    // bioship C8 to E6
    let bishop = $("C8").childNodes[0];
    let clone4 = bishop.cloneNode(true);
    $("E6").appendChild(clone4);
    bishop.remove();
    pieces["black"]["bishop"]["C8"].pos = "E6";
    pieces["black"]["bishop"]["C8"].moved = true;

    // queen D8 to F4
    let queen = $("D8").childNodes[0];
    let clone5 = queen.cloneNode(true);
    $("F4").appendChild(clone5);
    queen.remove();
    pieces["black"]["queen"]["D8"].pos = "F4";
    pieces["black"]["queen"]["D8"].moved = true;

    // pawn H2 to H3
    let pawn2 = $("H2").childNodes[0];
    let clone6 = pawn2.cloneNode(true);
    $("H3").appendChild(clone6);
    pawn2.remove();
    pieces["white"]["pawn"]["H2"].pos = "H3";
    pieces["white"]["pawn"]["H2"].moved = true;

    // pawn A7 to C3 
    let pawn3 = $("A7").childNodes[0];
    let clone7 = pawn3.cloneNode(true);
    $("E3").appendChild(clone7);
    pawn3.remove();
    pieces["black"]["pawn"]["A7"].pos = "E3";
    pieces["black"]["pawn"]["A7"].moved = true;

}

// when a piece is clicked, highlight the available moves
document.addEventListener("mousedown", (e) => {
    console.log(e.target.classList);
    // if the clicked element is a piece
    if (e.target.tagName == "PIECE") {
        // remove all highlights
        let highlights = document.querySelectorAll(".available, .capture");
        for (let i = 0; i < highlights.length; i++) {
            highlights[i].remove();
        }

        // deselects any squares
        let squares = document.querySelectorAll(".selected");
        for (let i = 0; i < squares.length; i++) {
            squares[i].classList.remove("selected");
        }

        // Highlight the available moves of the piece
        let square = e.target.parentNode; // the square the piece is on
        let piece = e.target;             // the piece itself

        let type = piece.classList[0];    // the type of the piece (pawn, rook, etc.)
        let color = piece.classList[1];   // the color of the piece (white, black)
        let pos = piece.parentNode.id;    // the position of the piece (A1, B2, etc.)
        let id = piece.id.split("_")[2];  // the id of the , it's starting position

        console.log(type, color, [pos[0], int(pos[1])]);

        addClass(square, "selected"); 

        // Highlight the available moves, depending on the piece type
        switch (type) { // some of these are broken, revisit
            case "pawn":
                // Check if the square in front of the pawn is empty
                let front = $(pos[0] + (color == "white" ? int(pos[1]) + 1 : int(pos[1]) - 1));
                console.log("Is (", front.id, ") empty? ", hasPiece(front) == false);
                if (front != null && hasPiece(front) == false) {
                    highlight(front);
                }

                // If this is the first move, check if the next square is empty
                console.log("pieces[" + color + "][" + type + "][" + square.id + "].moved: ");
                if (pieces[color][type][id].moved == false) {
                    let front2 = $(pos[0] + (color == "white" ? int(pos[1]) + 2 : int(pos[1]) - 2));
                    // if front does not contain a .available child, do not highlight front2
                    if (front2 != null && hasPiece(front2) == 0 && front.children[0].classList[0] == "available") {
                        highlight(front2);
                    }

                }

                // Check if there is a piece to capture
                // use letterOp to operate on the letter of the position
                // (e.g. letterOp("A", 1) returns "B")
                let left = $(letterOp(pos[0], -1) + (color == "white" ? int(pos[1]) + 1 : int(pos[1]) - 1));
                let right = $(letterOp(pos[0], 1) + (color == "white" ? int(pos[1]) + 1 : int(pos[1]) - 1));
                if (left != null && hasPiece(left)) {
                    if (left.children[0].classList[1] != color) {
                        highlightCapture(left);
                    }
                }

                if (right != null && hasPiece(right)) {
                    if (right.children[0].classList[1] != color) {
                        highlightCapture(right);
                    }
                }

                // Check for en passant late

                break;
            case "rook":
                // Check the squares behind and in front of the rook
                for (let i = 1; i < 8; i++) {
                    let front = $(pos[0] + (int(pos[1]) + i));
                    let back = $(pos[0] + (int(pos[1]) - i));

                    if (front != null) {
                        if (!hasPiece(front)) {
                            highlight(front);
                        } else {
                            if (front.children[0].classList[1] != color) {
                                highlightCapture(front);
                            }
                            break;
                        }
                    }

                    if (back != null) {
                        if (!hasPiece(back)) {
                            highlight(back);
                        } else {
                            if (back.children[0].classList[1] != color) {
                                highlightCapture(back);
                            }
                            break;
                        }
                    }
                }

                // Check the squares to the left and right of the rook
                for (let i = 1; i < 8; i++) {
                    let left = $(letterOp(pos[0], -i) + pos[1]);
                    let right = $(letterOp(pos[0], i) + pos[1]);

                    if (left != null) {
                        if (!hasPiece(left)) {
                            highlight(left);
                        } else {
                            if (left.children[0].classList[1] != color) {
                                highlightCapture(left);
                            }
                            break;
                        }
                    }

                    if (right != null) {
                        if (!hasPiece(right)) {
                            highlight(right);
                        } else {
                            if (right.children[0].classList[1] != color) {
                                highlightCapture(right);
                            }
                            break;
                        }
                    }
                }

                break;
            case "knight": // Uh oh (redo this oh my god)
                // Check the 2 squares above and then 1 square to the left and right (L - shape)
                let left2 = $(letterOp(pos[0], -2) + (int(pos[1]) + 1));
                let left1 = $(letterOp(pos[0], -1) + (int(pos[1]) + 2));

                let right2 = $(letterOp(pos[0], 2) + (int(pos[1]) + 1));
                let right1 = $(letterOp(pos[0], 1) + (int(pos[1]) + 2));

                if (left2 != null) {
                    if (!hasPiece(left2)) {
                        highlight(left2);
                    } else {
                        if (left2.children[0].classList[1] != color) {
                            highlightCapture(left2);
                        }
                    }
                }

                if (left1 != null) {
                    if (!hasPiece(left1)) {
                        highlight(left1);
                    } else {
                        if (left1.children[0].classList[1] != color) {
                            highlightCapture(left1);
                        }
                    }
                }

                if (right2 != null) {
                    if (!hasPiece(right2)) {
                        highlight(right2);
                    } else {
                        if (right2.children[0].classList[1] != color) {
                            highlightCapture(right2);
                        }
                    }
                }

                if (right1 != null) {
                    if (!hasPiece(right1)) {
                        highlight(right1);
                    } else {
                        if (right1.children[0].classList[1] != color) {
                            highlightCapture(right1);
                        }
                    }
                }

                // Check the 2 squares below and then 1 square to the left and right (Inverted L - shape)
                left2 = $(letterOp(pos[0], -2) + (int(pos[1]) - 1));
                left1 = $(letterOp(pos[0], -1) + (int(pos[1]) - 2));

                right2 = $(letterOp(pos[0], 2) + (int(pos[1]) - 1));
                right1 = $(letterOp(pos[0], 1) + (int(pos[1]) - 2));

                if (left2 != null) {
                    if (!hasPiece(left2)) {
                        highlight(left2);
                    } else {
                        if (left2.children[0].classList[1] != color) {
                            highlightCapture(left2);
                        }
                    }
                }

                if (left1 != null) {
                    if (!hasPiece(left1)) {
                        highlight(left1);
                    } else {
                        if (left1.children[0].classList[1] != color) {
                            highlightCapture(left1);
                        }
                    }
                }

                if (right2 != null) {
                    if (!hasPiece(right2)) {
                        highlight(right2);
                    } else {
                        if (right2.children[0].classList[1] != color) {
                            highlightCapture(right2);
                        }
                    }
                }

                if (right1 != null) {
                    if (!hasPiece(right1)) {
                        highlight(right1);
                    } else {
                        if (right1.children[0].classList[1] != color) {
                            highlightCapture(right1);
                        }
                    }
                }

                break;
            case "bishop":
                // Check every square diagonally to the top left
                for (let i = 1; i < 8; i++) {
                    let square = $(letterOp(pos[0], -i) + (int(pos[1]) + i));

                    if (square != null) {
                        if (!hasPiece(square)) {
                            highlight(square);
                        } else {
                            if (square.children[0].classList[1] != color) {
                                highlightCapture(square);
                            }
                            break;
                        }
                    }
                }

                // Check every square diagonally to the top right
                for (let i = 1; i < 8; i++) {
                    let square = $(letterOp(pos[0], i) + (int(pos[1]) + i));

                    if (square != null) {
                        if (!hasPiece(square)) {
                            highlight(square);
                        } else {
                            if (square.children[0].classList[1] != color) {
                                highlightCapture(square);
                            }
                            break;
                        }
                    }
                }

                // Check every square diagonally to the bottom left
                for (let i = 1; i < 8; i++) {
                    let square = $(letterOp(pos[0], -i) + (int(pos[1]) - i));

                    if (square != null) {
                        if (!hasPiece(square)) {
                            highlight(square);
                        } else {
                            if (square.children[0].classList[1] != color) {
                                highlightCapture(square);
                            }
                            break;
                        }
                    }
                }

                // Check every square diagonally to the bottom right
                for (let i = 1; i < 8; i++) {
                    let square = $(letterOp(pos[0], i) + (int(pos[1]) - i));

                    if (square != null) {
                        if (!hasPiece(square)) {
                            highlight(square);
                        } else {
                            if (square.children[0].classList[1] != color) {
                                highlightCapture(square);
                            }
                            break;
                        }
                    }
                }

                break;
            case "queen":
                // Queen moves like a rook and a bishop combined
                // Check the squares behind the queen
                for (let i = 1; i < 8; i++) {
                    let square = $(letterOp(pos[0], -i) + pos[1]);

                    if (square != null) {
                        if (!hasPiece(square)) {
                            highlight(square);
                        } else {
                            if (square.children[0].classList[1] != color) {
                                highlightCapture(square);
                            }
                            break;
                        }
                    }
                }

                // Check the squares in front of the queen
                for (let i = 1; i < 8; i++) {
                    let square = $(letterOp(pos[0], i) + pos[1]);

                    if (square != null) {
                        if (!hasPiece(square)) {
                            highlight(square);
                        } else {
                            if (square.children[0].classList[1] != color) {
                                highlightCapture(square);
                            }
                            break;
                        }
                    }
                }

                // Check the squares to the left of the queen
                for (let i = 1; i < 8; i++) {
                    let square = $(pos[0] + (int(pos[1]) + i));

                    if (square != null) {
                        if (!hasPiece(square)) {
                            highlight(square);
                        } else {
                            if (square.children[0].classList[1] != color) {
                                highlightCapture(square);
                            }
                            break;
                        }
                    }
                }

                // Check the squares to the right of the queen
                for (let i = 1; i < 8; i++) {
                    let square = $(pos[0] + (int(pos[1]) - i));

                    if (square != null) {
                        if (!hasPiece(square)) {
                            highlight(square);
                        } else {
                            if (square.children[0].classList[1] != color) {
                                highlightCapture(square);
                            }
                            break;
                        }
                    }
                }

                // Check every square diagonally to the top left
                for (let i = 1; i < 8; i++) {
                    let square = $(letterOp(pos[0], -i) + (int(pos[1]) + i));

                    if (square != null) {
                        if (!hasPiece(square)) {
                            highlight(square);
                        } else {
                            if (square.children[0].classList[1] != color) {
                                highlightCapture(square);
                            }
                            break;
                        }
                    }
                }

                // Check every square diagonally to the top right
                for (let i = 1; i < 8; i++) {
                    let square = $(letterOp(pos[0], i) + (int(pos[1]) + i));

                    if (square != null) {
                        if (!hasPiece(square)) {
                            highlight(square);
                        } else {
                            if (square.children[0].classList[1] != color) {
                                highlightCapture(square);
                            }
                            break;
                        }
                    }
                }

                // Check every square diagonally to the bottom left
                for (let i = 1; i < 8; i++) {
                    let square = $(letterOp(pos[0], -i) + (int(pos[1]) - i));

                    if (square != null) {
                        if (!hasPiece(square)) {
                            highlight(square);
                        } else {
                            if (square.children[0].classList[1] != color) {
                                highlightCapture(square);
                            }
                            break;
                        }
                    }
                }

                // every square diagonally to the bottom right
                for (let i = 1; i < 8; i++) {
                    let square = $(letterOp(pos[0], i) + (int(pos[1]) - i));

                    if (square != null) {
                        if (!hasPiece(square)) {
                            highlight(square);
                        } else {
                            if (square.children[0].classList[1] != color) {
                                highlightCapture(square);
                            }
                            break;
                        }
                    }
                }

                break; // finallly
            case "king": 
                // Check the squares around the king
                for (let i = -1; i < 2; i++) {
                    for (let j = -1; j < 2; j++) {
                        let square = $(letterOp(pos[0], i) + (int(pos[1]) + j));

                        if (square != null) {
                            if (!hasPiece(square)) {
                                highlight(square);
                            } else {
                                if (square.children[0].classList[1] != color) {
                                    highlightCapture(square);
                                }
                            }
                        }
                    }
                }

                // Add castle check

                break;
        }



    return; // lol
    }

    // click again to deselect (will be removed later)
    let selected = document.getElementsByClassName("selected")[0];
    if (selected != null) {
        selected.classList.remove("selected");

        let highlights = document.querySelectorAll(".available, .capture");
        for (let i = 0; i < highlights.length; i++) {
            highlights[i].classList.remove("available", "capture");
        }

    }

});

let hovered, move, canMove = false;
document.addEventListener("mouseover", function(e) {
    // pass hovered element to variable
    hovered = e.target; // this is not needed what the fuck
    // wrote this at 4 am
});


document.addEventListener("mousemove", function(e) {
    // if we're over a .available, .capture, <PIECE>, or .square, check if an available or .capture is present in the parent 
    if (hovered.classList.contains("available") || hovered.classList.contains("capture") || hovered.classList.contains("square") || hovered.tagName == "PIECE") {
        // get the parent if we're not on a .square already
        let parent = hovered.classList.contains("square") ? hovered : hovered.parentElement;
        if (parent.getElementsByClassName("available").length > 0 || parent.getElementsByClassName("capture").length > 0) {
            // if there is, log the parent's id
            console.log("Can move to " + parent.id);
            move = parent;
            canMove = true;
        }
    }
});

// CHANGE ALL OF THIS TO POINT AND CLICK
document.addEventListener("mouseup", function(e) {
    let square = move;

    // If we can move there, check if it's a capture or just a move
    if (canMove) {
        // If the square has a child with the cla ss "capture", it's a capture
        if (square.getElementsByClassName("capture").length > 0) {
            // Get the piece that's being captured
            let captured = square.getElementsByTagName("PIECE")[0];
            let selected = document.getElementsByClassName("selected")[0]; // the square of the piece that's moving

            // Remove the captured piece from the board
            captured.remove();

            // clear highlights
            let highlights = document.querySelectorAll(".available, .capture");
            for (let i = 0; i < highlights.length; i++) {
                highlights[i].classList.remove("available", "capture");
            }
            
            // Move the selected piece via cloning
            let piece = selected.getElementsByTagName("PIECE")[0];
            let clone = piece.cloneNode(true);
            square.appendChild(clone);
            selected.querySelector("PIECE").remove();
            selected.classList.remove("selected");

            // Update the piece's position
            let id = piece.id;

            pieces[id.split("_")[1]][id.split("_")[0]][id.split("_")[2]].pos = square.id; // pieces[color][type][id].pos = pos;
            pieces[id.split("_")[1]][id.split("_")[0]][id.split("_")[2]].moved = true;    // pieces[color][type][id].moved = true;

            // Remove the selected piece from the board
            piece.remove();            
        } else {
            // Just move the piece
            let selected = document.getElementsByClassName("selected")[0]; // the square of the piece that's moving

            // clear highlights
            let highlights = document.querySelectorAll(".available, .capture");
            for (let i = 0; i < highlights.length; i++) {
                highlights[i].classList.remove("available", "capture");
            }

            // Move the selected piece via cloning
            let piece = selected.getElementsByTagName("PIECE")[0];
            let clone = piece.cloneNode(true);
            square.appendChild(clone);
            selected.querySelector("PIECE").remove();
            selected.classList.remove("selected");

            // Update the piece's position
            let id = piece.id;

            pieces[id.split("_")[1]][id.split("_")[0]][id.split("_")[2]].pos = square.id; // pieces[color][type][id].pos = pos;
            pieces[id.split("_")[1]][id.split("_")[0]][id.split("_")[2]].moved = true;    // pieces[color][type][id].moved = true;

            // Remove the selected piece from the board
            piece.remove();
        }
    } else {
        
    }
});

