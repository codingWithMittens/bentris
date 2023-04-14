import './App.css';
import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';

const rows = 15;
const cols = 10;
let completedLinesInLevel = 0;
let totalCompletedLines = 0;

const App = () => {

  const swipeConfig = {
    delta: 10,                             // min distance(px) before a swipe starts. *See Notes*
    preventScrollOnSwipe: true,           // prevents scroll during swipe (*See Details*)
    trackTouch: true,                      // track touch input
    trackMouse: false,                     // track mouse input
    rotationAngle: 0,                      // set a rotation angle
    swipeDuration: Infinity,               // allowable duration of a swipe (ms). *See Notes*
    touchEventOptions: { passive: true },  // options for touch listeners (*See Details*)
  }

  const swipeHandlers = useSwipeable({
    onSwiped: () => { setActive(true) },
    onSwipedLeft: () => {move(-1)},
    onSwipedRight: () => {move(1)},
    onSwipedUp: () => {hardFall()},
    onTap: () => {rotate()},
    onSwipedDown: () => {fall()},
    ...swipeConfig,
  });

  const handleKeyDown = (event) => {
    setActive(true)

    if (event.keyCode === 37) { move(-1) }
    if (event.keyCode === 38) { rotate() }
    if (event.keyCode === 39) { move(1) }
    if (event.keyCode === 40) { fall() }
    if (event.keyCode === 32) { hardFall() }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, false);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, false);
    };
  }, [handleKeyDown]);


  const tetrominoes = [
    {name: 'I', shape: [[[1,0],[1,1],[1,2],[1,3]], [[0,2],[1,2],[2,2],[3,2]], [[2,0],[2,1],[2,2],[2,3]], [[0,1],[1,1],[2,1],[3,1]]]},
    {name: 'J', shape: [[[0,0],[1,0],[1,1],[1,2]], [[0,1],[0,2],[1,1],[2,1]], [[1,0],[1,1],[1,2],[2,2]], [[2,0],[2,1],[1,1],[0,1]]]},
    {name: 'L', shape: [[[0,2],[1,0],[1,1],[1,2]], [[0,1],[2,2],[1,1],[2,1]], [[1,0],[1,1],[1,2],[2,0]], [[0,0],[2,1],[1,1],[0,1]]]},
    {name: 'O', shape: [[[0,0],[0,1],[1,0],[1,1]]]},
    {name: 'S', shape: [[[1,0],[1,1],[0,1],[0,2]], [[0,1],[1,1],[1,2],[2,2]], [[2,0],[2,1],[1,1],[1,2]], [[0,0],[1,0],[1,1],[2,1]]]},
    {name: 'T', shape: [[[0,1],[1,0],[1,1],[1,2]], [[0,1],[1,1],[1,2],[2,1]], [[1,0],[1,1],[1,2],[2,1]], [[0,1],[1,1],[1,0],[2,1]]]},
    {name: 'Z', shape: [[[0,0],[0,1],[1,1],[1,2]], [[0,2],[1,2],[1,1],[2,1]], [[1,0],[1,1],[2,1],[2,2]], [[0,1],[1,1],[1,0],[2,0]]]},
  ];

  const newTetrominoeQueue = () => [...tetrominoes].sort( () => .5 - Math.random() );
  const [tetrominoeQueue, setTetrominoeQueue] = useState(newTetrominoeQueue);

  const initTetrominoe = () => ({
    rotation: 0,
    row: 0,
    col: Math.max(cols / 2) - 2,
    tetrominoe: tetrominoeQueue.shift(),
  });

  const initPlacedTetrominoes = [];
  for(let i = 0; i < rows; i++) {
    initPlacedTetrominoes.push(Array(cols).fill(''));
  };

  const [activeTetrominoe, setActiveTetrominoe] = useState(initTetrominoe);

  const [placedTetrominoes, setPlacedTetrominoes] = useState(initPlacedTetrominoes);
  const [speed, setSpeed] = useState(.8);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [active, setActive] = useState(false);

  const boardArray = (boardRows, boardCols) => Array(boardRows).fill(Array(boardCols).fill(''))

  useEffect(() => {
    const intervalId = setInterval(() => {
      active && fall();
    }, speed * 1000);

    return () => clearInterval(intervalId);
  }, [activeTetrominoe, speed]);

  const updateActiveTetrominoeAttr = (attr, newValue) => {
    const proposedPos = {...activeTetrominoe, [attr]: newValue}
    if (isValid(proposedPos)) {
      setActiveTetrominoe(proposedPos);
      return true;
    } else {
      return false;
    }
  };

  const rotate = () => {
    updateActiveTetrominoeAttr('rotation', (activeTetrominoe.rotation + 1) % activeTetrominoe.tetrominoe.shape.length)
  };

  const spawn = () => {
    const newTetrominoe = {...initTetrominoe()}
    setActiveTetrominoe(newTetrominoe);
    if(tetrominoeQueue.length === 0) {
      setTetrominoeQueue([...newTetrominoeQueue()])
    }
  };

  const move = (amount) => {
    updateActiveTetrominoeAttr('col', activeTetrominoe.col + amount);
  };

  const applyToBoard = () => {
    const newTetrominoeMap = [...placedTetrominoes]

    tetrominoeLocations(activeTetrominoe).forEach(blockPos => {
      const [row, col] = blockPos;

      newTetrominoeMap[row][col] = `tetrominoe-${activeTetrominoe.tetrominoe.name}`;
    })
    setPlacedTetrominoes(newTetrominoeMap);
    updateLevelAndScore(removeCompleteRows());
  };

  const updateLevelAndScore = (rowsRemoved) => {
    totalCompletedLines += rowsRemoved;
    completedLinesInLevel += rowsRemoved;
    const newScore = [0, 100, 300, 500, 800][rowsRemoved] * level;
    setScore(score + newScore);
    if(completedLinesInLevel >= level * 10) {
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
      } else {
        applyToBoard()
        spawn();
      };
    };
  };

  const hardFall = () => {
    let i = activeTetrominoe.row + 1;

    for(i; i < rows; i++) {
      if (!isValid({...activeTetrominoe, row: i})) { break };
    };

    fall(i-1);
    const fallInterval = setInterval(() => (fall()), .5);
    clearInterval(fallInterval);
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
    const color = tetrominoePosition ? `tetrominoe-${activeTetrominoe.tetrominoe.name}` : staticColors;
    const occupied = color ? 'occupied' : ''
    return `${color} ${occupied}`;
  }

  const previewCellColor = (row, col) => {
    const nextTetrominoe = tetrominoeQueue[0];
    const shapeCoords = nextTetrominoe.shape[0];
    const boardWidth = shapeCoords.map(coords => coords[1]).sort()[shapeCoords.length - 1]
    const isOccupied = shapeCoords.map(coords => coords.join(',')).includes([row, col].join(','));
    if (isOccupied) {
      return `tetrominoe-${nextTetrominoe.name}`
    }
    return col > boardWidth ? 'no-display' : 'no-background';
  }

  const createBoard = (boardRows, boardCols, populationCb) => (
    boardArray(boardRows, boardCols).map((row, rowi) => {
      return (
        <div className="row">
          {
            row.map((_, coli) => (
              <div className={`col  ${populationCb(rowi, coli)}`}/>
            ))
          }
        </div>
      )
    })
  );

  return (
    <div className="App" {...swipeHandlers}>
      <div className="board">
        { createBoard(rows, cols, cellColor) }
      </div>
      <div className="info">
        <div>
          <p className="score"><span className="label">Score</span><span className="label">{score}</span></p>
          <p className="level"><span className="label">Level</span><span className="label">{level}</span></p>
          <p className="next-level"><span className="label">Next level</span><span className="label">{(level * 10) - completedLinesInLevel}</span></p>
        </div>
        <div>
          <p className="next-up"><span className="label">Next up</span></p>
          <div className="preview">
            { createBoard(3, 4, previewCellColor) }
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
