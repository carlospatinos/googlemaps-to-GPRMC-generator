var map;
var markers = new Array();
var time = false;
var date = false;

google.maps.event.addDomListener(window, 'load', init);

function init() {
    var mapDiv = document.getElementById('map');
    // ATHLONE
    map = new google.maps.Map(mapDiv, {
      center: new google.maps.LatLng(53.423809, -7.934634),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.MAP
    });

    google.maps.event.addListener(map, 'click', addMarker);
}

function addMarker(p) {
    var date = document.getElementById('date').value;
    var time = document.getElementById('time').value;


    if(date == "" || time == "") {
        alert("Enter time and date in UTC format");
    }else {
        var marker = new google.maps.Marker({position:p.latLng, title: (markers.length+1).toString()});
        marker.setMap(map);
        markers.push(marker);

        
        areTimeAndDatePlaceHoldersInUse = document.getElementById("timeAndDatePlaceHolders").checked;
        
        imei = document.getElementById("imei").value

        gprmcEvent = decCoords2GPRMC(p.latLng, time, date, areTimeAndDatePlaceHoldersInUse);
        document.getElementById("GPRMC").value += gprmcEvent + "\n";
        document.getElementById("FOXEVENTS").value += generateFoxEvents(imei, gprmcEvent) + "\n";
        document.getElementById("decDeg").value += p.latLng.lat().toFixed(4).toString() +',' + p.latLng.lng().toFixed(4).toString() + "\n";
    }
}

//Format latitude for GPRMC sentence
function formatLat(lat) {
    if(lat > 0)
        return lat.toString()+',N';
    else
        return lat.toString()+',S';
}

//Format longitute for GPRMC sentence
function formatLon(lon) {
    if(lon < 0)
        return lon.toString()+',W';
    else
        return lon.toString()+',E';
}

//Create a GPRMC Sentence from the cordinates, time and date
function decCoords2GPRMC(latlng, time, date, areTimeAndDatePlaceHoldersInUse) {
    var lat = DD2DM( latlng.lat());
    var lng = DD2DM( latlng.lng());

    lat = formatLat(lat.toFixed(4));
    lng = formatLon(lng.toFixed(4));

    if(areTimeAndDatePlaceHoldersInUse) {
        timeValue = "TIME_PLACEHOLDER";
        dateValue = "DATE_PLACEHOLDER";
    } else {
        timeValue = time;
        dateValue = date;
        
    }
    return '$GPRMC,' + timeValue + ',A,' + lat + ',' + lng + ',,,'+ dateValue + ',,,A*89';
}

function generateFoxEvents(imei, gprmc) {
    event = "$<MSG.Info.ServerLogin>\n" + "$DeviceName=DEVICE-FOX3\n" + "$Security=0\n" + "$Software=avl_3.1.0 (IRNGT1gzLTRHIHJldjoxMy1OVUNIAhEA)\n" + "$Hardware=FOX3-4G rev:13-NUCH\n" + "$LastValidPosition=" + gprmc + "\n" + "$IMEI="+ imei + "\n" + "$LocalIP=10.236.242.149\n" + "$CmdVersion=2\n" + "$SUCCESS\n" + "$<end>\n"; + "\n";
    return event;
}


//convert degrees decimal 2 degress minutes format
function  DD2DM(DegreesDec) {
    var signChanged = false;

    DegreesDec = parseFloat(DegreesDec);

    if(DegreesDec < 0) {
        DegreesDec = Math.abs(DegreesDec);
        signChanged = true;
    }

    var dd = Math.floor(DegreesDec);
    var mmDot = (DegreesDec%1) * 60;
    var ddmmDotmm = dd*100 + mmDot;

    if (signChanged) {
        ddmmDotmm *= -1;
    }
    return ddmmDotmm;
}


//Reset app 
//i.e Remove all polygons and clear the textarea
function reset() {
    document.getElementById("GPRMC").value = " ";
    document.getElementById("decDeg").value = " ";

    if (markers) {
        for (i in markers) {
            markers[i].setMap(null);
        }
    }
    markers = new Array();
}

