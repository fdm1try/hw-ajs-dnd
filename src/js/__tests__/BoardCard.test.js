import BoardCard from '../BoardCard';

const spyOnRemove = jest.spyOn(BoardCard.prototype, 'onRemove');

describe('BoardCard class unit tests', () => {
  test('BoardCard rendering test', () => {
    const title = 'Board Card Test Title';
    const card = new BoardCard(title);
    document.body.appendChild(card.container);
    const cardContainerEl = document.body.querySelector(BoardCard.selector);
    const cardContentEl = cardContainerEl.querySelector(BoardCard.selectorContent);
    const cardRemoveButtonEl = cardContainerEl.querySelector(BoardCard.selectorRemoveButton);
    expect(cardContentEl).not.toBeNull();
    expect(cardRemoveButtonEl).not.toBeNull();
  });

  test('BoardCard change title test', () => {
    const title = 'Board Card Test Title';
    const card = new BoardCard('not defined');
    card.title = title;
    expect(card.title).toBe(title);
  });

  test('BoardCard remove test', () => {
    const card = new BoardCard('Board Card Test Title');
    document.body.appendChild(card.container);
    const callback = jest.fn();
    card.addRemoveEventListener(callback);
    card.remove();
    expect(callback).toHaveBeenCalledWith(card);
  });

  test('BoardCard remove button click test', () => {
    const card = new BoardCard('Board Card Test Title');
    document.body.appendChild(card.container);
    card.removeButtonEl.click();
    expect(spyOnRemove).toHaveBeenCalled();
  });

  test('BoardCard get editable card test', () => {
    const card = BoardCard.getEditableCard();
    expect(card.cardEl.classList.contains('editable')).toBeTruthy();
    expect(card.contentEl.getAttribute('contenteditable')).toBeTruthy();
  });
});
