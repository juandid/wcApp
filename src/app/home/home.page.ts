import { Component } from '@angular/core';
import {Map as GeoMap, tileLayer, marker, icon, CRS, polygon, LatLng, LayerGroup, latLngBounds, latLng, LeafletEvent} from 'leaflet';
import { Plugins } from '@capacitor/core';

import {GeoService} from '../geo.service';
import {AlertController} from '@ionic/angular';
import {CantonDisplay} from '../CantonDisplay';
const { Geolocation } = Plugins;

import { TranslateService } from '@ngx-translate/core';
import {MapViewSettings} from '../MapViewSettings';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  // map presentation
  map: GeoMap;
  layerGroup: LayerGroup;
  mvs: MapViewSettings;
  // geolocation
  latitude: number;
  longitude: number;
  accuracy: number;
  // canton selected
  title: string;
  abbr: string;

  // Hint Outside CH
  txthint: string;
  txterror: string;
  txtoutsidech: string;
  txtlocatingerror: string;
  txtdismiss: string;
  txtlocating: string;
  txtyouareat: string;

  constructor(
      private alertCtrl: AlertController,
      private translate: TranslateService,
      private geoAdminChService: GeoService
  ) {
    // empty constructor
    this.title = this.txtlocating;
    this.layerGroup = new LayerGroup<any>();
  }

  // The below function is added
  ionViewDidEnter(){
    this._initialiseTranslation();
    this.showCurrentCanton();
  }

  // The below function is added
  showCurrentCanton(){

    Geolocation.getCurrentPosition({ timeout: 5000, enableHighAccuracy: true }).then((resp) => {

      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;
      this.accuracy = resp.coords.accuracy;

      this.showCanton();

    }).catch((error) => {
      this.alertCtrl.create({
        animated: true,
        header: this.txterror,
        message: this.txtlocatingerror,
        buttons: [this.txtdismiss]
      }).then(alertEl => alertEl.present());
      this.showNoCanton();
    });

  }

  showNoCanton() {
    this.setupMap();
    this.map.setView([47.0, 8.3], 8);
  }

  showCanton() {
    this.setupMap();
    this.abbr = this.geoAdminChService.findCanton(this.longitude, this.latitude);

    if (this.abbr === undefined){
        this.map.setView([47.0, 8.3], 8);
        this.presentOutsideSwitzerlandAlert();
    }else{

        const cantonDisplay: CantonDisplay = CantonDisplay[this.abbr];
        this.title = this.txtyouareat + ' ' + cantonDisplay.label;

        const baseIcon = icon({
        iconUrl: '/assets/icon/base-marker.png',
        iconSize:     [20, 29], // size of the icon
        iconAnchor:   [10, 25], // point of the icon which will correspond to marker's location
      });
        marker([this.latitude, this.longitude], {icon: baseIcon}).addTo(this.layerGroup);

        const cantonIcon = icon({
          iconUrl: '/assets/icon/' + this.abbr + '.png',
          iconSize:     [20, 25], // size of the icon
          iconAnchor:   [10, 45], // point of the icon which will correspond to marker's location
        });
        marker([this.latitude, this.longitude], {icon: cantonIcon}).addTo(this.layerGroup).bindPopup(`Latitude: ${this.latitude}<br>Longitude: ${this.longitude}<br>Accuracy: ${this.accuracy}`).openPopup();

        let cnt = 0;
        for ( const polygonArray of this.geoAdminChService.getRingsFor(this.abbr)) {

          const polyArr: LatLng[] = [];
          // swap x and y
          for (const posArray of polygonArray){
            polyArr.push(new LatLng(posArray[1], posArray[0]));
          }

          const polygons: LatLng[][][] = [[ polyArr], []];

          const exclusions = this.geoAdminChService.getExclusionsFor(this.abbr, cnt);
          if ( this.abbr === 'SG' && cnt === 0){

            // union of ar 0 and all ai exclusions
            polygons[1].push(this.geoAdminChService.getUnionedPolygonsOfArAndAi());
            // exclusion of tg 1
            polygons[1].push(this.geoAdminChService.getAndSwapPolygonCoordinates(this.geoAdminChService.getCantInd('TG'), 1));

          } else {
            const type = typeof exclusions;
            // tslint:disable-next-line:prefer-for-of
            for ( let i = 0; i < exclusions.length; i++ ) {
              const exclusion = exclusions[i];
              polygons[1].push(this.geoAdminChService.getAndSwapPolygonCoordinates(exclusion.cantInd, exclusion.ringInd));
            }
          }

          // tslint:disable-next-line:max-line-length
          polygon( polygons, {color: cantonDisplay.color, fillColor: cantonDisplay.fillColor, fillOpacity: cantonDisplay.fillOpacity}).addTo(this.layerGroup);

          cnt++;
        }

        // finally add all objects to the map
        this.map.addLayer(this.layerGroup);

        // this.map.fitBounds(this.geoAdminChService.getBounds(this.abbr));


        this.mvs = this.geoAdminChService.calculateMapViewSettings(this.abbr);
        // console.log('map setView center' + mvs.centerLng + ',' + mvs.centerLng + ' zoom 10');
        // center to values given by bbox
        this.map.setView([this.mvs.centerLat, this.mvs.centerLng], this.mvs.zoom);

        this.map.on('zoom', (event: LeafletEvent) => {
                // console.log(this.map.getZoom());
                if (this.map.getZoom() > this.mvs.zoom){
                  this.map.panTo([this.latitude, this.longitude]);
                }else{
                  this.map.panTo([this.mvs.centerLat, this.mvs.centerLng]);
                }

            }
        );

      }

  }

  setupMap() {
    if ( this.map === undefined ) {

      this.map = new GeoMap('map', {crs: CRS.EPSG3857, worldCopyJump: false});
      // ch.swisstopo.pixelkarte-grau
      // ch.swisstopo.pixelkarte-farbe
      const tileUrlOnline = 'https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg';
      const tileUrlOffline = '/assets/tiles/{z}/{x}/{y}.jpeg';
      tileLayer(tileUrlOffline, {attribution: 'Map data © <a href="https://www.geo.admin.ch">geo.admin.ch</a>'})
          .addTo(this.map); // This line is added to add the Tile Layer to our map

      // tslint:disable-next-line:one-variable-per-declaration
      const southWest = latLng(45.16, 5.3), // Grenoble
          northEast = latLng(48.18, 10.9); // München

      // southWest = latLng(46.204391, 6.143158); // Genf
      // northEast = latLng(47.503040, 47.747); // Bregenz

      const bounds = latLngBounds(southWest, northEast);

      this.map.setMaxZoom(11);
      this.map.setMinZoom(8);

      this.map.setMaxBounds(bounds);

    }

    // remove old stuff
    this.map.removeLayer(this.layerGroup);
    // initialize
    this.layerGroup = new LayerGroup<any>();
  }

  _initialiseTranslation(): void {
    this.translate.get('txthint').subscribe((res: string) => {
      this.txthint = res;
    });
    this.translate.get('txterror').subscribe((res: string) => {
      this.txterror = res;
    });
    this.translate.get('txtoutsidech').subscribe((res: string) => {
      this.txtoutsidech = res;
    });
    this.translate.get('txtlocatingerror').subscribe((res: string) => {
      this.txtlocatingerror = res;
    });
    this.translate.get('txtdismiss').subscribe((res: string) => {
      this.txtdismiss = res;
    });
    this.translate.get('txtlocating').subscribe((res: string) => {
      this.txtlocating = res;
    });
    this.translate.get('txtyouareat').subscribe((res: string) => {
      this.txtyouareat = res;
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

  simHornTG() {

    this.latitude = 47.495701;
    this.longitude = 9.463580;
    this.accuracy = 10;

    this.showCanton();
  }

}
