import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className={'square ' + (props.highlight ? 'highlight' : null)} onClick={props.onClick} >
      { props.value }
    </button>
  );
}

class Board extends React.Component {

  renderSquare(i, highlight) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        highlight={highlight}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    let rows = Array(3);
    for(let i=0; i<3; i++) {
      let squares = Array(3);
      for(let j=0; j<3; j++) {
        squares[j] = this.renderSquare(3*i+j, this.props.wonAt && this.props.wonAt.find((k => k===3*i+j)) !== undefined );
      }
      rows[i] = <div className="board-row" key={i}> {squares} </div>
    }
    return <div>{rows}</div>;
  }
}

class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        lastMove: null
      }],
      stepNumber: 0,
      xIsNext: true,
      sortAsc: true
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const gameStatus = calculateWinner(squares);

    if (gameStatus.winner || gameStatus.draw || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        lastMove: i
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  toggleSort() {
    this.setState((state) => {
      return { sortAsc: !state.sortAsc };
    });
  }
  
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const gameStatus = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const stepX = Math.floor(step.lastMove/3), stepY = step.lastMove%3;
      const desc = move ?
        'Go to move #' + move + ' (' + stepY + ', ' + stepX + ')':
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)} 
            className={move===this.state.stepNumber ? 'currentMove' : null}>
              {desc}
          </button>
        </li>
      );
    });
    if(!this.state.sortAsc) {
      moves.reverse();
    }

    let status;
    if (gameStatus.draw) {
      status = 'Draw';
    } else if(gameStatus.winner) {
      status = 'Winner: ' + gameStatus.winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            wonAt={gameStatus.wonAt}
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />

        </div>
        <div className="game-info">
          <div> {status} </div>
          <span>-------------------------</span>
          <div>
            <button onClick={() => this.toggleSort()}>Sort {this.state.sortAsc ? 'Desc' : 'Asc'}</button>
          </div>
          <ol reversed={this.state.sortAsc ?  '' : 'reversed'}>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        wonAt: [a,b,c],
        draw: false
      };
    }
  }
  let anyLeft = false;
  for (let i = 0; i < 9; i++) {
    if(!squares[i]) {
      anyLeft = true;
      break;
    }
  }
  return { 
    winner: null,
    wonAt: null,
    draw: !anyLeft
  };
}