import BoardCard from './BoardCard';

export default class BoardColumn {
  #cards;

  newCard;

  #title;

  #listenersCardListChange = [];

  static get className() {
    return 'board-column';
  }

  static get selector() {
    return `.${BoardColumn.className}`;
  }

  static get selectorAddCardButton() {
    return `.${BoardColumn.className}-menu-add_button`;
  }

  static get selectorCardsList() {
    return `.${BoardColumn.className}-cards-list`;
  }

  static get selectorColumnTitle() {
    return `.${BoardColumn.className}-title`;
  }

  static get selectorColumnMenu() {
    return `.${BoardColumn.className}-menu`;
  }

  static get markup() {
    return `
      <div class="${BoardColumn.className}-header">
        <h2 class="${BoardColumn.className}-title"></h2>
      </div>
      <div class="${BoardColumn.className}-cards-list">
      </div>
      <div class="${BoardColumn.className}-menu">
        <button class="${BoardColumn.className}-menu-add_button">
          + Add another card
        </button>
      </div>
    `;
  }

  constructor(title) {
    this.#cards = [];
    this.#title = title;
    this.container = document.createElement('div');
    this.container.classList.add(BoardColumn.className);
    this.container.innerHTML = BoardColumn.markup;
    this.newCardConfirmButton = document.createElement('button');
    this.newCardConfirmButton.classList.add(`${BoardColumn.className}-menu-add-confirm_button`);
    this.rejectButton = document.createElement('button');
    this.rejectButton.classList.add(`${BoardColumn.className}-menu-add-reject_button`);

    this.addCardBtnEl = this.container.querySelector(BoardColumn.selectorAddCardButton);
    this.cardsListEl = this.container.querySelector(BoardColumn.selectorCardsList);
    this.titleEl = this.container.querySelector(BoardColumn.selectorColumnTitle);
    this.menuContainer = this.container.querySelector(BoardColumn.selectorColumnMenu);

    this.titleEl.textContent = title;
    this.rejectButton.textContent = '✖';
    this.newCardConfirmButton.textContent = 'Add Card';

    this.onAddCardButtonClick = this.onAddCardButtonClick.bind(this);
    this.onAddCardConfirm = this.onAddCardConfirm.bind(this);
    this.onAddCardReject = this.onAddCardReject.bind(this);
    this.removeCard = this.removeCard.bind(this);
    this.addCard = this.addCard.bind(this);

    this.registerEvents();
  }

  get title() {
    return this.#title;
  }

  get allCards() {
    return [...this.#cards];
  }

  get cardCount() {
    return this.#cards.length;
  }

  registerEvents() {
    this.addCardBtnEl.addEventListener('click', this.onAddCardButtonClick);
    this.newCardConfirmButton.addEventListener('click', this.onAddCardConfirm);
    this.rejectButton.addEventListener('click', this.onAddCardReject);
  }

  addCard(card) {
    this.#cards.push(card);
    if (card.container.parentElement !== this.cardsListEl) {
      this.cardsListEl.appendChild(card.container);
    }
    card.addRemoveEventListener(this.removeCard);
    this.onCardListChange();
  }

  removeCard(card) {
    if (!card || !(card instanceof BoardCard)) return false;
    this.#cards = this.#cards.filter((item) => item !== card);
    this.onCardListChange();
    return true;
  }

  onAddCardButtonClick() {
    this.newCard = BoardCard.getEditableCard();
    this.cardsListEl.appendChild(this.newCard.container);
    this.newCard.focus();
    this.showNewCardMenu();
  }

  onAddCardConfirm() {
    if (this.newCard.title !== '') {
      this.addCard(new BoardCard(this.newCard.title));
    }
    this.newCard.remove();
    this.hideNewCardMenu();
  }

  onAddCardReject() {
    this.newCard.remove();
    this.newCard = null;
    this.hideNewCardMenu();
  }

  showNewCardMenu() {
    this.addCardBtnEl.remove();
    this.menuContainer.appendChild(this.newCardConfirmButton);
    this.menuContainer.appendChild(this.rejectButton);
  }

  hideNewCardMenu() {
    this.menuContainer.innerHTML = '';
    this.menuContainer.appendChild(this.addCardBtnEl);
  }

  drag(card) {
    this.removeCard(card);
  }

  drop(card) {
    const nextCardEl = card.container.nextSibling;
    if (!nextCardEl) {
      this.#cards.push(card);
      return;
    }
    const cards = [];
    for (const item of this.#cards) {
      if (item.container === nextCardEl) {
        cards.push(card);
      }
      cards.push(item);
    }
    this.#cards = cards;
    this.onCardListChange();
  }

  addCardListChangeListener(callback) {
    this.#listenersCardListChange.push(callback);
  }

  onCardListChange() {
    for (const callback of this.#listenersCardListChange) {
      callback(this);
    }
  }
}
