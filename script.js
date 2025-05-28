// Глобальные переменные
const solutionArea = document.getElementById('solution-area');
const runButton = document.getElementById('run-button');
const resetButton = document.getElementById('reset-button');
const gameGrid = document.getElementById('game-grid');
const taskTitle = document.getElementById('task-title');
const taskDescription = document.getElementById('task-description');
const taskNumber = document.getElementById('task-number');
const prevTaskButton = document.getElementById('prev-task');
const nextTaskButton = document.getElementById('next-task');
const overlay = document.getElementById('overlay');
const overlayText = document.getElementById('overlay-text');
const closeOverlay = document.getElementById('close-overlay');

// Оверлей завершения игры
const completionOverlay = document.getElementById('completion-overlay');
const completionTime = document.getElementById('total-time');
const restartGameButton = document.getElementById('restart-game');

// Инициализация игрового поля
const gridSize = 4; // Размер поля
let heroPosition = { x: 0, y: 0 };
let crystals = [];
let currentTask = 1;
let completedTasks = 0; // Счётчик выполненных заданий
let startTime = null; // Время начала игры
let totalTime = 0; // Общее время игры

// Задания
const tasks = [
  { title: 'Task 1', description: 'Gather 1 crystal.', crystals: [{ x: 1, y: 1 }] },
  { title: 'Task 2', description: 'Gather 2 crystals.', crystals: [{ x: 1, y: 1 }, { x: 2, y: 2 }] },
  { title: 'Task 3', description: 'Gather 1 crystal.', crystals: [{ x: 3, y: 3 }] },
  { title: 'Task 4', description: 'Gather 2 crystals.', crystals: [{ x: 0, y: 3 }, { x: 3, y: 0 }] },
  { title: 'Task 5', description: 'Gather 3 crystals.', crystals: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }] },
  { title: 'Task 6', description: 'Gather 2 crystals.', crystals: [{ x: 0, y: 3 }, { x: 3, y: 3 }] },
  { title: 'Task 7', description: 'Gather 3 crystals.', crystals: [{ x: 0, y: 3 }, { x: 1, y: 1 }, { x: 2, y: 2 }] },
  { title: 'Task 8', description: 'Gather 4 crystals.', crystals: [{ x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }] },
  { title: 'Task 9', description: 'Gather 3 crystals.', crystals: [{ x: 0, y: 3 }, { x: 1, y: 2 }, { x: 2, y: 1 }] },
  { title: 'Task 10', description: 'Gather 4 crystals.', crystals: [{ x: 1, y: 2 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }] },
];

// Функция для запуска таймера
function startTimer() {
  startTime = Date.now();
}

// Функция для остановки таймера и расчёта времени
function stopTimer() {
  const endTime = Date.now();
  totalTime = Math.floor((endTime - startTime) / 1000); // Время в секундах
  const minutes = Math.floor(totalTime / 60).toString().padStart(2, '0');
  const seconds = (totalTime % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

// Загрузка задачи
function loadTask(taskIndex) {
  const task = tasks[taskIndex];
  taskTitle.textContent = task.title;
  taskDescription.textContent = task.description;
  crystals = [...task.crystals];
  heroPosition = { x: 0, y: 0 }; // Начальная позиция героя
  createGrid();
  updateTaskNumber();
  solutionArea.innerHTML = ''; // Очистка блоков при переключении задач
}

// Создание игрового поля
function createGrid() {
  gameGrid.innerHTML = '';
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');

      // Если это позиция героя
      if (x === heroPosition.x && y === heroPosition.y) {
        cell.classList.add('hero');
        const heroImage = document.createElement('img');
        heroImage.src = 'https://767416.selcdn.ru/production_kodland_main_public/task_description_materials/d806b48f-c50e-4bf5-b3df-003bf64ea6b0.png'; // Ссылка на изображение героя
        cell.appendChild(heroImage);
      }

      // Если здесь кристалл
      const crystal = crystals.find((c) => c.x === x && c.y === y);
      if (crystal) {
        cell.classList.add('crystal');
      }

      gameGrid.appendChild(cell);
    }
  }
}

// Обновление номера текущей задачи
function updateTaskNumber() {
  taskNumber.textContent = `${currentTask} / ${tasks.length}`;
}

// Drag and Drop
function allowDrop(event) {
  event.preventDefault();
}

function drop(event) {
  event.preventDefault();
  const block = document.querySelector('.dragging');
  if (block) {
    const clone = block.cloneNode(true);
    clone.classList.remove('dragging');
    clone.addEventListener('click', () => clone.remove()); // Удаление по клику на крестик
    solutionArea.appendChild(clone);
  }
}

document.querySelectorAll('.block').forEach((block) => {
  block.addEventListener('dragstart', () => {
    block.classList.add('dragging');
  });

  block.addEventListener('dragend', () => {
    block.classList.remove('dragging');
  });
});

// Выполнение программы
runButton.addEventListener('click', () => {
  heroPosition = { x: 0, y: 0 }; // Сброс героя в начальную позицию
  crystals = [...tasks[currentTask - 1].crystals]; // Восстановление кристаллов
  createGrid(); // Обновление сетки
  const blocks = Array.from(solutionArea.children);

  blocks.forEach((block, index) => {
    setTimeout(() => {
      const action = block.dataset.action;
      if (action === 'moveUp' && heroPosition.y > 0) heroPosition.y--;
      if (action === 'moveDown' && heroPosition.y < gridSize - 1) heroPosition.y++;
      if (action === 'moveLeft' && heroPosition.x > 0) heroPosition.x--;
      if (action === 'moveRight' && heroPosition.x < gridSize - 1) heroPosition.x++;
      if (action === 'collect') {
        const crystalIndex = crystals.findIndex(
          (c) => c.x === heroPosition.x && c.y === heroPosition.y
        );
        if (crystalIndex !== -1) {
          crystals.splice(crystalIndex, 1);
        }
      }
      createGrid();
    }, index * 500); // Задержка для анимации
  });

  // Проверка результата после выполнения всех блоков
  setTimeout(() => {
    overlay.classList.remove('hidden'); // Показываем оверлей

    if (crystals.length === 0) {
      // Все кристаллы собраны
      overlayText.textContent = 'Correct!';
      overlay.classList.add('success'); // Добавляем класс для правильного решения
      overlay.classList.remove('failure'); // Убираем класс для неправильного решения
      completedTasks++; // Увеличиваем счётчик выполненных заданий

      setTimeout(() => {
        if (currentTask < tasks.length) {
          currentTask++;
          loadTask(currentTask - 1);
        } else {
          // Если все задания выполнены
          stopTimer(); // Останавливаем таймер
          completionTime.textContent = stopTimer(); // Показываем время
          completionOverlay.classList.remove('hidden'); // Показываем оверлей завершения
        }
      }, 2000); // Автоматическое переключение на следующее задание
    } else {
      // Не все кристаллы собраны
      overlayText.textContent = 'Incorrect!';
      overlay.classList.add('failure'); // Добавляем класс для неправильного решения
      overlay.classList.remove('success'); // Убираем класс для правильного решения
    }
  }, blocks.length * 500);
});

// Кнопка "Сначала"
resetButton.addEventListener('click', () => {
  solutionArea.innerHTML = '';
  loadTask(currentTask - 1);
});

// Переключение задач
prevTaskButton.addEventListener('click', () => {
  if (currentTask > 1) {
    currentTask--;
    loadTask(currentTask - 1);
  }
});

nextTaskButton.addEventListener('click', () => {
  if (currentTask < tasks.length) {
    currentTask++;
    loadTask(currentTask - 1);
  }
});

// Закрытие оверлея
closeOverlay.addEventListener('click', () => {
  overlay.classList.add('hidden');
  overlay.classList.remove('success', 'failure'); // Сбрасываем классы при закрытии
});

// Кнопка "Начать заново"
restartGameButton.addEventListener('click', () => {
  completedTasks = 0; // Сбрасываем счётчик выполненных заданий
  currentTask = 1; // Возвращаемся к первой задаче
  startTimer(); // Запускаем таймер заново
  loadTask(0); // Загружаем первую задачу
  completionOverlay.classList.add('hidden'); // Скрываем оверлей завершения
});

// Загрузка первой задачи
startTimer(); // Запускаем таймер при старте игры
loadTask(0);
