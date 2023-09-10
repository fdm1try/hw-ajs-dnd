import BoardCard from '../BoardCard';
import BoardColumn from '../BoardColumn';

const spyRemoveCard = jest.spyOn(BoardColumn.prototype, 'removeCard');
const spyOnCardListChange = jest.spyOn(BoardColumn.prototype, 'onCardListChange');
const spyShowNewCardMenu = jest.spyOn(BoardColumn.prototype, 'showNewCardMenu');
const spyHideNewCardMenu = jest.spyOn(BoardColumn.prototype, 'hideNewCardMenu');
const spyOnAddCardReject = jest.spyOn(BoardColumn.prototype, 'onAddCardReject');

describe('BoardColumn class unit tests', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test('BoardColumn rendering test', () => {
    const column = new BoardColumn();
    document.body.appendChild(column.container);
    const columnEl = document.body.querySelector(BoardColumn.selector);
    expect(columnEl.innerHTML).toBe(BoardColumn.markup);
    const columnTitleEl = columnEl.querySelector(BoardColumn.selectorColumnTitle);
    const columnCardsListEl = columnEl.querySelector(BoardColumn.selectorCardsList);
    const columnMenuEl = columnEl.querySelector(BoardColumn.selectorColumnMenu);
    const columnAddCardButtonEl = columnEl.querySelector(BoardColumn.selectorAddCardButton);
    expect(columnTitleEl).not.toBeNull();
    expect(columnCardsListEl).not.toBeNull();
    expect(columnMenuEl).not.toBeNull();
    expect(columnAddCardButtonEl).not.toBeNull();
  });

  test('BoardColumn title test', () => {
    const title = 'Board Column Test Title';
    const column = new BoardColumn(title);
    expect(column.title).toBe(title);
  });

  test('addCard() method should add cards and store them in an ordered list', () => {
    const column = new BoardColumn('Board Column Test Title');
    const cards = ['first', 'second', 'third'].map((item) => new BoardCard(item));
    cards.forEach(column.addCard);
    expect(column.allCards).toEqual(cards);
    expect(column.cardCount).toBe(cards.length);
  });

  test('After deleting a card, it is deleted in the column', () => {
    const column = new BoardColumn('Board Column Test Title');
    const card = new BoardCard('Board card test title');
    column.addCard(card);
    expect(spyOnCardListChange).toHaveBeenCalled();
    card.remove();
    expect(spyRemoveCard).toHaveBeenCalledWith(card);
  });

  test('After clicking the add card button, a context menu appears to confirm', () => {
    const column = new BoardColumn('Board Column Test Title');
    document.body.appendChild(column.container);
    const addCardButton = document.querySelector(BoardColumn.selectorAddCardButton);
    const cardsListEl = document.querySelector(BoardColumn.selectorCardsList);
    addCardButton.click();
    expect(cardsListEl.children.length).toBe(1);
    expect(spyShowNewCardMenu).toHaveBeenCalled();
  });

  test('After confirming the addition of the card, it is saved in the column and the additional menu is hidden', () => {
    const column = new BoardColumn('Board Column Test Title');
    document.body.appendChild(column.container);
    const addCardButton = document.querySelector(BoardColumn.selectorAddCardButton);
    addCardButton.click();
    const title = 'New Card';
    column.newCard.title = title;
    column.newCardConfirmButton.click();
    const result = column.allCards[0].title;
    expect(result).toBe(title);
    expect(column.cardCount).toBe(1);
    expect(spyHideNewCardMenu).toHaveBeenCalled();
  });

  test('If you cancel adding a card, it does not appear in the column and the confirmation menu is hidden.', () => {
    const column = new BoardColumn('Board Column Test Title');
    document.body.appendChild(column.container);
    const cardsListEl = document.querySelector(BoardColumn.selectorCardsList);
    column.addCardBtnEl.click();
    column.newCard.title = 'New Card';
    column.rejectButton.click();
    expect(spyOnAddCardReject).toHaveBeenCalled();
    expect(cardsListEl.children.length).toBe(0);
    expect(column.cardCount).toBe(0);
    expect(spyHideNewCardMenu).toHaveBeenCalled();
  });

  test('The drag() method deletes the card', () => {
    const column = new BoardColumn('Board Column Test Title');
    const card = new BoardCard('Board Card Test Title');
    column.addCard(card);
    column.drag(card);
    expect(column.cardCount).toBe(0);
  });

  test('The drop() method adds a card to the column', () => {
    const column = new BoardColumn('Board Column Test Title');
    const card = new BoardCard('Board Card Test Title');
    column.drop(card);
    expect(column.cardCount).toBe(1);
    expect(column.allCards[0]).toEqual(card);
  });

  test('The drop() method adds a card to the column and sorts the column cards in a new order', () => {
    const column = new BoardColumn('Board Column Test Title');
    const cards = ['first', 'second', 'third'].map((item) => new BoardCard(item));
    column.addCard(cards[0]);
    column.addCard(cards[2]);
    column.cardsListEl.insertBefore(cards[1].container, cards[2].container);
    column.drop(cards[1]);
    expect(column.allCards).toEqual(cards);
  });

  test('The drop() method calls the onCardListChange listener', () => {
    const column = new BoardColumn('Board Column Test Title');
    const callback = jest.fn();
    column.addCardListChangeListener(callback);
    column.onCardListChange();
    expect(callback).toHaveBeenCalledWith(column);
  });
});
