var MYAPP = {}; // always put global Variables into some object like this or use better technics. This avoids errors.

/***************************************************************************
 * all the initialisation that does not directly correspond to the model
 * is done here after the resources are loaded
 ***************************************************************************/
jQuery(document).ready(function () {
	// just to show how this function works
	//jQuery.get("data/metaData.xml", function (jsonData){ console.log(jsonData.toString());}, "html");
	
	jQuery.get("data/metaData.xml", createMetaDataList, "xml");
	
	jQuery(".popUp").click(function() {
		jQuery(".popUp").fadeOut();
	});
});

function createMetaDataList(xmlData) {
	var element;
	var title;
	var content;
	
	//console.log(xmlData.toString());
	//console.log($(xmlData).text());

	$(xmlData).find("entry").each(function () {
		title = $(this).find("title").text();
		content = $(this).find("content").text();
		
		element = createMetaDataItem(title, content);
		jQuery('#metaDataList').append(element);
	});

	// the list has to be initialised, because we changed the DOM after jQuery did so
	jQuery('div[data-role=collapsible]').collapsible();
}

function createMetaDataItem(title, content) {
	var group;
	var header;
	var p;

	// create div for group
	group = jQuery('<div/>').attr({
		"data-role" : "collapsible",
		"data-collapsed" : "true",
		"data-mini" : "true",
		"data-iconpos" : "right",
		"data-theme" : "b",
		"class" : "metaDateEntry"
	});

	// create header
	header = jQuery('<h3/>').text(title);
	group.append(header);

	p = jQuery('<p >' + content + '</p>');
	group.append(p);

	return group;
}

function popup(){
	jQuery(".popUp").fadeIn();
}


/*---------------------------------------------*/
MYAPP.createAnnoMode = false;
MYAPP.runtime = null;
MYAPP.annos = [];
MYAPP.annos2D = [];
MYAPP.annoCnt = 0;

function addNode(event)
{
    if (MYAPP.createAnnoMode) {
        MYAPP.createAnnoMode = false;
        $("#btnCreatAnno span").text("Create Annotation");
    }
    else {
        return; // nothing to do
    }
    
    // show 3d marker at pick position
    var pos = new x3dom.fields.SFVec3f(event.worldX, event.worldY, event.worldZ);
    var norm = new x3dom.fields.SFVec3f(event.normalX, event.normalY, event.normalZ);
    
    // rotate such that cone points to click point
    var qDir = x3dom.fields.Quaternion.rotateFromTo(new x3dom.fields.SFVec3f(0, -1, 0), norm);
    var rot = qDir.toAxisAngle();
    var pos = pos.addScaled(norm, 9.5);  // since length is 10...
    
    var t = document.createElement('Transform');
    t.setAttribute("scale", "3 10 3" );
    t.setAttribute('rotation', rot[0].x+' '+rot[0].y+' '+rot[0].z+' '+rot[1]);
    t.setAttribute('translation', pos.x+' '+pos.y+' '+pos.z);
    
    var s = document.createElement('Shape');
    s.onclick = popup;
    t.appendChild(s);
    var b = document.createElement('Cone');
    s.appendChild(b);
    var a = document.createElement('Appearance');
    var m = document.createElement('Material');
    m.setAttribute("diffuseColor", "1 0 0");
    m.setAttribute("transparency", "0.5");
    a.appendChild(m);
    s.appendChild(a);

    var ot = document.getElementById('scene');
    ot.appendChild(t);
    MYAPP.annos.push(t);
    
    // obtain corresponding 2d position on page for displaying 2d markers
    var pos2d = MYAPP.runtime.calcPagePos(event.worldX, event.worldY, event.worldZ);
    
    var anno2D = document.createElement('span');
    anno2D.innerHTML = "Anno #" + (++MYAPP.annoCnt);
    anno2D.onclick = popup;
    
    anno2D.style.padding = "6px";
    anno2D.style.margin = "2px";
    anno2D.style.textAlign = "center";
    anno2D.style.backgroundColor = "blue";
    anno2D.style.color = "yellow";
    anno2D.style.position = "absolute";
    anno2D.style.border = "yellow solid 1px";
    anno2D.style.zIndex = (10+MYAPP.annoCnt)+"";
    anno2D.style.opacity = "0.7";
    anno2D.style.width = "70px";
    anno2D.style.height = "30px";
    anno2D.style.left = pos2d[0] + "px";
    anno2D.style.top = pos2d[1] + "px";
    
    document.body.appendChild(anno2D);
    MYAPP.annos2D.push(anno2D);
    
    return false;
}

// whenever viewpoint changes, the 2d positions need to be updated
var viewFunc = function(evt)
{
	for (var i=0, n=MYAPP.annos.length; i<n; i++)
	{
	    var trans = x3dom.fields.SFVec3f.parse(MYAPP.annos[i].getAttribute("translation"));
	    var pos2d = MYAPP.runtime.calcPagePos(trans.x, trans.y, trans.z);
	    
        MYAPP.annos2D[i].innerHTML = "Anno #" + (i+1) + '<br>(' + pos2d[0] + ", " + pos2d[1] + ")";
        MYAPP.annos2D[i].style.left = pos2d[0] + "px";
        MYAPP.annos2D[i].style.top = pos2d[1] + "px";
	}
};

document.onload = function addIt()
{
    MYAPP.runtime = document.getElementById("x3dElement").runtime;
    
    document.getElementById('vp').addEventListener('viewpointChanged', viewFunc, false);
    document.getElementById('mainModel').addEventListener('click', addNode, false);
    
    document.getElementById('btnCreatAnno').addEventListener('click', (function() {
        MYAPP.createAnnoMode = true;
        $("#btnCreatAnno span").text("Place Annotation");
    }), false);
};
