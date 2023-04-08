import './App.css';
import React, { useState, useEffect } from 'react';


const rows = 20;
const cols = 10;
let speed = 2;

const App = () => {

  const handleKeyDown = (event) => {
    if (event.keyCode === 38) { //up arrow key
      rotateActiveTetrino()
    }
    if (event.keyCode === 40) { //down arrow key
      spawn()
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, false);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, false);
    };
  }, [handleKeyDown]);

  const tetrinos = [
    {name: 'i', boundary: 4, shape: [[[1,0],[1,1],[1,2],[1,3]], [[0,2],[1,2],[2,2],[3,2]], [[2,0],[2,1],[2,2],[2,3]], [[0,1],[1,1],[2,1],[3,1]]], color: 'cyan'},
    {name: 'j', boundary: 3, shape: [[[0,0],[1,0],[1,1],[1,2]], [[0,1],[0,2],[1,1],[2,1]], [[1,0],[1,1],[1,2],[2,2]], [[2,0],[2,1],[1,1],[0,1]]], color: 'blue'},
    {name: 'l', boundary: 3, shape: [[[0,2],[1,0],[1,1],[1,2]], [[0,1],[2,2],[1,1],[2,1]], [[1,0],[1,1],[1,2],[2,0]], [[0,0],[2,1],[1,1],[0,1]]], color: 'orange'},
    {name: 'o', boundary: 2, shape: [[[0,0],[0,1],[1,0],[1,1]]], color: 'yellow'},
    {name: 's', boundary: 3, shape: [[[1,0],[1,1],[0,1],[0,2]], [[0,1],[1,1],[1,2],[2,2]], [[2,0],[2,1],[1,1],[1,2]], [[0,0],[1,0],[1,1],[2,1]]], color: 'green'},
    {name: 't', boundary: 3, shape: [[[0,1],[1,0],[1,1],[1,2]], [[0,1],[1,1],[1,2],[2,1]], [[1,0],[1,1],[1,2],[2,1]], [[0,1],[1,1],[1,0],[2,1]]], color: 'purple'},
    {name: 'z', boundary: 3, shape: [[[0,0],[1,0],[1,1],[1,2]], [[0,2],[1,2],[1,1],[2,1]], [[1,0],[1,1],[2,1],[2,2]], [[0,1],[1,1],[1,0],[2,0]]], color: 'red'},
  ];

  const [tetrinoSpace, setTetrinoSpace] = useState([]);
  const [activeTetrino, setActiveTetrino] = useState( {
    rotation: 0,
    row: 0,
    tetrino: tetrinos[4],
  })

  useEffect(() => {
    const tetrinoBoundary = []
    for(let i = 0; i < activeTetrino.tetrino.boundary; i++) {
      const row = [];
      for(let i = 0; i < activeTetrino.tetrino.boundary; i++) {
        row[i] = { color: '', occupied: false };
      }
      tetrinoBoundary[i] = row;
    }

    // render tetrino into boundary
    console.log('activeTetrino', activeTetrino)
    activeTetrino.tetrino.shape[activeTetrino.rotation].forEach(blockPos => {
      const [rowPos, colPos] = blockPos;
      tetrinoBoundary[rowPos][colPos].color = activeTetrino.tetrino.color;
    })

    setTetrinoSpace(tetrinoBoundary)
  }, [activeTetrino]);

  // const board = Array(rows).fill(Array(cols).fill({ color: '', occupied: false }))

  const rotateActiveTetrino = () => {
    console.log('rotating')
    setActiveTetrino({...activeTetrino, rotation: (activeTetrino.rotation + 1) % activeTetrino.tetrino.shape.length})
  };

  const spawn = () => {
    console.log('new tetrino')
    const nextTetrinoInt = Math.floor(Math.random() * tetrinos.length);
    console.log(nextTetrinoInt)
    setActiveTetrino({...activeTetrino, rotation: 0, tetrino: tetrinos[nextTetrinoInt]});
  };
  // const apply = () => {};

  // const isValid = () => {};

  // const nextRow = () => {};

  // const isRowComplete = () => {};

  // const spawn = () => {
  //   const tetrinoToSpawn = tetrinos[Math.floor(Math.random() * tetrinos.length)];
  //   setActiveTetrino(tetrinoToSpawn);
  // }

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // setActiveTetrino(tetrino => {
  //     //   const newTetrino = {...tetrino};
  //     //   newTetrino.row = (newTetrino.row + 1) % rows;
  //     //   return newTetrino;
  //     // })

  //     // if(rowPosition === 0) {
  //     //   spawn();
  //     // }

  //     // const startingPos = [activeTetrino.row, Math.max(cols/2)];
  //     // console.log(activeTetrino);
  //     const newTetrinoSpace = [...initialTetrinoSpace];
  //     console.log('newTetrinoSpace', newTetrinoSpace)
  //     activeTetrino.tetrino.shape[activeTetrino.rotation].forEach(blockPos => {
  //       console.log('blockpos', blockPos);
  //       const [rowPos, colPos] = blockPos;
  //       newTetrinoSpace[rowPos][colPos].occupied = true;
  //       newTetrinoSpace[rowPos][colPos].color = activeTetrino.tetrino.color;
  //     })
  //     setTetrinoSpace(newTetrinoSpace);



  //   }, speed * 1000);
  //   return () => clearInterval(interval);
  // }, []);

  console.log('rendering', tetrinoSpace);
  return (
    <div className="App">
      {
        tetrinoSpace.map((row, rowi) => {
          return (
            <div className="row">
              {
                row.map((col, coli) => {
                  // console.log('row', row)
                  // console.log('col', rowi, coli, col)
                  return (
                    <div className={`col ${col.color}`}>
                      {/* {rowPosition === i && 'CUR'} */}
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
