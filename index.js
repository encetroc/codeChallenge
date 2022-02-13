const axios = require('axios')
require('dotenv').config()

// make a graph, i's gonna be a map
const graph = new Map()

// add a node
function addNode(asset) {
  graph.set(asset, [])
}

// add an edge, directed
function addEdge(from, to) {
  graph.get(from).push(to)
}

// get all routes as strings
function printAllRoutes(start) {
  // route parts for construction all possible routes
  const routeParts = []
  // bfs to go through all possible paths in the graph
  const visited = new Set()
  const queue = [start]
  while (queue.length > 0) {
    const asset = queue.shift()
    const tos = graph.get(asset)
    tos.forEach((to) => {
      // add route part to the array of route parts
      routeParts.push([asset, to])
      if (!visited.has(to)) {
        visited.add(to)
        queue.push(to)
      }
    })
  }
  // transforme route parts into full routes
  for (let i = 1; i < routeParts.length; i++) {
    for (let j = 0; j < i; j++) {
      if (routeParts[i][0] === routeParts[j][routeParts[j].length - 1]) {
        routeParts[i] = [...routeParts[j], ...routeParts[i]]
      }
    }
  }
  // transforme routes into comprehensive strings, and return
  return routeParts.map((route) =>
    [...new Set(route)].reduce((prev, curr) => `${prev} > ${curr}`)
  )
}

// get data from API
axios
  .get(
    'https://backend.qa.fieldap.com/API/v1.9/-MA1551S-odms4rVbJ8A/subProject/-MA1551S-odms4rVbJ8B',
    {
      headers: {
        token: process.env.API_TOKEN,
      },
    }
  )
  .then((reasult) => {
    // get assets and connections
    const assets = Object.keys(reasult.data.stagedAssets)
    const connections = Object.values(reasult.data.connections).map(
      (connection) => [connection.from, connection.to]
    )

    // populate the graph with nodes (assets)
    assets.forEach(addNode)

    // populate the graph with edges (connections)
    connections.forEach((connection) => addEdge(...connection))

    // log all possible routes
    console.log(printAllRoutes(process.argv.splice(2)[0]))
  })
