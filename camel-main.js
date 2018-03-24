'use strict';

d3.select("#main").text("Calculating..");

var thelist;

function getFromXML(xml, name)
{
    var elements = xml.getElementsByTagName(name);
    if(elements.length)
        return elements[0].textContent;
    else
        return "";
    
}
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
		return {column: column, value: row[column]};
	    });
	})
	.enter()
	.append('td')
	.text(function (d) { return d.value; });

    return table;
}


var statuses={}
var dnsrfcentries={};
var rfclist=[];

function handleClick(e)
{
    statuses[e.id]=e.checked;
    updateTable();
}

function createTable()
{
    statuses["OBSOLETED"]=0;
    var statarr = Object.keys(statuses);
    console.log(statarr);
    var table = d3.select('#selector').append('table')
    var thead = table.append('thead')
    var	tbody = table.append('tbody');
    
    // append the header row
    thead.append('tr')
	.selectAll('th')
	.data(statarr).enter()
	.append('th')
	.html(function (column) {
            if(statuses[column])
                return '<input type="checkbox" checked id="'+column+'" onclick="handleClick(this);">  <label>'+column+'</label>';
            else
                return '<input type="checkbox" id="'+column+'" onclick="handleClick(this);">  <label>'+column+'</label>';
        });

}

function updateTable()
{
    var arr=[]
    var totalPages=0;
    for(var e in dnsrfcentries) {
        var o = dnsrfcentries[e];
        if(statuses[o.currentStatus] && (!o.obsoleted || statuses["OBSOLETED"])) {
            arr.push(o);
            totalPages += o.pages;
        }
    }
    
    tabulate(arr, ["docID", "title", "pages", "currentStatus", "obsoleted"]);
    
    d3.select("#main").text("There are "+rfclist.length+" RFCs, of which "+Object.keys(dnsrfcentries).length + " are relevant to DNS, of which "+arr.length+" are selected by filter. Total pages selected: "+totalPages);

}

d3.xml("ext/rfc-index.xml").then(function(xml) {
    rfclist= xml.documentElement.getElementsByTagName("rfc-entry");

    var idx={};
    for(var i = 0 ; i < dnsrfcs.length; i++) {
        idx[dnsrfcs[i].toUpperCase()]=1;
    }


    for(var i = 0 ; i < rfclist.length; i++) {
        var o={};
        o.docID = getFromXML(rfclist[i], "doc-id");
        if(o.docID in idx) {
            o.title = getFromXML(rfclist[i], "title");
            o.currentStatus = getFromXML(rfclist[i],"current-status");
            o.abstract = getFromXML(rfclist[i], "abstract");
            o.pages = parseInt(rfclist[i].getElementsByTagName("format")[0].getElementsByTagName("page-count")[0].textContent);
            o.obsoleted = rfclist[i].getElementsByTagName("obsoleted-by").length;
            statuses[o.currentStatus]=1;
            dnsrfcentries[o.docID]=o;
        }
    }

    createTable();
    updateTable();
});
