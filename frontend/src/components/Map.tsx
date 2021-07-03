import type { LatLngExpression, LeafletMouseEvent, PathOptions } from 'leaflet';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { polygon as turfPolygon, area as turfArea } from '@turf/turf';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents } from 'react-leaflet';

export interface LocationMarkerProps {
    onMapClick: (e: LeafletMouseEvent) => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ onMapClick }) => {
    const [position, setPosition] = useState<LatLngExpression>();
    const map = useMapEvents({
        click(e) {
            onMapClick(e);
        },
        locationfound(e) {
            console.log('location', e)
            setPosition(e.latlng)
        },
    })
    useEffect(() => {
        map.locate({setView: true, maxZoom: 16});
    }, [map])
    return (position ?
        <Marker position={position}>
            <Popup>You are here</Popup>
        </Marker> : <span></span>
    )
}

type CustomMarker = { position: LatLngExpression };

export interface Props {
    center: [number, number];
    overlays?: { polygon: LatLngExpression[], options: PathOptions }[];
    mode: 'draw' | 'place';
    markers?: CustomMarker[];
    onAreaCreate?: (polygon: LatLngExpression[]) => void;
    onPlace?: (position: LatLngExpression) => void;
    onMarkerSelect?: (marker: CustomMarker) => void;
}

const Map: React.FC<Props> = ({ mode, center, overlays, markers, onAreaCreate, onPlace, onMarkerSelect }) => {

    const [drawingMarkers, setDrawingMarkers] = useState<LatLngExpression[]>([]);

    const [dragIndex, setDragIndex] = useState<number | null>(null);

    const onMapClick = (e: LeafletMouseEvent) => {
        switch (mode) {
            case 'draw':
                setDrawingMarkers(prev => [...prev, e.latlng]);
                break;
            case 'place':
                onPlace?.(e.latlng);
                break;

            default:
                break;
        }
    };

    useEffect(() => {
        if (drawingMarkers.length > 3 && onAreaCreate) {
            onAreaCreate(drawingMarkers);
            //@ts-ignore
            const polygon = turfPolygon([[...drawingMarkers.map(value => [value.lng, value.lat]), [drawingMarkers[0].lng, drawingMarkers[0].lat]]]);
            const area = turfArea(polygon);
            console.log(area);
        };
    }, [drawingMarkers, onAreaCreate]);

    const eventHandlers = React.useMemo(
        () => ({
            dragstart(e: any) {
                //@ts-ignore;
                setDragIndex(drawingMarkers.findIndex(item => item.lat === e.target._latlng.lat && item.lng === e.target._latlng.lng));
            },
            dragend(e: any) {
                setDrawingMarkers(prev => {
                    if (dragIndex === null || dragIndex < 0) return prev;
                    prev[dragIndex] = e.target._latlng;
                    return [...prev];
                });
            },
        }),
        [drawingMarkers, dragIndex],
    )

    const markerEventsHandlers = React.useMemo(
        () => ({
            click(e: any) {
                //@ts-ignore;
                const foundMarker = markers?.find(marker => marker.position[0] === e.latlng.lat && marker.position[1] === e.latlng.lng);
                if(!onMarkerSelect || !foundMarker) return;
                onMarkerSelect(foundMarker);

            },
        }),
        [markers],
    )

    return (
        <MapContainer style={{ height: '100%' }} center={center} zoom={13} scrollWheelZoom={false}>
            <TileLayer
                attribution='<a href=\"https://www.maptiler.com/copyright/\" target=\"_blank\">&copy; MapTiler</a> <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">&copy; OpenStreetMap contributors</a>'
                url="https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=bqE39MC1GReby6O5JNcr"
            />
            {overlays?.map(overlay => (
                <Polygon pathOptions={overlay.options} positions={overlay.polygon} />
            ))}
            {markers?.map(marker => (
                <Marker position={marker.position} eventHandlers={markerEventsHandlers}></Marker>
            ))}
            {mode === 'draw' && drawingMarkers?.map(drawingMarker => (
                <Marker position={drawingMarker} draggable eventHandlers={eventHandlers}></Marker>
            ))}
            {mode === 'draw' && drawingMarkers && <Polygon positions={drawingMarkers} />}
            <LocationMarker onMapClick={onMapClick} />

        </MapContainer>
    )
}

export default Map;
