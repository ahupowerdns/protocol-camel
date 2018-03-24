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
    var table = d3.select('body').append('table')
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


d3.xml("ext/rfc-index.xml").then(function(xml) {

    var list= xml.documentElement.getElementsByTagName("rfc-entry");
    thelist = list;
    d3.select("#main").text("There are "+list.length+" RFCs");

    console.log(dnsrfcs);

    var idx={};
    for(var i = 0 ; i < dnsrfcs.length; i++) {
        idx[dnsrfcs[i].toUpperCase()]=1;
    }

    var dnsrfcentries={};
    for(var i = 0 ; i < list.length; i++) {
        var o={};
        o.docID = getFromXML(list[i], "doc-id");
        if(o.docID in idx) {
            o.title = getFromXML(list[i], "title");
            o.currentStatus = getFromXML(list[i],"current-status");
            o.abstract = getFromXML(list[i], "abstract");
            o.pages = parseInt(list[i].getElementsByTagName("format")[0].getElementsByTagName("page-count")[0].textContent);
            o.obsoleted = list[i].getElementsByTagName("obsoleted-by").length;

            dnsrfcentries[o.docID]=o;
        }
    }

    var arr=[]
    var totalPages=0;
    for(var e in dnsrfcentries) {
        var o = dnsrfcentries[e];
        if((o.currentStatus=="PROPOSED STANDARD" || o.currentStatus == "INTERNET STANDARD") && o.obsoleted==0)  {
            arr.push(o);
            totalPages += o.pages;
        }
    }

    tabulate(arr, ["docID", "title", "pages", "currentStatus", "obsoleted"]);

    d3.select("#main").text("There are "+list.length+" RFCs, of which "+Object.keys(dnsrfcentries).length + " are relevant to DNS, of which "+arr.length+" are selected by filter. Total pages selected: "+totalPages);
});
