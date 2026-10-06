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

        
        placeHoldersCBValue = document.getElementById("placeHoldersCB").checked;
        console.log("placeHoldersCBValue: " + placeHoldersCBValue);
        
        imei = document.getElementById("imei").value
        eventType = document.getElementById("eventType").value


        gprmcEvent = decCoords2GPRMC(p.latLng, time, date, placeHoldersCBValue);
        document.getElementById("GPRMC").value += gprmcEvent + "\n";


        foxEvent = generateFoxEvents(imei, gprmcEvent, eventType, placeHoldersCBValue);
        document.getElementById("FOXEVENTS").value += foxEvent + "\n";
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
function decCoords2GPRMC(latlng, time, date, placeHoldersCB) {
    var lat = DD2DM( latlng.lat());
    var lng = DD2DM( latlng.lng());

    lat = formatLat(lat.toFixed(4));
    lng = formatLon(lng.toFixed(4));

    if(placeHoldersCB) {
        timeValue = "TIME_PLACEHOLDER";
        dateValue = "DATE_PLACEHOLDER";
    } else {
        timeValue = time;
        dateValue = date;
        
    }
    return '$GPRMC,' + timeValue + ',A,' + lat + ',' + lng + ',,,'+ dateValue + ',,,A*89';
}

function generateFoxEvents(imei, gprmc, eventType, placeHoldersCB) {
    if(placeHoldersCB) {
        imeiValue = "IMEI_PLACEHOLDER";
    } else {
        imeiValue = imei;
        
    }
    switch(eventType) {
        case "login":
            foxEvent = "$<MSG.Info.ServerLogin>\n" + "$DeviceName=DEVICE-FOX3\n" + "$Security=0\n" + "$Software=avl_3.1.0 (IRNGT1gzLTRHIHJldjoxMy1OVUNIAhEA)\n" + "$Hardware=FOX3-4G rev:13-NUCH\n" + "$LastValidPosition=" + gprmc + "\n" + "$IMEI="+ imeiValue + "\n" + "$LocalIP=10.236.242.149\n" + "$CmdVersion=2\n" + "$SUCCESS\n" + "$<end>\n"; + "\n";
            break;
        case "ignition_on":
            foxEvent = "$<" + imeiValue + " Ignition On Voltage='11.988' RPM='225' Fuel='34' Odo='91826000' Total_Engine_Hours='4038'>*5C\n" + gprmc + "\n" +"$<end>\n"
            break;
        case "ignition_off":
            foxEvent = "$<" + imeiValue + " Ignition Off Voltage='11.988' RPM='225' Fuel='34' Odo='91826000' Total_Engine_Hours='4038'>*5C\n" + gprmc + "\n" +"$<end>\n"
            break;
        case "position":
            foxEvent = "$<" + imeiValue + " Position Voltage='13.753' RPM='1268' Fuel='35' Odo='91823000' Total_Engine_Hours='4036'>*69\n" + gprmc + "$<end>\n";
            break;
        default:
            foxEvent = "ERROR";
    }

    return foxEvent;
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

