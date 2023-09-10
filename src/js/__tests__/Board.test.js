import Board from '../Board';
import BoardCard from '../BoardCard';
import BoardColumn from '../BoardColumn';

describe('Load and save state tests', () => {
  const boardStateSample = {
    columns: [
      {
        title: 'Column title',
        cards: [
          { title: 'first card' },
          { title: 'second card' },
          { title: 'third card' },
        ],
      },
    ],
  };

  beforeAll(() => {
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem');
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem');
    global.console = {
      ...console,
      error: jest.fn(),
    };
  });

  beforeEach(() => {
    document.body.innerHTML = '<div class="container"></div>';
    jest.clearAllMocks();
  });

  test('Test of successful state saving', () => {
    const container = document.querySelector('.container');
    const cards = boardStateSample.columns[0].cards.map((item) => new BoardCard(item.title));
    const board = new Board(container);
    const column = board.addColumn(boardStateSample.columns[0].title);
    cards.forEach((card) => column.addCard(card));
    const result = board.saveState();
    expect(result).toBeTruthy();
    expect(window.localStorage.setItem).toHaveBeenCalledWith('board-state', JSON.stringify(boardStateSample));
  });

  test('Test of successful loading of the board state', () => {
    const container = document.querySelector('.container');
    const board = new Board(container);
    window.localStorage.setItem('board-state', JSON.stringify(boardStateSample));
    const result = board.loadState();
    expect(result).toBeTruthy();
    expect(window.localStorage.getItem).toHaveBeenCalledWith('board-state');
  });

  test('If the loading of the status failed false will be returned', () => {
    const container = document.querySelector('.container');
    const board = new Board(container);
    window.localStorage.setItem('board-state', '{}');
    const result = board.loadState();
    expect(result).toBeFalsy();
  });
});

describe('Board class unit tests', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div class="container"></div>';
    jest.clearAllMocks();
  });

  test('Board column rendering test', () => {
    const container = document.querySelector('.container');
    const board = new Board(container);
    board.addColumn('');
    board.render();
    const column = container.querySelector(BoardColumn.selector);
    expect(column.innerHTML).toBe(BoardColumn.markup);
  });
});

describe('Drag and drop tests', () => {
  let board;
  let column;
  let card;

  const spyOnDragStart = jest.spyOn(Board.prototype, 'onDragStart');
  const spyOnDragEnd = jest.spyOn(Board.prototype, 'onDragEnd');
  const spyOnDrag = jest.spyOn(Board.prototype, 'onDrag');

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '<div class="container"></div>';
    const container = document.querySelector('.container');
    board = new Board(container);
    column = board.addColumn('First column title');
    board.addColumn('Second column title');
    board.addColumn('Third column title');
    board.render();
    card = new BoardCard('card title');
    column.addCard(card);
  });

  test('After the drag of the card, a placeholder appears in place of the card', () => {
    const event = new Event('mousedown');
    Object.defineProperty(event, 'target', { writable: false, value: card.container });
    board.container.dispatchEvent(event);
    jest.runOnlyPendingTimers();
    const cardPlaceholder = board.container.querySelector(Board.selectorCardPlaceholder);
    expect(spyOnDragStart).toHaveBeenCalledWith(card);
    expect(cardPlaceholder).not.toBeNull();
    expect(column.cardsListEl.children[0]).toEqual(cardPlaceholder);
  });

  test('onDragEnd() is not called if you release the mouse button before the drag and drop timer is triggered', () => {
    let event = new Event('mousedown');
    Object.defineProperty(event, 'target', { writable: false, value: card.container });
    board.container.dispatchEvent(event);
    event = new Event('mouseup');
    Object.defineProperty(event, 'target', { writable: false, value: card.container });
    board.container.dispatchEvent(event);
    expect(spyOnDragEnd).not.toHaveBeenCalled();
  });

  jest.useFakeTimers();
  test('After the card drop, onDragEnd is called', () => {
    let event = new Event('mousedown');
    Object.defineProperty(event, 'target', { writable: false, value: card.container });
    board.container.dispatchEvent(event);
    jest.runOnlyPendingTimers();
    event = new Event('mouseup');
    Object.defineProperty(event, 'target', { writable: false, value: card.container });
    board.container.dispatchEvent(event);
    expect(spyOnDragEnd).toHaveBeenCalled();
  });

  jest.useFakeTimers();
  test('onDrag is called at the moment of mouse movement if the card is dragging, information about the mouse coordinate offset is transmitted to it', () => {
    board.mousePosition = { pageX: 15, pageY: 20 };
    let event = new Event('mousedown');
    Object.defineProperty(event, 'target', { writable: false, value: card.container });
    board.container.dispatchEvent(event);
    jest.runOnlyPendingTimers();

    event = new Event('mousemove');
    Object.defineProperty(event, 'target', { writable: false, value: card.container });
    Object.defineProperty(event, 'pageX', { writable: false, value: 50 });
    Object.defineProperty(event, 'pageY', { writable: false, value: 20 });
    board.container.dispatchEvent(event);

    expect(spyOnDrag).toHaveBeenCalledWith(35, 0);
  });
});
