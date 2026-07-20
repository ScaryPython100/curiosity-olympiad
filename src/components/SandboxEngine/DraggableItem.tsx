import { useState, useRef, useEffect, ReactNode } from 'react';

export type Position = { x: number, y: number };

interface DraggableItemProps {
  id: string;
  initialPosition: Position;
  onDragEnd: (id: string, position: Position) => void;
  onDragStart?: (id: string) => void;
  onDrag?: (id: string, position: Position) => void;
  children: ReactNode;
  bounds?: { width: number, height: number };
}

export function DraggableItem({ id, initialPosition, onDragEnd, onDragStart, onDrag, children, bounds }: DraggableItemProps) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  
  // Track offset from click position to top-left of element
  const offset = useRef<Position>({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setIsDragging(true);
    if (onDragStart) onDragStart(id);
    
    // Calculate where inside the element the user clicked
    const rect = dragRef.current.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    // Capture pointer events so dragging continues even if cursor leaves element
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragRef.current || !dragRef.current.parentElement) return;

    const parentRect = dragRef.current.parentElement.getBoundingClientRect();
    
    // Calculate new position relative to parent container
    let newX = e.clientX - parentRect.left - offset.current.x;
    let newY = e.clientY - parentRect.top - offset.current.y;

    // Enforce bounds if provided
    if (bounds) {
      const rect = dragRef.current.getBoundingClientRect();
      newX = Math.max(0, Math.min(newX, bounds.width - rect.width));
      newY = Math.max(0, Math.min(newY, bounds.height - rect.height));
    }

    setPosition({ x: newX, y: newY });
    if (onDrag) onDrag(id, { x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    onDragEnd(id, position);
    e.target.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      ref={dragRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="absolute cursor-grab active:cursor-grabbing touch-none select-none transition-shadow"
      style={{
        left: position.x,
        top: position.y,
        zIndex: isDragging ? 50 : 10,
        filter: isDragging ? 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
        transform: isDragging ? 'scale(1.05)' : 'scale(1)'
      }}
    >
      {children}
    </div>
  );
}
