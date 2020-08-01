import { Component } from '@angular/core';
import {Map, tileLayer, marker, icon, CRS, polygon, LatLng, LayerGroup, latLngBounds, latLng} from 'leaflet';
import { Plugins } from '@capacitor/core';

import {GeoAdminChService} from './../geo-admin-ch.service';
import {Lv95} from "../lv95";
import {CantonSearchResult} from "../CantonSearchResult";
import {AlertController} from "@ionic/angular";
import {CantonDisplay} from "../CantonDisplay";

const { Geolocation } = Plugins;

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  //map presentation
  map:Map;
  layerGroup: LayerGroup;
  //geolocation
  latitude: number;
  longitude: number;
  accuracy: number;
  //canton selected
  csr: CantonSearchResult;
  title: string;
  abbreviation: string;

  //Hint Outside Switzerland
  txt_hint: string;
  txt_outside_ch: string;


  constructor(
      private geoAdminChService: GeoAdminChService,
      private alertCtrl: AlertController,
      private translate: TranslateService
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
    this._initialiseTranslation();
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

      this.map = new Map("map", {crs: CRS.EPSG3857, worldCopyJump: false});
      //ch.swisstopo.pixelkarte-grau
      //ch.swisstopo.pixelkarte-farbe
      tileLayer('https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg',
          { attribution: 'Map data © <a href="https://www.geo.admin.ch">Geo Portal des Bundes</a>'})
          .addTo(this.map); // This line is added to add the Tile Layer to our map

      var southWest = latLng(45.16, 5.3), //Grenoble
          northEast = latLng(48.18, 10.9); //München

      //southWest = latLng(46.204391, 6.143158); //Genf
      //northEast = latLng(47.503040, 47.747); //Bregenz

      var bounds = latLngBounds(southWest, northEast);

      this.map.setMaxZoom(11);
      this.map.setMinZoom(8);

      this.map.setMaxBounds(bounds);

    }

    //remove old stuff
    this.map.removeLayer(this.layerGroup);
    //initialize
    this.layerGroup = new LayerGroup<any>();


    //retrieve canton data
    this.geoAdminChService.getCanton(this.longitude, this.latitude).subscribe( resp =>{
      //console.log(resp);
      this.csr = resp.body;
      const result = this.csr.results[0];
      if(result == undefined){
        this.presentOutsideSwitzerlandAlert();
      }else{

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
      }
    })

  }

  _initialiseTranslation(): void {
    this.translate.get('txt_hint').subscribe((res: string) => {
      this.txt_hint = res;
    });
    this.translate.get('txt_outside_ch').subscribe((res: string) => {
      this.txt_outside_ch = res;
    });
  }

  presentOutsideSwitzerlandAlert() {

    this.alertCtrl.create({
      animated: true,
      header: this.txt_hint,
      message: this.txt_outside_ch,
      buttons: ['Verstanden']
    }).then(alertEl => alertEl.present());

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

  simVorarlberg() {

    this.latitude = 47.503040;
    this.longitude = 9.747070;
    this.accuracy = 10;

    this.showCanton();
  }
}
