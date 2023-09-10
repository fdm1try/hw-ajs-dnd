import BoardCard from './BoardCard';
import BoardColumn from './BoardColumn';

export default class Board {
  #draggedCard;

  #columns;

  constructor(container) {
    this.#columns = [];
    this.container = container;

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onColumnChange = this.onColumnChange.bind(this);

    this.cardPlaceholder = document.createElement('div');
    this.cardPlaceholder.classList.add('board-card-placeholder');

    this.registerEvents();
  }

  static get markup() {
    return `
      <div class="board">
      </div>
    `;
  }

  static get selector() {
    return '.board';
  }

  static get selectorCardPlaceholder() {
    return '.board-card-placeholder';
  }

  addColumn(title) {
    const column = new BoardColumn(title);
    this.#columns.push(column);
    return column;
  }

  render() {
    this.container.innerHTML = Board.markup;
    const board = this.container.querySelector(Board.selector);
    for (const column of this.#columns) {
      board.appendChild(column.container);
      column.addCardListChangeListener(this.onColumnChange);
    }
  }

  loadState() {
    const prevColumns = this.#columns;
    try {
      const data = JSON.parse(localStorage.getItem('board-state'));
      this.#columns = [];
      for (const columnData of data.columns) {
        const column = this.addColumn(columnData.title);
        for (const cardData of columnData.cards) {
          column.addCard(new BoardCard(cardData.title));
        }
      }
      this.render();
      return true;
    } catch (e) {
      this.#columns = prevColumns;
      this.render();
      console.error(new Error(`Can not load board state. ${e}`));
      return false;
    }
  }

  saveState() {
    const columns = [];
    for (const column of this.#columns) {
      const cards = column.allCards.map((card) => ({ title: card.title }));
      columns.push({ title: column.title, cards });
    }
    const data = { columns };
    try {
      localStorage.setItem('board-state', JSON.stringify(data));
      return true;
    } catch (e) {
      console.error(new Error(`Can't save state. ${e}`));
      return false;
    }
  }

  registerEvents() {
    this.container.addEventListener('mousedown', this.onMouseDown);
    this.container.addEventListener('mouseup', this.onMouseUp);
    this.container.addEventListener('mousemove', this.onMouseMove);
  }

  onMouseDown(event) {
    const cardEl = event.target.closest(BoardCard.selector);
    if (cardEl) {
      const columnEl = cardEl.closest(BoardColumn.selector);
      const column = this.#columns.find((item) => item.container === columnEl);
      const card = column.allCards.find((item) => item.container === cardEl);
      if (!card) return;
      this.dragTimeout = setTimeout(this.onDragStart.bind(this, card), 300);
    }
  }

  onMouseUp() {
    if (this.dragTimeout) {
      clearTimeout(this.dragTimeout);
      return;
    }
    if (this.#draggedCard) {
      this.onDragEnd();
    }
  }

  onMouseMove(event) {
    if (this.dragTimeout) {
      clearTimeout(this.dragTimeout);
      this.dragTimeout = null;
    }
    const { pageX, pageY } = event;
    if (this.#draggedCard) {
      const pageXOffset = pageX - this.mousePosition.pageX;
      const pageYOffset = pageY - this.mousePosition.pageY;
      this.onDrag(pageXOffset, pageYOffset);
    }
    this.mousePosition = { pageX, pageY };
  }

  onDrag(pageXOffset, pageYOffset) {
    const { offsetTop, offsetLeft, offsetWidth } = this.#draggedCard.container;
    this.#draggedCard.container.style.top = `${offsetTop + pageYOffset}px`;
    this.#draggedCard.container.style.left = `${offsetLeft + pageXOffset}px`;
    const column = this.#columns.find((item) => {
      const left = item.container.offsetLeft;
      const width = item.container.offsetWidth;
      return offsetLeft + (offsetWidth / 2) < left + width;
    });
    if (!column) return;
    if (!column.cardCount) {
      column.cardsListEl.appendChild(this.cardPlaceholder);
      return;
    }
    const cards = column.allCards;
    for (let i = 0; i < column.cardCount; i += 1) {
      const card = cards[i];
      const top = card.container.offsetTop;
      const height = card.container.offsetHeight;
      const center = top + (height / 2);
      const { pageY } = this.mousePosition;
      if (top < pageY && top + height > pageY) {
        if (pageY < center) {
          column.cardsListEl.insertBefore(this.cardPlaceholder, card.container);
        } else if (i + 1 >= column.cardCount) {
          column.cardsListEl.appendChild(this.cardPlaceholder);
        } else {
          const nextEl = cards[i + 1].container;
          column.cardsListEl.insertBefore(this.cardPlaceholder, nextEl);
        }
        return;
      }
    }
  }

  onDragStart(card) {
    this.dragTimeout = null;
    this.container.classList.add('dragging');
    const { offsetWidth, offsetHeight } = card.container;
    this.#draggedCard = card;
    const cardEl = card.container;
    cardEl.style.width = `${offsetWidth}px`;
    cardEl.style.height = `${offsetHeight}px`;
    const columnEl = cardEl.closest(BoardColumn.selector);
    const column = this.#columns.find((item) => item.container === columnEl);
    column.drag(card);
    const cardsList = columnEl.querySelector(BoardColumn.selectorCardsList);
    this.cardPlaceholder.style.width = `${offsetWidth}px`;
    this.cardPlaceholder.style.height = `${offsetHeight}px`;
    const { offsetTop, offsetLeft } = cardEl;
    cardEl.style.top = `${offsetTop}px`;
    cardEl.style.left = `${offsetLeft}px`;
    cardEl.classList.add('dragged');
    cardsList.insertBefore(this.cardPlaceholder, cardEl);
  }

  onDragEnd() {
    this.container.classList.remove('dragging');
    const card = this.#draggedCard;
    const cardEl = card.container;
    cardEl.style.top = 0;
    cardEl.style.left = 0;
    this.#draggedCard = null;
    card.container.classList.remove('dragged');
    this.cardPlaceholder.replaceWith(card.container);
    const columnEl = card.container.closest(BoardColumn.selector);
    const column = this.#columns.find((item) => item.container === columnEl);
    column.drop(card);
    this.saveState();
  }

  onColumnChange() {
    this.saveState();
  }
}
