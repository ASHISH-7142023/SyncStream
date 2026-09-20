import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';

interface TicTacToeBoardProps {
  roomId: string;
  messageId: string;
  gameData: {
    gameType: string;
    board: (string | null)[];
    player1Id?: string;
    player1Name?: string;
    player2Id?: string;
    player2Name?: string;
    currentTurnId?: string;
    winnerId?: string;
    isGameOver?: boolean;
  };
}

export const TicTacToeBoard: React.FC<TicTacToeBoardProps> = ({ roomId, messageId, gameData }) => {
  const { user } = useAuth();
  const { sendGameMove } = useSocket();

  const handleCellClick = (index: number) => {
    if (gameData.isGameOver || gameData.board[index] !== null) return;
    
    // Check if user is a player and it's their turn
    if (
      (user?.id === gameData.player1Id || user?.id === gameData.player2Id || (!gameData.player1Id || !gameData.player2Id)) &&
      (gameData.currentTurnId === user?.id || !gameData.currentTurnId)
    ) {
      sendGameMove(roomId, messageId, index);
    }
  };

  const isPlayer1 = user?.id === gameData.player1Id;
  const isPlayer2 = user?.id === gameData.player2Id;
  const isPlaying = isPlayer1 || isPlayer2;
  const isMyTurn = gameData.currentTurnId === user?.id;

  const renderStatus = () => {
    if (gameData.isGameOver) {
      if (gameData.winnerId === 'DRAW') return "It's a Draw! 🤝";
      return gameData.winnerId === user?.id ? "You Won! 🎉" : `${gameData.winnerId === gameData.player1Id ? gameData.player1Name : gameData.player2Name} Won!`;
    }

    if (!gameData.player1Id) return "Waiting for Player 1...";
    if (!gameData.player2Id) return "Waiting for Player 2 to join...";

    if (isMyTurn) return "Your turn!";
    return `Waiting for ${gameData.currentTurnId === gameData.player1Id ? gameData.player1Name : gameData.player2Name}...`;
  };

  return (
    <div className="bg-[#1f2233] border border-white/10 rounded-2xl p-5 mt-1 min-w-[320px] max-w-sm w-full relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[#a78bfa] text-xs font-semibold uppercase tracking-wider">
          <i className="fa-solid fa-gamepad"></i>
          Tic-Tac-Toe
        </div>
        <div className={`text-xs font-medium px-2 py-1 rounded ${isMyTurn && !gameData.isGameOver ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400'}`}>
          {renderStatus()}
        </div>
      </div>

      {/* Players */}
      <div className="flex justify-between items-center mb-6 text-sm px-2">
        <div className={`flex flex-col items-center ${isPlayer1 ? 'text-[#8b5cf6] font-bold shadow-[0_4px_15px_rgba(139,92,246,0.3)]' : 'text-gray-400'}`}>
          <span className="text-xl mb-1">❌</span>
          {gameData.player1Name || "Waiting..."}
        </div>
        <div className="text-gray-600 font-bold text-lg">VS</div>
        <div className={`flex flex-col items-center ${isPlayer2 ? 'text-blue-400 font-bold shadow-[0_4px_15px_rgba(96,165,250,0.3)]' : 'text-gray-400'}`}>
          <span className="text-xl mb-1">⭕</span>
          {gameData.player2Name || "Waiting..."}
        </div>
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-2 w-full aspect-square bg-black/30 p-2 rounded-xl">
        {gameData.board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleCellClick(idx)}
            disabled={gameData.isGameOver || cell !== null || (!isPlaying && Boolean(gameData.player1Id && gameData.player2Id)) || (isPlaying && !isMyTurn)}
            className={`flex items-center justify-center text-4xl rounded-lg transition-all duration-200 bg-white/5 hover:bg-white/10 active:scale-95 disabled:hover:bg-white/5 disabled:active:scale-100 disabled:cursor-not-allowed
              ${cell === 'X' ? 'text-[#8b5cf6]' : cell === 'O' ? 'text-blue-400' : ''}
              ${isMyTurn && !cell && !gameData.isGameOver ? 'cursor-pointer hover:shadow-[inset_0_0_15px_rgba(139,92,246,0.2)]' : ''}
            `}
          >
            {cell === 'X' ? '❌' : cell === 'O' ? '⭕' : ''}
          </button>
        ))}
      </div>
    </div>
  );
};
