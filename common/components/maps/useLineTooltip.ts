import { useEffect, useMemo, useState } from 'react';

import type { Diagram, DiagramProjection } from './diagrams';
import type { CoordinateTransform } from './useDiagramCoordinates';

type Options = {
    diagram: Diagram;
    viewportCoordsToDiagram: CoordinateTransform;
    diagramCoordsToViewport: CoordinateTransform;
    snapToSegment: boolean;
    enabled?: boolean;
    maxDistance?: number;
};

export const useLineTooltip = (options: Options) => {
    const {
        diagram,
        viewportCoordsToDiagram,
        diagramCoordsToViewport,
        snapToSegment,
        enabled = true,
        maxDistance,
    } = options;
    const [projection, setProjection] = useState<null | DiagramProjection>(null);

    const mapCoordinates = useMemo(() => {
        if (projection) {
            if (typeof maxDistance === 'number' && projection.segmentProjection.d! > maxDistance) {
                return null;
            }
            if (snapToSegment) {
                const {
                    segmentLocation: { fromStationId, toStationId },
                } = projection;
                if (fromStationId && toStationId) {
                    const segmentPath = diagram.getPathBetweenStations(fromStationId, toStationId);
                    const midpoint = segmentPath.getPointFromFraction(0.5);
                    return midpoint;
                }
            }
            return projection.segmentProjection;
        }
        return null;
    }, [diagram, projection, maxDistance, snapToSegment]);

    const viewportCoordinates = useMemo(
        () => mapCoordinates && diagramCoordsToViewport(mapCoordinates),
        [mapCoordinates, diagramCoordsToViewport]
    );

    useEffect(() => {
        if (enabled) {
            const handleMouseOver = (evt: MouseEvent) => {
                const mapCoords = viewportCoordsToDiagram({
                    x: evt.clientX,
                    y: evt.clientY,
                });
                setProjection(diagram.project(mapCoords));
            };
            window.addEventListener('mousemove', handleMouseOver);
            return () => window.removeEventListener('mousemove', handleMouseOver);
        }
    }, [enabled, diagram, viewportCoordsToDiagram, diagramCoordsToViewport]);

    return { viewportCoordinates, mapCoordinates, segmentLocation: projection?.segmentLocation };
};
