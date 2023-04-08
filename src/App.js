import './App.css';
import React, { useState, useEffect } from 'react';


const rows = 10;
const cols = 10;
let speed = 2;

const App = () => {

  const handleKeyDown = (event) => {
    if (event.keyCode === 37) { //left arrow key
      move(-1)
    }
    if (event.keyCode === 38) { //up arrow key
      rotateActiveTetrino()
    }
    if (event.keyCode === 39) { //right arrow key
      move(1)
    }
    if (event.keyCode === 40) { //down arrow key
      fall()
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, false);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, false);
    };
  }, [handleKeyDown]);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     fall()
  //   }, speed * 1000);

  //   return () => clearInterval(intervalId);
  // }, []);

  const tetrinos = [
    {name: 'I', boundary: 4, shape: [[[1,0],[1,1],[1,2],[1,3]], [[0,2],[1,2],[2,2],[3,2]], [[2,0],[2,1],[2,2],[2,3]], [[0,1],[1,1],[2,1],[3,1]]], color: 'cyan'},
    {name: 'J', boundary: 3, shape: [[[0,0],[1,0],[1,1],[1,2]], [[0,1],[0,2],[1,1],[2,1]], [[1,0],[1,1],[1,2],[2,2]], [[2,0],[2,1],[1,1],[0,1]]], color: 'blue'},
    {name: 'L', boundary: 3, shape: [[[0,2],[1,0],[1,1],[1,2]], [[0,1],[2,2],[1,1],[2,1]], [[1,0],[1,1],[1,2],[2,0]], [[0,0],[2,1],[1,1],[0,1]]], color: 'orange'},
    {name: 'O', boundary: 2, shape: [[[0,0],[0,1],[1,0],[1,1]]], color: 'yellow'},
    {name: 'S', boundary: 3, shape: [[[1,0],[1,1],[0,1],[0,2]], [[0,1],[1,1],[1,2],[2,2]], [[2,0],[2,1],[1,1],[1,2]], [[0,0],[1,0],[1,1],[2,1]]], color: 'green'},
    {name: 'T', boundary: 3, shape: [[[0,1],[1,0],[1,1],[1,2]], [[0,1],[1,1],[1,2],[2,1]], [[1,0],[1,1],[1,2],[2,1]], [[0,1],[1,1],[1,0],[2,1]]], color: 'purple'},
    {name: 'Z', boundary: 3, shape: [[[0,0],[1,0],[1,1],[1,2]], [[0,2],[1,2],[1,1],[2,1]], [[1,0],[1,1],[2,1],[2,2]], [[0,1],[1,1],[1,0],[2,0]]], color: 'red'},
  ];

  const initTetrino = () => ({
    rotation: 0,
    row: 0,
    col: Math.max(cols / 2) - 2,
    tetrino: tetrinos[Math.floor(Math.random() * tetrinos.length)],
  })

  const initInactiveTetrinos = []
  for(let i = 0; i < rows; i++) {
    const row = [];
    for(let i = 0; i < cols; i++) {
      row[i] = { color: ''};
    }
    initInactiveTetrinos[i] = row;
  }

  const [activeTetrino, setActiveTetrino] = useState({...initTetrino()});
  const [inactiveTetrinos, setInactiveTetrinos] = useState(initInactiveTetrinos);

  const board = Array(rows).fill(Array(cols).fill())

  const updateActiveTetrinoAttr = (attr, newValue) => {
    const proposedPos = {...activeTetrino, [attr]: newValue}
    if (isValid(proposedPos.row, proposedPos.col, proposedPos.rotation)) {
      setActiveTetrino({...activeTetrino, [attr]: newValue});
      return true;
    } else {
      console.log('out of bounds')
      return false;
    }
  }

  const rotateActiveTetrino = () => {
    console.log('rotating', activeTetrino)
    updateActiveTetrinoAttr('rotation', (activeTetrino.rotation + 1) % activeTetrino.tetrino.shape.length)
  };

  const spawn = () => {
    setActiveTetrino({...initTetrino()});
  };

  const move = (amount) => {
    console.log('moving', activeTetrino)
    updateActiveTetrinoAttr('col', activeTetrino.col + amount)
  };

  const applyToBoard = () => {
    const newTetrinoMap = [...inactiveTetrinos]

    tetrinoLocations(activeTetrino.row, activeTetrino.col, activeTetrino.rotation).forEach(blockPos => {
      const [row, col] = blockPos;

      newTetrinoMap[row][col] = {color: activeTetrino.tetrino.color};
    })
    console.log(newTetrinoMap);
    setInactiveTetrinos(newTetrinoMap);
  }

  const fall = () => {
    // console.log('activeTetrino', activeTetrino)
    const newRow = activeTetrino.row + 1;
    if (!updateActiveTetrinoAttr('row', newRow)) {
      applyToBoard()
      spawn();
    }
  };

  const tetrinoLocations = (atRow, atCol, atRotation) => {
    return activeTetrino.tetrino.shape[atRotation].map(rowPos => {
      const [row, col] = rowPos
      return([atRow + row, atCol + col])
    })
  }

  const isValid = (row, col, rotation) => {
    const proposedLocation = tetrinoLocations(row, col, rotation)
    console.log(proposedLocation, rows)
    const insideLeftBoundary = proposedLocation.every(coords => coords[1] >= 0);
    const insideRightBoundary = proposedLocation.every(coords => coords[1] < cols);
    const aboveFloor = proposedLocation.every(coords => coords[0] < rows);

    return insideLeftBoundary && insideRightBoundary && aboveFloor;
  };


  // const isRowComplete = () => {};



  const cellColor = (row, col) => {
    const staticColors =  inactiveTetrinos[row][col].color;
    // hack - fix this
    const tetrinoPosition = tetrinoLocations(activeTetrino.row, activeTetrino.col, activeTetrino.rotation).map(coords => coords.join(',')).includes([row, col].join(','));
    return tetrinoPosition ? activeTetrino.tetrino.color : staticColors;
  }

  return (
    <div className="App">
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
  );
}

export default App;
