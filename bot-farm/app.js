/**
 * BOT FARM — CỜ CARO 19x19 + ENGINE RAPFI
 * Logic điều khiển bàn cờ, Gomocup protocol, Undo/Redo, Zoom/Pan & UI
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. TRẠNG THÁI TOÀN CỤC (STATE)
  // ==========================================================================
  const BOARD_SIZE = 19;

  // Thống kê chiến tích
  let stats = {
    wins: 0,
    losses: 0
  };

  // Cài đặt
  let settings = {
    difficulty: 3000,           // 1000, 3000, 5000, 10000 ms
    sideSelection: 'player_x',  // 'player_x' | 'player_o' | 'bot_first'
    sound: true,
    vibrate: true,
    showCoords: true,
    showLastMove: true
  };

  // Bàn cờ & Trận đấu
  let board = createEmptyBoard();
  let moves = [];              // [{ x, y, side }]
  let redoStack = [];          // [{ x, y, side }]
  let currentTurn = 'X';       // 'X' hoặc 'O'
  let gameOver = false;
  let winner = null;           // 'X' | 'O' | 'draw'
  let winningLine = null;      // [{ x, y }, ...]
  let lastMove = null;         // { x, y, side }
  let clearedBoardSnapshot = null; // Snapshot lưu khi bấm Trang Mới hoặc Khai Cuộc

  // Chế độ di chuyển Nước Đi & ALL
  let moveMode = false;
  let allMoveMode = false;
  let selectedPiece = null;    // { x, y }

  // Zoom & Pan
  let zoomLevel = 1.0;
  let panX = 0;
  let panY = 0;

  // Engine Rapfi Worker
  let worker = null;
  let engineReady = false;
  let isThinking = false;
  let pendingBotMove = false;

  // Web Audio Context
  let audioCtx = null;

  // ==========================================================================
  // 2. KHỞI TẠO DOM ELEMENTS
  // ==========================================================================
  // Màn hình
  const screenHome = document.getElementById('screen-home');
  const screenSettings = document.getElementById('screen-settings');
  const screenGame = document.getElementById('screen-game');

  // Home Screen Elements
  const homeStatsText = document.getElementById('home-stats-text');
  const btnStartGame = document.getElementById('btn-start-game');
  const btnOpenSettings = document.getElementById('btn-open-settings');

  // Settings Elements
  const btnSettingsBack = document.getElementById('btn-settings-back');
  const btnSaveSettings = document.getElementById('btn-save-settings');
  const diffButtons = document.querySelectorAll('#difficulty-options .opt-btn');
  const sideButtons = document.querySelectorAll('#side-options .opt-btn');
  const toggleSound = document.getElementById('toggle-sound');
  const toggleVibrate = document.getElementById('toggle-vibrate');
  const toggleCoords = document.getElementById('toggle-coords');
  const toggleLastMove = document.getElementById('toggle-last-move');

  // Game Header & Status
  const btnGameHome = document.getElementById('btn-game-home');
  const btnGameSettings = document.getElementById('btn-game-settings');
  const gameScoreText = document.getElementById('game-score-text');
  const turnSymbol = document.getElementById('turn-symbol');
  const thinkingBadge = document.getElementById('thinking-badge');
  const engineAlert = document.getElementById('engine-alert');

  // Zoom Controls
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const btnZoomReset = document.getElementById('btn-zoom-reset');
  const zoomLevelText = document.getElementById('zoom-level-text');
  const boardViewport = document.getElementById('board-viewport');
  const boardCanvas = document.getElementById('board-canvas');
  const ctx = boardCanvas.getContext('2d');

  // Move Pad (Nước Đi / ALL)
  const movePad = document.getElementById('move-pad');
  const movePadStatus = document.getElementById('move-pad-status');
  const btnCloseMovePad = document.getElementById('btn-close-move-pad');
  const btnMoveUp = document.getElementById('btn-move-up');
  const btnMoveDown = document.getElementById('btn-move-down');
  const btnMoveLeft = document.getElementById('btn-move-left');
  const btnMoveRight = document.getElementById('btn-move-right');

  // Toolbar Buttons (Mục 4)
  const btnNewPage = document.getElementById('btn-new-page');
  const btnRestoreNewPage = document.getElementById('btn-restore-new-page');
  const btnUndoAll = document.getElementById('btn-undo-all');
  const btnRedoAll = document.getElementById('btn-redo-all');
  const btnUndoOne = document.getElementById('btn-undo-one');
  const btnRedoOne = document.getElementById('btn-redo-one');
  const btnMoveMode = document.getElementById('btn-move-mode');
  const btnMoveAll = document.getElementById('btn-move-all');
  const btnOpen4 = document.getElementById('btn-open-4');
  const btnPlay = document.getElementById('btn-play');

  // Modal Game Over
  const modalGameOver = document.getElementById('modal-gameover');
  const modalIcon = document.getElementById('modal-icon');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalStats = document.getElementById('modal-stats');
  const btnPlayAgain = document.getElementById('btn-play-again');
  const btnViewBoard = document.getElementById('btn-view-board');
  const btnModalHome = document.getElementById('btn-modal-home');

  // Toast
  const toast = document.getElementById('toast');
  let toastTimer = null;

  // ==========================================================================
  // 3. KHỞI TẠO & LƯU TRỮ (LOCALSTORAGE)
  // ==========================================================================
  function loadPersistedData() {
    try {
      const savedStats = localStorage.getItem('bot_farm_stats');
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        stats.wins = Number(parsed.wins) || 0;
        stats.losses = Number(parsed.losses) || 0;
      }
    } catch (e) {}

    try {
      const savedSettings = localStorage.getItem('bot_farm_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.difficulty) settings.difficulty = Number(parsed.difficulty);
        if (parsed.sideSelection) settings.sideSelection = parsed.sideSelection;
        if (typeof parsed.sound === 'boolean') settings.sound = parsed.sound;
        if (typeof parsed.vibrate === 'boolean') settings.vibrate = parsed.vibrate;
        if (typeof parsed.showCoords === 'boolean') settings.showCoords = parsed.showCoords;
        if (typeof parsed.showLastMove === 'boolean') settings.showLastMove = parsed.showLastMove;
      }
    } catch (e) {}

    try {
      const savedGame = localStorage.getItem('bot_farm_saved_game');
      if (savedGame) {
        const parsed = JSON.parse(savedGame);
        if (Array.isArray(parsed.board) && parsed.board.length === BOARD_SIZE) {
          board = parsed.board;
          moves = Array.isArray(parsed.moves) ? parsed.moves : [];
          redoStack = Array.isArray(parsed.redoStack) ? parsed.redoStack : [];
          currentTurn = parsed.currentTurn || 'X';
          gameOver = Boolean(parsed.gameOver);
          winner = parsed.winner || null;
          winningLine = parsed.winningLine || null;
          lastMove = parsed.lastMove || null;
          clearedBoardSnapshot = parsed.clearedBoardSnapshot || null;
        }
      }
    } catch (e) {}

    updateStatsDisplay();
    syncSettingsUI();
  }

  function saveStats() {
    try {
      localStorage.setItem('bot_farm_stats', JSON.stringify(stats));
    } catch (e) {}
    updateStatsDisplay();
  }

  function saveSettings() {
    try {
      localStorage.setItem('bot_farm_settings', JSON.stringify(settings));
    } catch (e) {}
  }

  function saveGameState() {
    try {
      const state = {
        board,
        moves,
        redoStack,
        currentTurn,
        gameOver,
        winner,
        winningLine,
        lastMove,
        clearedBoardSnapshot
      };
      localStorage.setItem('bot_farm_saved_game', JSON.stringify(state));
    } catch (e) {}
  }

  function updateStatsDisplay() {
    const text = `Tổng Trận — Thắng: ${stats.wins} | Thua: ${stats.losses}`;
    if (homeStatsText) homeStatsText.textContent = text;
    if (gameScoreText) gameScoreText.textContent = `Thắng: ${stats.wins} | Thua: ${stats.losses}`;
    if (modalStats) modalStats.textContent = text;
  }

  function syncSettingsUI() {
    diffButtons.forEach(btn => {
      btn.classList.toggle('active', Number(btn.dataset.diff) === settings.difficulty);
    });
    sideButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.side === settings.sideSelection);
    });
    if (toggleSound) toggleSound.checked = settings.sound;
    if (toggleVibrate) toggleVibrate.checked = settings.vibrate;
    if (toggleCoords) toggleCoords.checked = settings.showCoords;
    if (toggleLastMove) toggleLastMove.checked = settings.showLastMove;
  }

  function createEmptyBoard() {
    const b = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      b.push(new Array(BOARD_SIZE).fill(null));
    }
    return b;
  }

  // ==========================================================================
  // 4. ĐIỀU HƯỚNG MÀN HÌNH
  // ==========================================================================
  function showScreen(screen) {
    [screenHome, screenSettings, screenGame].forEach(s => {
      s.classList.remove('screen-active');
    });
    screen.classList.add('screen-active');
    if (screen === screenGame) {
      resizeCanvas();
      renderBoard();
      updateButtons();
    }
  }

  // ==========================================================================
  // 5. ENGINE WORKER (RAPFI GOMOCUP PROTOCOL - MỤC 6)
  // ==========================================================================
  function initEngineWorker() {
    try {
      worker = new Worker('engine-worker.js');

      worker.onmessage = function (e) {
        const msg = e.data || {};
        if (msg.type === 'ready') {
          engineReady = true;
          hideEngineAlert();
          sendEngineCmd('START 19');
          sendEngineCmd(`INFO timeout_turn ${settings.difficulty}`);
          sendEngineCmd('INFO timeout_match 100000');
          if (pendingBotMove) {
            pendingBotMove = false;
            requestBotMove();
          }
        } else if (msg.type === 'stdout') {
          handleEngineStdout(msg.data);
        } else if (msg.type === 'error' || msg.type === 'worker-error') {
          handleEngineError(msg.data);
        }
      };

      worker.postMessage({ type: 'init' });
    } catch (err) {
      handleEngineError(err.message || 'Không thể khởi tạo Web Worker');
    }
  }

  function sendEngineCmd(cmd) {
    if (worker) {
      worker.postMessage({ type: 'command', data: cmd });
    }
  }

  function handleEngineStdout(data) {
    if (!data || typeof data !== 'string') return;
    const line = data.trim();

    // Định dạng nước đi của Gomocup: "x,y" (ví dụ 9,9 hoặc 10,8)
    const match = line.match(/^(\d+)\s*,\s*(\d+)$/);
    if (match && isThinking) {
      const bx = parseInt(match[1], 10);
      const by = parseInt(match[2], 10);

      setThinking(false);

      if (bx >= 0 && bx < BOARD_SIZE && by >= 0 && by < BOARD_SIZE && board[by][bx] === null && !gameOver) {
        applyMove(bx, by, currentTurn, true);
      }
    }
  }

  function handleEngineError(err) {
    setThinking(false);
    const msg = typeof err === 'string' ? err : 'Lỗi engine Rapfi';
    showEngineAlert(msg);
  }

  function showEngineAlert(text) {
    if (engineAlert) {
      engineAlert.textContent = `Lỗi: ${text}`;
      engineAlert.classList.remove('hidden');
    }
  }

  function hideEngineAlert() {
    if (engineAlert) {
      engineAlert.textContent = '';
      engineAlert.classList.add('hidden');
    }
  }

  function setThinking(val) {
    isThinking = val;
    if (val) {
      thinkingBadge.classList.remove('hidden');
    } else {
      thinkingBadge.classList.add('hidden');
    }
  }

  function requestBotMove() {
    if (gameOver) return;

    if (!engineReady) {
      pendingBotMove = true;
      showToast('Đang khởi động engine...');
      return;
    }

    if (isThinking) return;

    setThinking(true);

    // Gomocup protocol: BOARD -> x,y,side -> DONE
    sendEngineCmd('BOARD');
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const p = board[y][x];
        if (p) {
          const side = (p === 'X') ? 1 : 2;
          sendEngineCmd(`${x},${y},${side}`);
        }
      }
    }
    sendEngineCmd('DONE');
  }

  // ==========================================================================
  // 6. LUẬT CHƠI FREESTYLE GOMOKU & KIỂM TRA THẮNG THUA (MỤC 5)
  // ==========================================================================
  function checkWin(b, x, y) {
    const side = b[y][x];
    if (!side) return null;

    const directions = [
      [1, 0],   // Ngang
      [0, 1],   // Dọc
      [1, 1],   // Chéo chính (\)
      [1, -1]   // Chéo phụ (/)
    ];

    for (let i = 0; i < directions.length; i++) {
      const [dx, dy] = directions[i];
      const line = [{ x, y }];

      // Đi theo chiều dương (dx, dy)
      let step = 1;
      while (true) {
        const nx = x + dx * step;
        const ny = y + dy * step;
        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && b[ny][nx] === side) {
          line.push({ x: nx, y: ny });
          step++;
        } else {
          break;
        }
      }

      // Đi theo chiều âm (-dx, -dy)
      step = 1;
      while (true) {
        const nx = x - dx * step;
        const ny = y - dy * step;
        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && b[ny][nx] === side) {
          line.unshift({ x: nx, y: ny });
          step++;
        } else {
          break;
        }
      }

      // Gomoku freestyle: 5 quân liên tiếp trở lên là thắng
      if (line.length >= 5) {
        return { winner: side, line };
      }
    }

    return null;
  }

  function handleGameOver(w, line) {
    gameOver = true;
    winner = w;
    winningLine = line || null;

    // Xác định người thắng hay bot thắng theo lựa chọn quân
    let isHumanWin = false;
    let isDraw = (w === 'draw');

    if (!isDraw) {
      if (settings.sideSelection === 'player_x') {
        isHumanWin = (w === 'X');
      } else {
        // 'player_o' hoặc 'bot_first' (người cầm O)
        isHumanWin = (w === 'O');
      }

      if (isHumanWin) {
        stats.wins++;
        playWinSound();
      } else {
        stats.losses++;
        playLoseSound();
      }
      saveStats();
    }

    // Cập nhật modal
    if (isDraw) {
      modalIcon.textContent = '🤝';
      modalTitle.textContent = 'Hòa Cờ!';
      modalDesc.textContent = 'Bàn cờ 19x19 đã kín chỗ mà không ai tạo được chuỗi 5 quân.';
    } else if (isHumanWin) {
      modalIcon.textContent = '🏆';
      modalTitle.textContent = 'Người Thắng!';
      modalDesc.textContent = `Tuyệt đỉnh! Bạn đã tạo được chuỗi ${winningLine ? winningLine.length : 5} quân ${w} liên tiếp.`;
    } else {
      modalIcon.textContent = '🤖';
      modalTitle.textContent = 'Bot Farm Thắng!';
      modalDesc.textContent = `Bot Farm đã tạo được thế cờ hiểm hóc với chuỗi quân ${w}.`;
    }

    updateStatsDisplay();
    saveGameState();
    renderBoard();
    updateButtons();

    // Hiện modal
    setTimeout(() => {
      modalGameOver.classList.remove('hidden');
    }, 400);
  }

  // ==========================================================================
  // 7. ĐẶT NƯỚC ĐI (APPLY MOVE)
  // ==========================================================================
  function applyMove(x, y, side, isFromBot) {
    if (board[y][x] !== null || gameOver) return false;

    board[y][x] = side;
    moves.push({ x, y, side });
    redoStack = []; // Có nước mới thì xóa redo
    lastMove = { x, y, side };

    // Đổi lượt
    currentTurn = (side === 'X') ? 'O' : 'X';

    // Âm thanh & Rung
    playMoveSound();
    triggerVibrate();

    // Kiểm tra thắng thua
    const win = checkWin(board, x, y);
    if (win) {
      handleGameOver(win.winner, win.line);
    } else if (moves.length === BOARD_SIZE * BOARD_SIZE) {
      handleGameOver('draw', null);
    }

    updateButtons();
    renderBoard();
    saveGameState();
    return true;
  }

  // ==========================================================================
  // 8. THANH CÔNG CỤ (MỤC 4 & 4.5 TRẠNG THÁI NÚT)
  // ==========================================================================
  function updateButtons() {
    // 4.5 Trạng thái nút bắt buộc:
    // - Khi không còn gì để lùi thì 《 và < mờ (disabled)
    // - Khi có nước đã lùi thì 》 và > sáng (enabled)
    const canUndo = moves.length > 0;
    const canRedo = redoStack.length > 0;
    const canRestore = (clearedBoardSnapshot !== null);

    btnUndoAll.disabled = !canUndo;
    btnUndoOne.disabled = !canUndo;

    btnRedoAll.disabled = !canRedo;
    btnRedoOne.disabled = !canRedo;

    btnRestoreNewPage.disabled = !canRestore;

    // Cập nhật lượt đi UI
    if (turnSymbol) {
      turnSymbol.textContent = currentTurn;
      turnSymbol.className = `turn-symbol symbol-${currentTurn.toLowerCase()}`;
    }

    // Nút Play chỉ bấm được khi chưa Game Over và không đang tính
    btnPlay.disabled = gameOver || isThinking;
  }

  // 1. Trang Mới
  function actionNewPage() {
    if (moves.length > 0) {
      const confirmMsg = 'Bắt đầu ván mới và xóa bàn cờ hiện tại? Bàn cờ cũ sẽ được lưu để có thể khôi phục.';
      if (!window.confirm(confirmMsg)) return;
    }

    // Lưu snapshot để khôi phục
    clearedBoardSnapshot = {
      board: board.map(r => [...r]),
      moves: [...moves],
      redoStack: [...redoStack],
      currentTurn,
      gameOver,
      winner,
      winningLine: winningLine ? [...winningLine] : null,
      lastMove: lastMove ? { ...lastMove } : null
    };

    resetBoardState();
    showToast('Đã tạo ván mới');
  }

  // 2. Khôi Phục Trang Mới
  function actionRestoreNewPage() {
    if (!clearedBoardSnapshot) return;

    board = clearedBoardSnapshot.board.map(r => [...r]);
    moves = [...clearedBoardSnapshot.moves];
    redoStack = [...clearedBoardSnapshot.redoStack];
    currentTurn = clearedBoardSnapshot.currentTurn;
    gameOver = clearedBoardSnapshot.gameOver;
    winner = clearedBoardSnapshot.winner;
    winningLine = clearedBoardSnapshot.winningLine ? [...clearedBoardSnapshot.winningLine] : null;
    lastMove = clearedBoardSnapshot.lastMove ? { ...clearedBoardSnapshot.lastMove } : null;

    clearedBoardSnapshot = null;

    updateButtons();
    renderBoard();
    saveGameState();
    showToast('Đã khôi phục bàn cờ');
  }

  // 3. 《 Undo toàn bộ
  function actionUndoAll() {
    if (moves.length === 0) return;

    while (moves.length > 0) {
      const m = moves.pop();
      board[m.y][m.x] = null;
      redoStack.push(m);
    }

    lastMove = null;
    gameOver = false;
    winner = null;
    winningLine = null;

    // Đặt lại lượt đầu theo cài đặt
    currentTurn = (settings.sideSelection === 'player_o') ? 'O' : 'X';

    updateButtons();
    renderBoard();
    saveGameState();
    showToast('Đã lùi toàn bộ nước đi');
  }

  // 》 Redo toàn bộ
  function actionRedoAll() {
    if (redoStack.length === 0) return;

    while (redoStack.length > 0) {
      const m = redoStack.pop();
      board[m.y][m.x] = m.side;
      moves.push(m);
      lastMove = m;
      currentTurn = (m.side === 'X') ? 'O' : 'X';

      const win = checkWin(board, m.x, m.y);
      if (win) {
        handleGameOver(win.winner, win.line);
        break;
      }
    }

    updateButtons();
    renderBoard();
    saveGameState();
    showToast('Đã khôi phục toàn bộ nước đi');
  }

  // 4. < Lùi 1 nước
  function actionUndoOne() {
    if (moves.length === 0) return;

    const m = moves.pop();
    board[m.y][m.x] = null;
    redoStack.push(m);

    currentTurn = m.side; // Trả lại lượt cho quân vừa lùi
    lastMove = (moves.length > 0) ? moves[moves.length - 1] : null;
    gameOver = false;
    winner = null;
    winningLine = null;

    updateButtons();
    renderBoard();
    saveGameState();
  }

  // > Tiến 1 nước
  function actionRedoOne() {
    if (redoStack.length === 0) return;

    const m = redoStack.pop();
    board[m.y][m.x] = m.side;
    moves.push(m);
    lastMove = m;
    currentTurn = (m.side === 'X') ? 'O' : 'X';

    const win = checkWin(board, m.x, m.y);
    if (win) {
      handleGameOver(win.winner, win.line);
    }

    updateButtons();
    renderBoard();
    saveGameState();
  }

  // 8. Nút Play: Bot suy nghĩ rồi đánh tiếp 1 nước đúng bên tới lượt
  function actionPlayBot() {
    if (gameOver) {
      showToast('Ván cờ đã kết thúc! Hãy bấm Trang Mới');
      return;
    }
    requestBotMove();
  }

  // 9. Khai Cuộc Open 4: thế tứ mở ở giữa bàn
  function actionOpen4() {
    if (moves.length > 0) {
      clearedBoardSnapshot = {
        board: board.map(r => [...r]),
        moves: [...moves],
        redoStack: [...redoStack],
        currentTurn,
        gameOver,
        winner,
        winningLine: winningLine ? [...winningLine] : null,
        lastMove: lastMove ? { ...lastMove } : null
      };
    }

    board = createEmptyBoard();
    moves = [];
    redoStack = [];
    gameOver = false;
    winner = null;
    winningLine = null;

    // Đặt 4 quân X ở hàng giữa (hàng 9, tính 0-indexed; tức hàng 10 theo 1-19)
    // 4 quân X tại cột 8, 9, 10, 11 (2 đầu cột 7 và 12 đều trống)
    const midRow = 9;
    const cols = [8, 9, 10, 11];

    cols.forEach(c => {
      board[midRow][c] = 'X';
      moves.push({ x: c, y: midRow, side: 'X' });
    });

    lastMove = { x: 11, y: midRow, side: 'X' };
    currentTurn = 'O'; // Lượt kế tiếp là O

    updateButtons();
    renderBoard();
    saveGameState();
    showToast('Đã xếp thế Khai Cuộc Open 4 (Tứ thông)');
  }

  // Reset bàn cờ về trống theo thiết lập hiện tại
  function resetBoardState() {
    board = createEmptyBoard();
    moves = [];
    redoStack = [];
    gameOver = false;
    winner = null;
    winningLine = null;
    lastMove = null;
    selectedPiece = null;

    if (settings.sideSelection === 'player_o') {
      currentTurn = 'O';
    } else {
      currentTurn = 'X';
    }

    sendEngineCmd('START 19');
    sendEngineCmd(`INFO timeout_turn ${settings.difficulty}`);
    sendEngineCmd('INFO timeout_match 100000');

    updateButtons();
    renderBoard();
    saveGameState();

    // Nếu chọn "Bot đi trước", bot sẽ tự động đánh nước đầu tiên!
    if (settings.sideSelection === 'bot_first') {
      setTimeout(() => {
        requestBotMove();
      }, 300);
    }
  }

  // ==========================================================================
  // 9. CHẾ ĐỘ DI CHUYỂN QUÂN: NƯỚC ĐI & ALL (MỤC 4.6 & 4.7)
  // ==========================================================================
  function toggleMoveMode() {
    moveMode = !moveMode;
    if (moveMode) {
      allMoveMode = false;
      btnMoveMode.classList.add('active-mode');
      btnMoveAll.classList.remove('active-all');
      movePad.classList.remove('hidden');
      updateMovePadStatus('Chế độ Nước Đi: Chạm vào 1 quân để chọn');
    } else {
      closeMovePad();
    }
    renderBoard();
  }

  function toggleMoveAll() {
    allMoveMode = !allMoveMode;
    if (allMoveMode) {
      moveMode = true;
      selectedPiece = null;
      btnMoveAll.classList.add('active-all');
      btnMoveMode.classList.add('active-mode');
      movePad.classList.remove('hidden');
      updateMovePadStatus('Chế độ ALL: Bấm mũi tên để di chuyển tất cả quân');
    } else {
      closeMovePad();
    }
    renderBoard();
  }

  function closeMovePad() {
    moveMode = false;
    allMoveMode = false;
    selectedPiece = null;
    btnMoveMode.classList.remove('active-mode');
    btnMoveAll.classList.remove('active-all');
    movePad.classList.add('hidden');
    renderBoard();
  }

  function updateMovePadStatus(txt) {
    if (movePadStatus) movePadStatus.textContent = txt;
  }

  function moveSelectedOrAll(dx, dy) {
    if (allMoveMode) {
      // 4.7 Di chuyển TẤT CẢ quân
      moveAllPieces(dx, dy);
    } else if (selectedPiece) {
      // 4.6 Di chuyển 1 quân đã chọn
      moveSinglePiece(selectedPiece.x, selectedPiece.y, dx, dy);
    } else {
      showToast('Hãy chạm chọn 1 quân trên bàn trước!');
    }
  }

  function moveSinglePiece(sx, sy, dx, dy) {
    const tx = sx + dx;
    const ty = sy + dy;

    // Chỉ di chuyển được khi ô đích còn trống và còn trong bàn
    if (tx < 0 || tx >= BOARD_SIZE || ty < 0 || ty >= BOARD_SIZE) {
      showToast('Không thể di chuyển ra ngoài bàn cờ!');
      return;
    }
    if (board[ty][tx] !== null) {
      showToast('Ô đích đã có quân!');
      return;
    }

    const side = board[sy][sx];
    board[sy][sx] = null;
    board[ty][tx] = side;

    // Cập nhật vị trí quân trong moves
    for (let i = moves.length - 1; i >= 0; i--) {
      if (moves[i].x === sx && moves[i].y === sy) {
        moves[i].x = tx;
        moves[i].y = ty;
        break;
      }
    }

    selectedPiece = { x: tx, y: ty };
    lastMove = { x: tx, y: ty, side };
    redoStack = []; // Di chuyển quân reset redo

    updateMovePadStatus(`Đang chọn quân ${side} tại (${tx + 1}, ${ty + 1})`);
    playMoveSound();
    triggerVibrate();
    updateButtons();
    renderBoard();
    saveGameState();
  }

  function moveAllPieces(dx, dy) {
    // Thu thập tất cả quân trên bàn
    const pieces = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (board[y][x]) {
          pieces.push({ x, y, side: board[y][x] });
        }
      }
    }

    if (pieces.length === 0) {
      showToast('Bàn cờ chưa có quân nào để di chuyển!');
      return;
    }

    // Kiểm tra xem mọi ô đích có nằm trong bàn cờ không
    for (let i = 0; i < pieces.length; i++) {
      const nx = pieces[i].x + dx;
      const ny = pieces[i].y + dy;
      if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
        showToast('Có quân bị chạm mép bàn cờ, không thể di chuyển!');
        return;
      }
    }

    // Thực hiện dịch chuyển đồng loạt
    const newBoard = createEmptyBoard();
    pieces.forEach(p => {
      newBoard[p.y + dy][p.x + dx] = p.side;
    });
    board = newBoard;

    // Cập nhật tọa độ trong moves & lastMove
    moves.forEach(m => {
      m.x += dx;
      m.y += dy;
    });

    if (lastMove) {
      lastMove.x += dx;
      lastMove.y += dy;
    }

    redoStack = [];
    playMoveSound();
    triggerVibrate();
    updateButtons();
    renderBoard();
    saveGameState();
  }

  // ==========================================================================
  // 10. VẼ BÀN CỜ CANVAS (MỤC 3.3)
  // ==========================================================================
  const INTERNAL_SIZE = 760; // Độ phân giải vẽ canvas nội bộ siêu sắc nét

  function resizeCanvas() {
    boardCanvas.width = INTERNAL_SIZE;
    boardCanvas.height = INTERNAL_SIZE;
  }

  function renderBoard() {
    ctx.clearRect(0, 0, INTERNAL_SIZE, INTERNAL_SIZE);

    // Nền bàn cờ đen
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, INTERNAL_SIZE, INTERNAL_SIZE);

    const margin = settings.showCoords ? 34 : 20;
    const gridSpan = INTERNAL_SIZE - margin * 2;
    const cellSize = gridSpan / (BOARD_SIZE - 1);

    // 1. Tọa độ bàn cờ (nếu bật)
    if (settings.showCoords) {
      ctx.fillStyle = '#78849e';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'];

      for (let i = 0; i < BOARD_SIZE; i++) {
        const x = margin + i * cellSize;
        const y = margin + i * cellSize;

        // Cột (A..S) mép trên và dưới
        ctx.fillText(colLetters[i], x, 14);
        ctx.fillText(colLetters[i], x, INTERNAL_SIZE - 14);

        // Hàng (1..19) mép trái và phải
        const rowNum = String(i + 1);
        ctx.fillText(rowNum, 14, y);
        ctx.fillText(rowNum, INTERNAL_SIZE - 14, y);
      }
    }

    // 2. Lưới bàn cờ 19x19
    ctx.strokeStyle = '#222836';
    ctx.lineWidth = 1.2;

    for (let i = 0; i < BOARD_SIZE; i++) {
      const pos = margin + i * cellSize;

      // Đường dọc
      ctx.beginPath();
      ctx.moveTo(pos, margin);
      ctx.lineTo(pos, margin + gridSpan);
      ctx.stroke();

      // Đường ngang
      ctx.beginPath();
      ctx.moveTo(margin, pos);
      ctx.lineTo(margin + gridSpan, pos);
      ctx.stroke();
    }

    // Khung viền ngoài của lưới
    ctx.strokeStyle = '#323a4d';
    ctx.lineWidth = 2.2;
    ctx.strokeRect(margin, margin, gridSpan, gridSpan);

    // 3. Các điểm sao (Star points - Mục 3.3)
    // 8 điểm sao chuẩn + 1 điểm trung tâm to rõ tại (10, 10) tức index 9, 9
    const starIndices = [
      [3, 3], [3, 9], [3, 15],
      [9, 3],         [9, 15],
      [15, 3], [15, 9], [15, 15]
    ];

    // Vẽ 8 điểm sao
    ctx.fillStyle = '#8b949e';
    starIndices.forEach(([c, r]) => {
      const sx = margin + c * cellSize;
      const sy = margin + r * cellSize;
      ctx.beginPath();
      ctx.arc(sx, sy, 3.8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Vẽ điểm trung tâm (hàng 10, cột 10) to rõ
    const centerX = margin + 9 * cellSize;
    const centerY = margin + 9 * cellSize;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Quân cờ X và O (to rõ)
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = board[r][c];
        if (piece) {
          const px = margin + c * cellSize;
          const py = margin + r * cellSize;
          drawPiece(piece, px, py, cellSize);
        }
      }
    }

    // 5. Vòng xanh quân được chọn (Mục 4.6)
    if (selectedPiece && board[selectedPiece.y][selectedPiece.x]) {
      const sx = margin + selectedPiece.x * cellSize;
      const sy = margin + selectedPiece.y * cellSize;

      ctx.save();
      ctx.strokeStyle = '#00e676';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#00e676';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(sx, sy, cellSize * 0.46, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 6. Dấu nước đi cuối (Mục 3.3)
    if (settings.showLastMove && lastMove && board[lastMove.y][lastMove.x]) {
      const lx = margin + lastMove.x * cellSize;
      const ly = margin + lastMove.y * cellSize;

      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Hiệu ứng chuỗi thắng (Winning Line)
    if (winningLine && winningLine.length >= 5) {
      ctx.save();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      const first = winningLine[0];
      ctx.moveTo(margin + first.x * cellSize, margin + first.y * cellSize);

      for (let i = 1; i < winningLine.length; i++) {
        const pt = winningLine[i];
        ctx.lineTo(margin + pt.x * cellSize, margin + pt.y * cellSize);
      }
      ctx.stroke();

      // Vẽ vòng tròn phát sáng quanh mỗi quân trong chuỗi thắng
      winningLine.forEach(pt => {
        const wx = margin + pt.x * cellSize;
        const wy = margin + pt.y * cellSize;
        ctx.beginPath();
        ctx.arc(wx, wy, cellSize * 0.44, 0, Math.PI * 2);
        ctx.stroke();
      });

      ctx.restore();
    }
  }

  function drawPiece(side, px, py, cellSize) {
    const radius = cellSize * 0.38;

    if (side === 'X') {
      // Chữ X đỏ tươi, nét to rõ
      ctx.save();
      ctx.strokeStyle = '#ff4d4f';
      ctx.lineWidth = cellSize * 0.16;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(px - radius, py - radius);
      ctx.lineTo(px + radius, py + radius);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(px + radius, py - radius);
      ctx.lineTo(px - radius, py + radius);
      ctx.stroke();

      ctx.restore();
    } else if (side === 'O') {
      // Chữ O xanh dương tươi, nét to rõ
      ctx.save();
      ctx.strokeStyle = '#388bfd';
      ctx.lineWidth = cellSize * 0.16;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }
  }

  // ==========================================================================
  // 11. ZOOM & PAN BÀN CỜ (MỤC 3.3)
  // ==========================================================================
  function updateViewportTransform() {
    boardViewport.style.transform = `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`;
    if (zoomLevelText) {
      zoomLevelText.textContent = `${zoomLevel.toFixed(1)}x`;
    }
  }

  function setZoom(val) {
    const clamped = Math.min(3.0, Math.max(1.0, val));
    zoomLevel = Math.round(clamped * 10) / 10;
    if (zoomLevel === 1.0) {
      panX = 0;
      panY = 0;
    }
    updateViewportTransform();
  }

  function resetZoom() {
    zoomLevel = 1.0;
    panX = 0;
    panY = 0;
    updateViewportTransform();
  }

  // ==========================================================================
  // 12. XỬ LÝ CHẠM BÀN CỜ: TAP, PINCH & PAN (MOBILE-FIRST)
  // ==========================================================================
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragInitialPanX = 0;
  let dragInitialPanY = 0;
  let hasMoved = false;

  let pinchInitialDist = 0;
  let pinchInitialZoom = 1.0;

  let lastTapTime = 0;
  let lastTapX = 0;
  let lastTapY = 0;

  function handleBoardClick(clientX, clientY) {
    const rect = boardCanvas.getBoundingClientRect();
    const margin = settings.showCoords ? 34 : 20;
    const gridSpan = INTERNAL_SIZE - margin * 2;
    const cellSize = gridSpan / (BOARD_SIZE - 1);

    // Quy đổi tọa độ click màn hình sang tọa độ nội bộ canvas
    const scaleX = INTERNAL_SIZE / rect.width;
    const scaleY = INTERNAL_SIZE / rect.height;

    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;

    // Tìm giao điểm gần nhất
    const col = Math.round((canvasX - margin) / cellSize);
    const row = Math.round((canvasY - margin) / cellSize);

    // Kiểm tra phạm vi
    if (col < 0 || col >= BOARD_SIZE || row < 0 || row >= BOARD_SIZE) return;

    const ptX = margin + col * cellSize;
    const ptY = margin + row * cellSize;
    const dist = Math.hypot(canvasX - ptX, canvasY - ptY);

    if (dist > cellSize * 0.58) return; // Nhấp quá xa giao điểm

    // Nếu đang ở chế độ Nước Đi
    if (moveMode && !allMoveMode) {
      if (board[row][col] !== null) {
        if (selectedPiece && selectedPiece.x === col && selectedPiece.y === row) {
          // Bấm lại vào quân đó: hủy chọn
          selectedPiece = null;
          updateMovePadStatus('Chế độ Nước Đi: Chạm vào 1 quân để chọn');
        } else {
          // Chọn quân này
          selectedPiece = { x: col, y: row };
          updateMovePadStatus(`Đang chọn quân ${board[row][col]} tại (${col + 1}, ${row + 1})`);
        }
        renderBoard();
      }
      return;
    }

    // Chế độ chơi bình thường: đặt quân
    if (board[row][col] === null && !gameOver && !isThinking) {
      applyMove(col, row, currentTurn, false);
    }
  }

  // Pointer & Touch Events
  boardCanvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      // Pinch 2 ngón
      pinchInitialDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchInitialZoom = zoomLevel;
      isDragging = false;
    } else if (e.touches.length === 1) {
      isDragging = true;
      hasMoved = false;
      dragStartX = e.touches[0].clientX;
      dragStartY = e.touches[0].clientY;
      dragInitialPanX = panX;
      dragInitialPanY = panY;
    }
  }, { passive: false });

  boardCanvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (pinchInitialDist > 10) {
        const factor = currentDist / pinchInitialDist;
        setZoom(pinchInitialZoom * factor);
      }
    } else if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartX;
      const dy = e.touches[0].clientY - dragStartY;

      if (Math.hypot(dx, dy) > 8) {
        hasMoved = true;
        if (zoomLevel > 1.0) {
          e.preventDefault();
          // Pan bàn cờ
          panX = dragInitialPanX + dx / zoomLevel;
          panY = dragInitialPanY + dy / zoomLevel;
          updateViewportTransform();
        }
      }
    }
  }, { passive: false });

  boardCanvas.addEventListener('touchend', (e) => {
    if (!hasMoved && e.changedTouches.length > 0) {
      const t = e.changedTouches[0];
      const now = Date.now();
      const timeDiff = now - lastTapTime;
      const distFromLastTap = Math.hypot(t.clientX - lastTapX, t.clientY - lastTapY);

      // Double-tap để bật/tắt zoom 2x (Mục 3.3)
      if (timeDiff < 320 && distFromLastTap < 25) {
        if (zoomLevel > 1.2) {
          resetZoom();
        } else {
          setZoom(2.0);
        }
        lastTapTime = 0;
      } else {
        lastTapTime = now;
        lastTapX = t.clientX;
        lastTapY = t.clientY;
        handleBoardClick(t.clientX, t.clientY);
      }
    }
    isDragging = false;
  });

  // Desktop Mouse Support
  boardCanvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    hasMoved = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragInitialPanX = panX;
    dragInitialPanY = panY;
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      if (Math.hypot(dx, dy) > 6) {
        hasMoved = true;
        if (zoomLevel > 1.0) {
          panX = dragInitialPanX + dx / zoomLevel;
          panY = dragInitialPanY + dy / zoomLevel;
          updateViewportTransform();
        }
      }
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (isDragging && !hasMoved) {
      handleBoardClick(e.clientX, e.clientY);
    }
    isDragging = false;
  });

  // ==========================================================================
  // 13. ÂM THANH & RUNG (MỤC 3.2)
  // ==========================================================================
  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) audioCtx = new AudioCtxClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playMoveSound() {
    if (!settings.sound) return;
    try {
      const ac = getAudioContext();
      if (!ac) return;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ac.currentTime + 0.06);
      gain.gain.setValueAtTime(0.25, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + 0.06);
    } catch (e) {}
  }

  function playWinSound() {
    if (!settings.sound) return;
    try {
      const ac = getAudioContext();
      if (!ac) return;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const startTime = ac.currentTime + idx * 0.09;
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.28);
      });
    } catch (e) {}
  }

  function playLoseSound() {
    if (!settings.sound) return;
    try {
      const ac = getAudioContext();
      if (!ac) return;
      const notes = [400, 320, 250, 180];
      notes.forEach((freq, idx) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        const startTime = ac.currentTime + idx * 0.1;
        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.26);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.26);
      });
    } catch (e) {}
  }

  function triggerVibrate() {
    if (settings.vibrate && navigator.vibrate) {
      try {
        navigator.vibrate(30);
      } catch (e) {}
    }
  }

  // Toast Notification
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('hidden');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2400);
  }

  // ==========================================================================
  // 14. LẮNG NGHE SỰ KIỆN UI
  // ==========================================================================
  function setupEventListeners() {
    // Navigation
    btnStartGame.addEventListener('click', () => {
      showScreen(screenGame);
      // Nếu là ván hoàn toàn mới và cài đặt là Bot đi trước
      if (moves.length === 0 && settings.sideSelection === 'bot_first') {
        requestBotMove();
      }
    });

    btnOpenSettings.addEventListener('click', () => {
      showScreen(screenSettings);
    });

    btnSettingsBack.addEventListener('click', () => {
      showScreen(screenHome);
    });

    btnGameHome.addEventListener('click', () => {
      showScreen(screenHome);
    });

    btnGameSettings.addEventListener('click', () => {
      showScreen(screenSettings);
    });

    // Settings Controls
    diffButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        settings.difficulty = Number(btn.dataset.diff);
        saveSettings();
        // Cập nhật ngay tới engine nếu đã sẵn sàng (Mục 6)
        if (engineReady) {
          sendEngineCmd(`INFO timeout_turn ${settings.difficulty}`);
        }
      });
    });

    sideButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        sideButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        settings.sideSelection = btn.dataset.side;
        saveSettings();
      });
    });

    toggleSound.addEventListener('change', (e) => {
      settings.sound = e.target.checked;
      saveSettings();
    });

    toggleVibrate.addEventListener('change', (e) => {
      settings.vibrate = e.target.checked;
      saveSettings();
    });

    toggleCoords.addEventListener('change', (e) => {
      settings.showCoords = e.target.checked;
      saveSettings();
      renderBoard();
    });

    toggleLastMove.addEventListener('change', (e) => {
      settings.showLastMove = e.target.checked;
      saveSettings();
      renderBoard();
    });

    btnSaveSettings.addEventListener('click', () => {
      saveSettings();
      showToast('Đã lưu cài đặt');
      showScreen(screenGame);
    });

    // Zoom Controls
    btnZoomIn.addEventListener('click', () => setZoom(zoomLevel + 0.5));
    btnZoomOut.addEventListener('click', () => setZoom(zoomLevel - 0.5));
    btnZoomReset.addEventListener('click', resetZoom);

    // Toolbar Buttons (Mục 4)
    btnNewPage.addEventListener('click', actionNewPage);
    btnRestoreNewPage.addEventListener('click', actionRestoreNewPage);
    btnUndoAll.addEventListener('click', actionUndoAll);
    btnRedoAll.addEventListener('click', actionRedoAll);
    btnUndoOne.addEventListener('click', actionUndoOne);
    btnRedoOne.addEventListener('click', actionRedoOne);
    btnPlay.addEventListener('click', actionPlayBot);
    btnOpen4.addEventListener('click', actionOpen4);

    // Move Mode Buttons (4.6 & 4.7)
    btnMoveMode.addEventListener('click', toggleMoveMode);
    btnMoveAll.addEventListener('click', toggleMoveAll);
    btnCloseMovePad.addEventListener('click', closeMovePad);

    btnMoveUp.addEventListener('click', () => moveSelectedOrAll(0, -1));
    btnMoveDown.addEventListener('click', () => moveSelectedOrAll(0, 1));
    btnMoveLeft.addEventListener('click', () => moveSelectedOrAll(-1, 0));
    btnMoveRight.addEventListener('click', () => moveSelectedOrAll(1, 0));

    // Modal Game Over Buttons
    btnPlayAgain.addEventListener('click', () => {
      modalGameOver.classList.add('hidden');
      resetBoardState();
    });

    btnViewBoard.addEventListener('click', () => {
      modalGameOver.classList.add('hidden');
    });

    btnModalHome.addEventListener('click', () => {
      modalGameOver.classList.add('hidden');
      showScreen(screenHome);
    });

    // Window Resize
    window.addEventListener('resize', () => {
      renderBoard();
    });
  }

  // ==========================================================================
  // 15. BOOTSTRAP APP
  // ==========================================================================
  function initApp() {
    loadPersistedData();
    resizeCanvas();
    setupEventListeners();
    updateButtons();
    renderBoard();
    initEngineWorker();
  }

  // Khởi động khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
