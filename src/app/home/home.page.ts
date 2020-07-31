import { Component } from '@angular/core';
import {Map, tileLayer, marker, icon, CRS, polygon, circle, LatLngExpression, LatLng} from 'leaflet';
import { Plugins } from '@capacitor/core';

import {GeoAdminChService} from './../geo-admin-ch.service';
import {Lv95} from "../lv95";
import {CantonSearchResult} from "../CantonSearchResult";
import {AlertController} from "@ionic/angular";

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
  canton: string;
  easting: number;
  northing: number;
  pos: Lv95;
  csr: CantonSearchResult;

  constructor(
      private geoAdminChService: GeoAdminChService,
      private alertCtrl: AlertController
  ) {
    //empty constructor
    this.canton = "Welcher Kanton?";
  }

  // The below function is added
  ionViewDidEnter(){
    this.loadMap();
  }

  // The below function is added
  loadMap(){

    Geolocation.getCurrentPosition({ maximumAge: 5000, timeout: 10000, enableHighAccuracy: false }).then((resp) => {

      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;
      this.accuracy = resp.coords.accuracy;

      console.log(this.latitude + ',' + this.longitude);

      this.map = new Map("map", {crs: CRS.EPSG3857, worldCopyJump: false}).setView([this.latitude,this.longitude], 9);
      tileLayer('https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg',
          { attribution: 'Map data © <a href="https://www.geo.admin.ch">Geo Portal des Bundes</a>'})
          .addTo(this.map); // This line is added to add the Tile Layer to our map


      marker([this.latitude,this.longitude]).addTo(this.map);

      /*polygon([
        [47.465012, 9.044770], //Wil
        [47.478298, 9.492990], //Rorschach
        [47.377892, 9.539830], //Altstätten
        [47.047859, 9.440560], //Sargans
        [47.226620, 8.818400] //Rapperswil-Jona
      ], {color: 'green', fillColor: 'lightgreen', fillOpacity: 0.5}).addTo(this.map);


     */
      this.determineCanton();

    }).catch((error) => {
      alert('Error getting location' + JSON.stringify(error));
    });

  }

  determineCanton() {

      //retrieve canton data
      this.geoAdminChService.getCanton(this.longitude, this.latitude).subscribe( resp =>{
        //console.log(resp);
        this.csr = resp.body;
        //console.log("csr.result size = " + this.csr.result.length);
        this.canton = this.csr.results[0].attributes.name;

        console.log("number of rings " + this.csr.results[0].geometry.rings.length);

        var colorArr: string[] = ['green', 'red', 'blue'];
        var fillColorArr: string[] = ['lightgreen', 'lightred', 'lightblue'];
        var pCnt: number = 0;

        for (let polygonArray of this.csr.results[0].geometry.rings) {
          console.log("number of points " + polygonArray.length);


          var polyArr: LatLng[] = [];
          //swap x and y
          for(let posArray of polygonArray){
            let latlng = new LatLng(posArray[1],posArray[0]);
            polyArr.push(latlng);
          }
          polygon( polyArr, {color: colorArr[pCnt], fillColor: fillColorArr[pCnt], fillOpacity: 0.5}).addTo(this.map);
          pCnt++;
        }


      })

  }

  simAI() {

    this.latitude = 47.334930;
    this.longitude = 9.406594;
    this.accuracy = 10;

    this.determineCanton();

  }

  simAR() {

    this.latitude = 47.411130;
    this.longitude = 9.442970;
    this.accuracy = 10;

    this.determineCanton();
  }


}
