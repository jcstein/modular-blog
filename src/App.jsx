/* src/App.jsx */
import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers'
import { create } from 'ipfs-http-client'
import { Buffer } from 'buffer'
import Blog from '../Blog.json'

/* configure authorization for Infura and IPFS */
const auth =
    'Basic ' + Buffer.from(import.meta.env.VITE_INFURA_ID + ':' + import.meta.env.VITE_INFURA_SECRET).toString('base64');
    
/* create an IPFS client */
const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
      authorization: auth,
  },
});

const contractAddress = "0xc1e99a2a791d85433a3693ef267166412ad462eb"

function App() {
  useEffect(() => {
    fetchPosts()
  }, [])
  const [viewState, setViewState] = useState('view-posts')
  const [posts, setPosts] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  /* when the component loads, useEffect will call this function */
  async function fetchPosts() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(contractAddress, Blog.abi, provider)
    let data = await contract.fetchPosts()
    /* once the data is returned from the network we map over it and */
    /* transform the data into a more readable format  */
    data = data.map(d => ({
      content: d['content'],
      title: d['title'],
      published: d['published'],
      id: d['id'].toString(),
    }))

    /* we then fetch the post content from IPFS and add it to the post objects */
    data = await Promise.all(data.map(async d => {
      const endpoint = `https://infura-ipfs.io/ipfs/${d.content}`
      const options = {
        mode: 'no-cors',
      }
      const response = await fetch(endpoint, options)
      const value = await response.text()
      d.postContent = value
      return d
    }))

    setPosts(data)
  }

  async function createPost() {
    const added = await client.add(content)
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(contractAddress, Blog.abi, signer)
    const tx = await contract.createPost(title, added.path)
    await tx.wait()
    setViewState('view-posts')
  }

  function toggleView(value) {
    setViewState(value)
    if (value === 'view-posts') {
      fetchPosts()
    }
  }

  async function editPost(postId, title, content) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, Blog.json.abi, signer)
  
    // add the new content to IPFS
    const added = await client.add(content)
  
    // update the post with the new title and content hash
    const tx = await contract.updatePost(postId, title, added.path, true)
    await tx.wait()
  }
  
  return (
    <div style={outerContainerStyle}>
      <div style={innerContainerStyle}>
      <h1>Modular Rollup Blog</h1>
      <h3>Built with <a href="https://celestia.org" target="_blank">Celestia</a>, <a href ="https://docs.celestia.org/developers/rollmint" target="_blank">RollKit</a>, <a href="https://github.com/celestiaorg/ethermint" target="_blank">Ethermint</a>, and <a href="https://ipfs.io" target="_blank">IPFS</a></h3>
      <p>This blog is a <a href="https://celestia.org/glossary/sovereign-rollup" target="_blank">sovereign rollup</a> built on Celestia to provide <a href="https://celestia.org/glossary/data-availability" target="_blank">data availability</a> and <a href="https://ethereum.org/en/developers/docs/consensus-mechanisms/" target="_blank">consensus</a>, Ethermint with RollKit for <a href="https://celestia.org/glossary/execution-environment" target="_blank">execution</a>, and IPFS for <a href="https://docs.celestia.org/concepts/data-availability-faq#what-is-the-difference-between-data-availability-and-data-storage" target="_blank">long-term data storage.</a></p>
      <p>This allows users to securely create and share blog posts on the blockchain without the need for a centralized server or authority.</p>
      <p>If you're looking to dive deep into rollups, check out <a href="https://members.delphidigital.io/reports/the-complete-guide-to-rollups/" target="_blank">The Complete Guide to Rollups</a> by Jon Charbonneau from Delphi Digital.</p>
      <p>Now, let's get started. First, read the instructions in post <a href="https://ipfs.io/ipfs/QmSYDGR8EHEyN1ANcBW6R3aJYQo9EGvom6U9KDtZzfRhKP" target="_blank">GMID: 1</a>. (You'll need to follow the instructions in GMID: 1 and connect your wallet to see the blog)</p>
      <br />
      <h3 style={{ justifyContent: 'right', textAlign: 'right'}}>Connect your Ethereum wallet to begin ✨</h3>
      <div style={buttonContainerStyle}>
      <ConnectButton />
      </div>
      <div style={buttonContainerStyle}>
        <button onClick={() => toggleView('view-posts')} style={buttonStyle}>View Posts</button>
        <button  onClick={() => toggleView('create-post')} style={buttonStyle}>Create Post</button>
      </div>
      {
        viewState === 'view-posts' && (
          <div>
            <div style={postContainerStyle}>
            <h1>Posts</h1>
            {
              posts.map((post, index) => (
                <div key={index}>
                  <h2>{post.title}</h2>
                  <button style={{ fontSize: '16px' }} onClick={() => window.open(`https://infura-ipfs.io/ipfs/${post.content}`)}>Read on IPFS</button>
                  <p style={mbidStyle}>GMID: {post.id}</p>
                </div>
              ))
            }
          </div>
          </div>
        )
      }
      {
        viewState === 'create-post' && (
          <div style={formContainerStyle}>
              <h2>Create Post</h2>
              <input
                placeholder='Title'
                onChange={e => setTitle(e.target.value)}
                style={inputStyle}
              />
              <textarea
                placeholder='Content'
                onChange={e => setContent(e.target.value)}
                style={inputStyle}
              />
              <button onClick={createPost}>Create Post</button>
          </div>
        )
      }
      </div>
    </div>
  )
}

const outerContainerStyle = {
  width: '100vw',
  height: '100vh',
  padding: '50px 0px'
}

const innerContainerStyle = {
  width: '90%',
  maxWidth: '800px',
  margin: '0 auto',
}

const formContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
}

const inputStyle = {
  width: '400px',
  marginBottom: '10px',
  padding: '10px',
  height: '40px',
}

const postContainerStyle = {
  margin: '0 auto',
  padding: '1em',
  width: '90%',
  maxWidth: '800px',
  // center everything
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  justifyContent: 'center',
}

const mbidStyle = {
  fontSize: '10px',
  textAlign: 'start',
}

const buttonStyle = {
  marginTop: 15,
  marginRight: 5,
  border: '1px solid rgba(255, 255, 255, .2)'
}

const buttonContainerStyle = {
  marginTop: 15,
  marginRight: 5,
  display: 'flex',
  justifyContent: 'right',
}

export default App