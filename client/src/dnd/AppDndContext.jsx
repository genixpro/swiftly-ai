import React from 'react';
import {DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors} from '@dnd-kit/core';

export default function AppDndContext({children}) {
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));
    return <DndContext
        sensors={sensors}
        onDragEnd={({active, over}) => over?.data.current?.onDrop?.(active.data.current)}
        accessibility={{screenReaderInstructions: {draggable: 'Press space to pick up extracted text, move to a field with arrow keys, then press space to drop.'}}}
    >{children}</DndContext>;
}
