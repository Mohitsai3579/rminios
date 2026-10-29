'use client';
import { useState, useRef, useEffect } from 'react';
import { Eraser, Pen, Square, Circle, Type, Download, Trash2, Undo2, Redo2, Minus, Plus, Palette, MousePointer, Box, Image as ImageIcon, Sparkles, X, Loader, Search } from 'lucide-react';

const COLORS = ['#e2e8f0', '#6366f1', '#2dd4bf', '#fbbf24', '#f43f5e', '#22c55e', '#ec4899', '#f97316', '#8b5cf6', '#06b6d4'];
const TOOLS = [
  { id: 'select', icon: MousePointer, label: 'Select' },
  { id: 'pen', icon: Pen, label: 'Pen' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'rect', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
];

export default function CanvasTab({ workspaceId }) {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#6366f1');
  const [lineWidth, setLineWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [startPos, setStartPos] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPos, setTextPos] = useState(null);
  
  // 3D State
  const [is3D, setIs3D] = useState(true);

  // External Image Tools State
  const [showImageTools, setShowImageTools] = useState(false);
  const [imageSearchQuery, setImageSearchQuery] = useState('');
  const [imageResults, setImageResults] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    clearCanvas();
  }, []);

  const drawGrid = (ctx, w, h) => {
    ctx.fillStyle = '#0a0b0f';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let x = 0; x < w; x += 30) {
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  function saveState() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }

  function undo() {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  }

  function redo() {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawGrid(ctx, canvas.width, canvas.height);
    saveState();
  }

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Adjust coordinates if 3D transform is applied (rough approximation)
    if (is3D) {
      // In a real 3D canvas, we would use proper matrix inversion.
      // For this isometric CSS trick, drawing while in 3D mode is slightly misaligned.
    }

    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function handleStart(e) {
    if (is3D) return; // Disable drawing while in 3D orbit mode
    e.preventDefault();
    const pos = getPos(e);

    if (tool === 'text') {
      setTextPos(pos);
      return;
    }

    setIsDrawing(true);
    setStartPos(pos);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = tool === 'eraser' ? '#0a0b0f' : color;
      ctx.lineWidth = tool === 'eraser' ? lineWidth * 5 : lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }

  function handleMove(e) {
    if (!isDrawing || is3D) return;
    e.preventDefault();
    const pos = getPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (['line', 'rect', 'circle'].includes(tool)) {
      if (historyIndex >= 0 && history[historyIndex]) {
        ctx.putImageData(history[historyIndex], 0, 0);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';

      if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (tool === 'rect') {
        ctx.beginPath();
        ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
      } else if (tool === 'circle') {
        const rx = Math.abs(pos.x - startPos.x) / 2;
        const ry = Math.abs(pos.y - startPos.y) / 2;
        const cx = startPos.x + (pos.x - startPos.x) / 2;
        const cy = startPos.y + (pos.y - startPos.y) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  function handleEnd(e) {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveState();
  }

  function addText() {
    if (!textInput.trim() || !textPos) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.font = `${Math.max(14, lineWidth * 6)}px Inter, sans-serif`;
    ctx.fillText(textInput, textPos.x, textPos.y);
    setTextInput('');
    setTextPos(null);
    saveState();
  }

  function downloadCanvas() {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `rminios-canvas-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  async function handleImageSearch(e) {
    e.preventDefault();
    if (!imageSearchQuery.trim()) return;
    setImageLoading(true);
    try {
      const q = encodeURIComponent(imageSearchQuery.trim());
      const seed1 = Math.floor(Math.random() * 100000);
      const seed2 = Math.floor(Math.random() * 100000);
      const seed3 = Math.floor(Math.random() * 100000);
      setImageResults([
        `https://image.pollinations.ai/prompt/${q}?width=300&height=300&seed=${seed1}&nologo=true`,
        `https://image.pollinations.ai/prompt/${q}%20scientific%20diagram?width=300&height=300&seed=${seed2}&nologo=true`,
        `https://image.pollinations.ai/prompt/${q}%20minimal%20technical%20schematic?width=300&height=300&seed=${seed3}&nologo=true`
      ]);
    } catch (err) {
      console.error('Dynamic image error:', err);
    }
    setImageLoading(false);
  }

  function insertImage(url) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      ctx.drawImage(img, canvas.width/2 - 100, canvas.height/2 - 100, 200, 200);
      saveState();
      setShowImageTools(false);
    };
    img.src = url;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', position: 'relative' }}>
      
      {/* Premium 3D Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'rgba(10,11,15,0.8)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', margin: '0 auto 16px auto', zIndex: 50, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        
        {/* View Toggle */}
        <button className={`btn btn-sm ${is3D ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setIs3D(!is3D)} style={{ marginRight: 8 }}>
          <Box size={14} /> {is3D ? '3D Orbit View' : '2D Draw Mode'}
        </button>

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />

        {/* Tools */}
        <div style={{ display: 'flex', gap: 2, pointerEvents: is3D ? 'none' : 'auto', opacity: is3D ? 0.4 : 1 }}>
          {TOOLS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} className={`btn btn-icon btn-sm ${tool === t.id ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTool(t.id)} title={t.label} style={{ width: 32, height: 32 }}>
                <Icon size={14} />
              </button>
            );
          })}
        </div>

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />

        {/* Colors & Media */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-sm btn-ghost" onClick={() => setShowColorPicker(!showColorPicker)}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: color, border: '2px solid white' }} />
          </button>
          {showColorPicker && (
            <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', zIndex: 100, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: 12, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginTop: 8, boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => { setColor(c); setShowColorPicker(false); }} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: color === c ? '2px solid white' : 'none', cursor: 'pointer' }} />
              ))}
            </div>
          )}
          
          <button className="btn btn-sm btn-secondary" onClick={() => setShowImageTools(!showImageTools)}>
            <ImageIcon size={14} style={{ color: 'var(--emerald)' }} /> Media & AI
          </button>
        </div>

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', marginLeft: 'auto' }} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn-icon btn-ghost btn-sm" onClick={undo} disabled={historyIndex <= 0}><Undo2 size={14} /></button>
          <button className="btn btn-icon btn-ghost btn-sm" onClick={redo} disabled={historyIndex >= history.length - 1}><Redo2 size={14} /></button>
          <button className="btn btn-icon btn-ghost btn-sm" onClick={downloadCanvas}><Download size={14} /></button>
          <button className="btn btn-icon btn-ghost btn-sm" onClick={clearCanvas} style={{ color: 'var(--rose)' }}><Trash2 size={14} /></button>
        </div>
      </div>

      {/* Floating Image Tools Panel */}
      {showImageTools && (
        <div className="card" style={{ position: 'absolute', top: 80, right: 20, width: 300, zIndex: 100, padding: 16, background: 'rgba(10,11,15,0.95)', backdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}><Sparkles size={16} style={{ color: 'var(--purple)' }}/> Image Tools</h4>
            <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setShowImageTools(false)}><X size={14} /></button>
          </div>
          
          <form onSubmit={handleImageSearch} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input type="text" className="input" placeholder="Search or Generate..." value={imageSearchQuery} onChange={e => setImageSearchQuery(e.target.value)} style={{ flex: 1 }} />
            <button type="submit" className="btn btn-primary btn-sm"><Search size={14} /></button>
          </form>

          {imageLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>
          ) : imageResults.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {imageResults.map((url, i) => (
                <div key={i} onClick={() => insertImage(url)} style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={url} alt="Result" style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>Search Google Images or enter an AI prompt to generate art directly onto your canvas.</p>
          )}
        </div>
      )}

      {/* Text input overlay */}
      {textPos && !is3D && (
        <div style={{ position: 'absolute', top: textPos.y, left: textPos.x, zIndex: 20, display: 'flex', gap: 4 }}>
          <input autoFocus className="input" value={textInput} onChange={e => setTextInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addText(); }} style={{ width: 200 }} />
          <button className="btn btn-sm btn-primary" onClick={addText}>Add</button>
        </div>
      )}

      {/* 3D Container Wrapper */}
      <div style={{ 
        flex: 1, position: 'relative', overflow: 'hidden', 
        perspective: '1500px', 
        background: 'radial-gradient(circle at center, #1a1b26 0%, #050508 100%)',
        borderRadius: '16px'
      }}>
        {/* Canvas Element */}
        <div style={{
          width: '100%', height: '100%',
          transform: is3D ? 'rotateX(45deg) rotateZ(-20deg) scale(0.85) translateZ(-50px)' : 'none',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          boxShadow: is3D ? '40px 40px 100px rgba(0,0,0,0.8), -10px -10px 40px rgba(99,102,241,0.1), inset 0 0 20px rgba(255,255,255,0.05)' : 'none',
          borderRadius: is3D ? '24px' : '0px',
          border: is3D ? '2px solid rgba(255,255,255,0.1)' : 'none',
          overflow: 'hidden',
          background: '#0a0b0f'
        }}>
          {is3D && (
            <div style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(99,102,241,0.2)', color: 'var(--accent)', padding: '4px 12px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600, letterSpacing: 1, zIndex: 10 }}>
              3D ORBIT MODE
            </div>
          )}
          <canvas
            ref={canvasRef}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            style={{ 
              display: 'block', width: '100%', height: '100%', 
              cursor: is3D ? 'grab' : tool === 'eraser' ? 'crosshair' : tool === 'text' ? 'text' : 'crosshair' 
            }}
          />
        </div>
      </div>
    </div>
  );
}
