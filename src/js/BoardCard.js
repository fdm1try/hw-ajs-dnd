export default class BoardCard {
  #onRemoveListeners = [];

  #title;

  static get markup() {
    return `
    <div class="${BoardCard.className}">
      <button class="${BoardCard.className}-remove_button">✖</button>
      <div class="${BoardCard.className}-content">
      </div>
    </div>
    `;
  }

  static get className() {
    return 'board-card';
  }

  static get selector() {
    return `.${BoardCard.className}-container`;
  }

  static get selectorRemoveButton() {
    return `.${BoardCard.className}-remove_button`;
  }

  static get selectorContent() {
    return `.${BoardCard.className}-content`;
  }

  constructor(title = '') {
    this.container = document.createElement('div');
    this.container.classList.add(`${BoardCard.className}-container`);
    this.container.innerHTML = BoardCard.markup;

    this.cardEl = this.container.querySelector(`.${BoardCard.className}`);
    this.contentEl = this.container.querySelector(BoardCard.selectorContent);
    this.removeButtonEl = this.container.querySelector(BoardCard.selectorRemoveButton);

    this.title = title;

    this.remove = this.remove.bind(this);
    this.onTitleChange = this.onTitleChange.bind(this);

    this.registerEvents();
  }

  registerEvents() {
    this.removeButtonEl.addEventListener('click', this.remove);
    this.contentEl.addEventListener('input', this.onTitleChange);
  }

  onTitleChange() {
    this.#title = this.contentEl.outerText;
  }

  set title(text) {
    this.#title = text;
    this.contentEl.innerText = text;
  }

  get title() {
    return this.#title;
  }

  addRemoveEventListener(callback) {
    this.#onRemoveListeners.push(callback);
  }

  remove() {
    this.container.remove();
    this.onRemove();
  }

  onRemove() {
    for (const listener of this.#onRemoveListeners) {
      listener(this);
    }
  }

  focus() {
    this.contentEl.focus();
  }

  static getEditableCard() {
    const card = new BoardCard();
    card.cardEl.classList.add('editable');
    card.contentEl.setAttribute('contenteditable', true);
    return card;
  }
}
