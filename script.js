document.addEventListener('DOMContentLoaded', function() {
    // Game state
    let board = [];
    let selectedPiece = null;
    let currentPlayer = 'white';
    let moveHistory = [];
    let gameActive = false;
    
    // DOM elements
    const chessBoard = document.getElementById('chessBoard');
    const turnIndicator = document.getElementById('turnIndicator');
    const moveHistoryElement = document.getElementById('moveHistory');
    const newGameBtn = document.getElementById('newGameBtn');
    const helpBtn = document.getElementById('helpBtn');
    const exitBtn = document.getElementById('exitBtn');
    const helpModal = document.getElementById('helpModal');
    const closeModal = document.querySelector('.close');
    
    // Initialize the game
    function initGame() {
        createEmptyBoard();
        setupPieces();
        renderBoard();
        gameActive = true;
        currentPlayer = 'white';
        moveHistory = [];
        updateTurnIndicator();
        moveHistoryElement.innerHTML = '';
    }
    
    // Create empty 8x8 board
    function createEmptyBoard() {
        board = Array(8).fill().map(() => Array(8).fill(null));
    }
    
    // Set up initial chess pieces
    function setupPieces() {
        // Set up pawns
        for (let i = 0; i < 8; i++) {
            board[1][i] = { type: 'pawn', color: 'black' };
            board[6][i] = { type: 'pawn', color: 'white' };
        }
        
        // Set up rooks
        board[0][0] = board[0][7] = { type: 'rook', color: 'black' };
        board[7][0] = board[7][7] = { type: 'rook', color: 'white' };
        
        // Set up knights
        board[0][1] = board[0][6] = { type: 'knight', color: 'black' };
        board[7][1] = board[7][6] = { type: 'knight', color: 'white' };
        
        // Set up bishops
        board[0][2] = board[0][5] = { type: 'bishop', color: 'black' };
        board[7][2] = board[7][5] = { type: 'bishop', color: 'white' };
        
        // Set up queens
        board[0][3] = { type: 'queen', color: 'black' };
        board[7][3] = { type: 'queen', color: 'white' };
        
        // Set up kings
        board[0][4] = { type: 'king', color: 'black' };
        board[7][4] = { type: 'king', color: 'white' };
    }
    
    // Render the chess board
    function renderBoard() {
        chessBoard.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'square-light' : 'square-dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                if (board[row][col]) {
                    const piece = document.createElement('div');
                    piece.className = 'piece';
                    piece.textContent = getPieceSymbol(board[row][col]);
                    piece.dataset.color = board[row][col].color;
                    square.appendChild(piece);
                }
                
                square.addEventListener('click', () => handleSquareClick(row, col));
                chessBoard.appendChild(square);
            }
        }
    }
    
    // Get Unicode symbol for a piece
    function getPieceSymbol(piece) {
        const symbols = {
            king: { white: '♔', black: '♚' },
            queen: { white: '♕', black: '♛' },
            rook: { white: '♖', black: '♜' },
            bishop: { white: '♗', black: '♝' },
            knight: { white: '♘', black: '♞' },
            pawn: { white: '♙', black: '♟' }
        };
        return symbols[piece.type][piece.color];
    }
    
    // Handle square click
    function handleSquareClick(row, col) {
        if (!gameActive) return;
        
        const square = board[row][col];
        
        // If no piece is selected and the square has a piece of the current player's color
        if (!selectedPiece && square && square.color === currentPlayer) {
            selectedPiece = { row, col, piece: square };
            highlightValidMoves(row, col);
            return;
        }
        
        // If a piece is already selected
        if (selectedPiece) {
            // If clicking on the same piece, deselect it
            if (selectedPiece.row === row && selectedPiece.col === col) {
                clearHighlights();
                selectedPiece = null;
                return;
            }
            
            // If clicking on another piece of the same color, select that piece instead
            if (square && square.color === currentPlayer) {
                clearHighlights();
                selectedPiece = { row, col, piece: square };
                highlightValidMoves(row, col);
                return;
            }
            
            // Check if the move is valid
            if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
                // Make the move
                makeMove(selectedPiece.row, selectedPiece.col, row, col);
                
                // Switch player
                currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
                updateTurnIndicator();
                
                // Check for checkmate or stalemate
                // (Simplified version - full implementation would require more logic)
            }
            
            // Clear selection and highlights
            clearHighlights();
            selectedPiece = null;
        }
    }
    
    // Highlight valid moves for a piece
    function highlightValidMoves(row, col) {
        const squares = document.querySelectorAll('.square');
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (isValidMove(row, col, r, c)) {
                    const index = r * 8 + c;
                    squares[index].classList.add('square-highlight');
                }
            }
        }
        
        // Highlight selected piece
        const selectedIndex = row * 8 + col;
        squares[selectedIndex].classList.add('square-selected');
    }
    
    // Clear all highlights
    function clearHighlights() {
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('square-highlight', 'square-selected');
        });
    }
    
    // Check if a move is valid (simplified version)
    function isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = board[fromRow][fromCol];
        if (!piece) return false;
        
        // Can't capture your own piece
        if (board[toRow][toCol] && board[toRow][toCol].color === piece.color) {
            return false;
        }
        
        // Simplified movement rules (full implementation would be more complex)
        switch (piece.type) {
            case 'pawn':
                // Pawns move forward one square, capture diagonally
                const direction = piece.color === 'white' ? -1 : 1;
                
                // Normal move
                if (fromCol === toCol && !board[toRow][toCol]) {
                    // Move one square forward
                    if (toRow === fromRow + direction) return true;
                    // Move two squares from starting position
                    if ((fromRow === 1 || fromRow === 6) && 
                        toRow === fromRow + 2 * direction && 
                        !board[fromRow + direction][fromCol]) {
                        return true;
                    }
                }
                // Capture
                if (Math.abs(toCol - fromCol) === 1 && 
                    toRow === fromRow + direction &&
                    board[toRow][toCol] && 
                    board[toRow][toCol].color !== piece.color) {
                    return true;
                }
                return false;
                
            case 'rook':
                return (fromRow === toRow || fromCol === toCol) && 
                       isPathClear(fromRow, fromCol, toRow, toCol);
                
            case 'knight':
                return (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 1) || 
                       (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 2);
                
            case 'bishop':
                return Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol) && 
                       isPathClear(fromRow, fromCol, toRow, toCol);
                
            case 'queen':
                return (fromRow === toRow || fromCol === toCol || 
                        Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) && 
                       isPathClear(fromRow, fromCol, toRow, toCol);
                
            case 'king':
                return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
                
            default:
                return false;
        }
    }
    
    // Check if path between two squares is clear (for rook, bishop, queen)
    function isPathClear(fromRow, fromCol, toRow, toCol) {
        const rowStep = fromRow === toRow ? 0 : (fromRow < toRow ? 1 : -1);
        const colStep = fromCol === toCol ? 0 : (fromCol < toCol ? 1 : -1);
        
        let row = fromRow + rowStep;
        let col = fromCol + colStep;
        
        while (row !== toRow || col !== toCol) {
            if (board[row][col]) return false;
            row += rowStep;
            col += colStep;
        }
        
        return true;
    }
    
    // Make a move on the board
    function makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = board[fromRow][fromCol];
        const captured = board[toRow][toCol];
        
        // Record the move
        const moveNotation = getMoveNotation(piece, fromRow, fromCol, toRow, toCol, captured);
        moveHistory.push(moveNotation);
        updateMoveHistory();
        
        // Perform the move
        board[toRow][toCol] = piece;
        board[fromRow][fromCol] = null;
        
        // Check for pawn promotion
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            // Promote to queen (simplified)
            board[toRow][toCol].type = 'queen';
        }
        
        renderBoard();
    }
    
    // Get algebraic notation for a move
    function getMoveNotation(piece, fromRow, fromCol, toRow, toCol, captured) {
        const pieceSymbol = piece.type === 'knight' ? 'N' : 
                          piece.type === 'bishop' ? 'B' : 
                          piece.type === 'rook' ? 'R' : 
                          piece.type === 'queen' ? 'Q' : 
                          piece.type === 'king' ? 'K' : '';
        
        const fromFile = String.fromCharCode(97 + fromCol);
        const fromRank = 8 - fromRow;
        const toFile = String.fromCharCode(97 + toCol);
        const toRank = 8 - toRow;
        
        const captureSymbol = captured ? 'x' : '';
        
        return `${pieceSymbol}${fromFile}${fromRank}${captureSymbol}${toFile}${toRank}`;
    }
    
    // Update the move history display
    function updateMoveHistory() {
        moveHistoryElement.innerHTML = moveHistory.join('<br>');
        moveHistoryElement.scrollTop = moveHistoryElement.scrollHeight;
    }
    
    // Update the turn indicator
    function updateTurnIndicator() {
        turnIndicator.textContent = `${currentPlayer === 'white' ? 'White' : 'Black'}'s turn`;
        turnIndicator.style.color = currentPlayer === 'white' ? '#333' : '#000';
    }
    
    // Event listeners for buttons
    newGameBtn.addEventListener('click', function() {
        if (confirm('Start a new game? Current game will be lost.')) {
            initGame();
        }
    });
    
    helpBtn.addEventListener('click', function() {
        helpModal.style.display = 'block';
    });
    
    exitBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to exit the game?')) {
            gameActive = false;
            chessBoard.innerHTML = '';
            turnIndicator.textContent = 'Game ended';
            moveHistoryElement.innerHTML = '';
        }
    });
    
    closeModal.addEventListener('click', function() {
        helpModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });
    
    // Initialize the game on page load
    initGame();
});