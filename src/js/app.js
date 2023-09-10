import Board from './Board';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.container');
  const board = new Board(container);
  if (!board.loadState()) {
    board.addColumn('todo');
    board.addColumn('in progress');
    board.addColumn('done');
  }
  board.render();
});
