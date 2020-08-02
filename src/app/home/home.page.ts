import { Component } from '@angular/core';
import {Map, tileLayer, marker, icon, CRS, polygon, LatLng, LayerGroup, latLngBounds, latLng} from 'leaflet';
import { Plugins } from '@capacitor/core';

import {GeoAdminChService} from './../geo-admin-ch.service';
import {CantonSearchResult} from '../CantonSearchResult';
import {AlertController} from '@ionic/angular';
import {CantonDisplay} from '../CantonDisplay';

const { Geolocation } = Plugins;

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  // map presentation
  map: Map;
  layerGroup: LayerGroup;
  // geolocation
  latitude: number;
  longitude: number;
  accuracy: number;
  // canton selected
  csr: CantonSearchResult;
  title: string;
  abbr: string;

  // Hint Outside CH
  txthint: string;
  txtoutsidech: string;
  txtdismiss: string;

  constructor(
      private geoAdminChService: GeoAdminChService,
      private alertCtrl: AlertController,
      private translate: TranslateService
  ) {
    // empty constructor
    this.title = 'Standort wird ermittelt...';
    this.layerGroup = new LayerGroup<any>();
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

    if ( this.map === undefined ) {

      this.map = new Map('map', {crs: CRS.EPSG3857, worldCopyJump: false});
      // ch.swisstopo.pixelkarte-grau
      // ch.swisstopo.pixelkarte-farbe
      tileLayer('https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg',
          {attribution: 'Map data © <a href="https:// www.geo.admin.ch">Geo Portal des Bundes</a>'})
          .addTo(this.map); // This line is added to add the Tile Layer to our map

      // tslint:disable-next-line:one-variable-per-declaration
      const southWest = latLng(45.16, 5.3), // Grenoble
          northEast = latLng(48.18, 10.9); // München

      // southWest = latLng(46.204391, 6.143158); // Genf
      // northEast = latLng(47.503040, 47.747); // Bregenz

      const bounds = latLngBounds(southWest, northEast);

      this.map.setMaxZoom(12);
      this.map.setMinZoom(5);

      this.map.setMaxBounds(bounds);

    }

    // remove old stuff
    this.map.removeLayer(this.layerGroup);
    // initialize
    this.layerGroup = new LayerGroup<any>();


    // retrieve canton data
    this.geoAdminChService.getCanton(this.longitude, this.latitude).subscribe( resp => {
      // console.log(resp);
      this.csr = resp.body;
      const result = this.csr.results[0];
      if (result === undefined){
        this.presentOutsideSwitzerlandAlert();
      }else{

        this.title = this.csr.results[0].attributes.name;

        const bBoxArr: Array<number> = this.csr.results[0].bbox;
        const centerLat = (bBoxArr[1] + bBoxArr[3]) / 2;
        const centerLng = (bBoxArr[0] + bBoxArr[2]) / 2;
        // const extentLat = bBoxArr[3] - bBoxArr[1];
        // console.log("extentLat=" + extentLat);
        const extentLng = bBoxArr[2] - bBoxArr[0];
        console.log('extentLng=' + extentLng);

        // extentLng=0.31200399999999995 --> zoom 10
        // extentLng = 0.8941440000000007 > zoom 9
        // extentLng=1.875807 --> 8
        const zoom = Math.round(10.4 - (extentLng * 1.5 ));
        console.log('zoom=' + zoom);
        // center to values given by bbox
        this.map.setView([centerLat, centerLng], zoom);

        this.abbr = this.csr.results[0].attributes.ak;
        const cantonDisplay: CantonDisplay = CantonDisplay[this.abbr];
        const cantonIcon = icon({
          iconUrl: '/assets/icon/' + this.abbr + '.png',
          iconSize:     [20, 25], // size of the icon
          iconAnchor:   [10, 25], // point of the icon which will correspond to marker's location
        });
        marker([this.latitude, this.longitude], {icon: cantonIcon}).addTo(this.layerGroup);
        // marker([this.latitude,this.longitude]).addTo(this.layerGroup);

        let cnt = 0;
        for (const polygonArray of this.csr.results[0].geometry.rings) {
          // console.log("number of points " + polygonArray.length);
          const polyArr: LatLng[] = [];
          // swap x and y
          for (const posArray of polygonArray){
            const latlng = new LatLng(posArray[1], posArray[0]);
            polyArr.push(latlng);
          }
          if (cnt === 0 && this.abbr === 'SGXXXXXXX'){
            polygon( [
              polyArr, // outer ring
              [[47.415659, 9.4899445], [47.334930, 9.406594], [47.385849, 9.278850]] // hole
            ], {color: cantonDisplay.color, fillColor: cantonDisplay.fillColor, fillOpacity: 0.5}).addTo(this.layerGroup);
          }else{
            polygon( polyArr, {color: cantonDisplay.color, fillColor: cantonDisplay.fillColor, fillOpacity: 0.5}).addTo(this.layerGroup);
          }
          cnt++;
        }

        // finally add all objects to the map
        this.map.addLayer(this.layerGroup);
        // this.map.fitBounds(this.layerGroup.getBounds())
      }
    });

  }

  _initialiseTranslation(): void {
    this.translate.get('txthint').subscribe((res: string) => {
      this.txthint = res;
    });
    this.translate.get('txt_outside_ch').subscribe((res: string) => {
      this.txtoutsidech = res;
    });
    this.translate.get('txt_dismiss').subscribe((res: string) => {
      this.txtdismiss = res;
    });
  }

  presentOutsideSwitzerlandAlert() {

    this.alertCtrl.create({
      animated: true,
      header: this.txthint,
      message: this.txtoutsidech,
      buttons: [this.txtdismiss]
    }).then(alertEl => alertEl.present());

  }

  simKt(abbr: string) {
    const cantonDisplay: CantonDisplay = CantonDisplay[abbr];
    this.latitude = cantonDisplay.lat;
    this.longitude = cantonDisplay.lng;
    this.accuracy = 10;
    this.showCanton();
  }

  dumpCurl() {

    const arr: string[] = Object.keys(CantonDisplay);
    for (const abbr of arr) {
      const cantonDisplay: CantonDisplay = CantonDisplay[abbr];
      console.log('curl --location --request GET \'https://api3.geo.admin.ch/rest/services/all/MapServer/identify?geometryType=esriGeometryPoint&tolerance=0&lang=de&layers=all:ch.swisstopo.swissboundaries3d-kanton-flaeche.fill&sr=4326&geometry=' + cantonDisplay.lng + ',' + cantonDisplay.lat + '\' > ' + abbr + '.json');
    }

  }


  simRandom() {
    const arr: string[] = Object.keys(CantonDisplay);
    const random = Math.floor(Math.random() * arr.length);
    const randomAbbr = arr[random];
    const cantonDisplay: CantonDisplay = CantonDisplay[randomAbbr];
    this.latitude = cantonDisplay.lat;
    this.longitude = cantonDisplay.lng;
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
