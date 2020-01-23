import { Component, OnInit } from '@angular/core';
import mapboxgl from 'mapbox-gl';
import { MapboxLayer } from '@deck.gl/mapbox';
import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import { registerLoaders } from "@loaders.gl/core";
import { GLTFScenegraphLoader } from "@luma.gl/addons";

@Component({
  selector: 'app-map-box',
  templateUrl: './map-box.component.html',
  styleUrls: ['./map-box.component.scss']
})
export class MapBoxComponent implements OnInit {
  public mapLayerCollection: MapboxLayer[] = [];
  private map: mapboxgl.Map;
  private style = 'mapbox://styles/mapbox/streets-v11';
  private lngLat: mapboxgl.LngLatLike = [19.959764, 50.057488];
  private buildingLayerToggle = false;

  constructor() { }

  public ngOnInit(): void {
    registerLoaders([GLTFScenegraphLoader]);
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';
      this.map = new mapboxgl.Map({
        container: 'map',
        style: this.style,
        zoom: 17,
        pitch: 60,
        center: this.lngLat,
        antialias: true // create the gl context with MSAA antialiasing, so custom layers are antialiased
    });

    this.createDeck3dObjectLayer(
      'duckObject', 
      'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb' ,
      this.lngLat[0],this.lngLat[1], 30
    );

    this.map.on('load', () => {
      this.mapLayerCollection.forEach((layer)=>{
        this.map.addLayer(layer);
      })
    });
  }

  public toggleMap3dDefaultBuildingsLayer(): void{
    !this.buildingLayerToggle ? this.create3dDefaultMapboxBuildingsLayer() : this.removeLayer('3d-buildings');
  }

  private createDeck3dObjectLayer(layerId: string, scenegraphModelUrl: string,
    lng: number,lat: number, sizeScale: number) : void {

      let layer = new MapboxLayer(
      {
        id: layerId,
        type: ScenegraphLayer,
        scenegraph: scenegraphModelUrl,
        data: [ {position: [lng, lat], size: 100} ],
        getPosition: d => d.position,
        sizeScale: sizeScale,
        getOrientation: [0, 330, 90],
        getTranslation: [0, 0, 0],
        getScale: [1, 1, 1],
        pickable: true,
        _lighting: 'pbr',

        onClick: ($event) => {
          alert("Hello! I am a duck and I am guarding my work!!");
        },
      });

        this.mapLayerCollection.push(layer);
  }

  private create3dDefaultMapboxBuildingsLayer(){
    const firstLabelLayerId = this.map.getStyle().layers.find(layer => layer.type === 'symbol').id;

      this.map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#aaa',

            // use an 'interpolate' expression to add a smooth transition effect to the
            // buildings as the user zooms in
            'fill-extrusion-height': [
                "interpolate", ["linear"], ["zoom"],
                15, 0,
                15.05, ["get", "height"]
            ],
            'fill-extrusion-base': [
                "interpolate", ["linear"], ["zoom"],
                15, 0,
                15.05, ["get", "min_height"]
            ],
            'fill-extrusion-opacity': .6
        }
      }, firstLabelLayerId);
       this.buildingLayerToggle = true;
    }

    private removeLayer(layerId: string){
      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId);
    }
      this.buildingLayerToggle = false;
    } 
}
