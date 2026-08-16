import type { MutableRefObject } from 'react';
import type {
  CollisionDetection,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  pointerWithin,
  rectIntersection,
  closestCorners,
} from '@dnd-kit/core';

/**
 * Custom collision detection strategy for nested sortable.
 * 
 * - When dragging a Group: only detect collisions with root-level items.
 * - When dragging a Task:
 *   - If pointer is within a specific child task or root task, target that task.
 *   - If pointer is within group children area (${group.id}-droppable), target that group's children.
 *   - If pointer is within group header/container (outside children), target root level (before the group).
 */
export function createCustomCollisionDetection(
  lastOverIdRef: MutableRefObject<UniqueIdentifier | null>
): CollisionDetection {
  return (args) => {
    const activeType = args.active.data.current?.type;

    // When dragging a Group, only collide with root-level items
    if (activeType === 'group') {
      const rootDroppables = args.droppableContainers.filter(
        (c) => c.data.current?.containerId === 'root'
      );
      return closestCorners({
        ...args,
        droppableContainers: rootDroppables,
      });
    }

    // When dragging a Task:
    // 1. First try pointerWithin
    const pointerCollisions = pointerWithin(args);

    if (pointerCollisions.length > 0) {
      // Priority 1: A specific task (child task or root task)
      const taskCollision = pointerCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.type === 'task'
      );
      if (taskCollision) {
        lastOverIdRef.current = taskCollision.id;
        return [taskCollision];
      }

      // Priority 2: Group children drop zone (${group.id}-droppable)
      const groupZoneCollision = pointerCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.isGroupDropZone
      );
      if (groupZoneCollision) {
        lastOverIdRef.current = groupZoneCollision.id;
        return [groupZoneCollision];
      }

      // Priority 3: Root Group header / container (when hovering over header or group border)
      const groupCollision = pointerCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.type === 'group'
      );
      if (groupCollision) {
        lastOverIdRef.current = groupCollision.id;
        return [groupCollision];
      }

      const first = pointerCollisions[0];
      lastOverIdRef.current = first.id;
      return [first];
    }

    // 2. Fallback to rectIntersection
    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) {
      const taskCollision = rectCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.type === 'task'
      );
      if (taskCollision) {
        lastOverIdRef.current = taskCollision.id;
        return [taskCollision];
      }

      const groupZoneCollision = rectCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.isGroupDropZone
      );
      if (groupZoneCollision) {
        lastOverIdRef.current = groupZoneCollision.id;
        return [groupZoneCollision];
      }

      const groupCollision = rectCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.type === 'group'
      );
      if (groupCollision) {
        lastOverIdRef.current = groupCollision.id;
        return [groupCollision];
      }

      const first = rectCollisions[0];
      lastOverIdRef.current = first.id;
      return [first];
    }

    // 3. Fallback to closestCorners
    const closest = closestCorners(args);
    if (closest.length > 0) {
      lastOverIdRef.current = closest[0].id;
      return closest;
    }

    if (lastOverIdRef.current) {
      return [{ id: lastOverIdRef.current }];
    }

    return [];
  };
}

