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

const contractAddress = "0x14bbb1c4d67f9b870d162927456e66720fa63dd7"

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
      <h1>Modular Blog</h1>
      <h2>Built with Celestia, RollKit, Ethermint, and IPFS</h2>
      <div style={{marginBottom: 42}}>
      <text>Connect your Ethereum wallet to begin ✨</text> 
      </div>
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
                  <p style={mbidStyle}>MBID: {post.id}</p>
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
  justifyContent: 'center',
}

export default App