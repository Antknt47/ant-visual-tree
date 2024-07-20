import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import "./TreeSvg.css";

function deserialize(data) {
  let values = null;
  if (!data || data.length === 0) return null;
  try {
    values = JSON.parse(data);
  } catch (e) {
    return null;
  }

  let root = { name: values[0], children: [] };
  let queue = [root];

  let i = 1;
  while (i < values.length) {
    let current = queue.shift();

    if (values[i] !== null) {
      let leftChild = { name: values[i], children: [] };
      current.children.push(leftChild);
      queue.push(leftChild);
    }
    i++;

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

  const data = deserialize(props.data);
  const [count, setCount] = useState(0);
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
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

    // 创建树布局
    const treeLayout = d3.tree().size([width, height - 200]);

    // 将数据转换为D3可用的层次结构
    if(!data) {
      return;
    }
    const root = d3.hierarchy(data);
    treeLayout(root);

    // 选择SVG元素
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
    // 清除之前的内容
    svg.selectAll("*").remove();

    // 创建链接
    svg.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("d", d => {
        return `M${d.source.x},${d.source.y + 100} L${d.target.x},${d.target.y + 100}`;
      });

    // 创建节点
    const node = svg.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y + 100})`);

    // 节点圆
    node.append("circle")
    // 节点文本
    node.append("text")
      .attr("dy", 6)
      .attr("x", 0)
      .style("text-anchor", "middle")
      .text(d => d.data.name);
  }, [data]);
  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" ref={svgRef} className="treeSvg"></svg>
    </>
  )
}

export default TreeSvg;