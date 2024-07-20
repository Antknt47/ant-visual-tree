import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import "./TreeSvg.css";

// Function to deserialize the JSON data into a tree structure
function deserialize(data) {
  let values = null;
  if (!data || data.length === 0) return null;
  try {
    values = JSON.parse(data);
  } catch (e) {
    return null;
  }

  // Initialize the root of the tree
  let root = { name: values[0], children: [] };
  let queue = [root];

  let i = 1;
  while (i < values.length) {
    let current = queue.shift();

    // Create left child if the value is not null
    if (values[i] !== null) {
      let leftChild = { name: values[i], children: [] };
      current.children.push(leftChild);
      queue.push(leftChild);
    }
    i++;

    // Create right child if the value is not null
    if (i < values.length && values[i] !== null) {
      let rightChild = { name: values[i], children: [] };
      current.children.push(rightChild);
      queue.push(rightChild);
    }
    i++;
  }

  return root;
}

function TreeSvg(props) {

  // Deserialize the data and set the maximum length to 100
  const data = deserialize(props.data);
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Use ResizeObserver to update dimensions on resize
  useEffect(() => {
    const svgElement = svgRef.current;

    if (svgElement) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          if (entry.target === svgElement) {
            const { width, height } = entry.contentRect;
            setDimensions({ width, height });
          }
        }
      });

      resizeObserver.observe(svgElement);

      return () => {
        resizeObserver.unobserve(svgElement);
      };
    }
  }, []);

  useEffect(() => {

    const width = dimensions.width;
    const height = dimensions.height;

    // Create zoom behavior with scale extent
    const zoom = d3.zoom()
      .scaleExtent([0.1, 10]) // Set the zoom scale range
      .on('zoom', (event) => {
        g.attr('transform', event.transform); // Apply zoom transform
      });

    // Create drag behavior
    const drag = d3.drag()
      .on('drag', (event) => {
        const { dx, dy } = event;
        const transform = d3.zoomTransform(svgRef.current);
        g.attr('transform', transform.translate(dx, dy)); // Apply drag transform
      });

    // Create tree layout with specified size
    const treeLayout = d3.tree()
      .size([width, height - 200]);

    // Convert data into D3 hierarchy format
    if (!data) {
      return;
    }

    const root = d3.hierarchy(data);
    treeLayout(root);

    // Select SVG element and apply zoom behavior
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .call(zoom); // Apply zoom behavior to the SVG

    // Create or select a g element for transformations
    let g = svg.select('g');
    if (g.empty()) {
      g = svg.append('g');
    }

    // Clear previous contents of the g element
    g.selectAll("*").remove();

    // Create links between nodes
    g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("d", d => `M${d.source.x},${d.source.y + 100} L${d.target.x},${d.target.y + 100}`);

    // Create nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y + 100})`);

    // Add circles to nodes
    node.append("circle")

    // Add text labels to nodes
    node.append("text")
      .attr("dy", 6)
      .attr("x", 0)
      .style("text-anchor", "middle")
      .text(d => d.data.name);
  }, [data, dimensions]);
  
  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" ref={svgRef} className="treeSvg"></svg>
    </>
  )
}

export default TreeSvg;
