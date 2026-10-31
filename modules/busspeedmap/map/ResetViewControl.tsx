import { useState } from 'react';
import { createPortal } from 'react-dom';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useControl } from 'react-map-gl/maplibre';

/**
 * A "home" button that returns the map to its opening view. MapLibre places the container like
 * one of its own controls, so the button stacks under the zoom buttons and takes their styling;
 * React only renders what goes inside it.
 */
export const ResetViewControl = ({ onReset }: { onReset: () => void }) => {
  const [container] = useState(() => {
    const element = document.createElement('div');
    element.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    return element;
  });
  useControl(() => ({ onAdd: () => container, onRemove: () => container.remove() }), {
    position: 'top-right',
  });

  return createPortal(
    <button type="button" title="Reset view" aria-label="Reset map view" onClick={onReset}>
      <FontAwesomeIcon icon={faHouse} className="text-stone-700" />
    </button>,
    container
  );
};
