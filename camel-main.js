'use strict';

document.title = specific.toUpperCase() + " Camel";
d3.select('#welcome').text(specific.toUpperCase());

d3.select("#main").text("Calculating..");

var statuses={}
var allsections={};
var allrfcs={};
var specificrfcentries={};

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
    for(var e in specificrfcentries) {
        var o = specificrfcentries[e];
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
    
    d3.select("#main").text("There are "+Object.keys(specificrfcentries).length + " RFCs relevant to " + specific.toUpperCase() + ", of which "+arr.length+" are selected by filter. Total pages selected: "+totalPages);
}

var specificrfcs={};
var drafts={};

function phaseTwo() {
d3.json("data/all-" + specific + "-rfcs.json", {cache: "force-cache"}).then(function(js) {
    allrfcs = js;
    for(var a in js) {
        var rfc = js[a];

        // there must be a way, way better way to do this loop
        if(rfc.docID.toLowerCase() in specificrfcs) {
            statuses[rfc.currentStatus]=1;
            rfc.url = 'https://tools.ietf.org/html/'+rfc.docID.toLowerCase()+'.txt';
            rfc.sections="";

            if("sections" in specificrfcs[rfc.docID.toLowerCase()]) {
                rfc.sectionsArray = specificrfcs[rfc.docID.toLowerCase()].sections;
                for(var b in specificrfcs[rfc.docID.toLowerCase()].sections) {
                    rfc.sections+= specificrfcs[rfc.docID.toLowerCase()].sections[b]+" ";
                    allsections[specificrfcs[rfc.docID.toLowerCase()].sections[b]] = 1;
                }
            }
            specificrfcentries[rfc.docID] = rfc;
        }
    }
    statuses["INFORMATIONAL"]=0;
    statuses["EXPERIMENTAL"]=0;
    statuses["BEST CURRENT PRACTICE"]=0;
    statuses["UNKNOWN"]=0;
    statuses["HISTORIC"] = 0
    statuses["BEST_CURRENT_PRACTICE"] = 0

    d3.json(specific + "-drafts.json").then(function(js) {
        drafts=js;
        for(var a in js) {
            var o ={};
            o.docID="draft"+a;
            o.docID = js[a].name;
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
            specificrfcentries[o.docID]=o;
        }

        createTable();
        updateTable();
    });
});


}

d3.json(specific + "-rfc-annotations.json", {cache: "force-cache"}).then(function(js) {
    specificrfcs = js;
    phaseTwo();
});
