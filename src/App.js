import './App.css';
import React, { useState, useEffect } from 'react';


const rows = 15;
const cols = 10;
let completedLinesInLevel = 0;
let totalCompletedLines = 0;

const App = () => {

  const handleKeyDown = (event) => {
    setActive(true)

    if (event.keyCode === 37) {
      move(-1);
    }
    if (event.keyCode === 38) {
      rotateActiveTetrominoe();
    }
    if (event.keyCode === 39) {
      move(1);
    }
    if (event.keyCode === 40) {
      fall();
    }
    if (event.keyCode === 32) {
      hardFall();
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, false);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, false);
    };
  }, [handleKeyDown]);


  const tetrominoes = [
    {name: 'I', shape: [[[1,0],[1,1],[1,2],[1,3]], [[0,2],[1,2],[2,2],[3,2]], [[2,0],[2,1],[2,2],[2,3]], [[0,1],[1,1],[2,1],[3,1]]], color: 'cyan'},
    {name: 'J', shape: [[[0,0],[1,0],[1,1],[1,2]], [[0,1],[0,2],[1,1],[2,1]], [[1,0],[1,1],[1,2],[2,2]], [[2,0],[2,1],[1,1],[0,1]]], color: 'blue'},
    {name: 'L', shape: [[[0,2],[1,0],[1,1],[1,2]], [[0,1],[2,2],[1,1],[2,1]], [[1,0],[1,1],[1,2],[2,0]], [[0,0],[2,1],[1,1],[0,1]]], color: 'orange'},
    {name: 'O', shape: [[[0,0],[0,1],[1,0],[1,1]]], color: 'yellow'},
    {name: 'S', shape: [[[1,0],[1,1],[0,1],[0,2]], [[0,1],[1,1],[1,2],[2,2]], [[2,0],[2,1],[1,1],[1,2]], [[0,0],[1,0],[1,1],[2,1]]], color: 'green'},
    {name: 'T', shape: [[[0,1],[1,0],[1,1],[1,2]], [[0,1],[1,1],[1,2],[2,1]], [[1,0],[1,1],[1,2],[2,1]], [[0,1],[1,1],[1,0],[2,1]]], color: 'purple'},
    {name: 'Z', shape: [[[0,0],[0,1],[1,1],[1,2]], [[0,2],[1,2],[1,1],[2,1]], [[1,0],[1,1],[2,1],[2,2]], [[0,1],[1,1],[1,0],[2,0]]], color: 'red'},
  ];

  const initTetrominoe = () => ({
    rotation: 0,
    row: 0,
    col: Math.max(cols / 2) - 2,
    tetrominoe: tetrominoes[Math.floor(Math.random() * tetrominoes.length)],
  })

  const initPlacedTetrominoes = [];
  for(let i = 0; i < rows; i++) {
    initPlacedTetrominoes.push(Array(cols).fill(''));
  }

  const [activeTetrominoe, setActiveTetrominoe] = useState({...initTetrominoe()});
  const [placedTetrominoes, setPlacedTetrominoes] = useState(initPlacedTetrominoes);
  const [speed, setSpeed] = useState(2);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [active, setActive] = useState(false);

  const board = Array(rows).fill(Array(cols).fill())

  useEffect(() => {
    const intervalId = setInterval(() => {
      active && fall();
    }, speed * 1000);

    return () => clearInterval(intervalId);
  }, [activeTetrominoe, speed]);

  const updateActiveTetrominoeAttr = (attr, newValue) => {
    const proposedPos = {...activeTetrominoe, [attr]: newValue}
    if (isValid(proposedPos)) {
      setActiveTetrominoe({...activeTetrominoe, [attr]: newValue});
      return true;
    } else {
      console.log('out of bounds')
      return false;
    }
  };

  const rotateActiveTetrominoe = () => {
    updateActiveTetrominoeAttr('rotation', (activeTetrominoe.rotation + 1) % activeTetrominoe.tetrominoe.shape.length)
  };

  const spawn = () => {
    const newTetrominoe = {...initTetrominoe()}
    setActiveTetrominoe(newTetrominoe);
  };

  const move = (amount) => {
    updateActiveTetrominoeAttr('col', activeTetrominoe.col + amount)
  };

  const applyToBoard = () => {
    const newTetrominoeMap = [...placedTetrominoes]

    tetrominoeLocations(activeTetrominoe).forEach(blockPos => {
      const [row, col] = blockPos;

      newTetrominoeMap[row][col] = activeTetrominoe.tetrominoe.color;
    })
    setPlacedTetrominoes(newTetrominoeMap);
    updateLevelAndScore(removeCompleteRows());
  };

  const updateLevelAndScore = (rowsRemoved) => {
    totalCompletedLines += rowsRemoved;
    completedLinesInLevel += rowsRemoved;
    const newScore = [0,100,300,500,800][rowsRemoved] * level;
    setScore(score + newScore);
    if(completedLinesInLevel >= level * 2) {
      setLevel(level + 1);
      completedLinesInLevel = 0;
      setSpeed(speed * .7)
    }
  };

  const fall = (newRow = activeTetrominoe.row + 1) => {
    if (!updateActiveTetrominoeAttr('row', newRow)) {
      if(newRow <= 2) {
        setActive(false);
        alert('Game Over!');
        window.location.reload()
      }
      else {
        applyToBoard()
        spawn();
      }
    }
  };

  const hardFall = () => {
    let i = activeTetrominoe.row + 1;

    for(i; i < rows; i++) {
      console.log('checking row', i);
      if (!isValid({...activeTetrominoe, row: i})) { break }
    };

    fall(i-1)
  };

  const tetrominoeLocations = (attrs) => {
    const {row, col, rotation} = attrs;
    return activeTetrominoe.tetrominoe.shape[rotation]?.map(coords => [coords[0] + row, coords[1] + col]) || [];
  };

  const isValid = (attrs) => {
    return tetrominoeLocations(attrs).every(coords => {
      const [row, col] = coords;
      const insideLeftBoundary = col >= 0;
      const insideRightBoundary = col < cols;
      const aboveFloor = row < rows;
      const noConflicts = aboveFloor && placedTetrominoes[coords[0]][coords[1]] === ''

      return insideLeftBoundary && insideRightBoundary && aboveFloor && noConflicts;
    })
  };


  const removeCompleteRows = () => {
    const incompleteRows = placedTetrominoes.filter(row => row.some(col => col === ''));
    const removedRows =  rows - incompleteRows.length;

    while(incompleteRows.length < rows) { incompleteRows.unshift(Array(cols).fill('')) }

    setPlacedTetrominoes(incompleteRows);
    return removedRows;
  };

  const cellColor = (row, col) => {
    const staticColors =  placedTetrominoes[row][col];
    const tetrominoePosition = tetrominoeLocations(activeTetrominoe).map(coords => coords.join(',')).includes([row, col].join(','));
    const color = tetrominoePosition ? activeTetrominoe.tetrominoe.color : staticColors;
    const occupied = color ? 'occupied' : ''
    return `${color} ${occupied}`
  }

  return (
    <div className="App">
      <div className="score">Score: {score}</div>
      <div className="level">Level: {level}</div>
      <div className="board">
      {
        board.map((row, rowi) => {
          return (
            <div className="row">
              {
                row.map((col, coli) => (
                  <div className={`col  ${cellColor(rowi, coli)}`} />
                ))
              }
            </div>
          )
        })
      }
      </div>
    </div>
  );
};

export default App;
