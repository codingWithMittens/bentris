import './App.css';
import React, { useState, useEffect } from 'react';


const rows = 15;
const cols = 10;
let completedLinesInLevel = 0;
let totalCompletedLines = 0;
let speed = 2;

const App = () => {

  const handleKeyDown = (event) => {
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
    // if (event.keyCode === 49) {
    //   hardFall();
    // }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, false);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, false);
    };
  }, [handleKeyDown]);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     console.log('falling', activeTetrominoe);
  //     fall();
  //   }, speed * 1000);

  //   return () => clearInterval(intervalId);
  // }, ['']);

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
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const board = Array(rows).fill(Array(cols).fill())

  const updateActiveTetrominoeAttr = (attr, newValue) => {
    const proposedPos = {...activeTetrominoe, [attr]: newValue}
    if (isValid(proposedPos.row, proposedPos.col, proposedPos.rotation)) {
      setActiveTetrominoe({...activeTetrominoe, [attr]: newValue});
      return true;
    } else {
      console.log('out of bounds')
      return false;
    }
  }

  const rotateActiveTetrominoe = () => {
    console.log('rotating', activeTetrominoe)
    updateActiveTetrominoeAttr('rotation', (activeTetrominoe.rotation + 1) % activeTetrominoe.tetrominoe.shape.length)
  };

  const spawn = () => {
    setActiveTetrominoe({...initTetrominoe()});
  };

  const move = (amount) => {
    console.log('moving', activeTetrominoe)
    updateActiveTetrominoeAttr('col', activeTetrominoe.col + amount)
  };

  const applyToBoard = () => {
    const newTetrominoeMap = [...placedTetrominoes]

    tetrominoeLocations(activeTetrominoe.row, activeTetrominoe.col, activeTetrominoe.rotation).forEach(blockPos => {
      const [row, col] = blockPos;

      newTetrominoeMap[row][col] = activeTetrominoe.tetrominoe.color;
    })
    console.log(newTetrominoeMap);
    setPlacedTetrominoes(newTetrominoeMap);
    updateLevelAndScore(removeCompleteRows());
  }

  const updateLevelAndScore = (rowsRemoved) => {
    totalCompletedLines += rowsRemoved;
    completedLinesInLevel += rowsRemoved;
    const newScore = [0,100,300,500,800][rowsRemoved] * level;
    console.log(rowsRemoved, newScore);
    setScore(score + newScore);
    if(completedLinesInLevel >= level * 10) {
      setLevel(level + 1);
      completedLinesInLevel = 0;
    }
  }

  const fall = () => {
    const newRow = activeTetrominoe.row + 1;
    if (!updateActiveTetrominoeAttr('row', newRow)) {
      applyToBoard()
      spawn();
    }
  };

  const tetrominoeLocations = (atRow, atCol, atRotation) => {
    return activeTetrominoe.tetrominoe.shape[atRotation].map(rowPos => {
      const [row, col] = rowPos
      return([atRow + row, atCol + col])
    })
  }

  const isValid = (row, col, rotation) => (
    tetrominoeLocations(row, col, rotation).every(coords => {
      [row, col] = coords;
      const insideLeftBoundary = col >= 0;
      const insideRightBoundary = col < cols;
      const aboveFloor = row < rows;
      const noConflicts = aboveFloor && placedTetrominoes[coords[0]][coords[1]] === ''

      return insideLeftBoundary && insideRightBoundary && aboveFloor && noConflicts;
    })
  );


  const removeCompleteRows = () => {
    const incompleteRows = placedTetrominoes.filter(row => row.some(col => col === ''));
    const removedRows =  rows - incompleteRows.length;

    while(incompleteRows.length < rows) { incompleteRows.unshift(Array(cols).fill('')) }

    setPlacedTetrominoes(incompleteRows);
    return removedRows;
  };

  const cellColor = (row, col) => {
    const staticColors =  placedTetrominoes[row][col];
    // hack - fix this
    const tetrominoePosition = tetrominoeLocations(activeTetrominoe.row, activeTetrominoe.col, activeTetrominoe.rotation).map(coords => coords.join(',')).includes([row, col].join(','));
    return tetrominoePosition ? activeTetrominoe.tetrominoe.color : staticColors;
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
                row.map((col, coli) => {
                  return (
                    <div className={`col ${cellColor(rowi, coli)}`}>
                    </div>
                  )
                })
              }
            </div>
          )
        })
      }
      </div>
    </div>
  );
}

export default App;
