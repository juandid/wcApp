import { Component } from '@angular/core';
import {Map, tileLayer, marker, icon, CRS, polygon, LatLng, LayerGroup} from 'leaflet';
import { Plugins } from '@capacitor/core';

import {GeoAdminChService} from './../geo-admin-ch.service';
import {Lv95} from "../lv95";
import {CantonSearchResult} from "../CantonSearchResult";
import {AlertController} from "@ionic/angular";
import {CantonDisplay} from "../CantonDisplay";

const { Geolocation } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  map:Map;
  latitude: number;
  longitude: number;
  accuracy: number;
  title: string;
  abbreviation: string;
  layerGroup: LayerGroup;
  pos: Lv95;
  csr: CantonSearchResult;

  constructor(
      private geoAdminChService: GeoAdminChService,
      private alertCtrl: AlertController
  ) {
    //empty constructor
    this.title = "Standort wird ermittelt...";
    this.layerGroup = new LayerGroup<any>();

    var greenIcon = icon({
      iconUrl: 'SG.png',
      iconSize:     [164, 207], // size of the icon
      iconAnchor:   [80, 207], // point of the icon which will correspond to marker's location
    });

  }

  // The below function is added
  ionViewDidEnter(){
    this.showCurrentCanton();
  }

  // The below function is added
  showCurrentCanton(){

    Geolocation.getCurrentPosition({ maximumAge: 5000, timeout: 10000, enableHighAccuracy: false }).then((resp) => {

      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;
      this.accuracy = resp.coords.accuracy;

      console.log(this.latitude + ',' + this.longitude);

      this.showCanton();

    }).catch((error) => {
      alert('Error getting location' + JSON.stringify(error));
    });

  }

  showCanton() {
    if(this.map == undefined){
      //TODO take care of the valid map area
      this.map = new Map("map", {crs: CRS.EPSG3857, worldCopyJump: false});
      //ch.swisstopo.pixelkarte-grau
      //ch.swisstopo.pixelkarte-farbe
      tileLayer('https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg',
          { attribution: 'Map data © <a href="https://www.geo.admin.ch">Geo Portal des Bundes</a>'})
          .addTo(this.map); // This line is added to add the Tile Layer to our map
    }

    //remove old stuff
    this.map.removeLayer(this.layerGroup);
    //initialize
    this.layerGroup = new LayerGroup<any>();



    //retrieve canton data
    this.geoAdminChService.getCanton(this.longitude, this.latitude).subscribe( resp =>{
      //console.log(resp);
      this.csr = resp.body;
      this.title = this.csr.results[0].attributes.name;

      const bBoxArr: Array<number> = this.csr.results[0].bbox;
      const centerLat = (bBoxArr[1] + bBoxArr[3])/2;
      const centerLng = (bBoxArr[0] + bBoxArr[2])/2;
      //center to values given by bbox
      this.map.setView([centerLat,centerLng], 9);

      //console.log(this.canton);
      //console.log(this.csr.results[0].attributes.ak);
      const cantonDisplay: CantonDisplay = CantonDisplay[this.csr.results[0].attributes.ak];

      marker([this.latitude,this.longitude]).addTo(this.layerGroup);

      for (let polygonArray of this.csr.results[0].geometry.rings) {
        //console.log("number of points " + polygonArray.length);
        var polyArr: LatLng[] = [];
        //swap x and y
        for(let posArray of polygonArray){
          let latlng = new LatLng(posArray[1],posArray[0]);
          polyArr.push(latlng);
        }
        polygon( polyArr, {color: cantonDisplay.color, fillColor: cantonDisplay.fillColor, fillOpacity: 0.5}).addTo(this.layerGroup);
      }

      //finally add all objects to the map
      this.map.addLayer(this.layerGroup);
    })

  }

  simAI() {

    this.latitude = 47.334930;
    this.longitude = 9.406594;
    this.accuracy = 10;

    this.showCanton();

  }

  simTG() {

    this.latitude = 47.495700;
    this.longitude = 9.463580;
    this.accuracy = 10;

    this.showCanton();

  }

  simAR() {

    this.latitude = 47.411130;
    this.longitude = 9.442970;
    this.accuracy = 10;

    this.showCanton();
  }

  simGE() {

    this.latitude = 46.204391;
    this.longitude = 6.143158;
    this.accuracy = 10;

    this.showCanton();
  }

}
