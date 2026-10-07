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
        multilineCBValue = document.getElementById('multiline').checked

        
        imei = document.getElementById("imei").value
        eventType = document.getElementById("eventType").value

        parsedDate = new Date(date);
        formattedDate =  parsedDate.getDate().toString().padStart(2, '0') + parsedDate.getMonth().toString().padStart(2, '0') + parsedDate.getFullYear().toString().slice(-2);
        
        time = time.replace(":", "").replace(":", "").padEnd(6, '0') + ".000";

        gprmcEvent = decCoords2GPRMC(p.latLng, time, formattedDate, placeHoldersCBValue);

        document.getElementById("GPRMC").value += gprmcEvent + "\n";


        foxEvent = generateFoxEvents(imei, gprmcEvent, eventType, placeHoldersCBValue, multilineCBValue);
        document.getElementById("FOXEVENTS").value += foxEvent + "\n";
        document.getElementById("decDeg").value += p.latLng.lat().toFixed(4).toString() +',' + p.latLng.lng().toFixed(4).toString() + "\n";
    }
}

//Create a GPRMC Sentence from the cordinates, time and date
function decCoords2GPRMC(latlng, time, date, placeHoldersCB) {
    latAndLng = decimalToNmea(latlng.lat(), latlng.lng());   

     if(placeHoldersCB) {
        timeValue = "TIME_PLACEHOLDER";
        dateValue = "DATE_PLACEHOLDER";
        checksumValue = "CHECKSUM_PLACEHOLDER";

        gprmc = '$GPRMC,' + timeValue + ',A,' + latAndLng + ',,,'+ dateValue + ',,,';
        checksumValue = nmeaChecksum(gprmc);
        gprmc += '*' + checksumValue;
    } else {
        timeValue = time;
        dateValue = date;

        gprmc = '$GPRMC,' + timeValue + ',A,' + latAndLng + ',,,'+ dateValue + ',,,';
        checksumValue = nmeaChecksum(gprmc);
        gprmc += '*' + checksumValue;
    }
    
    console.log("GPRMC CHECKSUM: " + gprmc);
    
    return gprmc;
}

function nmeaChecksum(sentence) {
    // Strip leading '$' and trailing '*' if present
    payload = sentence.replace("$", "").split("*")[0]
    console.log("Payload for checksum: " + payload);
    checksum = 0
    for (char in payload) {
        checksum ^= payload[char].charCodeAt();
        // console.log("Char: " + payload[char] + " Code: " + payload[char].charCodeAt() + " checksum: " + checksum.toString(16).toUpperCase());
    }
    return checksum.toString(16).toUpperCase();
}

function generateFoxEvents(imei, gprmc, eventType, placeHoldersCB, multilineCBValue) {
    if(placeHoldersCB) {
        imeiValue = "IMEI_PLACEHOLDER";
    } else {
        imeiValue = imei;
    }

    if (multilineCBValue) {
        newline = "\n";
    } else {
        newline = "\\n";
    }

    switch(eventType) {
        case "login":
            foxEvent = "$<MSG.Info.ServerLogin>" + newline + "$DeviceName=DEVICE-FOX3" + newline  + "$Security=0" + newline  + "$Software=avl_3.1.0 (IRNGT1gzLTRHIHJldjoxMy1OVUNIAhEA)" + newline  + "$Hardware=FOX3-4G rev:13-NUCH" + newline  + "$LastValidPosition=" + gprmc + newline + "$IMEI="+ imeiValue + newline  + "$LocalIP=10.236.242.149" + newline  + "$CmdVersion=2" + newline  + "$SUCCESS" + newline  + "$<end>";
            break;
        case "ignition_on":
            foxEvent = "$<" + imeiValue + " Ignition On Voltage='11.988' RPM='225' Fuel='34' Odo='91826000' Total_Engine_Hours='4038'>*5C" + newline + gprmc + newline  +"$<end>"
            break;
        case "ignition_off":
            foxEvent = "$<" + imeiValue + " Ignition Off Voltage='11.988' RPM='225' Fuel='34' Odo='91826000' Total_Engine_Hours='4038'>*5C" + newline + gprmc + newline  +"$<end>"
            break;
        case "position":
            foxEvent = "$<" + imeiValue + " Position Voltage='13.753' RPM='1268' Fuel='35' Odo='91823000' Total_Engine_Hours='4036'>*69" + newline + gprmc + newline + "$<end>";
            break;
        default:
            foxEvent = "ERROR";
    }

    return foxEvent;
}

function decimalToNmea(lat, lon) {
    // Convert Latitude
    const latDir = lat >= 0 ? 'N' : 'S';
    const absLat = Math.abs(lat);
    const latDeg = Math.floor(absLat);
    const latMin = (absLat - latDeg) * 60;
    const formattedLat = `${String(latDeg).padStart(2, '0')}${latMin.toFixed(4).padStart(7, '0')}`;

    // Convert Longitude
    const lonDir = lon >= 0 ? 'E' : 'W';
    const absLon = Math.abs(lon);
    const lonDeg = Math.floor(absLon);
    const lonMin = (absLon - lonDeg) * 60;
    const formattedLon = `${String(lonDeg).padStart(3, '0')}${lonMin.toFixed(4).padStart(7, '0')}`;

    return formattedLat + "," + latDir + "," + formattedLon + "," + lonDir;
}


//Reset app 
//i.e Remove all polygons and clear the textarea
function reset() {
    document.getElementById("GPRMC").value = "";
    document.getElementById("decDeg").value = "";
    document.getElementById("FOXEVENTS").value = "";

    if (markers) {
        for (i in markers) {
            markers[i].setMap(null);
        }
    }
    markers = new Array();
}

var timerVar = setInterval(countTimer, 1000);
function countTimer() {
    var date = new Date();

    var seconds = date.getSeconds();
    var minutes = date.getMinutes();
    var hour = date.getHours();

    const paddedSec = (seconds + "").padStart(2, "0");
    const paddedMin = (minutes + "").padStart(2, "0");
    const paddedHour = (hour + "").padStart(2, "0");
    
    // console.log("Timer called: " + paddedHour + ":" + paddedMin + ":" + paddedSec);
    document.getElementById("time").value = paddedHour + ":" + paddedMin + ":" + paddedSec;
}

