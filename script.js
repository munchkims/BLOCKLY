// Инициализация Blockly
let workspace;
let character = document.getElementById('character');
let positionX = 50; // Позиция по горизонтали
let positionY = 50; // Позиция по вертикали

// Функция для загрузки Blockly
window.onload = function() {
  workspace = Blockly.inject('blocklyDiv', {
    toolbox: `
      <xml>
        <block type="move_forward"></block>
        <block type="turn_left"></block>
        <block type="logic_if"></block>
        <block type="text"></block>
        <block type="controls_repeat"></block>
      </xml>`
  });

  // Создание блоков для простых заданий
  Blockly.defineBlocksWithJsonArray([
    {
      "type": "move_forward",
      "message0": "двигаться вперед",
      "previousStatement": null,
      "nextStatement": null,
      "colour": 160,
      "tooltip": "Двигает персонажа вперед",
      "helpUrl": ""
    },
    {
      "type": "turn_left",
      "message0": "поворот налево",
      "previousStatement": null,
      "nextStatement": null,
      "colour": 160,
      "tooltip": "Поворачивает персонажа налево",
      "helpUrl": ""
    },
    {
      "type": "logic_if",
      "message0": "если %1 тогда %2",
      "args0": [
        {
          "type": "input_value",
          "name": "BOOL",
          "check": "Boolean"
        },
        {
          "type": "input_statement",
          "name": "DO"
        }
      ],
      "colour": 210,
      "tooltip": "Выполняет действия, если условие истинно",
      "helpUrl": ""
    }
  ]);

  // Старт игры
  document.getElementById('startButton').addEventListener('click', function() {
    // Скрываем стартовый оверлей и показываем контейнер с игрой
    document.getElementById('startOverlay').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    // Запускаем игру
    startGame();
  });

  // Функция для запуска игры
  function startGame() {
    // Пример выполнения решения
    const code = Blockly.JavaScript.workspaceToCode(workspace);
    if (code) {
      executeCode(code);
    }
  }

  // Выполнение сгенерированного кода
  function executeCode(code) {
    // Очищаем все предыдущие действия
    resetCharacterPosition();

    // Преобразуем полученный код в исполнение
    let func = new Function(code);
    func();  // Выполняем сгенерированный код

    checkVictory();
  }

  // Функции для движения и поворота персонажа
  function moveForward() {
    positionX += 10;
    character.style.left = positionX + '%';
  }

  function turnLeft() {
    positionY += 10;
    character.style.top = positionY + '%';
  }

  // Функция проверки победы
  function checkVictory() {
    if (positionX > 90 && positionY > 90) {
      showVictory();
    }
  }

  // Функция для победы
  function showVictory() {
    document.getElementById('victoryOverlay').style.display = 'block';
  }

  // Закрытие окна победы
  document.getElementById('closeVictory').addEventListener('click', function() {
    document.getElementById('victoryOverlay').style.display = 'none';
    document.getElementById('startOverlay').style.display = 'block';
  });

  // Сброс позиции персонажа
  function resetCharacterPosition() {
    positionX = 50;
    positionY = 50;
    character.style.left = positionX + '%';
    character.style.top = positionY + '%';
  }
};
