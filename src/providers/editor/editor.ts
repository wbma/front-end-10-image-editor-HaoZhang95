import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EXIF } from 'exif-js';
import { File, FileEntry } from '@ionic-native/file';

/*
  Generated class for the EditorProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class EditorProvider {
  canvas: any;
  context: any;
  image: any;
  imageData: any;
  pixels: any;
  numPixels: number;
  functions: any = {
    brightContrast: this.brightContrast
  };
  functions2: any = {
    colorFilter: this.colorFilter
  };
  functions3: any = {
    autoContrast: this.autoContrast
  };

  // editor variables
  contrast: string = '10';
  brightness: string = '0';
  reddness: string = '0';


  red: string = '128';
  green: string = '128';
  blue: string = '128';
  strength: string = '10';
  autoContrastFlag: boolean;  // for checkbox

  constructor(public http: HttpClient, private file: File) {
    console.log('Hello EditorProvider Provider');
  }

  setElements(c, i) {
    this.canvas = c;
    this.context = this.canvas.getContext('2d');
    this.image = i;
    // console.log(this.image);
  };

  setFile(imData): void {
    this.file.resolveLocalFilesystemUrl(imData).
      then(entry => (<FileEntry>entry).file(file => this.filetoCanvas(file))).
      catch(err => console.log(err));
  }

  filetoCanvas(file) {
    const reader: FileReader = new FileReader();

    reader.onload = () => {
      // console.log(reader.result);
      this.image.src = reader.result;
      this.image.onload = () => this.resetImage();
    };

    reader.readAsDataURL(file);
  };

  resetImage() {
    // console.log(this.image);
    this.canvas.height = this.image.height;
    this.canvas.width = this.image.width;

    this.context.drawImage(this.image, 0, 0, this.image.width,
      this.image.height);
    this.imageData = this.context.getImageData(0, 0, this.canvas.width,
      this.canvas.height);
    this.pixels = this.imageData.data;
    this.numPixels = this.imageData.width * this.imageData.height;
  };

  applyFilters() {
    this.resetImage();

    for (let i in this.functions) {
      if (this.functions.hasOwnProperty(i)) {
        this.functions[i](this);
      }
    }
  }

  applyFilters2() {
    this.resetImage();

    for (let i in this.functions2) {
      if (this.functions2.hasOwnProperty(i)) {
        this.functions2[i](this);
      }
    }
  }

  applyFilters3() {
    this.resetImage();

    for (let i in this.functions3) {
      if (this.functions3.hasOwnProperty(i)) {
        this.functions3[i](this);
      }
    }
  }

  // filters
  brightContrast(thisClass) {
    // console.log(thisClass);
    // console.log(thisClass.brightness);
    // console.log(thisClass.contrast);
    let contrast = parseFloat(thisClass.contrast) / 10;
    let brightness = parseInt(thisClass.brightness);
    for (let i = 0; i < thisClass.numPixels; i++) {
      thisClass.pixels[i * 4] = (thisClass.pixels[i * 4] - 128) * contrast + 128 +
        brightness; // Red
      thisClass.pixels[i * 4 + 1] = (thisClass.pixels[i * 4 + 1] - 128) * contrast +
        128 + brightness; // Green
      thisClass.pixels[i * 4 + 2] = (thisClass.pixels[i * 4 + 2] - 128) * contrast +
        128 + brightness; // Blue
    }

    thisClass.context.clearRect(0, 0, thisClass.canvas.width, thisClass.canvas.height);
    thisClass.context.putImageData(thisClass.imageData, 0, 0);

  };

  //===============================
  /*
  Po = P + R / (101 - S)

  P = Pixel value

  R = color value R/G/B (3 range inputs 0-255, step 1)

  S = Strength (range input 0-100, step 1)
  */
  colorFilter(thisClass) {

    let red = parseInt(thisClass.red);
    let green = parseInt(thisClass.green);
    let blue = parseInt(thisClass.blue);
    let strength = parseInt(thisClass.strength);

    for (let i = 0; i < thisClass.numPixels; i++) {

      thisClass.pixels[i * 4] = thisClass.pixels[i * 4] + red / (101 - strength);
      thisClass.pixels[i * 4 + 1] = thisClass.pixels[i * 4 + 1] + green / (101 - strength);
      thisClass.pixels[i * 4 + 2] = thisClass.pixels[i * 4 + 2] + blue / (101 - strength);

    }

    thisClass.context.clearRect(0, 0, thisClass.canvas.width, thisClass.canvas.height);
    thisClass.context.putImageData(thisClass.imageData, 0, 0);

  };



  autoContrast(thisClass) {

    let temp = [255, 0, 255, 0, 255, 0];  // red-green-blue (maxValue && minValue)

    for (let i = 0; i < thisClass.numPixels; i++) {
      if (thisClass.pixels[i * 4] < temp[0]) { temp[0] = thisClass.pixels[i * 4]; }
      if (thisClass.pixels[i * 4] > temp[1]) { temp[1] = thisClass.pixels[i * 4]; }
      if (thisClass.pixels[i * 4 + 1] < temp[2]) { temp[2] = thisClass.pixels[i * 4 + 1]; }
      if (thisClass.pixels[i * 4 + 1] > temp[3]) { temp[3] = thisClass.pixels[i * 4 + 1]; }
      if (thisClass.pixels[i * 4 + 2] < temp[4]) { temp[4] = thisClass.pixels[i * 4 + 2]; }
      if (thisClass.pixels[i * 4 + 2] > temp[5]) { temp[5] = thisClass.pixels[i * 4 + 2]; }
    }

    for (let i = 0; i < thisClass.numPixels; i++) {
      thisClass.pixels[i * 4] = (thisClass.pixels[i * 4] - temp[0]) / (temp[1] - temp[0]) * 255; // Red
      thisClass.pixels[i * 4 + 1] = (thisClass.pixels[i * 4 + 1] - temp[2]) / (temp[3] - temp[2]) * 255; // Green
      thisClass.pixels[i * 4 + 2] = (thisClass.pixels[i * 4 + 2] - temp[4]) / (temp[5] - temp[4]) * 255; // Blue
    }
    thisClass.context.clearRect(0, 0, thisClass.canvas.width, thisClass.canvas.height);
    thisClass.context.putImageData(thisClass.imageData, 0, 0);
  }

  getExif(img) {
    let latLon: any;
    try {
      EXIF.getData(img, () => {
        console.log(EXIF.getAllTags(img));
        /* console.log(EXIF.getTag(evt.target, 'GPSLatitude'));
        console.log(EXIF.getTag(evt.target, 'GPSLongitude')); */
        try {
          if (EXIF.getTag(img, 'GPSLatitude')) {

            latLon.lat = this.degreesToDecimals(
              EXIF.getTag(img, 'GPSLatitude'));
            latLon.lon = this.degreesToDecimals(
              EXIF.getTag(img, 'GPSLongitude'));
            return latLon;
          } else {
            return false;
          }
        } catch (e) {
          console.log(e);
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  degreesToDecimals(deg: Array<number>): number {
    /*deg.forEach(d => {
      console.log(d['numerator']);
    });*/
    return deg[0]['numerator'] + (deg[1]['numerator'] / 60) +
      (deg[2]['numerator'] / 100 / 3600);
  }
}
