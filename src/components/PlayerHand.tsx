import React, { useCallback } from 'react';
import type { Card } from '../types';
import MahjongTile from './MahjongTile';
import useGameStore from '../hooks/useGameStore';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PlayerHandProps {
  cards: Card[];
  playerId: number;
  isCurrentPlayer?: boolean;
  faceDown?: boolean;
  selectable?: boolean;
  onTileClick?: (card: Card) => void;
  onCardsReorder?: (newCards: Card[]) => void;
}

interface SortableTileProps {
  card: Card;
  index: number;
  isSelected: boolean;
  selectable: boolean;
  faceDown: boolean;
  onTileClick?: (card: Card) => void;
}

const SortableTile: React.FC<SortableTileProps> = ({
  card,
  index,
  isSelected,
  selectable,
  faceDown,
  onTileClick,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <MahjongTile
        card={card}
        selected={isSelected}
        selectable={selectable}
        faceDown={faceDown}
        onClick={() => onTileClick?.(card)}
      />
    </div>
  );
};

const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  playerId,
  isCurrentPlayer = false,
  faceDown = false,
  selectable = false,
  onTileClick,
  onCardsReorder,
}) => {
  const selectedCombination = useGameStore((state: any) => state.state.selectedCombination);
  const updatePlayerHand = useGameStore((state: any) => state.updatePlayerHand);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 移动8px才开始拖拽，避免误触
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = cards.findIndex((card) => card.id === active.id);
      const newIndex = cards.findIndex((card) => card.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newCards = arrayMove(cards, oldIndex, newIndex);
        
        // 调用回调更新手牌顺序
        if (onCardsReorder) {
          onCardsReorder(newCards);
        } else {
          // 默认更新store中的手牌
          updatePlayerHand(playerId, newCards);
        }
      }
    }
  }, [cards, playerId, onCardsReorder, updatePlayerHand]);

  // 只有当前玩家且是人类玩家才能拖拽
  const canDrag = isCurrentPlayer && playerId === 0 && !faceDown;

  return (
    <div className="player-hand">
      {canDrag && (
        <div className="text-center text-xs text-white/70 mb-1 flex items-center justify-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17V7m0 10l-5-5m5 5l5-5M17 7v10m0-10l5 5m-5-5l-5 5"/>
          </svg>
          <span>拖拽卡牌调整顺序</span>
        </div>
      )}
      {canDrag ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={cards.map(card => card.id)}
            strategy={rectSortingStrategy}
          >
            <div className="flex gap-1 flex-wrap justify-center">
              {cards.map((card, index) => {
                const isSelected = selectedCombination.some((c: Card) => c.id === card.id);
                return (
                  <SortableTile
                    key={card.id}
                    card={card}
                    index={index}
                    isSelected={isSelected}
                    selectable={selectable}
                    faceDown={faceDown}
                    onTileClick={onTileClick}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex gap-1 flex-wrap justify-center">
          {cards.map((card) => {
            const isSelected = selectedCombination.some((c: Card) => c.id === card.id);
            return (
              <MahjongTile
                key={card.id}
                card={card}
                selected={isSelected}
                selectable={selectable}
                faceDown={faceDown}
                onClick={() => onTileClick?.(card)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlayerHand;
