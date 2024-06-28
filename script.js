'use strict';

const DATA_URL = 'https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json';

const plotChart = (rawData) => {
    // Mapping indexes to country codes
    const mappedLinks = rawData.links.map((el) => {
        return {
            target: rawData.nodes[el.target].code,
            source: rawData.nodes[el.source].code
        };
    });
    const data = Object.assign({}, rawData, {links: mappedLinks});

    const vis = d3.select('#chart');

    const width = +vis.attr('width');
    const height = +vis.attr('height');

    const simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(function(d) { return d.code; }))
        .force('charge', d3.forceManyBody().strength(-50))
        .force('y', d3.forceY(0))
        .force('x', d3.forceX(0))
        .force('center', d3.forceCenter(width / 2, height / 2));
    
    simulation
        .nodes(data.nodes)
        .on('tick', handleTick);

    simulation.force('link')
        .links(data.links);
    
    const linkInstances = vis.append('g')
        .selectAll('line')
        .data(data.links)
        .enter().append('line')
        .attr('stroke-width', 1)
        .attr('stroke', '#606060');
   
    const nodeInstances = d3.select('.country-flags')
        .selectAll('.flags')
        .data(data.nodes)
        .enter()
        .append('div')
        .style('top', '100px')
        .attr('class', d => 'flag flag-icon flag-icon-' + d.code)
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut)
        .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded));  

    function handleTick() {       
        linkInstances
            .attr('x1', d => d.source.x + 9)
            .attr('y1', d => d.source.y + 8)
            .attr('x2', d => d.target.x + 9)
            .attr('y2', d => d.target.y + 8);
        nodeInstances
            .style('left', d => `${d.x}px`)
            .style('top', d => `${d.y}px`);
    }

    function dragStarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
      
    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }
      
    function dragEnded(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    function handleMouseOver (d) {
        d3.select('#tip')
            .html(`<p>${d.country}, ${d.code.toUpperCase()}</p>`
            + `<span class="flag-large flag-icon flag-icon-${d.code}"></span>`
            )
            .style('visibility', 'visible')
            .style('left', `${0}px`)
            .style('top', `${0}px`);
    }

    function handleMouseOut () {
        d3.select('#tip')
            .style('visibility', 'hidden');
    }
};

fetch(DATA_URL)
    .then(response => {
        if (response.status !== 200) {
            alert(`Status: ${response.status}`);
            return;
        }
        response.json().then(data => {
            plotChart(data);
        });
    })
    .catch(err => {
        alert(`Error: ${err}`);        
    });
