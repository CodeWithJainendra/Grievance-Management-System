import React from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const LeafletBackground = () => {
    // India center coordinates
    const center = [20.5937, 78.9629]
    const zoom = 5

    return (
        <div className="w-full h-full">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={false}
                zoomControl={false}
                dragging={false}
                doubleClickZoom={false}
                className="w-full h-full"
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    opacity={0.6}
                />
            </MapContainer>
        </div>
    )
}

export default LeafletBackground