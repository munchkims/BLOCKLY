/* script.js */

// Флаг, показывающий, были ли вызваны функции-управления (т.е. сгенерированные команды реально добавлены)
var executedCommands = false;

// ============================
// 1. Определяем пользовательские блоки для управления героем
// ============================
Blockly.defineBlocksWithJsonArray([
  {
    "type": "move_up",
    "message0": "вверх",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "Движение вверх",
    "helpUrl": ""
  },
  {
    "type": "move_down",
    "message0": "вниз",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "Движение вниз",
    "helpUrl": ""
  },
  {
    "type": "move_left",
    "message0": "влево",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "Движение влево",
    "helpUrl": ""
  },
  {
    "type": "move_right",
    "message0": "вправо",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "Движение вправо",
    "helpUrl": ""
  },
  {
    "type": "collect",
    "message0": "собрать",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "Собрать кристалл",
    "helpUrl": ""
  }
]);

// Генерация кода для пользовательских блоков
Blockly.JavaScript['move_up'] = function(block) {
  return 'moveUp();\n';
};
Blockly.JavaScript['move_down'] = function(block) {
  return 'moveDown();\n';
};
Blockly.JavaScript['move_left'] = function(block) {
  return 'moveLeft();\n';
};
Blockly.JavaScript['move_right'] = function(block) {
  return 'moveRight();\n';
};
Blockly.JavaScript['collect'] = function(block) {
  return 'collectCrystal();\n';
};

// ============================
// 2. Инициализация Blockly
// ============================
var toolbox = `<xml>
  <block type="move_up"></block>
  <block type="move_down"></block>
  <block type="move_left"></block>
  <block type="move_right"></block>
  <block type="collect"></block>
  <block type="controls_repeat_ext"></block>
</xml>`;

var workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolbox,
  trashcan: true
});

// ============================
// 3. Игровая логика и переменные
// ============================

// Получаем canvas и его контекст
var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

// Задаём размер сетки (количество ячеек по горизонтали и вертикали)
var gridSize = 5;
var cellSize = canvas.width / gridSize;

// Состояние игры: положение героя и кристаллов
var gameState = {
  hero: { x: 0, y: 0 },
  crystals: []
};

// Очередь команд – команды добавляются функциями-обработчиками
var commandQueue = [];

// Массив задач – 10 простых заданий, где герой должен ходить и собирать кристаллы
var tasks = [
  {
    description: "Перемести героя вправо, чтобы собрать кристалл.",
    heroStart: { x: 0, y: 0 },
    crystals: [{ x: 1, y: 0 }]
  },
  {
    description: "Перемести героя вниз, чтобы собрать кристалл.",
    heroStart: { x: 0, y: 0 },
    crystals: [{ x: 0, y: 1 }]
  },
  {
    description: "Перемести героя влево, чтобы собрать кристалл.",
    heroStart: { x: 1, y: 0 },
    crystals: [{ x: 0, y: 0 }]
  },
  {
    description: "Перемести героя вверх, чтобы собрать кристалл.",
    heroStart: { x: 0, y: 1 },
    crystals: [{ x: 0, y: 0 }]
  },
  {
    description: "Собери два кристалла: сначала вправо, затем вниз.",
    heroStart: { x: 0, y: 0 },
    crystals: [{ x: 1, y: 0 }, { x: 1, y: 1 }]
  },
  {
    description: "Собери два кристалла: сначала влево, затем вверх.",
    heroStart: { x: 1, y: 1 },
    crystals: [{ x: 0, y: 1 }, { x: 1, y: 0 }]
  },
  {
    description: "Собери два кристалла: перемести героя вниз и вправо.",
    heroStart: { x: 0, y: 0 },
    crystals: [{ x: 0, y: 2 }, { x: 2, y: 0 }]
  },
  {
    description: "Собери два кристалла: перемести героя вверх и влево.",
    heroStart: { x: 2, y: 2 },
    crystals: [{ x: 2, y: 0 }, { x: 0, y: 2 }]
  },
  {
    description: "Собери три кристалла вокруг героя.",
    heroStart: { x: 0, y: 0 },
    crystals: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }]
  },
  {
    description: "Собери все кристаллы, перемещаясь по кругу.",
    heroStart: { x: 2, y: 2 },
    crystals: [{ x: 1, y: 2 }, { x: 2, y: 1 }, { x: 3, y: 2 }, { x: 2, y: 3 }]
  }
];

var currentTaskIndex = 0;

// Функция загрузки задачи: задаёт положение героя и кристаллов, обновляет описание задачи
function loadTask(index) {
  if (index < 0 || index >= tasks.length) return;
  var task = tasks[index];
  gameState.hero = { x: task.heroStart.x, y: task.heroStart.y };
  gameState.crystals = task.crystals.map(function(crystal) {
    return { x: crystal.x, y: crystal.y };
  });
  drawGame();
  document.getElementById('taskDisplay').textContent =
    "Задача " + (index + 1) + ": " + task.description;
}

// ============================
// 4. Отрисовка игрового поля с улучшенным фоном
// ============================
function drawGame() {
  // Улучшенный фон: градиент от светло-голубого к белому
  var gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#a1c4fd");
  gradient.addColorStop(1, "#c2e9fb");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Рисуем сетку
  ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
  for (let i = 0; i <= gridSize; i++) {
    // Вертикальные линии
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, canvas.height);
    ctx.stroke();
    // Горизонтальные линии
    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(canvas.width, i * cellSize);
    ctx.stroke();
  }
  
  // Рисуем кристаллы
  gameState.crystals.forEach(function(crystal) {
    drawCrystal(crystal.x, crystal.y);
  });
  
  // Рисуем героя
  drawHero(gameState.hero.x, gameState.hero.y);
}

function drawHero(x, y) {
  // Герой в виде круга с небольшим "блеском"
  var centerX = x * cellSize + cellSize / 2;
  var centerY = y * cellSize + cellSize / 2;
  var radius = cellSize * 0.3;
  
  // Тень
  ctx.beginPath();
  ctx.arc(centerX + 3, centerY + 3, radius, 0, 2 * Math.PI);
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fill();
  
  // Основной круг
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fillStyle = "#FF5722";
  ctx.fill();
  
  // Блик
  ctx.beginPath();
  ctx.arc(centerX - radius/3, centerY - radius/3, radius/4, 0, 2 * Math.PI);
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.fill();
}

function drawCrystal(x, y) {
  // Кристалл в виде простого круга
  var centerX = x * cellSize + cellSize / 2;
  var centerY = y * cellSize + cellSize / 2;
  var radius = cellSize * 0.2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fillStyle = "#FFC107";
  ctx.fill();
}

// ============================
// 5. Функции управления: добавляют команды в очередь  
// (при каждом вызове устанавливаем executedCommands в true)
// ============================
function moveUp() {
  executedCommands = true;
  commandQueue.push({ command: "moveUp" });
}
function moveDown() {
  executedCommands = true;
  commandQueue.push({ command: "moveDown" });
}
function moveLeft() {
  executedCommands = true;
  commandQueue.push({ command: "moveLeft" });
}
function moveRight() {
  executedCommands = true;
  commandQueue.push({ command: "moveRight" });
}
function collectCrystal() {
  executedCommands = true;
  commandQueue.push({ command: "collectCrystal" });
}

// Обработка одной команды с анимацией
function processCommand(cmd, callback) {
  if (cmd.command === "moveUp") {
    if (gameState.hero.y > 0) gameState.hero.y -= 1;
  } else if (cmd.command === "moveDown") {
    if (gameState.hero.y < gridSize - 1) gameState.hero.y += 1;
  } else if (cmd.command === "moveLeft") {
    if (gameState.hero.x > 0) gameState.hero.x -= 1;
  } else if (cmd.command === "moveRight") {
    if (gameState.hero.x < gridSize - 1) gameState.hero.x += 1;
  } else if (cmd.command === "collectCrystal") {
    // Если герой находится на ячейке с кристаллом – удаляем кристалл
    for (let i = 0; i < gameState.crystals.length; i++) {
      if (gameState.crystals[i].x === gameState.hero.x &&
          gameState.crystals[i].y === gameState.hero.y) {
        gameState.crystals.splice(i, 1);
        break;
      }
    }
  }
  drawGame();
  setTimeout(callback, 300);
}

// Последовательное выполнение команд из очереди
function runCommands() {
  if (commandQueue.length === 0) {
    // Если ни одна команда не была выполнена, выдаём сообщение об ошибке
    checkTaskCompletion();
    return;
  }
  var cmd = commandQueue.shift();
  processCommand(cmd, runCommands);
}

// Проверка выполнения задачи: если все кристаллы собраны – решение верное
function checkTaskCompletion() {
  if (gameState.crystals.length === 0) {
    alert("Правильно!");
    setTimeout(function() {
      currentTaskIndex = (currentTaskIndex + 1) % tasks.length;
      loadTask(currentTaskIndex);
    }, 500);
  } else {
    alert("Неправильно! Попробуйте снова.");
  }
}

// ============================
// 6. Обработчики событий для кнопок
// ============================
document.getElementById('runButton').addEventListener('click', function() {
  // Сброс флага и очереди команд перед выполнением
  executedCommands = false;
  commandQueue = [];
  
  // Генерируем код из блоков
  var code = Blockly.JavaScript.workspaceToCode(workspace);
  
  // Если код пуст (например, блоки не подключены в цепочку), сразу выдаём сообщение об ошибке
  if (!code.trim()) {
    alert("Неправильно! Попробуйте снова.");
    return;
  }
  
  try {
    var func = new Function(
      'moveUp',
      'moveDown',
      'moveLeft',
      'moveRight',
      'collectCrystal',
      code
    );
    func(moveUp, moveDown, moveLeft, moveRight, collectCrystal);
    
    // Если ни одна команда не была вызвана (executedCommands остался false),
    // то через 300 мс выдаём сообщение об ошибке, иначе запускаем выполнение очереди команд.
    setTimeout(function() {
      if (!executedCommands) {
        alert("Неправильно! Попробуйте снова.");
      } else {
        runCommands();
      }
    }, 300);
  } catch (e) {
    alert("Ошибка выполнения: " + e);
  }
});

document.getElementById('nextTaskButton').addEventListener('click', function() {
  currentTaskIndex = (currentTaskIndex + 1) % tasks.length;
  loadTask(currentTaskIndex);
});

// ============================
// 7. Инициализация: загрузка первой задачи
// ============================
loadTask(currentTaskIndex);
