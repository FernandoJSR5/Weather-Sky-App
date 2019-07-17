import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material';
import { DialogExampleComponent } from './dialog-example/dialog-example.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private http: HttpClient, public dialog: MatDialog) {}
  lat: number = -33.47894935950537;
  lng: number = -70.67328738854872;
  locationChosen = false;
  zoomControl = false;
  data;

  onChoseLocation(event) {
    this.lat = event.coords.lat;
    this.lng = event.coords.lng;
    const coords = { latitude: this.lat, longitude: this.lng };
    this.http.post<{response: string}>('http://localhost:3000/api/coords', coords)
    .subscribe((responseData) => {
      console.log(responseData.response);
      this.data = responseData.response;
      let dialogRef = this.dialog.open(DialogExampleComponent, {data : this.data});
      dialogRef.afterClosed().subscribe( result => {
        console.log('Dialog result: ${result}');
      });
    });
    this.locationChosen = true;
  }
}
