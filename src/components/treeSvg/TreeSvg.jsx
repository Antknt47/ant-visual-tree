import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import "./TreeSvg.css";

// Function to deserialize the JSON data into a tree structure
function deserialize(data) {
  let values = data;

  // Initialize the root of the tree
  let root = { name: values[0], children: [] };
  let queue = [root];

  let i = 1;
  while (i < values.length) {
    let current = queue.shift();

    // Create left child if the value is not null
    let leftChild = null;
    if (i < values.length && values[i] !== null) {
      leftChild = { name: values[i], children: [] };
      current.children.push(leftChild);
      queue.push(leftChild);
    } else if (values[i] == null) {
      leftChild = { name: null, children: [] };
      current.children.push(leftChild);
    }
    i++;

    // Create right child if the value is not null
    let rightChild = null;
    if (i < values.length && values[i] !== null) {
      rightChild = { name: values[i], children: [] };
      current.children.push(rightChild);
      queue.push(rightChild);
    } else if (values[i] == null) {
      rightChild = { name: null, children: [] };
      current.children.push(rightChild);
    }
    i++;

    // Ensure each node has exactly two children or no children
    if (leftChild && !rightChild) {
      current.children.push({ name: null, children: [] });
    } else if (!leftChild && rightChild) {
      current.children.push({ name: null, children: [] });
    }
  }

  return root;
}

function TreeSvg(props) {
  const ScaleSpeed = 0.8; // Scale speed
  const [loadedData, setLoadedData] = useState([]);

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

  function radius(depth) {
    const baseRadius = 35; // Base radius for the root node
    return baseRadius * Math.pow(ScaleSpeed, depth); // Starting from the fourth layer, the radius decreases by half each layer
  }

  function fontSize(depth) {
    const baseRadius = 20; // Base radius for the root node
    return baseRadius * Math.pow(ScaleSpeed, depth); // Starting from the fourth layer, the radius decreases by half each layer
  }

  function strokeWidth(depth) {
    const baseRadius = 1.5; // Base radius for the root node
    return baseRadius * Math.pow(ScaleSpeed, depth); // Starting from the fourth layer, the radius decreases by half each layer
  }

  function mappingY(d, height) {
    const baseHeight = height / 4;
    const marginTop = 150;

    return (1 - Math.pow(ScaleSpeed, d.depth)) / (1 - ScaleSpeed) * baseHeight + marginTop;
  }

  // Use Effect to load data in chunks
  useEffect(() => {
    const data = props.data.slice();
    const intervalId = setInterval(() => {
      setLoadedData(prevData => {
        const nextChunk = data.slice(prevData.length, prevData.length + 100); // 每次加载一个分片
        if (nextChunk.length === 0) {
          clearInterval(intervalId);
        }
        return [...prevData, ...nextChunk];
      });
    }, 100); // 每 500ms 加载一个分片

    return () => clearInterval(intervalId);
  }, [props.data]);

  useEffect(() => {
    const width = dimensions.width;
    const height = dimensions.height;

    // Create zoom behavior with scale extent
    const zoom = d3.zoom()
      .scaleExtent([0.1, 1000]) // Set the zoom scale range
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
      .size([width, height - 200])
      .separation((a, b) => {
        const depthA = a.depth;
        const depthB = b.depth;

        // Adjust spacing based on depth
        let separation = 1; // Default spacing
        if (depthA >= 3 || depthB >= 3) { // Starting from the fourth layer
          const minDepth = Math.min(depthA, depthB);
          separation = Math.pow(0.5, minDepth - 3);
        }
        return 0.1;
      });

    // Convert data into D3 hierarchy format
    const deserializedData = deserialize(loadedData);
    const root = d3.hierarchy(deserializedData);
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
      .attr("stroke-width", d => strokeWidth(d.source.depth))
      .attr("opacity", d => d.target.data.name === null ? 0 : 1) // Set opacity based on data
      .attr("d", d => `M${d.source.x},${mappingY(d.source, height)} L${d.target.x},${mappingY(d.target, height)}`);

    // Create nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${mappingY(d, height)})`)
      .attr("opacity", d => d.data.name === null ? 0 : 1); // Set opacity based on data

    // Add circles to nodes
    node.append("circle")
      .attr("r", d => radius(d.depth))
      .attr("stroke-width", d => strokeWidth(d.depth));

    // Add text labels to nodes
    node.append("text")
      .attr("dy", d => fontSize(d.depth) / 3)
      .attr("x", 0)
      .attr("font-size", d => fontSize(d.depth))
      .style("text-anchor", "middle")
      .text(d => d.data.name);

  }, [loadedData, dimensions]);

  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" ref={svgRef} className="treeSvg"></svg>
    </>
  );
}

export default TreeSvg;
