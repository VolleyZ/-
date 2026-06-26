'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface Node {
  id: string
  title: string
  category: string
  difficulty: string
  year: number | null
}

interface Edge {
  source: string
  target: string
  type: string
}

interface Props {
  nodes: Node[]
  edges: Edge[]
}

export function ForceGraph({ nodes, edges }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null)

  useEffect(() => {
    if (!svgRef.current || typeof window === 'undefined') return

    const svgElement = svgRef.current
    const width = svgElement.clientWidth || 800
    const height = svgElement.clientHeight || 600

    // 动态导入 D3.js（避免 SSR 问题）
    import('d3').then((d3) => {
      const svg = d3.select(svgElement)
      svg.selectAll('*').remove()

      // 设置 SVG
      svg
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height])

      // 难度颜色映射
      const difficultyColors: Record<string, string> = {
        beginner: '#22c55e',
        intermediate: '#eab308',
        advanced: '#ef4444'
      }

      // 创建节点数据（带位置）
      const graphNodes = nodes.map((node, i) => ({
        ...node,
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 2 + (Math.random() - 0.5) * 200
      }))

      // 创建边数据
      const nodeMap = new Map(graphNodes.map(n => [n.id, n]))
      const graphLinks = edges
        .filter(e => nodeMap.has(e.source) && nodeMap.has(e.target))
        .map(e => ({
          source: e.source,
          target: e.target
        }))

      // 创建力模拟
      const simulation = d3
        .forceSimulation(graphNodes as any)
        .force(
          'link',
          d3
            .forceLink(graphLinks)
            .id((d: any) => d.id)
            .distance(100)
        )
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force(
          'collision',
          d3.forceCollide().radius(50)
        )

      // 绘制边
      const link = svg
        .append('g')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-opacity', 0.6)
        .selectAll('line')
        .data(graphLinks)
        .join('line')
        .attr('stroke-width', 1)

      // 绘制节点组
      const node = svg
        .append('g')
        .selectAll('g')
        .data(graphNodes)
        .join('g')
        .attr('cursor', 'pointer')
        .call(
          d3
            .drag<any, any>()
            .on('start', (event, d) => {
              if (!event.active) simulation.alphaTarget(0.3).restart()
              d.fx = d.x
              d.fy = d.y
            })
            .on('drag', (event, d) => {
              d.fx = event.x
              d.fy = event.y
            })
            .on('end', (event, d) => {
              if (!event.active) simulation.alphaTarget(0)
              d.fx = null
              d.fy = null
            })
        )

      // 节点圆圈
      node
        .append('circle')
        .attr('r', 8)
        .attr('fill', (d: any) => difficultyColors[d.difficulty] || '#6366f1')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .on('mouseenter', (_, d: any) => setHoveredNode(d))
        .on('mouseleave', () => setHoveredNode(null))
        .on('click', (_, d: any) => setSelectedNode(d))

      // 节点标签
      node
        .append('text')
        .text((d: any) =>
          d.title.length > 25 ? d.title.slice(0, 25) + '...' : d.title
        )
        .attr('x', 12)
        .attr('y', 4)
        .attr('font-size', '11px')
        .attr('fill', '#374151')

      // 更新位置
      simulation.on('tick', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y)

        node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
      })
    })

    return () => {}
  }, [nodes, edges])

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full bg-gray-50" />
      
      {/* Hover tooltip */}
      {hoveredNode && !selectedNode && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg max-w-xs">
          <p className="font-medium text-gray-900">{hoveredNode.title}</p>
          <p className="text-sm text-gray-500 mt-1">
            难度：{hoveredNode.difficulty === 'beginner' ? '入门' : hoveredNode.difficulty === 'intermediate' ? '进阶' : '深入'}
          </p>
          <p className="text-xs text-gray-400 mt-1">点击查看详情</p>
        </div>
      )}
      
      {/* Selected node detail */}
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-sm">
          <h3 className="font-semibold text-gray-900">{selectedNode.title}</h3>
          <p className="text-sm text-gray-500 mt-2">
            分类：{formatCategoryName(selectedNode.category)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            难度：{selectedNode.difficulty === 'beginner' ? '入门' : selectedNode.difficulty === 'intermediate' ? '进阶' : '深入'}
          </p>
          <div className="flex gap-2 mt-4">
            <Link
              href={`/papers/${encodeURIComponent(selectedNode.id)}`}
              className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm text-center rounded-lg hover:bg-indigo-700"
            >
              查看论文
            </Link>
            <button
              onClick={() => setSelectedNode(null)}
              className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200"
            >
              关闭
            </button>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-gray-600">入门</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-gray-600">进阶</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-gray-600">深入</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatCategoryName(category: string): string {
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}