import React, { useRef, useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import type { WhiteboardAction } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface WhiteboardProps {
  roomId: string;
}

export const Whiteboard: React.FC<WhiteboardProps> = ({ roomId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { subscribeToWhiteboard, sendWhiteboardAction } = useSocket();

  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#a78bfa');
  const [size, setSize] = useState(2);
  const [mode, setMode] = useState<'DRAW' | 'ERASE'>('DRAW');
  
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // 1. Fetch initial state
    api.get(`/api/rooms/${roomId}/whiteboard`).then((res) => {
      const strokes: WhiteboardAction[] = res.data;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Clear before drawing initial
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      strokes.forEach(stroke => {
        if (stroke.type === 'CLEAR') {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
          drawStroke(stroke);
        }
      });
    }).catch(console.error);

    // 2. Subscribe to live changes
    const unsubscribe = subscribeToWhiteboard(roomId, (action) => {
      // Ignore our own echo if we want, but since STOMP usually loops back, 
      // we can either rely on the echo or draw optimistic. 
      // We will draw optimistically, so we should ignore our own echo
      if (action.userId !== user?.id) {
        if (action.type === 'CLEAR') {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
          }
        } else {
          drawStroke(action);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomId, subscribeToWhiteboard, user]);

  useEffect(() => {
    // Handle resize
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        // We preserve drawing data on resize
        const ctx = canvas.getContext('2d');
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        if (imageData && ctx) {
          ctx.putImageData(imageData, 0, 0);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const drawStroke = (action: WhiteboardAction) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = action.size;
    
    if (action.type === 'ERASE') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = action.color;
    }

    ctx.moveTo(action.prevX * canvas.width, action.prevY * canvas.height);
    ctx.lineTo(action.currentX * canvas.width, action.currentY * canvas.height);
    ctx.stroke();
    
    // Reset to default
    ctx.globalCompositeOperation = 'source-over';
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    // Return relative coordinates (0 to 1) for responsive drawing
    return {
      x: (clientX - rect.left) / canvas.width,
      y: (clientY - rect.top) / canvas.height
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const coords = getCoordinates(e);
    if (coords) {
      lastPos.current = coords;
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !lastPos.current || !user) return;
    
    const coords = getCoordinates(e);
    if (!coords) return;

    const action: WhiteboardAction = {
      type: mode,
      prevX: lastPos.current.x,
      prevY: lastPos.current.y,
      currentX: coords.x,
      currentY: coords.y,
      color: color,
      size: mode === 'ERASE' ? size * 4 : size,
      userId: user.id
    };

    // Draw optimistic
    drawStroke(action);
    // Send to server
    sendWhiteboardAction(roomId, action);

    lastPos.current = coords;
  };

  const clearBoard = () => {
    if (!user) return;
    const action: WhiteboardAction = {
      type: 'CLEAR',
      prevX: 0, prevY: 0, currentX: 0, currentY: 0,
      color: '#000000', size: 1, userId: user.id
    };
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    sendWhiteboardAction(roomId, action);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#151723] rounded-xl overflow-hidden border border-white/5 relative">
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#1f2233]/90 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl flex items-center gap-4 z-10 border border-white/10">
        
        <div className="flex items-center gap-2 border-r border-white/10 pr-4">
          <button 
            onClick={() => setMode('DRAW')}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${mode === 'DRAW' ? 'bg-brand-500 text-white' : 'text-text-muted hover:bg-white/10 hover:text-white'}`}
            title="Pen"
          >
            <i className="fa-solid fa-pen"></i>
          </button>
          <button 
            onClick={() => setMode('ERASE')}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${mode === 'ERASE' ? 'bg-brand-500 text-white' : 'text-text-muted hover:bg-white/10 hover:text-white'}`}
            title="Eraser"
          >
            <i className="fa-solid fa-eraser"></i>
          </button>
        </div>

        <div className="flex items-center gap-2 border-r border-white/10 pr-4">
          <input 
            type="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            disabled={mode === 'ERASE'}
            className={`w-6 h-6 border-none cursor-pointer rounded-full overflow-hidden ${mode === 'ERASE' ? 'opacity-50' : ''}`}
            title="Color Picker"
          />
        </div>

        <div className="flex items-center gap-3 border-r border-white/10 pr-4">
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={size} 
            onChange={(e) => setSize(parseInt(e.target.value))}
            className="w-24 accent-brand-500"
            title="Brush Size"
          />
        </div>

        <button 
          onClick={clearBoard}
          className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <i className="fa-solid fa-trash-can"></i>
          Clear
        </button>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef} 
        className="flex-1 w-full h-full cursor-crosshair relative touch-none"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  );
};
