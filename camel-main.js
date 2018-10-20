'use strict';

d3.select("#main").text("Calculating..");

function getFromXML(xml, name)
{
    var elements = xml.getElementsByTagName(name);
    if(elements.length)
        return elements[0].textContent;
    else
        return "";
    
}


function convertIETFXML2Json()
{
    d3.xml("ext/rfc-index.xml", {cache: "force-cache"}).then(function(xml) {
        var allrfcs={};
        var rfclist= xml.documentElement.getElementsByTagName("rfc-entry");
        
        for(var i = 0 ; i < rfclist.length; i++) {
            var o={};
            o.docID = getFromXML(rfclist[i], "doc-id");
            o.title = getFromXML(rfclist[i], "title");
            o.currentStatus = getFromXML(rfclist[i],"current-status");
            //            o.abstract = getFromXML(rfclist[i], "abstract");
            if(rfclist[i].getElementsByTagName("format").length && rfclist[i].getElementsByTagName("format")[0].getElementsByTagName("page-count").length)
                o.pages = parseInt(rfclist[i].getElementsByTagName("format")[0].getElementsByTagName("page-count")[0].textContent);
            else
                o.pages=0;
            o.obsoleted = rfclist[i].getElementsByTagName("obsoleted-by").length;
            o.draft = 0;
            allrfcs[o.docID]=o;
        }
        d3.select("#json").text(JSON.stringify(allrfcs));
    });
}


var statuses={}
var allsections={};
var allrfcs={};
var dnsrfcentries={};

function tabulate(data, columns) {
    d3.select('#table').html("");
    var table = d3.select('#table').append('table')
    var thead = table.append('thead')
    var	tbody = table.append('tbody');

    // append the header row
    thead.append('tr')
	.selectAll('th')
	.data(columns).enter()
	.append('th')
	.text(function (column) { return column; });

    // create a row for each object in the data
    var rows = tbody.selectAll('tr')
	.data(data)
	.enter()
	.append('tr');

    // create a cell in each row for each column
    var cells = rows.selectAll('td')
	.data(function (row) {
	    return columns.map(function (column) {
		return {column: column, value: row[column], url: row["url"]};
	    });
	})
	.enter()
	.append('td')
	.html(function (d) {
            if(d.column != "title")
                return d.value;
            else
                return '<a href="'+d.url+'">'+d.value+'</a>';
        });

    return table;
}


function handleStatusClick(e)
{
    statuses[e.id]=e.checked;
    updateTable();
}

function handleSectionClick(e)
{
    allsections[e.id]=e.checked;
    updateTable();
}


function createTable()
{
    statuses["OBSOLETED"]=0;
    statuses["DRAFT"]=0;
    var statarr = Object.keys(statuses);

    var table = d3.select('#selector').append('table')
    var thead = table.append('thead')
    var	tbody = table.append('tbody');
    
    tbody.append('tr')
	.selectAll('td')
	.data(statarr).enter()
	.append('td')
	.html(function (column) {
            if(statuses[column])
                return '<input type="checkbox" checked id="'+column+'" onclick="handleStatusClick(this);">  <label for="'+column+'">'+column+'</label>';
            else
                return '<input type="checkbox" id="'+column+'" onclick="handleStatusClick(this);">  <label for="'+column+'">'+column+'</label>';
        });

    var sectarr = Object.keys(allsections);
    tbody.append('tr')
	.selectAll('td')
	.data(sectarr).enter()
	.append('td')
	.html(function (column) {
            if(allsections[column])
                return '<input type="checkbox" checked id="'+column+'" onclick="handleSectionClick(this);">  <label for="'+column+'">'+column+'</label>';
            else
                return '<input type="checkbox" id="'+column+'" onclick="handleSectionClick(this);">  <label for="'+column+'">'+column+'</label>';
        });

}

function updateTable()
{
    var arr=[]
    var totalPages=0;
    for(var e in dnsrfcentries) {
        var o = dnsrfcentries[e];
        if(statuses[o.currentStatus] && (!o.obsoleted || statuses["OBSOLETED"]) && (!o.draft || statuses["DRAFT"])) {
            var doit=false;
            for(var l in o.sectionsArray) {
                if(allsections[o.sectionsArray[l] ]) {
                    doit = true;
                    break;
                }
            }
            if(doit) {
                arr.push(o);
                totalPages += o.pages;
            }
        }
    }
    
    tabulate(arr, ["docID", "title", "pages", "currentStatus", "obsoleted", "sections"]);
    
    d3.select("#main").text("There are "+Object.keys(allrfcs).length+" RFCs, of which "+Object.keys(dnsrfcentries).length + " are relevant to DNS, of which "+arr.length+" are selected by filter. Total pages selected: "+totalPages);
}
                                                           
d3.json("all-rfcs.json", {cache: "force-cache"}).then(function(js) {
    allrfcs = js;
    for(var a in js) {
        var rfc = js[a];

        // there must be a way, way better way to do this loop
        if(rfc.docID.toLowerCase() in dnsrfcs) {
            statuses[rfc.currentStatus]=1;
            rfc.url = 'https://tools.ietf.org/html/'+rfc.docID.toLowerCase()+'.txt';
            rfc.sections="";

            if("sections" in dnsrfcs[rfc.docID.toLowerCase()]) {
                rfc.sectionsArray = dnsrfcs[rfc.docID.toLowerCase()].sections;
                for(var b in dnsrfcs[rfc.docID.toLowerCase()].sections) {
                    rfc.sections+= dnsrfcs[rfc.docID.toLowerCase()].sections[b]+" ";
                    allsections[dnsrfcs[rfc.docID.toLowerCase()].sections[b]] = 1;
                }
            }
            dnsrfcentries[rfc.docID] = rfc;
        }
    }
    statuses["INFORMATIONAL"]=0;
    statuses["HISTORIC"]=0;
    statuses["EXPERIMENTAL"]=0;
    statuses["BEST CURRENT PRACTICE"]=0;
    statuses["UNKNOWN"]=0;

    d3.json("drafts.json").then(function(js) {
        for(var a in js) {
            var o ={};
            o.docID="draft"+a;
            o.title = js[a].title;
            o.pages = js[a].pages;
            o.currentStatus = js[a].track;
            if(o.currentStatus == "STANDARDS TRACK")
                o.currentStatus = "PROPOSED STANDARD";
            o.obsoleted=0;
            o.draft=1;
            o.url = 'https://tools.ietf.org/id/'+js[a].name;
            o.sections="core";
            o.sectionsArray=["core"];
            dnsrfcentries[o.docID]=o;
        }

        createTable();
        updateTable();
    });
});
