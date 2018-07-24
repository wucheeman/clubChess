import React, { Component } from "react";

import Chessboard from "chessboardjsx";
import HumanVsHuman from "./integrations/HumanVsHuman";

class Game extends Component {
  render() {
    return (
      <div style={boardsContainer}>
        <HumanVsHuman>
          {({
            position,
            selectedSquares,
            onDrop,
            onMouseOverSquare,
            onMouseOutSquare
          }) => (
            <Chessboard
              id="humanVsHuman"
              width={320}
              position={position}
              selectedSquares={selectedSquares}
              onDrop={onDrop}
              onMouseOverSquare={onMouseOverSquare}
              onMouseOutSquare={onMouseOutSquare}
              boardStyle={boardStyle}
            />
          )}
        </HumanVsHuman>
      </div>
    );
  }
}

export default Game;

const boardsContainer = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};
const boardStyle = {
  borderRadius: "5px",
  boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`
};
