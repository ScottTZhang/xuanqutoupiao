//
// Global state
//
// map     - the map object
// usermark- marks the user's position on the map
// markers - list of markers on the current map (not including the user position)
// 
//

//
// First time run: request current location, with callback to Start
//
if (navigator.geolocation)  {
    navigator.geolocation.getCurrentPosition(Start);
}


function UpdateMapById(id, tag) {

    var target = document.getElementById(id);
    var data = target.innerHTML;

    var rows  = data.split("\n");
   
    for (i in rows) {
	var cols = rows[i].split("\t");
	var lat = cols[0];
	var long = cols[1];

	markers.push(new google.maps.Marker({ map:map,
						    position: new google.maps.LatLng(lat,long),
						    title: tag+"\n"+cols.join("\n")}));
	
    }
}

function ClearMarkers()
{
    // clear the markers
    while (markers.length>0) { 
	markers.pop().setMap(null);
    }
}


function UpdateMap()
{
    var color = document.getElementById("color");
    
    color.innerHTML="<b><blink>Updating Display...</blink></b>";
    color.style.backgroundColor='white';

    ClearMarkers();

    if(document.getElementById("comm").checked)UpdateMapById("committee_data","COMMITTEE");
    if(document.getElementById("cand").checked)UpdateMapById("candidate_data","CANDIDATE");
    if(document.getElementById("indi").checked)UpdateMapById("individual_data", "INDIVIDUAL");
    if(document.getElementById("opin").checked)UpdateMapById("opinion_data","OPINION");


   	var sum1= $('#comm_sumVal1').val();//rep red
	var sum2= $('#comm_sumVal2').val();//dem blue
	var sum3= $('#indi_sumVal1').val();//rep
	var sum4= $('#indi_sumVal2').val();//dem
	var comm_sum;
	var indi_sum;	
	if(sum1 > sum2){comm_sum = sum1;} else {comm_sum=sum2;}
	if(sum3 > sum4){indi_sum = sum3;} else {indi_sum=sum4;}
 	var avg = $('#opiavg').val();
	var std = $('#opistd').val();
    
    if(document.getElementById("comm").checked)
    {	    color.innerHTML += "Committee total amount: "+comm_sum+"\n";
	    if (sum1<sum2) { 
		 document.getElementById("comm_color").style.backgroundColor='blue';
	    } else  document.getElementById("comm_color").style.backgroundColor='red';
    }
    if(document.getElementById("indi").checked)
    {	    color.innerHTML += "Individual total amount: "+indi_sum+"\n";
	    if (sum3<sum4) { 
		 document.getElementById("indi_color").style.backgroundColor='blue';
	    } else  document.getElementById("indi_color").style.backgroundColor='red';
    }
    if(document.getElementById("opin").checked)
    {
	    color.innerHTML += "average is: "+ avg +"\t standard deviation is: "+std+"\n";
    }

}

function NewData(data)
{
  var target = document.getElementById("data");
  
  target.innerHTML = data;

  UpdateMap();

}


// give opinion data
function Submit()
{
	if (navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition(SubmitLocation);
	}
 	else{document.getElementById("demo").innerHTML="Geolocation is not supported by this browser.";}
	//document.opinion_form.submit();
}

function SubmitLocation(pos)
{
	//var lat = document.getElementByName("latitude");
	document.opinion_form.elements["latitude"].value = pos.coords.latitude;
	//var lng = document.getElementById("longitude");
	document.opinion_form.elements["longitude"].value = pos.coords.longitude;
  	document.getElementById("demo").innerHTML="Latitude: " + pos.coords.latitude + "<br>Longitude: " + pos.coords.longitude;	
}

function ViewShift()
{
    var bounds = map.getBounds();

    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    var color = document.getElementById("color");

    color.innerHTML="<b><blink>Querying...("+ne.lat()+","+ne.lng()+") to ("+sw.lat()+","+sw.lng()+")</blink></b>";
    color.style.backgroundColor='white';
    
    var what="";
    var x=document.getElementById("comm");
    var y=document.getElementById("cand");
    var z=document.getElementById("indi");
    var w=document.getElementById("opin");
    
    if(x.checked){what+=x.value+",";}
    if(y.checked){what+=y.value+",";}
    if(z.checked){what+=z.value+",";}
    if(w.checked){what+=w.value+",";}
    if(what=="") {alert("choose a type");what="committees";x.checked=true;}
    else{
    var whatlen = what.length -1;
    what = what.substring(0,whatlen);}
    
    //var m = document.getElementById("cycle");
    
    var m = document.getElementById("cycle");
    var i;
    var cyc = "";
    for(i=0;i<m.length;i++){if(m.options[i].selected){cyc += m.options[i].value+",";}}
    var len = cyc.length -1;
    cyc = cyc.substring(0,len);

    // debug status flows through by cookie
    $.get("rwb.pl?act=near&latne="+ne.lat()+"&longne="+ne.lng()+"&latsw="+sw.lat()+"&longsw="+sw.lng()+"&format=raw&what="+what+"&cycle="+cyc, NewData);
}


function Reposition(pos)
{
    var lat=pos.coords.latitude;
    var long=pos.coords.longitude;

    map.setCenter(new google.maps.LatLng(lat,long));
    usermark.setPosition(new google.maps.LatLng(lat,long));
}


function Start(location) 
{
  var lat = location.coords.latitude;
  var long = location.coords.longitude;
  var acc = location.coords.accuracy;
  
  var mapc = $( "#map");

  map = new google.maps.Map(mapc[0], 
			    { zoom:16, 
				center:new google.maps.LatLng(lat,long),
				mapTypeId: google.maps.MapTypeId.HYBRID
				} );

  usermark = new google.maps.Marker({ map:map,
					    position: new google.maps.LatLng(lat,long),
					    title: "You are here"});

  markers = new Array;

  var color = document.getElementById("color");
  color.style.backgroundColor='white';
  color.innerHTML="<b><blink>Waiting for first position</blink></b>";

  google.maps.event.addListener(map,"bounds_changed",ViewShift);
  google.maps.event.addListener(map,"center_changed",ViewShift);
  google.maps.event.addListener(map,"zoom_changed",ViewShift);

  navigator.geolocation.watchPosition(Reposition);

}