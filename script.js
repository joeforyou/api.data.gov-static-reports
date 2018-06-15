//import the express module
var fetch = require("isomorphic-fetch");
var fs = require("fs");
var express = require('express');
var request = require('request');
var D3Node = require('d3-node')
var d3 = require('d3');

// Get today's date
var today = new Date();
var yesterday = new Date(new Date().setDate(today.getDate()-1));
var edd = yesterday.getDate();
var emm = yesterday.getMonth() + 1;
var eyyyy = yesterday.getFullYear();

var thirtyDaysAgo = new Date(new Date().setDate(today.getDate()-30));
var sdd = thirtyDaysAgo.getDate();
var smm = thirtyDaysAgo.getMonth() + 1;
var syyyy = thirtyDaysAgo.getFullYear();

var endDate = eyyyy + "-" + emm + "-" + edd;
var startDate = syyyy + "-" + smm + "-" + sdd;

//store the express in a variable 
var app = express();
var adminToken = "";
var apiKey = ""


var allHits = {
    url: 'https://api.data.gov/api-umbrella/v1/analytics/drilldown.json?start_at=' + startDate + '&end_at=' + endDate + '&interval=day&query=%7B%22condition%22%3A%22AND%22%2C%22rules%22%3A%5B%7B%22field%22%3A%22gatekeeper_denied_code%22%2C%22id%22%3A%22gatekeeper_denied_code%22%2C%22input%22%3A%22select%22%2C%22operator%22%3A%22is_null%22%2C%22type%22%3A%22string%22%2C%22value%22%3Anull%7D%5D%7D&search=&prefix=0%2F&beta_analytics=false&api_key=IYBk8u97J3fclHUaxO9ulAfPrr7jokwXbqW3nicS',
    headers: {
        "X-Admin-Auth-Token": adminToken,
        "X-Api-Key": apiKey
    }
}

var monitoringPlans = {
    url: "https://api.data.gov/api-umbrella/v1/analytics/drilldown.json?start_at=" + startDate +"&end_at=" + endDate + "&interval=day&query=%7B%22condition%22%3A%22AND%22%2C%22rules%22%3A%5B%7B%22field%22%3A%22gatekeeper_denied_code%22%2C%22id%22%3A%22gatekeeper_denied_code%22%2C%22input%22%3A%22select%22%2C%22operator%22%3A%22is_null%22%2C%22type%22%3A%22string%22%2C%22value%22%3Anull%7D%5D%7D&search=user_id%3A%2205f86ad7-a48b-4b50-a916-ccf9f35c1521%22&prefix=0%2F&beta_analytics=false&api_key=IYBk8u97J3fclHUaxO9ulAfPrr7jokwXbqW3nicS",
    headers: {
        "X-Admin-Auth-Token": adminToken,
        "X-Api-Key": apiKey
    }
}

var fact = {
    url: "https://api.data.gov/api-umbrella/v1/analytics/drilldown.json?start_at=" + startDate +"&end_at=" + endDate + "&interval=day&query=%7B%22condition%22%3A%22AND%22%2C%22rules%22%3A%5B%7B%22field%22%3A%22gatekeeper_denied_code%22%2C%22id%22%3A%22gatekeeper_denied_code%22%2C%22input%22%3A%22select%22%2C%22operator%22%3A%22is_null%22%2C%22type%22%3A%22string%22%2C%22value%22%3Anull%7D%5D%7D&search=user_id%3A27b9fe53-d45e-4144-bafb-fa7f6e18cd3a&prefix=0%2F&beta_analytics=false&api_key=IYBk8u97J3fclHUaxO9ulAfPrr7jokwXbqW3nicS",
    headers: {
        "X-Admin-Auth-Token": adminToken,
        "X-Api-Key": apiKey
    }
}

request(allHits, function(error, response, body){
    if (error) { console.log(error) }

    if (!error && response.statusCode == 200) {
        makeChart(body,"total")
    }
})

request(monitoringPlans, function(error, response, body){
    if (error) { console.log(error) }

    if (!error && response.statusCode == 200) {
        makeChart(body, "mp")
    }
})

request(fact, function(error, response, body){
    if (error) { console.log(error) }

    if (!error && response.statusCode == 200) {
        makeChart(body, "fact")
    }
})

function makeChart(body,folder) {
    
    var options = {
      d3Module: d3
    };
    
    var d3n = new D3Node(options);
    var json = JSON.parse(body)
    var data = json["hits_over_time"]["rows"]
    
    var margin = {top: 20, right: 20, bottom: 100, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    
    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);
    
    const svgWidth = width + margin.left + margin.right
    const svgHeight = height + margin.top + margin.bottom

    var kpi = d3.select(d3n.document.body).append("div");
    kpi.html("<h1>Total hits:<br>" + json["results"][0]["hits"] + "</h1><h1>Hits on " + emm + "/" + edd + ":<br>" + data[data.length - 1].c[1].f + "</h1>"); 

    var svg = d3n.createSVG(svgWidth, svgHeight);
    
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    x.domain(data.map(function(d) { return d.c[0].f; }));
    y.domain([0, d3.max(data, function(d) { return d.c[1].v; })]);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", -100)
        .attr("transform", "rotate(-60)")
        .style("text-anchor","start");
    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(10))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Frequency");

    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .style("fill","steelblue")
        .attr("x", function(d) { return x(d.c[0].f); })
        .attr("y", function(d) { return y(d.c[1].v); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.c[1].v); });
    
    g.selectAll("text.bar")
        .data(data)
        .enter().append("text")
        .style("font-family","sans-serif")
        .style("font-size","10px")
        .attr("class","bar")
        .attr("text-anchor","middle")
        .attr("x", function(d) { return x(d.c[0].f) + 10; })
        .attr("y", function(d) { return y(d.c[1].v) - 10; })
        .text(function(d) { return d.c[1].f; });
    
        
        // Write to archive
        fs.writeFile("archive/"+folder+"/fact_api_stats_"+endDate+".html", d3n.html(), function(error){
            if(error) throw error;
            console.log("Done writing to archive.")
        })
        
        // Write to current file to display
        fs.writeFile("current/"+folder+"/fact_api_stats.xml", d3n.html(), function(error){
            if(error) throw error;
            console.log("Done writing to current file.")
        })

        // Write files to SharePoint-connected folder

}